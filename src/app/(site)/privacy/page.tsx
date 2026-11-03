import type { Metadata } from "next";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "Privacy on this demo website",
  description: "What this demo website saves, who handles it and when it is deleted. Demo data is removed after 7 days. No tracking, and no cookies for visitors.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      <h1>Privacy</h1>
      <p className={styles.lead}>This is a demo website for a fictional firm. Please do not enter anything private. Use made-up details if you like.</p>
      <div className={styles.prose}>
        <h2>What we save, and for how long</h2>
        <ul className={styles.list}>
          <li><strong>Enquiries:</strong> what you type in the form. Deleted from the website&apos;s database after 7 days.</li>
          <li><strong>Call-out bookings:</strong> what you type in the form, plus the payment status. Deleted from the website&apos;s database after 7 days.</li>
          <li><strong>Emails:</strong> a copy of each enquiry and booking is emailed to the demo inbox. That copy, and any record kept by the email service, is not covered by the 7-day deletion and may last longer. This is one more reason to use made-up details.</li>
          <li><strong>Limits:</strong> a scrambled code made from your connection, so that one visitor cannot use up the demo. It changes each day, and cannot show who you are. Deleted after 7 days.</li>
          <li><strong>Chats:</strong> not saved after your visit. We keep only a count of the messages and their cost.</li>
        </ul>
        <h2>Who handles it</h2>
        <ul className={styles.list}>
          <li><strong>Supabase</strong> stores the enquiries and bookings.</li>
          <li><strong>Stripe</strong> runs the test payment page. Card details go to Stripe, not to this website. Please use the test card.</li>
          <li><strong>Resend</strong> sends a notification to the demo inbox.</li>
          <li><strong>Anthropic</strong> writes the AI assistant&apos;s replies, so it receives your chat messages. Its own data rules apply.</li>
          <li><strong>Cloudflare</strong> hosts the website.</li>
        </ul>
        <h2>Cookies and tracking</h2>
        <p>Visitors get no cookies, and there is no tracking or advertising. The only cookie is a sign-in cookie for the firm&apos;s private admin page. The dark mode button stores nothing. If you copy a chat into the enquiry form, it is kept in that browser tab only until you close it.</p>
        <h2>If this were a real firm</h2>
        <p>A real firm would need its own privacy notice under UK data protection law, with its own contact details and a way to ask for your data. This page is a demo and is not legal advice.</p>
        <p>Questions about this demo can go to <a className={styles.inlineLink} href="https://tarnfield.pages.dev/">Tarnfield</a>, which made it.</p>
      </div>
    </div>
  );
}
