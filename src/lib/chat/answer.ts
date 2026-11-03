import Anthropic from "@anthropic-ai/sdk";
import { actualCost } from "./cost";
import type { ChatMessage } from "./input";
import { LIMITS } from "./input";
import { cleanReply, FALLBACK_REPLY, systemPrompt } from "./reply";

export const CHAT_MODEL = "claude-haiku-5-5";

export function chatClient(apiKey: string): Anthropic {
  // No automatic retries: every attempt costs money and must pass the budget check first.
  return new Anthropic({ apiKey, maxRetries: 0, timeout: 20_000 });
}

export type Answer = { text: string; costNanoUsd: number };

// The model has no tools and no access to any data, only the facts in the system prompt.
export async function generateReply(client: Anthropic, messages: ChatMessage[]): Promise<Answer> {
  const response = await client.messages.create({
    model: CHAT_MODEL,
    max_tokens: LIMITS.maxReplyTokens,
    thinking: { type: "disabled" },
    system: systemPrompt(),
    messages,
  });
  const costNanoUsd = actualCost(response.usage.input_tokens, response.usage.output_tokens);
  if (response.stop_reason === "refusal") return { text: FALLBACK_REPLY, costNanoUsd };
  const text = response.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join(" ");
  return { text: cleanReply(text, response.stop_reason === "max_tokens"), costNanoUsd };
}
