import * as brevo from "@getbrevo/brevo";

/**
 * Validates that Brevo API key is set
 * @returns {Object} { valid: boolean, missing: string[] }
 */
const validateEmailConfig = () => {
  const required = ["BREVO_API_KEY"];
  const missing = required.filter((key) => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
};

/**
 * Sends an email using Brevo API with retry logic
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
    console.error("📖 Set BREVO_API_KEY in your environment variables");
    throw new Error(errorMsg);
  }

  // Validate email address
  if (!to || typeof to !== "string" || !to.includes("@")) {
    const errorMsg = `Invalid recipient email address: ${to}`;
    console.error("❌ Email Error:", errorMsg);
    throw new Error(errorMsg);
  }

  // Prepare sender info
  const fromEmail = process.env.BREVO_FROM_EMAIL || "onboarding@resend.dev";
  const fromName = process.env.BREVO_FROM_NAME || "Hardware Tech";

  let lastError = null;

  // Retry logic with optimized backoff
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Initialize Brevo API client (create fresh instance for each attempt)
      const apiInstance = new brevo.TransactionalEmailsApi();
      apiInstance.setApiKey(
        brevo.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY
      );

      // Create email object
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.sender = {
        email: fromEmail,
        name: fromName,
      };
      sendSmtpEmail.to = [{ email: to }];

      // Send email with timeout
      const sendPromise = apiInstance.sendTransacEmail(sendSmtpEmail);
      
      const data = await Promise.race([
        sendPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Email sending timeout after 10 seconds")), 10000)
        )
      ]);

      console.log(`✅ Email sent successfully to ${to}. Message ID: ${data?.messageId || "N/A"}`);
      
      return data;
    } catch (error) {
      lastError = error;
      
      // Enhanced error logging
      const errorDetails = {
        attempt: attempt + 1,
        maxAttempts: retries + 1,
        to,
        subject: subject.substring(0, 50) + (subject.length > 50 ? "..." : ""),
        error: error.message || error.body?.message || "Unknown error",
        statusCode: error.statusCode,
        response: error.response?.text || error.body,
      };

      console.error(`❌ Email sending failed (attempt ${attempt + 1}/${retries + 1}):`, errorDetails);

      // Brevo-specific error help
      if (error.statusCode === 401 || error.body?.code === "unauthorized") {
        console.error("\n🔴 BREVO AUTHENTICATION ERROR DETECTED:");
        console.error("   This usually means:");
        console.error("   1. Your BREVO_API_KEY is invalid or expired");
        console.error("   2. Check your Brevo dashboard for the correct API key");
        console.error("   3. Make sure BREVO_API_KEY is set in your environment variables");
        console.error("");
      } else if (error.statusCode === 400 || error.body?.code === "invalid_parameter") {
        console.error("\n🔴 BREVO VALIDATION ERROR:");
        console.error("   This usually means:");
        console.error("   1. Invalid sender email address");
        console.error("   2. Sender domain not verified in Brevo");
        console.error("   3. Check BREVO_FROM_EMAIL and verify your domain in Brevo dashboard");
        console.error("");
      }

      // Optimized backoff for faster retries
      if (attempt < retries) {
        const waitTime = Math.min((attempt + 1) * 300, 1500); // Faster backoff: 300ms, 600ms, max 1500ms
        console.log(`⏳ Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  const finalError = `Failed to send email after ${retries + 1} attempts. Last error: ${lastError?.message || lastError?.body?.message || "Unknown error"}`;
  console.error("❌ Email sending failed completely:", {
    to,
    subject,
    finalError,
    lastError: lastError?.message || lastError?.body?.message,
    statusCode: lastError?.statusCode,
  });

  throw new Error(finalError);
};

/**
 * Tests the email configuration by attempting to verify Brevo API connection
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
    // Test by getting account info (lightweight API call)
    const apiInstance = new brevo.AccountApi();
    apiInstance.setApiKey(
      brevo.AccountApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    await Promise.race([
      apiInstance.getAccount(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection test timeout")), 10000)
      )
    ]);
    
    return {
      success: true,
      message: "Brevo API configuration is valid and connection successful",
    };
  } catch (error) {
    return {
      success: false,
      message: `Brevo API connection test failed: ${error.message || error.body?.message || "Unknown error"}`,
      error: error.message || error.body?.message,
    };
  }
};
