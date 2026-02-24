const nodemailer = require("nodemailer");
const twilio = require("twilio");

// Email configuration
const getEmailTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Email credentials not configured in .env");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Twilio configuration
const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn("⚠️ Twilio credentials not configured in .env");
    return null;
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

// Send Email
exports.sendEmail = async (to, subject, html, shopName) => {
  console.log("\n--- EMAIL ATTEMPT ---");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("From:", shopName || process.env.COMPANY_NAME || 'Smart Grocery');
  
  const transporter = getEmailTransporter();
  if (!transporter) {
    console.log(`📧 [DEMO MODE] Email would be sent to ${to}`);
    console.log("Reason: Email credentials not configured in .env");
    return false;
  }
  
  try {
    const info = await transporter.sendMail({
      from: `"${shopName || process.env.COMPANY_NAME || 'Smart Grocery'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent successfully to ${to}`);
    console.log("Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Email error:", error.message);
    return false;
  }
};

// Send SMS
exports.sendSMS = async (to, message) => {
  console.log("\n--- SMS ATTEMPT ---");
  console.log("To:", to);
  console.log("Message:", message);
  console.log("TWILIO_ACCOUNT_SID configured:", process.env.TWILIO_ACCOUNT_SID ? "Yes" : "No");
  
  const twilioClient = getTwilioClient();
  if (!twilioClient) {
    console.log(`📱 [DEMO MODE] SMS would be sent to ${to}`);
    console.log("Reason: Twilio credentials not configured in .env");
    return false;
  }
  
  try {
    const result = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${to}`,
    });
    console.log(`✅ SMS sent successfully to ${to}`);
    console.log("Message SID:", result.sid);
    return true;
  } catch (error) {
    console.error("❌ SMS error:", error.message);
    console.error("Full error:", error);
    return false;
  }
};

// Staff Registration Notification
exports.sendStaffRegistrationNotification = async (staff, shopName) => {
  console.log("\n========== STAFF REGISTRATION NOTIFICATION ==========");
  console.log("Staff Details:", { name: staff.name, email: staff.email, role: staff.role });
  console.log("Shop Name:", shopName);
  
  const registrationLink = `${process.env.FRONTEND_URL}/staff-register?email=${staff.email}&staffId=${staff._id}`;
  console.log("\n🔗 REGISTRATION LINK:", registrationLink);
  console.log("FRONTEND_URL from env:", process.env.FRONTEND_URL);
  
  const companyName = shopName || 'Your Company';
  
  const emailSubject = `Invitation to Join ${companyName}`;
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header with Gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); padding: 40px 30px; text-align: center;">
                  <div style="background-color: rgba(255, 255, 255, 0.2); width: 60px; height: 60px; border-radius: 12px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                      <path d="M3 3v18h18"/>
                      <path d="M18 17V9"/>
                      <path d="M13 17V5"/>
                      <path d="M8 17v-3"/>
                    </svg>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">ACCUNEX</h1>
                  <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 14px; font-weight: 500;">Business Management Platform</p>
                </td>
              </tr>
              
              <!-- Welcome Badge -->
              <tr>
                <td style="padding: 0 30px;">
                  <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); margin: -20px 0 0 0; padding: 20px; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; color: #0d9488; font-size: 16px; font-weight: 600;">🎉 You've Been Invited!</p>
                  </div>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px 30px;">
                  <p style="margin: 0 0 20px 0; color: #1f2937; font-size: 16px; line-height: 1.6;">
                    Hi <strong style="color: #0d9488;">${staff.name}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 15px; line-height: 1.7;">
                    Great news! <strong>${companyName}</strong> has invited you to join their team as a <strong style="color: #0d9488;">${staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}</strong>.
                  </p>
                  
                  <!-- Info Box -->
                  <div style="background-color: #f9fafb; border-left: 4px solid #0d9488; padding: 16px 20px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">What's Next?</p>
                    <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Click the button below to set up your account and start managing business operations securely.
                    </p>
                  </div>
                  
                  <!-- Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding: 10px 0 30px 0;">
                        <a href="${registrationLink}" style="display: inline-block; background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; text-decoration: none; padding: 16px 48px; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px rgba(13, 148, 136, 0.3);">
                          Activate My Account →
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Or Copy Link -->
                  <p style="margin: 0 0 10px 0; color: #9ca3af; font-size: 13px; text-align: center;">
                    Or copy this link:
                  </p>
                  <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 25px;">
                    <p style="margin: 0; color: #6b7280; font-size: 12px; word-break: break-all; text-align: center;">
                      ${registrationLink}
                    </p>
                  </div>
                  
                  <!-- Security Note -->
                  <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.5;">
                      ⚠️ <strong>Security Notice:</strong> This invitation link expires in 24 hours for your security.
                    </p>
                  </div>
                  
                  <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    If you have any questions, please contact your company administrator.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 5px 0; color: #1f2937; font-size: 14px;">
                    Best regards,
                  </p>
                  <p style="margin: 0 0 25px 0; color: #0d9488; font-size: 15px; font-weight: 600;">
                    ${companyName} Team
                  </p>
                  
                  <!-- Accunex Branding -->
                  <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 12px;">
                      Powered by
                    </p>
                    <p style="margin: 0; color: #0d9488; font-size: 16px; font-weight: 700; letter-spacing: -0.3px;">
                      ACCUNEX
                    </p>
                    <p style="margin: 5px 0 0 0; color: #9ca3af; font-size: 11px;">
                      Business Management Platform
                    </p>
                  </div>
                </td>
              </tr>
              
            </table>
            
            <!-- Footer Note -->
            <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
              This email was sent to ${staff.email}<br>
              If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await this.sendEmail(staff.email, emailSubject, emailHtml, shopName);
  
  console.log("======================================================\n");
};
