"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { EmergencyAdvice } from "@/components/EmergencyAdvice";
import { location } from "@/config/location";
import { routes } from "@/config/site";
import { LIMITS, type ChatMessage } from "@/lib/chat/input";
import type { Emergency } from "@/lib/chat/safety";
import type { ChatResponse } from "@/lib/chat/types";
import styles from "./ChatWidget.module.css";

export const CHAT_HANDOVER_KEY = "kirkgate-chat-for-enquiry";

const STARTERS = [
  "How much is a boiler service?",
  "Do you cover Westhill?",
  "What happens with the £25 deposit?",
  "My boiler has stopped working, what should I do?",
];

type Entry =
  | { type: "visitor"; text: string }
  | { type: "assistant"; text: string }
  | { type: "emergency"; emergency: Emergency }
  | { type: "notice"; text: string };

type StopReason = "paused" | "visitor_limit" | "conversation_full";

const STOP_TEXT: Record<StopReason, string> = {
  paused: "The chat is paused until tomorrow, because today's demo budget has been used.",
  visitor_limit: "You have reached today's limit of messages for this demo.",
  conversation_full: "This chat has reached its limit.",
};

export function ChatWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [stopped, setStopped] = useState<StopReason | null>(null);
  const [askingConsent, setAskingConsent] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const log = logRef.current;
    if (!log) return;
    // Emergency advice is shown from its first line, because that line says what to do first.
    if (!busy && entries[entries.length - 1]?.type === "emergency") {
      const alerts = log.querySelectorAll<HTMLElement>('[role="alert"]');
      const latest = alerts[alerts.length - 1];
      if (latest) {
        log.scrollTo({ top: latest.offsetTop });
        return;
      }
    }
    log.scrollTo({ top: log.scrollHeight });
  }, [entries, busy]);

  function close() {
    setOpen(false);
    toggleRef.current?.focus();
  }

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy || stopped) return;
    setDraft("");
    setAskingConsent(false);
    setEntries((e) => [...e, { type: "visitor", text }]);
    setBusy(true);
    const messages: ChatMessage[] = [...history, { role: "user", content: text }];
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = (await response.json()) as ChatResponse;
      if (data.kind === "reply") {
        setHistory([...messages, { role: "assistant", content: data.text }]);
        setEntries((e) => [...e, { type: "assistant", text: data.text }]);
      } else if (data.kind === "emergency") {
        setEntries((e) => [...e, { type: "emergency", emergency: data.emergency }]);
      } else if (data.kind === "paused" || data.kind === "visitor_limit" || data.kind === "conversation_full") {
        setStopped(data.kind);
      } else if (data.kind === "too_long") {
        setEntries((e) => [...e, { type: "notice", text: `Please keep your message under ${LIMITS.maxMessageChars} characters.` }]);
      } else {
        setEntries((e) => [...e, { type: "notice", text: `The assistant is not available right now. Please use the enquiry form, or call ${location.phone.display}.` }]);
      }
    } catch {
      setEntries((e) => [...e, { type: "notice", text: `That did not send. Check your connection and try again, or call ${location.phone.display}.` }]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(draft);
  }

  function sendToForm() {
    const transcript = entries
      .flatMap((e) => (e.type === "visitor" ? [`Me: ${e.text}`] : e.type === "assistant" ? [`Assistant: ${e.text}`] : []))
      .join("\n");
    try {
      sessionStorage.setItem(CHAT_HANDOVER_KEY, transcript);
    } catch {
      // Blocked storage only means the form starts empty.
    }
    close();
    router.push(routes.contact);
  }

  const hasChat = entries.some((e) => e.type === "assistant" || e.type === "visitor");

  return (
    <div className={styles.widget}>
      {open && (
        <section
          className={styles.panel}
          role="dialog"
          aria-labelledby="chat-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") close();
          }}
        >
          <header className={styles.head}>
            <h2 id="chat-title">Kirkgate Assistant</h2>
            <button type="button" className={styles.close} onClick={close}>Close</button>
          </header>

          <div className={styles.log} ref={logRef} role="log" aria-live="polite" aria-relevant="additions" tabIndex={0} aria-label="Chat messages">
            <p className={styles.intro}>
              Hello. I am an AI assistant, not a person. I can answer questions about this fictional firm&apos;s services, areas, demo prices and hours. Chats are not saved after your visit.
            </p>
            {!hasChat && (
              <ul className={styles.starters} aria-label="Suggested questions">
                {STARTERS.map((q) => (
                  <li key={q}>
                    <button type="button" onClick={() => void ask(q)}>{q}</button>
                  </li>
                ))}
              </ul>
            )}
            {entries.map((entry, i) => {
              if (entry.type === "visitor") return <p key={i} className={styles.visitor}><span className="sr-only">You said: </span>{entry.text}</p>;
              if (entry.type === "assistant") return <p key={i} className={styles.assistant}><span className="sr-only">Assistant said: </span>{entry.text}</p>;
              if (entry.type === "emergency") return <div key={i} role="alert"><EmergencyAdvice kind={entry.emergency} className={styles.emergency} /></div>;
              return <p key={i} className={styles.notice}>{entry.text}</p>;
            })}
            {busy && <p className={styles.writing}>The assistant is writing...</p>}
            {stopped && (
              <p className={styles.notice} role="status">
                {STOP_TEXT[stopped]} Please use the <Link href={routes.contact} onClick={close}>enquiry form</Link>, or call <a href={`tel:${location.phone.tel}`}>{location.phone.display}</a>.
              </p>
            )}
          </div>

          {hasChat && !askingConsent && (
            <button type="button" className={styles.handover} onClick={() => setAskingConsent(true)}>
              Send this chat to the enquiry form
            </button>
          )}
          {askingConsent && (
            <div className={styles.consent}>
              <p>This copies your chat into the enquiry form so you can check it. Nothing is sent until you press send on the form.</p>
              <div>
                <button type="button" onClick={sendToForm}>Copy it across</button>
                <button type="button" onClick={() => setAskingConsent(false)}>Not now</button>
              </div>
            </div>
          )}

          {!stopped && (
            <form className={styles.form} onSubmit={onSubmit}>
              <label htmlFor="chat-input" className="sr-only">Your question</label>
              <input
                id="chat-input"
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={LIMITS.maxMessageChars}
                placeholder="Ask a question"
                autoComplete="off"
              />
              <button type="submit" disabled={busy || !draft.trim()}>Send</button>
            </form>
          )}
        </section>
      )}
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? "Close chat" : "Ask our chatbot"}
      </button>
    </div>
  );
}
