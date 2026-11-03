import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { londonDay } from "./chat/cost";
import { visitorHash } from "./chat/limits";

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing setting: ${name}`);
  return value;
}

// Uses the secret key, so this file must only ever run on the server.
export function serverDb(): SupabaseClient {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Counts an action against a per-visitor daily limit, using a hash that changes daily and stores no address.
export async function allowAction(db: SupabaseClient, action: string, limit: number): Promise<boolean> {
  const list = await headers();
  const address = list.get("cf-connecting-ip") ?? list.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const day = londonDay(new Date());
  const hash = await visitorHash(address, day, requireEnv("IP_HASH_SALT"));
  const { data, error } = await db.rpc("count_action", { p_day: day, p_action: action, p_hash: hash, p_limit: limit });
  if (error) throw new Error(`limit check failed: ${error.code}`);
  return data === true;
}
