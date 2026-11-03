import type { Emergency } from "./safety";

export type ChatResponse =
  | { kind: "reply"; text: string }
  | { kind: "emergency"; emergency: Emergency }
  | { kind: "paused" | "visitor_limit" | "too_long" | "conversation_full" | "unavailable" | "invalid" };
