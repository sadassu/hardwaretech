import nodemailer from "nodemailer";

/**
 * Validates that all required SMTP environment variables are set
 * @returns {Object} { valid: boolean, missing: string[] }
 */
const validateEmailConfig = () => {
  const required = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];
  const missing = required.filter((key) => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Creates a nodemailer transporter with optimized settings for deployment
 * @returns {Object} Nodemailer transporter
 */
const createTransporter = () => {
  const port = parseInt(process.env.SMTP_PORT, 10);
  const secure = port === 465;
  const requireTLS = port === 587;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: port,
    secure: secure, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Connection timeout settings (important for deployment)
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
    // TLS/SSL configuration
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
      minVersion: "TLSv1.2", // Minimum TLS version
    },
    // For port 587 (STARTTLS)
    ...(requireTLS && {
      requireTLS: true,
    }),
    // Connection pooling for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    // Rate limiting
    rateDelta: 1000, // 1 second
    rateLimit: 5, // 5 messages per second
  });
};

/**
 * Sends an email using nodemailer with retry logic
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @param {number} retries - Number of retry attempts (default: 2)
 * @throws {Error} If email configuration is invalid or sending fails after retries
 */
export const sendEmail = async (to, subject, html, retries = 2) => {
  // Validate email configuration
  const configCheck = validateEmailConfig();
  if (!configCheck.valid) {
    const errorMsg = `Email configuration incomplete. Missing: ${configCheck.missing.join(", ")}. Please check your environment variables.`;
    console.error("❌ Email Configuration Error:", errorMsg);
    console.error("📖 See backend/EMAIL_SETUP.md for configuration guide");
    throw new Error(errorMsg);
  }

  // Validate port
  const port = parseInt(process.env.SMTP_PORT, 10);
  if (isNaN(port)) {
    const errorMsg = `Invalid SMTP_PORT: ${process.env.SMTP_PORT}. Must be a number (e.g., 587 or 465).`;
    console.error("❌ Email Configuration Error:", errorMsg);
    throw new Error(errorMsg);
  }

  // Validate email address
  if (!to || typeof to !== "string" || !to.includes("@")) {
    const errorMsg = `Invalid recipient email address: ${to}`;
    console.error("❌ Email Error:", errorMsg);
    throw new Error(errorMsg);
  }

  // Gmail-specific validation and warnings
  if (process.env.SMTP_HOST === "smtp.gmail.com") {
    // Check if using Gmail and provide helpful warnings
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";
    
    // Warn if password looks like a regular password (too short or contains spaces)
    if (smtpPass.length < 16 || smtpPass.includes(" ")) {
      console.warn("⚠️  Gmail Warning: App Password should be 16 characters with no spaces.");
      console.warn("   If you're using a regular password, Gmail will reject it.");
      console.warn("   Generate an App Password: https://myaccount.google.com/apppasswords");
    }
    
    // Warn if email format looks wrong
    if (!smtpUser.includes("@gmail.com") && !smtpUser.includes("@googlemail.com")) {
      console.warn("⚠️  Gmail Warning: SMTP_USER should be your Gmail address (e.g., yourname@gmail.com)");
    }
  }

  let lastError = null;

  // Retry logic
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create transporter (new instance for each attempt to avoid connection issues)
      const transporter = createTransporter();

      // Verify connection (only on first attempt or if VERIFY_SMTP is enabled)
      if ((attempt === 0 && process.env.NODE_ENV !== "production") || process.env.VERIFY_SMTP === "true") {
        try {
          await Promise.race([
            transporter.verify(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error("SMTP verification timeout")), 5000)
            )
          ]);
          console.log("✅ SMTP connection verified successfully");
        } catch (verifyError) {
          console.warn("⚠️ SMTP verification failed (continuing anyway):", verifyError.message);
          // Don't throw, some servers don't support verify but can still send emails
        }
      }

      // Send email with timeout
      const sendPromise = transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Hardwaretech" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        // Additional headers for better deliverability
        headers: {
          "X-Priority": "3",
          "X-MSMail-Priority": "Normal",
        },
      });

      // Add timeout to sending
      const info = await Promise.race([
        sendPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Email sending timeout after 15 seconds")), 15000)
        )
      ]);

      console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
      
      // Close transporter connection
      transporter.close();
      
      return info;
    } catch (error) {
      lastError = error;
      
      // Enhanced error logging with Gmail-specific help
      const errorDetails = {
        attempt: attempt + 1,
        maxAttempts: retries + 1,
        to,
        subject: subject.substring(0, 50) + (subject.length > 50 ? "..." : ""),
        error: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
        errno: error.errno,
        syscall: error.syscall,
        hostname: error.hostname,
      };

      console.error(`❌ Email sending failed (attempt ${attempt + 1}/${retries + 1}):`, errorDetails);

      // Gmail-specific error help
      if (process.env.SMTP_HOST === "smtp.gmail.com") {
        const isAuthError = error.message?.includes("Invalid login") || 
                           error.message?.includes("BadCredentials") ||
                           error.message?.includes("535-5.7.8") ||
                           error.responseCode === 535;
        
        if (isAuthError) {
          console.error("\n🔴 GMAIL AUTHENTICATION ERROR DETECTED:");
          console.error("   This usually means:");
          console.error("   1. You're using your regular Gmail password (NOT allowed)");
          console.error("   2. You need to use a Gmail App Password instead");
          console.error("   3. 2-Factor Authentication must be enabled");
          console.error("\n   📝 How to fix:");
          console.error("   1. Go to: https://myaccount.google.com/apppasswords");
          console.error("   2. Enable 2-Factor Authentication if not already enabled");
          console.error("   3. Generate a new App Password (select 'Mail' and your device)");
          console.error("   4. Copy the 16-character password (no spaces)");
          console.error("   5. Use it as SMTP_PASS in your environment variables");
          console.error("   6. Make sure SMTP_USER is your full Gmail address");
          console.error("");
        }
      }

      // If this is not the last attempt, wait before retrying
      if (attempt < retries) {
        const waitTime = (attempt + 1) * 1000; // Exponential backoff: 1s, 2s, 3s...
        console.log(`⏳ Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  const finalError = `Failed to send email after ${retries + 1} attempts. Last error: ${lastError?.message || "Unknown error"}`;
  console.error("❌ Email sending failed completely:", {
    to,
    subject,
    finalError,
    lastError: lastError?.message,
    code: lastError?.code,
  });

  throw new Error(finalError);
};

/**
 * Tests the email configuration by attempting to verify SMTP connection
 * @returns {Promise<Object>} { success: boolean, message: string }
 */
export const testEmailConfig = async () => {
  const configCheck = validateEmailConfig();
  if (!configCheck.valid) {
    return {
      success: false,
      message: `Email configuration incomplete. Missing: ${configCheck.missing.join(", ")}`,
      missing: configCheck.missing,
    };
  }

  try {
    const transporter = createTransporter();
    
    // Test connection with timeout
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection test timeout")), 10000)
      )
    ]);
    
    transporter.close();
    
    return {
      success: true,
      message: "Email configuration is valid and connection successful",
    };
  } catch (error) {
    return {
      success: false,
      message: `Email connection test failed: ${error.message}`,
      error: error.message,
    };
  }
};
