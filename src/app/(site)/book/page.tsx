import type { Metadata } from "next";
import Link from "next/link";
import { BookingForm } from "@/components/BookingForm";
import formStyles from "@/components/Form.module.css";
import { location } from "@/config/location";
import { routes } from "@/config/site";
import { bookableDays } from "@/lib/booking/dates";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "Book a call-out with a £25 test deposit (demo)",
  description: "Pick a date and a morning or afternoon, then pay a £25 call-out deposit with test money. A fictional firm's demo checkout. Nothing is sold.",
  alternates: { canonical: "/book" },
};
export const dynamic = "force-dynamic";

export default async function BookPage({ searchParams }: { searchParams: Promise<{ cancelled?: string }> }) {
  const { cancelled } = await searchParams;
  const { currencySymbol, depositPounds, gasEmergency } = location;
  return (
    <div className={styles.page}>
      <h1>Book a call-out</h1>
      <p className={styles.lead}>Pick a date and a window, then pay a {currencySymbol}{depositPounds} deposit, which comes off your final bill. Cancelling is free up to 24 hours before.</p>

      {cancelled && <p className={formStyles.summary} style={{ marginTop: "1rem" }} role="status">You left the payment page, so nothing was paid and no call-out is booked.</p>}

      <div className={formStyles.testCard} style={{ margin: "1.25rem 0" }}>
        <p><strong>This uses test money. No real card is charged.</strong></p>
        <p style={{ marginTop: "0.4rem" }}>On the payment page, use card number <code>4242 4242 4242 4242</code>, any future expiry date and any 3-digit code. Please do not enter a real card.</p>
      </div>

      <p className={formStyles.safety} style={{ marginBottom: "1.25rem" }}>
        <strong>An emergency today?</strong> <Link href={routes.contact}>Send an enquiry</Link> or call instead. If you smell gas, call the {gasEmergency.name} on <a href={`tel:${gasEmergency.tel}`}>{gasEmergency.display}</a>.
      </p>

      <BookingForm days={bookableDays(new Date())} />
    </div>
  );
}
