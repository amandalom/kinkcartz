// STUB-friendly email sender: uses Resend's HTTP API directly (no SDK
// dependency) if RESEND_API_KEY is set. Without it, this just logs —
// matches the rest of this codebase's "wire the real thing before going
// live" pattern (see app/api/checkout/route.ts, README).
type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: Buffer }[];
};

export async function sendEmail({ to, subject, html, text, attachments }: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "kinkcartz <orders@kinkcartz.example>";

  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY not set — skipping send, dumping to console instead.\nTo: ${to}\nSubject: ${subject}\n${text}`
    );
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
        text,
        attachments: attachments?.map((a) => ({
          filename: a.filename,
          content: a.content.toString("base64"),
        })),
      }),
    });
    if (!res.ok) {
      console.error(`[email] Resend API error ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error("[email] failed to send", err);
  }
}
