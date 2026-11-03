// Costs are whole billionths of a US dollar, so sums never drift.
// Prices for the model named in answer.ts, checked 3 November 2026 on the maker's pricing page.
// $0.10 per million input tokens and $0.50 per million output tokens, for prompts up to 100,000 tokens.
export const NANO_USD_PER_INPUT_TOKEN = 100;
export const NANO_USD_PER_OUTPUT_TOKEN = 500;

// £0.10 was about $0.134 on 3 November 2026 (European Central Bank rates). Rounded down to stay under £0.10.
export const DEFAULT_DAILY_BUDGET_NANO_USD = 130_000_000;

export function actualCost(inputTokens: number, outputTokens: number): number {
  return inputTokens * NANO_USD_PER_INPUT_TOKEN + outputTokens * NANO_USD_PER_OUTPUT_TOKEN;
}

// Worst case before the call, assuming every 2 characters could be a token. The real cost is settled afterwards.
export function worstCaseCost(promptChars: number, maxReplyTokens: number): number {
  return actualCost(Math.ceil(promptChars / 2), maxReplyTokens);
}

export function dailyBudget(raw: string | undefined): number {
  if (raw === undefined || raw.trim() === "") return DEFAULT_DAILY_BUDGET_NANO_USD;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? Math.min(value, DEFAULT_DAILY_BUDGET_NANO_USD) : 0;
}

export function londonDay(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
