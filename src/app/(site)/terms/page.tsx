import type { Metadata } from "next";
import { location } from "@/config/location";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "Cancellation and terms (demo)",
  description: "Demo terms for a fictional firm: the £25 test deposit, free cancellation up to 24 hours before, and refunds. Nothing is sold.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  const { currencySymbol, depositPounds } = location;
  const deposit = `${currencySymbol}${depositPounds}`;
  return (
    <div className={styles.page}>
      <h1>Cancellation and terms</h1>
      <p className={styles.lead}>These are demo terms. Kirkgate Heating &amp; Plumbing is fictional, nothing is sold, and no contract is made on this website.</p>
      <div className={styles.prose}>
        <h2>The deposit</h2>
        <p>Booking a call-out takes a {deposit} deposit, using test money only. In the demo story, it comes off the final bill.</p>
        <h2>Cancelling</h2>
        <p>Cancelling is free up to 24 hours before the appointment, and the deposit is refunded. Refunds on this demo are made by the admin, in test mode.</p>
        <h2>Time windows</h2>
        <p>You choose a morning or an afternoon. The engineer would arrive at some point during that window. On Saturdays, only the morning is offered, and there are no Sunday bookings.</p>
        <h2>Prices</h2>
        <p>All prices on this site are demo prices. They are not offers and cannot be accepted.</p>
        <h2>If this were a real firm</h2>
        <p>A real firm would need its own terms, including customers&apos; legal rights to cancel. This page is a demo and is not legal advice.</p>
      </div>
    </div>
  );
}
