import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || "noreply@taskbox.dev";
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: smtpUser && smtpPass ? {
    user: smtpUser,
    pass: smtpPass,
  } : undefined,
});

interface SendInvitationEmailParams {
  to: string;
  workspaceName: string;
  inviterName: string;
  role: string;
  token: string;
}

export async function sendInvitationEmail({
  to,
  workspaceName,
  inviterName,
  role,
  token,
}: SendInvitationEmailParams) {
  const acceptLink = `${clientUrl}/invitations/${token}`;

  const mailOptions = {
    from: `"Taskbox" <${smtpFrom}>`,
    to,
    subject: `You've been invited to join the workspace "${workspaceName}" on Taskbox`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; tracking-tight: -0.025em;">Taskbox</h1>
        </div>
        
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Workspace Invitation</h2>
        
        <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 16px;">
          Hi there,
        </p>
        
        <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
          <strong>${inviterName}</strong> has invited you to join the workspace <strong>"${workspaceName}"</strong> as an <strong>${role}</strong>.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${acceptLink}" style="background-color: #0f172a; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; transition: background-color 0.2s;">
            View Invitation
          </a>
        </div>
        
        <p style="color: #64748b; font-size: 14px; line-height: 22px; margin-bottom: 24px;">
          This invitation link will expire in <strong>7 days</strong>.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
        
        <p style="color: #94a3b8; font-size: 12px; line-height: 18px; margin: 0;">
          If the button doesn't work, copy and paste this URL into your browser: <br />
          <a href="${acceptLink}" style="color: #2563eb; text-decoration: none; word-break: break-all;">${acceptLink}</a>
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Invitation email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    throw error;
  }
}

interface SendRemovalEmailParams {
  to: string;
  workspaceName: string;
  removerName: string;
}

export async function sendRemovalEmail({
  to,
  workspaceName,
  removerName,
}: SendRemovalEmailParams) {
  const mailOptions = {
    from: `"Taskbox" <${smtpFrom}>`,
    to,
    subject: `You have been removed from the workspace "${workspaceName}"`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; tracking-tight: -0.025em;">Taskbox</h1>
        </div>
        
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Workspace Notification</h2>
        
        <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 16px;">
          Hi there,
        </p>
        
        <p style="color: #334155; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
          <strong>${removerName}</strong> has removed you from the workspace <strong>"${workspaceName}"</strong>.
        </p>
        
        <p style="color: #64748b; font-size: 14px; line-height: 22px; margin-bottom: 24px;">
          You will no longer have access to this workspace or its boards. If you believe this is a mistake, please contact the workspace owner.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Removal email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send removal email:", error);
    throw error;
  }
}
