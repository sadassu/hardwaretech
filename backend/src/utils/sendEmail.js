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

// Reusable Brevo API instance (singleton pattern for better performance)
let apiInstance = null;
let apiKey = null;

/**
 * Get or create Brevo API instance (reused for better performance)
 * @returns {brevo.TransactionalEmailsApi}
 */
const getApiInstance = () => {
  const currentApiKey = process.env.BREVO_API_KEY;
  
  // Reuse instance if API key hasn't changed
  if (apiInstance && apiKey === currentApiKey) {
    return apiInstance;
  }
  
  // Create new instance
  apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    currentApiKey
  );
  apiKey = currentApiKey;
  
  return apiInstance;
};

/**
 * Convert HTML to plain text (simple version for email deliverability)
 * @param {string} html - HTML content
 * @returns {string} Plain text version
 */
const htmlToPlainText = (html) => {
  if (!html) return "";
  
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, "")
    .replace(/<script[^>]*>.*?<\/script>/gis, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Generate Message-ID for email
 * @param {string} domain - Sender domain
 * @returns {string} Message-ID
 */
const generateMessageId = (domain) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `<${timestamp}.${random}@${domain}>`;
};

/**
 * Sends an email using Brevo API with retry logic and optimized performance
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 * @param {number} retries - Number of retry attempts (default: 1 for faster delivery)
 * @param {boolean} isPriority - Whether this is a priority email (affects retry timing)
 * @throws {Error} If email configuration is invalid or sending fails after retries
 */
export const sendEmail = async (to, subject, html, retries = 1, isPriority = false) => {
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
  const domain = fromEmail.split("@")[1] || "hardwaretech.com";
  
  // Generate plain text version for better deliverability
  const textContent = htmlToPlainText(html);
  
  // Generate unique Message-ID for spam prevention
  const messageId = generateMessageId(domain);
  
  // Get reusable API instance
  const apiInstance = getApiInstance();

  let lastError = null;

  // Optimized retry logic with faster backoff for priority emails
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create email object with anti-spam headers
      const sendSmtpEmail = new brevo.SendSmtpEmail();
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = html;
      sendSmtpEmail.textContent = textContent; // Plain text alternative for better deliverability
      sendSmtpEmail.sender = {
        email: fromEmail,
        name: fromName,
      };
      sendSmtpEmail.to = [{ email: to }];
      
      // Add headers for spam prevention and deliverability
      sendSmtpEmail.headers = {
        "Message-ID": messageId,
        "X-Mailer": "HardwareTech-Email-System",
        "X-Priority": isPriority ? "1" : "3",
        "List-Unsubscribe": `mailto:unsubscribe@${domain}, https://${domain}/unsubscribe`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "Precedence": "bulk",
        "X-Auto-Response-Suppress": "All",
      };
      
      // Add reply-to for better deliverability
      sendSmtpEmail.replyTo = {
        email: process.env.BREVO_REPLY_TO || fromEmail,
        name: fromName,
      };

      // Send email with optimized timeout (5 seconds instead of 10)
      const sendPromise = apiInstance.sendTransacEmail(sendSmtpEmail);
      
      const data = await Promise.race([
        sendPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Email sending timeout after 5 seconds")), 5000)
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

      // Optimized backoff: faster for priority emails, standard for others
      if (attempt < retries) {
        const baseWaitTime = isPriority ? 100 : 200; // Faster for priority
        const waitTime = Math.min((attempt + 1) * baseWaitTime, isPriority ? 500 : 1000);
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
