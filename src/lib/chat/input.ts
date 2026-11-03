export const LIMITS = {
  maxMessageChars: 500,
  maxMessages: 12,
  maxTotalChars: 4000,
  maxBodyBytes: 16_000,
  maxReplyTokens: 350,
  visitorMessagesPerDay: 20,
} as const;

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ParsedInput =
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; reason: "invalid" | "too_long" | "conversation_full" };

// Visitors control everything in the request, including earlier "assistant" turns, so all of it is checked here.
export function parseMessages(body: unknown): ParsedInput {
  const raw = (body as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(raw) || raw.length === 0) return { ok: false, reason: "invalid" };
  if (raw.length > LIMITS.maxMessages) return { ok: false, reason: "conversation_full" };

  const messages: ChatMessage[] = [];
  let total = 0;
  for (const [i, m] of raw.entries()) {
    const role = (m as { role?: unknown })?.role;
    const content = (m as { content?: unknown })?.content;
    if (typeof content !== "string") return { ok: false, reason: "invalid" };
    const expected = i % 2 === 0 ? "user" : "assistant";
    if (role !== expected) return { ok: false, reason: "invalid" };
    const trimmed = content.trim();
    if (!trimmed) return { ok: false, reason: "invalid" };
    if (role === "user" && trimmed.length > LIMITS.maxMessageChars) return { ok: false, reason: "too_long" };
    total += trimmed.length;
    messages.push({ role: expected, content: trimmed });
  }
  if (total > LIMITS.maxTotalChars) return { ok: false, reason: "conversation_full" };
  if (messages[messages.length - 1].role !== "user") return { ok: false, reason: "invalid" };
  return { ok: true, messages };
}
