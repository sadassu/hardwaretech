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
 * Sends an email using nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @throws {Error} If email configuration is invalid or sending fails
 */
export const sendEmail = async (to, subject, html) => {
  // Validate email configuration
  const configCheck = validateEmailConfig();
  if (!configCheck.valid) {
    const errorMsg = `Email configuration incomplete. Missing: ${configCheck.missing.join(", ")}`;
    console.error("❌ Email Error:", errorMsg);
    throw new Error(errorMsg);
  }

  // Parse port as integer
  const port = parseInt(process.env.SMTP_PORT, 10);
  if (isNaN(port)) {
    const errorMsg = `Invalid SMTP_PORT: ${process.env.SMTP_PORT}. Must be a number.`;
    console.error("❌ Email Error:", errorMsg);
    throw new Error(errorMsg);
  }

  // Determine if secure connection (SSL/TLS)
  const secure = port === 465;
  const requireTLS = port === 587;

  try {
    // Create transporter with proper configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: secure, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Additional options for better compatibility
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates (useful for some SMTP servers)
      },
      // For port 587 (STARTTLS)
      ...(requireTLS && {
        requireTLS: true,
      }),
    });

    // Verify connection before sending (optional but recommended)
    if (process.env.NODE_ENV !== "production" || process.env.VERIFY_SMTP === "true") {
      try {
        await transporter.verify();
        console.log("✅ SMTP connection verified successfully");
      } catch (verifyError) {
        console.error("❌ SMTP verification failed:", verifyError.message);
        // Don't throw here, some servers don't support verify
      }
    }

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"Hardwaretech" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    // Enhanced error logging
    console.error("❌ Email sending failed:", {
      to,
      subject,
      error: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    });
    
    // Re-throw with more context
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
