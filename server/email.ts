import nodemailer from "nodemailer";

// Environment variables for email configuration
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const APP_URL = process.env.APP_URL || "http://localhost:5000";

/**
 * Check if email is configured
 */
export function isEmailConfigured(): boolean {
  return !!(EMAIL_USER && EMAIL_PASS);
}

/**
 * Create email transporter - connects to email service
 * For production, configure with your email provider (Gmail, SendGrid, etc.)
 */
const createTransporter = () => {
  if (!isEmailConfigured()) {
    throw new Error("Email credentials not configured. Set EMAIL_USER and EMAIL_PASS in .env file.");
  }
  
  return nodemailer.createTransport({
    service: "gmail", // Change to your email service
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS, // Use App Password for Gmail
    },
  });
};

/**
 * Send password reset email with token link
 * @param email - User's email address
 * @param resetToken - Random token for password reset
 * @param userName - User's first name for personalization
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<void> {
  // Construct the reset link with token as query parameter
  const resetLink = `${APP_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Password Reset Request - Ecospace Employee Portal",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #2563eb; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0;
            font-weight: bold;
          }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .warning { color: #dc2626; font-weight: bold; margin: 15px 0; }
          .token-box {
            word-break: break-all; 
            background: #e5e7eb; 
            padding: 10px; 
            border-radius: 4px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <p>We received a request to reset your password for your Ecospace Employee Portal account.</p>
            <p>Click the button below to reset your password:</p>
            <center>
              <a href="${resetLink}" class="button">Reset Password</a>
            </center>
            <p>Or copy and paste this link into your browser:</p>
            <div class="token-box">${resetLink}</div>
            <p class="warning">⚠️ This link will expire in 10 minutes for security.</p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            <p>For security reasons, we recommend:</p>
            <ul>
              <li>Use a strong, unique password</li>
              <li>Don't share your password with anyone</li>
              <li>Change your password regularly</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2025 Ecospace Employee Portal. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  // Create transporter and send the email
  const transporter = createTransporter();
  await transporter.sendMail(mailOptions);
}
