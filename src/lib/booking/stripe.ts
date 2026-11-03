import Stripe from "stripe";

// Test mode only. Any live key is refused, here and at every use.
export function assertTestKey(key: string | undefined): string {
  if (!key || !/^(sk|rk)_test_/.test(key)) throw new Error("Only Stripe test keys are allowed on this demo.");
  return key;
}

export function stripeClient(): Stripe {
  return new Stripe(assertTestKey(process.env.STRIPE_SECRET_KEY), {
    httpClient: Stripe.createFetchHttpClient(),
    maxNetworkRetries: 1,
  });
}
