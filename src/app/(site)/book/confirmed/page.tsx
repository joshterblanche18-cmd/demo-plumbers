import type { Metadata } from "next";
import Link from "next/link";
import { location } from "@/config/location";
import { routes } from "@/config/site";
import { windowLabel } from "@/lib/booking/dates";
import { serverDb } from "@/lib/server";
import styles from "../../content.module.css";

export const metadata: Metadata = {
  title: "Your call-out booking (demo)",
  description: "The status of your demo call-out booking.",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

// Shows what the database says. Only Stripe's signed webhook can mark a booking as paid, never this page.
export default async function ConfirmedPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId } = await searchParams;
  const valid = typeof sessionId === "string" && /^cs_test_[A-Za-z0-9_]+$/.test(sessionId);
  const { data: booking } = valid
    ? await serverDb().from("bookings").select("status, visit_date, visit_window").eq("stripe_session_id", sessionId).maybeSingle()
    : { data: null };
  const { currencySymbol, depositPounds } = location;

  if (!booking) {
    return (
      <div className={styles.page}>
        <h1>We could not find that booking</h1>
        <p className={styles.lead}>The link may be out of date. Bookings are deleted after 7 days.</p>
        <p style={{ marginTop: "1rem" }}><Link className={styles.inlineLink} href={routes.book}>Book a call-out</Link></p>
      </div>
    );
  }

  const date = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${booking.visit_date}T12:00:00Z`));

  if (booking.status === "paid") {
    return (
      <div className={styles.page}>
        <h1>Your call-out is booked</h1>
        <p className={styles.lead}>{date}. {windowLabel(booking.visit_date, booking.visit_window)}.</p>
        <p style={{ marginTop: "1rem" }}>Your {currencySymbol}{depositPounds} test deposit comes off the final bill. You can cancel free up to 24 hours before.</p>
        <p style={{ marginTop: "0.75rem" }}>A confirmation email went to the demo inbox, not to you, and no real money was taken. This firm is fictional, so nobody will really come out.</p>
        <p style={{ marginTop: "1rem" }}><Link className={styles.inlineLink} href={routes.home}>Back to the home page</Link></p>
      </div>
    );
  }
  if (booking.status === "refunded") {
    return (
      <div className={styles.page}>
        <h1>This booking was refunded</h1>
        <p className={styles.lead}>The test deposit has gone back, and no call-out is booked.</p>
      </div>
    );
  }
  if (booking.status === "expired") {
    return (
      <div className={styles.page}>
        <h1>This booking was not paid</h1>
        <p className={styles.lead}>The payment page timed out, so no call-out is booked and nothing was charged.</p>
        <p style={{ marginTop: "1rem" }}><Link className={styles.inlineLink} href={routes.book}>Book a call-out</Link></p>
      </div>
    );
  }
  return (
    <div className={styles.page}>
      <h1>Waiting for payment confirmation</h1>
      <p className={styles.lead}>We have not had confirmation from the payment service yet, so this call-out is not booked yet. This usually takes a few seconds.</p>
      <p style={{ marginTop: "1rem" }}><a className={styles.inlineLink} href={`/book/confirmed?session_id=${sessionId}`}>Check again</a></p>
    </div>
  );
}
