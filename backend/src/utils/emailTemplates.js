/**
 * Email Templates for Reservation Status Changes
 */

export const getReservationStatusEmailTemplate = (
  userName,
  reservationId,
  status,
  reservationDate,
  totalPrice,
  remarks = ""
) => {
  const statusConfig = {
    pending: {
      color: "#F59E0B",
      icon: "⏳",
      title: "Reservation Pending",
      message: "Your reservation is awaiting confirmation.",
    },
    confirmed: {
      color: "#3B82F6",
      icon: "✅",
      title: "Reservation Confirmed",
      message: "Great news! Your reservation has been confirmed.",
    },
    cancelled: {
      color: "#EF4444",
      icon: "❌",
      title: "Reservation Cancelled",
      message: "Your reservation has been cancelled.",
    },
    completed: {
      color: "#10B981",
      icon: "🎉",
      title: "Reservation Completed",
      message: "Thank you! Your reservation has been completed successfully.",
    },
    failed: {
      color: "#EF4444",
      icon: "⚠️",
      title: "Reservation Failed",
      message: "Unfortunately, your reservation could not be processed.",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 10px;">${config.icon}</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">${config.title}</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">
                Hello <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151;">
                ${config.message}
              </p>

              <!-- Reservation Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                <tr>
                  <td>
                    <h3 style="margin: 0 0 15px; font-size: 18px; color: #111827;">Reservation Details</h3>
                    
                    <table width="100%" cellpadding="8" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size: 14px; color: #6b7280; width: 40%;">Reservation ID:</td>
                        <td style="font-size: 14px; color: #111827; font-weight: 600;">#${reservationId.slice(-8)}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #6b7280;">Status:</td>
                        <td>
                          <span style="display: inline-block; padding: 4px 12px; background-color: ${config.color}20; color: ${config.color}; border-radius: 12px; font-size: 13px; font-weight: 600; text-transform: capitalize;">
                            ${status}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #6b7280;">Reservation Date:</td>
                        <td style="font-size: 14px; color: #111827; font-weight: 600;">${new Date(reservationDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 14px; color: #6b7280;">Total Amount:</td>
                        <td style="font-size: 18px; color: ${config.color}; font-weight: bold;">₱${totalPrice.toLocaleString()}</td>
                      </tr>
                      ${remarks ? `
                      <tr>
                        <td colspan="2" style="padding-top: 15px; border-top: 1px solid #e5e7eb; margin-top: 10px;">
                          <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Remarks:</div>
                          <div style="font-size: 14px; color: #111827; background-color: #ffffff; padding: 10px; border-radius: 6px; border-left: 3px solid ${config.color};">
                            ${remarks}
                          </div>
                        </td>
                      </tr>
                      ` : ""}
                    </table>
                  </td>
                </tr>
              </table>

              ${status === "confirmed" ? `
              <div style="background-color: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #1e40af;">
                  <strong>Next Steps:</strong> Please prepare for your reservation date. We look forward to serving you!
                </p>
              </div>
              ` : ""}

              ${status === "completed" ? `
              <div style="background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #065f46;">
                  <strong>Thank you for your business!</strong> We hope to see you again soon.
                </p>
              </div>
              ` : ""}

              ${status === "cancelled" || status === "failed" ? `
              <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <p style="margin: 0; font-size: 14px; color: #991b1b;">
                  If you have any questions or concerns, please don't hesitate to contact us.
                </p>
              </div>
              ` : ""}

              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #6b7280;">
                Best regards,<br>
                <strong style="color: #111827;">Hardware Tech Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #9ca3af;">
                This is an automated notification email. Please do not reply to this message.
              </p>
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
};

