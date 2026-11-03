import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { location } from "../../config/location";
import { DEPOSIT_PENCE, windowLabel } from "./dates";

type SendEmail = (subject: string, text: string) => Promise<boolean>;

function intentId(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

// Only a paid, test-mode session for exactly the right amount can confirm a booking.
async function confirmPaid(db: SupabaseClient, session: Stripe.Checkout.Session, sendEmail: SendEmail) {
  if (session.payment_status !== "paid") return;
  if (session.amount_total !== DEPOSIT_PENCE || session.currency !== "gbp") return;

  const { data: first, error } = await db.rpc("mark_booking_paid", {
    p_session: session.id,
    p_intent: intentId(session.payment_intent),
  });
  if (error) throw new Error(`mark paid failed: ${error.code}`);
  // A repeat delivery changes nothing and sends no second email.
  if (first !== true) return;

  const { data: booking } = await db.from("bookings").select("id, name, visit_date, visit_window, phone, email").eq("stripe_session_id", session.id).single();
  if (!booking) return;
  const sent = await sendEmail(
    `Call-out booked for ${booking.visit_date}`,
    [
      `Booking confirmed, with a ${location.currencySymbol}${location.depositPounds} test deposit paid. It comes off the final bill.`,
      `Name: ${booking.name}`,
      `Phone: ${booking.phone}`,
      `Email: ${booking.email}`,
      `Date: ${booking.visit_date}`,
      `Window: ${windowLabel(booking.visit_date, booking.visit_window)}`,
      "Free cancellation up to 24 hours before.",
    ].join("\n"),
  );
  if (sent) await db.from("bookings").update({ email_sent: true }).eq("id", booking.id);
}

export async function handleStripeEvent(db: SupabaseClient, event: Stripe.Event, sendEmail: SendEmail): Promise<void> {
  // This demo must never act on anything from a live Stripe account.
  if (event.livemode) return;

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await confirmPaid(db, event.data.object, sendEmail);
      break;
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const { error } = await db.from("bookings").update({ status: "expired" }).eq("stripe_session_id", event.data.object.id).eq("status", "pending");
      if (error) throw new Error(`expire failed: ${error.code}`);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object;
      if (!charge.refunded) break;
      const { error } = await db
        .from("bookings")
        .update({ status: "refunded", refunded_at: new Date().toISOString() })
        .eq("stripe_payment_intent", intentId(charge.payment_intent))
        .eq("status", "paid");
      if (error) throw new Error(`refund failed: ${error.code}`);
      break;
    }
    default:
      break;
  }

  await db.from("stripe_events").upsert({ id: event.id, type: event.type }, { onConflict: "id", ignoreDuplicates: true });
}
