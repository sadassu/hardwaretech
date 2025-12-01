/**
 * Professional Email Service
 * Specialized email functions for different purposes with optimized delivery
 */

import { dispatchEmail } from "./emailDispatcher.js";
import { EMAIL_TYPES } from "../constants/emailTypes.js";

/**
 * Send email verification code (6-digit code)
 * Purpose: Verify user email during registration/login
 * Priority: High - User waiting for code
 */
export const sendVerificationCodeEmail = async (email, userName, code) => {
  // Removed emoji from subject for better spam filter compliance
  const subject = "Email Verification Code - Hardware Tech";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">🔐</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Email Verification</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Hello <strong>${userName || "User"}</strong>,
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                Use the verification code below to verify your email address:
              </p>
              <div style="background-color: #f9fafb; border: 2px dashed #3B82F6; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                <div style="font-size: 42px; font-weight: bold; letter-spacing: 8px; color: #3B82F6; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
                This code will expire in <strong>10 minutes</strong>.
              </p>
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin-top: 30px;">
                <p style="margin: 0; font-size: 13px; color: #92400e;">
                  <strong>⚠️ Security Notice:</strong> Never share this code with anyone. Hardware Tech will never ask for your verification code.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Hardware Tech. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({
    type: EMAIL_TYPES.VERIFICATION_CODE,
    to: email,
    subject,
    html,
    retries: 1,
  });
};

/**
 * Send email verification link
 * Purpose: Verify user email via link (registration)
 * Priority: Medium
 */
export const sendVerificationLinkEmail = async (email, userName, verificationLink) => {
  // Removed emoji from subject for better spam filter compliance
  const subject = "Verify Your Email - Hardware Tech";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Verify Your Email</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Hello <strong>${userName || "User"}</strong>,
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                Thank you for registering! Please click the button below to verify your email address:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="display: inline-block; background-color: #10B981; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <span style="color: #3B82F6; word-break: break-all;">${verificationLink}</span>
              </p>
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
                This link will expire in <strong>24 hours</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Hardware Tech. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({
    type: EMAIL_TYPES.VERIFICATION_LINK,
    to: email,
    subject,
    html,
    retries: 1,
  });
};

/**
 * Send password reset email
 * Purpose: Allow user to reset forgotten password
 * Priority: High - Security critical
 */
export const sendPasswordResetEmail = async (email, userName, resetLink) => {
  // Removed emoji from subject for better spam filter compliance
  const subject = "Password Reset Request - Hardware Tech";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">🔒</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Password Reset</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Hello <strong>${userName || "User"}</strong>,
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                You requested to reset your password. Click the button below to create a new password:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="display: inline-block; background-color: #EF4444; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Reset Password
                </a>
              </div>
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <span style="color: #3B82F6; word-break: break-all;">${resetLink}</span>
              </p>
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280; text-align: center;">
                This link will expire in <strong>1 hour</strong>.
              </p>
              <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin-top: 30px;">
                <p style="margin: 0; font-size: 13px; color: #991b1b;">
                  <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Hardware Tech. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return dispatchEmail({
    type: EMAIL_TYPES.PASSWORD_RESET,
    to: email,
    subject,
    html,
    retries: 2,
  });
};

/**
 * Send reservation status update email
 * Purpose: Notify user of reservation status changes (pending, confirmed, cancelled, failed)
 * Priority: Medium - Non-blocking
 */
export const sendReservationStatusEmail = async (email, userName, reservationData) => {
  const { getReservationStatusEmailTemplate } = await import("../utils/emailTemplates.js");
  
  // Removed emojis from subjects for better spam filter compliance
  const statusTitles = {
    pending: "Reservation Pending - Hardware Tech",
    confirmed: "Reservation Confirmed - Hardware Tech",
    cancelled: "Reservation Cancelled - Hardware Tech",
    failed: "Reservation Failed - Hardware Tech",
    completed: "Reservation Completed - Hardware Tech",
  };

  const subject = statusTitles[reservationData.status] || "Reservation Update - Hardware Tech";
  const html = getReservationStatusEmailTemplate(
    userName,
    reservationData.reservationId,
    reservationData.status,
    reservationData.reservationDate,
    reservationData.totalPrice,
    reservationData.remarks || "",
    reservationData.products || []
  );

  return dispatchEmail({
    type: EMAIL_TYPES.RESERVATION_STATUS,
    to: email,
    subject,
    html,
    retries: 1,
    fireAndForget: true,
  });
};

/**
 * Send reservation completion email
 * Purpose: Notify user when reservation is completed
 * Priority: Medium - Non-blocking
 */
export const sendReservationCompletedEmail = async (email, userName, reservationData) => {
  const { getReservationStatusEmailTemplate } = await import("../utils/emailTemplates.js");
  
  // Removed emoji from subject for better spam filter compliance
  const subject = "Reservation Completed - Hardware Tech";
  const html = getReservationStatusEmailTemplate(
    userName,
    reservationData.reservationId,
    "completed",
    reservationData.reservationDate,
    reservationData.totalPrice,
    reservationData.remarks || "",
    reservationData.products || []
  );

  return dispatchEmail({
    type: EMAIL_TYPES.RESERVATION_COMPLETED,
    to: email,
    subject,
    html,
    retries: 1,
    fireAndForget: true,
  });
};

/**
 * Send new reservation created email
 * Purpose: Confirm reservation creation to user
 * Priority: Medium - Non-blocking
 */
export const sendReservationCreatedEmail = async (email, userName, reservationData) => {
  const { getReservationStatusEmailTemplate } = await import("../utils/emailTemplates.js");
  
  // Removed emoji from subject for better spam filter compliance
  const subject = "Reservation Created - Hardware Tech";
  const html = getReservationStatusEmailTemplate(
    userName,
    reservationData.reservationId,
    "pending",
    reservationData.reservationDate,
    reservationData.totalPrice,
    reservationData.remarks || "",
    reservationData.products || []
  );

  return dispatchEmail({
    type: EMAIL_TYPES.RESERVATION_CREATED,
    to: email,
    subject,
    html,
    retries: 1,
    fireAndForget: true,
  });
};

export { EMAIL_TYPES };

