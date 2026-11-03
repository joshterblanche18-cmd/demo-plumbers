import { Resend } from "resend";

// Sends only to the demo inbox. Without a domain of our own, Resend allows no other address.
// Returns false instead of throwing, because a failed email must never lose an enquiry or a booking.
export async function sendDemoEmail(subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.DEMO_INBOX_EMAIL;
  if (!key || !to) return false;
  try {
    const { error } = await new Resend(key).emails.send({
      from: "Kirkgate demo <onboarding@resend.dev>",
      to,
      subject: `[Demo] ${subject}`,
      text: `${text}\n\nThis came from a demo website for a fictional business. Nothing is sold.`,
    });
    return !error;
  } catch {
    return false;
  }
}
