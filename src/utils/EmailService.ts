import Mailgun from "mailgun.js";
import FormData from "form-data"; // form-data v4.0.1

export async function sendOtpEmail(email: string, otp: number) {
  const mailgun = new Mailgun(FormData);

  const mg = mailgun.client({
    username: "api",
    key: process.env.MAIL_GUN_API_KEY || "",
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net"
  });

  try {
    const data = await mg.messages.create(
      "sandboxe85f63a918af4937a02f8434b6bed8c8.mailgun.org",
      {
        from: "Mailgun Sandbox <postmaster@sandboxe85f63a918af4937a02f8434b6bed8c8.mailgun.org>",
        to: [email],
        subject: "Hello Keerthivasan",
        text: `Congratulations Keerthivasan, you just sent an email with Mailgun! You are truly awesome! Otp is ${otp}`,
      },
    );

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
}

export async function sendTeamInvitationEmail(
  email: string,
  teamName: string,
  inviteLink: string,
) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Enhance AI" <noreply@enhanceai.com>',
    to: email,
    subject: `Invitation to join team "${teamName}" - Enhance AI`,
    text: `You have been invited to join the team "${teamName}". Click the link to accept: ${inviteLink}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Enhance AI</h2>
        <p>Hello,</p>
        <p>You have been invited to join the team <strong>"${teamName}"</strong> on Enhance AI.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteLink}" style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p>If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${inviteLink}</p>
        <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px; text-align: center;">&copy; 2026 Enhance AI. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending invitation email:", error);
    // In development, we still want to see the link in logs if email fails
    console.log(`FALLBACK: Invitation link for ${email}: ${inviteLink}`);
  }
}

export async function sendForgotPasswordEmail(email: string, otp: number) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Enhance AI" <noreply@enhanceai.com>',
    to: email,
    subject: "Reset Your Password - Enhance AI",
    text: `Your password reset code is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Enhance AI</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Use the code below to proceed:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px; text-align: center;">&copy; 2026 Enhance AI. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Forgot password email sent to ${email}`);
  } catch (error) {
    console.error("Error sending forgot password email:", error);
    // In development, we still want to see the OTP in logs if email fails
    console.log(`FALLBACK: Reset OTP for ${email}: ${otp}`);
  }
}

export async function sendRegistrationInvitationEmail(
  email: string,
  teamName: string,
  inviteLink: string,
) {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"Enhance AI" <noreply@enhanceai.com>',
    to: email,
    subject: `Invitation to join team "${teamName}" - Enhance AI`,
    text: `You have been invited to join the team "${teamName}". Please register first and then click the link to accept: ${inviteLink}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4f46e5; text-align: center;">Enhance AI</h2>
        <p>Hello,</p>
        <p>You have been invited to join the team <strong>"${teamName}"</strong> on Enhance AI.</p>
        <div style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #92400e;"><strong>Note:</strong> You need to create an account first before accepting this invitation.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/register" style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; margin-right: 10px;">
            Register Now
          </a>
        </div>
        <p>After registering, use this link to join the team:</p>
        <p style="word-break: break-all; color: #6b7280; font-size: 14px; background: #f3f4f6; padding: 10px; border-radius: 4px;">${inviteLink}</p>
        <p>If you weren't expecting this invitation, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px; text-align: center;">&copy; 2026 Enhance AI. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Registration invitation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending registration invitation email:", error);
    // In development, we still want to see the link in logs if email fails
    console.log(
      `FALLBACK: Registration invitation link for ${email}: ${inviteLink}`,
    );
  }
}
