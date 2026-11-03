import type { ReactNode } from "react";
import type { FieldErrors } from "@/lib/forms";
import styles from "./Form.module.css";

export const LABELS: Record<string, string> = {
  name: "Your name",
  phone: "Phone number",
  email: "Email address",
  postcode: "Postcode area",
  problem: "What is the problem?",
  urgency: "How urgent is it?",
  contact_method: "How should we contact you?",
  preferred_time: "Best time to contact you",
  consent: "Agreeing to be contacted",
  date: "Date",
  window: "Time window",
};

export function errorProps(name: string, errors: FieldErrors, hintId?: string) {
  const describedBy = [errors[name] ? `${name}-error` : "", hintId ?? ""].filter(Boolean).join(" ");
  return { "aria-invalid": errors[name] ? (true as const) : undefined, "aria-describedby": describedBy || undefined };
}

export function FieldError({ name, errors }: { name: string; errors: FieldErrors }) {
  return errors[name] ? <p id={`${name}-error`} className={styles.error}>{errors[name]}</p> : null;
}

export function ErrorSummary({ errors, message, focusRef }: { errors: FieldErrors; message?: string; focusRef: React.RefObject<HTMLDivElement | null> }) {
  const names = Object.keys(errors);
  if (!names.length && !message) return null;
  return (
    <div ref={focusRef} className={styles.summary} role="alert" tabIndex={-1}>
      {message ? <p>{message}</p> : <p><strong>Please check {names.length === 1 ? "this" : "these"}:</strong></p>}
      {names.length > 0 && (
        <ul>
          {names.map((name) => (
            <li key={name}><a href={`#${name}`}>{LABELS[name] ?? name}: {errors[name]}</a></li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function HoneyPot() {
  return (
    <div className={styles.honey} aria-hidden="true">
      <label htmlFor="kg_leave_blank">Leave this empty</label>
      <input id="kg_leave_blank" name="kg_leave_blank" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

export function TextField({ name, type = "text", autoComplete, errors, values, hint, inputMode }: {
  name: string;
  type?: "text" | "tel" | "email";
  autoComplete?: string;
  errors: FieldErrors;
  values?: Record<string, string>;
  hint?: ReactNode;
  inputMode?: "text" | "tel" | "email";
}) {
  const hintId = hint ? `${name}-hint` : undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={name}>{LABELS[name]}</label>
      {hint ? <p id={hintId} className={styles.hint}>{hint}</p> : null}
      <FieldError name={name} errors={errors} />
      <input id={name} name={name} type={type} autoComplete={autoComplete} inputMode={inputMode} defaultValue={values?.[name]} required {...errorProps(name, errors, hintId)} />
    </div>
  );
}
