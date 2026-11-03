"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DEPOSIT_PENCE, isBookable, windowLabel } from "@/lib/booking/dates";
import { stripeClient } from "@/lib/booking/stripe";
import { isSpam, keepValues, validateContact, type FieldErrors, type FormState } from "@/lib/forms";
import { allowAction, serverDb } from "@/lib/server";

const BOOKINGS_PER_DAY = 6;
const FAILED = "We could not start the payment, and nothing has been charged. Please try again, or use the enquiry form.";

async function siteOrigin(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  const list = await headers();
  return `${list.get("x-forwarded-proto") ?? "http"}://${list.get("host")}`;
}

export async function startBooking(_previous: FormState, data: FormData): Promise<FormState> {
  if (isSpam(data)) redirect("/book");

  const errors: FieldErrors = {};
  const contact = validateContact(data, errors);
  const date = String(data.get("date") ?? "");
  const visitWindow = String(data.get("window") ?? "");
  if (!date) errors.date = "Choose a date.";
  else if (!visitWindow) errors.window = "Choose a time window.";
  else if (!isBookable(date, visitWindow, new Date())) errors.window = "That date and window are not available. Please choose again.";
  if (data.get("consent") !== "yes") errors.consent = "Tick this box to agree to the cancellation terms.";
  if (Object.keys(errors).length) return { errors, values: keepValues(data) };

  let checkoutUrl: string | null = null;
  try {
    const db = serverDb();
    if (!(await allowAction(db, "booking", BOOKINGS_PER_DAY))) {
      return { errors: {}, values: keepValues(data), message: "You have started several bookings today. Please use the enquiry form instead." };
    }
    const { data: booking, error } = await db
      .from("bookings")
      .insert({ ...contact, visit_date: date, visit_window: visitWindow, amount_pence: DEPOSIT_PENCE })
      .select("id")
      .single();
    if (error) return { errors: {}, values: keepValues(data), message: FAILED };

    const origin = await siteOrigin();
    const session = await stripeClient().checkout.sessions.create(
      {
        mode: "payment",
        integration_identifier: "kirkgate_deposit_qhtbxmzr",
        // Managed Payments is for digital products, not a call-out deposit. This changes this session only, not the account.
        managed_payments: { enabled: false },
        client_reference_id: booking.id,
        customer_email: contact.email,
        locale: "en-GB",
        expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "gbp",
              unit_amount: DEPOSIT_PENCE,
              product_data: {
                name: "Call-out deposit (demo, test money only)",
                description: `${date}, ${windowLabel(date, visitWindow)}. Comes off the final bill.`,
              },
            },
          },
        ],
        metadata: { booking_id: booking.id },
        success_url: `${origin}/book/confirmed?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/book?cancelled=1`,
      },
      { idempotencyKey: `booking-${booking.id}` },
    );
    // If the link cannot be saved, no webhook could ever find this booking, so the payment page is never shown.
    const { error: linkError } = await db.from("bookings").update({ stripe_session_id: session.id }).eq("id", booking.id);
    if (linkError) {
      await stripeClient().checkout.sessions.expire(session.id).catch(() => undefined);
      return { errors: {}, values: keepValues(data), message: FAILED };
    }
    checkoutUrl = session.url;
  } catch {
    return { errors: {}, values: keepValues(data), message: FAILED };
  }
  if (!checkoutUrl) return { errors: {}, values: keepValues(data), message: FAILED };
  redirect(checkoutUrl);
}
