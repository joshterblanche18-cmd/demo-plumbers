import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";
import { location } from "@/config/location";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "Contact and enquiries, Aberdeen plumber (demo)",
  description: "Send an enquiry to a fictional Aberdeen plumbing and heating firm. This demo form really works, but nobody will really reply. Nothing is sold.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { phone, address } = location;
  return (
    <div className={styles.page}>
      <h1>Send an enquiry</h1>
      <p className={styles.lead}>Tell us what has gone wrong. This form really works, but the firm is fictional, so nobody will really reply.</p>
      <p style={{ margin: "0.75rem 0 1.5rem" }}>
        Or call <a className={styles.inlineLink} href={`tel:${phone.tel}`}>{phone.display}</a>. We are at {address}. Both are made up.
      </p>
      <EnquiryForm />
    </div>
  );
}
