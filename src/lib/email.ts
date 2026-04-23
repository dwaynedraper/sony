import "server-only";
import { Resend } from "resend";

let _resend: Resend | null = null;

function getClient(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set.");
  _resend = new Resend(key);
  return _resend;
}

export async function sendMagicLink(email: string, url: string): Promise<void> {
  const from = process.env.EMAIL_FROM;
  if (!from) throw new Error("EMAIL_FROM is not set.");

  const html = `
<!doctype html>
<html>
  <body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#0a0a0a;color:#e5e5e5;padding:40px 20px;">
    <div style="max-width:480px;margin:0 auto;background:#141414;border-radius:12px;padding:32px;">
      <h1 style="font-size:20px;margin:0 0 16px;color:#fff;">Sign in to Sony Rep Toolkit</h1>
      <p style="margin:0 0 24px;line-height:1.5;">Click the button below to finish signing in. This link expires in 15 minutes and can only be used once.</p>
      <p style="margin:0 0 24px;">
        <a href="${url}" style="display:inline-block;background:#fff;color:#000;text-decoration:none;padding:12px 20px;border-radius:8px;font-weight:600;">Sign in</a>
      </p>
      <p style="margin:0;font-size:12px;color:#888;">If the button doesn't work, paste this URL into your browser:<br><span style="word-break:break-all;">${url}</span></p>
      <p style="margin:24px 0 0;font-size:12px;color:#666;">If you didn't request this, you can ignore this email.</p>
    </div>
  </body>
</html>`.trim();

  const text = `Sign in to Sony Rep Toolkit\n\n${url}\n\nThis link expires in 15 minutes and can only be used once. If you didn't request this, ignore this email.`;

  await getClient().emails.send({
    from,
    to: email,
    subject: "Sign in to Sony Rep Toolkit",
    html,
    text,
  });
}
