"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, isValidSession, SESSION_HOURS } from "@/lib/admin/session";
import { stripeClient } from "@/lib/booking/stripe";
import { allowAction, requireEnv, serverDb } from "@/lib/server";

const COOKIE = "kirkgate_admin";
const SIGN_INS_PER_DAY = 10;

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return isValidSession(jar.get(COOKIE)?.value, process.env.ADMIN_SESSION_SECRET);
}

export type SignInState = { message?: string };

export async function signIn(_previous: SignInState, data: FormData): Promise<SignInState> {
  const email = String(data.get("email") ?? "").trim().toLowerCase();
  const password = String(data.get("password") ?? "");
  const denied = { message: "That email and password did not work." };
  try {
    if (!(await allowAction(serverDb(), "admin-sign-in", SIGN_INS_PER_DAY))) return { message: "Too many tries today. Please try again tomorrow." };
    if (!email || !password || email !== requireEnv("ADMIN_EMAIL").toLowerCase()) return denied;
    const auth = createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), { auth: { persistSession: false, autoRefreshToken: false } });
    const { error } = await auth.auth.signInWithPassword({ email, password });
    if (error) return denied;
    const jar = await cookies();
    jar.set(COOKIE, await createSession(requireEnv("ADMIN_SESSION_SECRET")), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_HOURS * 3600,
    });
  } catch {
    return { message: "Signing in is not available right now." };
  }
  redirect("/admin");
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/admin/login");
}

export type RefundState = { message?: string };

export async function refundBooking(_previous: RefundState, data: FormData): Promise<RefundState> {
  if (!(await isAdmin())) redirect("/admin/login");
  const id = String(data.get("id") ?? "");
  try {
    const db = serverDb();
    const { data: booking } = await db.from("bookings").select("status, stripe_payment_intent").eq("id", id).single();
    if (!booking || booking.status !== "paid" || !booking.stripe_payment_intent) return { message: "Only a paid booking can be refunded." };
    // The key stops a double click from refunding twice. Stripe's webhook then confirms it, and this also updates the row straight away.
    await stripeClient().refunds.create({ payment_intent: booking.stripe_payment_intent }, { idempotencyKey: `refund-${id}` });
    await db.from("bookings").update({ status: "refunded", refunded_at: new Date().toISOString() }).eq("id", id).eq("status", "paid");
  } catch {
    return { message: "The refund did not go through. Nothing has changed." };
  }
  revalidatePath("/admin");
  redirect("/admin?refunded=1");
}
