import Stripe from "stripe";
import { stripeClient } from "@/lib/booking/stripe";
import { handleStripeEvent } from "@/lib/booking/webhook";
import { sendDemoEmail } from "@/lib/email";
import { serverDb } from "@/lib/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Not allowed", { status: 400 });

  const stripe = stripeClient();
  let event: Stripe.Event;
  try {
    // The exact raw text is needed: the signature proves the message really came from Stripe.
    event = await stripe.webhooks.constructEventAsync(await request.text(), signature, secret, undefined, Stripe.createSubtleCryptoProvider());
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  try {
    await handleStripeEvent(serverDb(), event, sendDemoEmail);
  } catch {
    // A failure asks Stripe to send the event again later.
    return new Response("Try again", { status: 500 });
  }
  return new Response("OK", { status: 200 });
}
