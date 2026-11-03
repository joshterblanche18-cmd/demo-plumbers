import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Uses the secret key, on the server only. Visitors' keys cannot reach these tables or functions.
export function limitsClient(url: string, secretKey: string): SupabaseClient {
  return createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function reserveBudget(db: SupabaseClient, day: string, amount: number, limit: number): Promise<boolean> {
  const { data, error } = await db.rpc("chat_reserve_budget", { p_day: day, p_amount: amount, p_limit: limit });
  if (error) throw new Error(`reserve failed: ${error.code}`);
  return data === true;
}

export async function settleBudget(db: SupabaseClient, day: string, reserved: number, actual: number): Promise<void> {
  const { error } = await db.rpc("chat_settle_budget", { p_day: day, p_reserved: reserved, p_actual: actual });
  if (error) throw new Error(`settle failed: ${error.code}`);
}

export async function countVisitor(db: SupabaseClient, day: string, hash: string, limit: number): Promise<boolean> {
  const { data, error } = await db.rpc("chat_count_visitor", { p_day: day, p_hash: hash, p_limit: limit });
  if (error) throw new Error(`count failed: ${error.code}`);
  return data === true;
}

// The hash changes every day and needs the secret salt, so a stored row cannot be traced back to a visitor.
export async function visitorHash(address: string, day: string, salt: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${salt}|${day}|${address}`));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}
