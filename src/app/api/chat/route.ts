import Anthropic from "@anthropic-ai/sdk";
import { chatClient, generateReply } from "@/lib/chat/answer";
import { dailyBudget, londonDay, worstCaseCost } from "@/lib/chat/cost";
import { LIMITS, parseMessages } from "@/lib/chat/input";
import { countVisitor, limitsClient, reserveBudget, settleBudget, visitorHash } from "@/lib/chat/limits";
import { systemPrompt } from "@/lib/chat/reply";
import { detectEmergency } from "@/lib/chat/safety";
import type { ChatResponse } from "@/lib/chat/types";

export const dynamic = "force-dynamic";

const send = (body: ChatResponse, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return send({ kind: "invalid" }, 403);

  // The declared size is checked first, so an oversized request is refused without being read.
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > LIMITS.maxBodyBytes) return send({ kind: "too_long" }, 413);
  const raw = await request.text();
  if (raw.length > LIMITS.maxBodyBytes) return send({ kind: "too_long" }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return send({ kind: "invalid" }, 400);
  }
  const input = parseMessages(body);
  if (!input.ok) return send({ kind: input.reason }, input.reason === "invalid" ? 400 : 200);

  // Safety first: an emergency gets official advice with no AI call and no charge.
  const emergency = detectEmergency(input.messages[input.messages.length - 1].content);
  if (emergency) return send({ kind: "emergency", emergency });

  const { ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, IP_HASH_SALT, CHAT_DAILY_BUDGET_NANO_USD } = process.env;
  if (!ANTHROPIC_API_KEY || !NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SECRET_KEY || !IP_HASH_SALT) return send({ kind: "unavailable" });

  const day = londonDay(new Date());
  const db = limitsClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY);
  const address = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // If the limits cannot be checked, no paid call is made.
  let reserved = 0;
  try {
    const hash = await visitorHash(address, day, IP_HASH_SALT);
    if (!(await countVisitor(db, day, hash, LIMITS.visitorMessagesPerDay))) return send({ kind: "visitor_limit" });
    const promptChars = systemPrompt().length + input.messages.reduce((sum, m) => sum + m.content.length, 0);
    reserved = worstCaseCost(promptChars, LIMITS.maxReplyTokens);
    if (!(await reserveBudget(db, day, reserved, dailyBudget(CHAT_DAILY_BUDGET_NANO_USD)))) return send({ kind: "paused" });
  } catch {
    return send({ kind: "unavailable" });
  }

  try {
    const answer = await generateReply(chatClient(ANTHROPIC_API_KEY), input.messages);
    await settleBudget(db, day, reserved, answer.costNanoUsd).catch(() => undefined);
    return send({ kind: "reply", text: answer.text });
  } catch (error) {
    // A clear refusal from the API is not charged, so it gives the money back. After a timeout or lost
    // connection the cost is unknown, so the reservation stays in place.
    if (error instanceof Anthropic.APIError && typeof error.status === "number") {
      await settleBudget(db, day, reserved, 0).catch(() => undefined);
    }
    return send({ kind: "unavailable" });
  }
}
