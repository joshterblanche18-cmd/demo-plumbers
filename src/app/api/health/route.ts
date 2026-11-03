import { serverDb } from "@/lib/server";

export const dynamic = "force-dynamic";

// A small scheduled visit keeps the free database awake, because it pauses after a week with no activity.
// It reads only a count and reveals nothing.
export async function GET() {
  try {
    const { error } = await serverDb().from("chat_budget_days").select("day", { head: true, count: "exact" });
    return Response.json({ ok: !error }, { status: error ? 503 : 200, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
