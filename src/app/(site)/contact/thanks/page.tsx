import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/site";
import styles from "../../content.module.css";

export const metadata: Metadata = {
  title: "Thank you for your enquiry (demo)",
  description: "Your demo enquiry has been received.",
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return (
    <div className={styles.page}>
      <h1>Thank you. We have your enquiry.</h1>
      <p className={styles.lead}>In real life, the firm would now come back to you the way you chose. This firm is fictional, so nobody will contact you.</p>
      <p style={{ marginTop: "1rem" }}>Any notification goes to the demo inbox, not to you. Your enquiry is deleted from the website&apos;s database after 7 days.</p>
      <p style={{ marginTop: "1rem" }}><Link className={styles.inlineLink} href={routes.home}>Back to the home page</Link></p>
    </div>
  );
}
