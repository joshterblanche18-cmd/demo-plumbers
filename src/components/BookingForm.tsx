"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { startBooking } from "@/app/(site)/book/actions";
import { routes } from "@/config/site";
import type { BookableDay } from "@/lib/booking/dates";
import type { FormState } from "@/lib/forms";
import { ErrorSummary, errorProps, FieldError, HoneyPot, LABELS, TextField } from "./Field";
import styles from "./Form.module.css";

const initial: FormState = { errors: {} };

export function BookingForm({ days }: { days: BookableDay[] }) {
  const [state, action, pending] = useActionState(startBooking, initial);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState(state.values?.date ?? "");
  const { errors, values, message } = state;
  const selected = days.find((d) => d.value === date);
  // Without JavaScript every window is offered, and the server checks the choice.
  const windows = selected?.windows ?? [
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon (weekdays only)" },
  ];

  useEffect(() => {
    if (Object.keys(errors).length || message) summaryRef.current?.focus();
  }, [errors, message]);

  return (
    <form className={styles.form} action={action} noValidate>
      <ErrorSummary errors={errors} message={message} focusRef={summaryRef} />
      <HoneyPot />

      <div className={styles.field}>
        <label htmlFor="date">{LABELS.date}</label>
        <FieldError name="date" errors={errors} />
        <select id="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} required {...errorProps("date", errors)}>
          <option value="">Choose a date</option>
          {days.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      <fieldset id="window" className={styles.field} {...errorProps("window", errors)}>
        <legend>{LABELS.window}</legend>
        <FieldError name="window" errors={errors} />
        <div className={styles.choices}>
          {windows.map((w) => (
            <label className={styles.choice} key={w.value}>
              <input type="radio" name="window" value={w.value} defaultChecked={values?.window === w.value} required />
              {w.label}
            </label>
          ))}
        </div>
      </fieldset>

      <TextField name="name" autoComplete="name" errors={errors} values={values} />
      <TextField name="phone" type="tel" autoComplete="tel" inputMode="tel" errors={errors} values={values} />
      <TextField name="email" type="email" autoComplete="email" inputMode="email" errors={errors} values={values} />
      <TextField name="postcode" autoComplete="postal-code" errors={errors} values={values} hint="The first part is enough, like AB15." />

      <div className={styles.field}>
        <label htmlFor="problem">{LABELS.problem}</label>
        <FieldError name="problem" errors={errors} />
        <textarea id="problem" name="problem" defaultValue={values?.problem} maxLength={2000} required {...errorProps("problem", errors)} />
      </div>

      <div className={styles.field} id="consent">
        <FieldError name="consent" errors={errors} />
        <label className={styles.checkbox}>
          <input type="checkbox" name="consent" value="yes" defaultChecked={values?.consent === "yes"} required {...errorProps("consent", errors)} />
          <span>I agree to the <Link href={routes.terms} style={{ textDecoration: "underline" }}>cancellation terms</Link>: free cancellation up to 24 hours before.</span>
        </label>
      </div>

      <button className={styles.submit} type="submit" disabled={pending}>{pending ? "Opening the payment page..." : "Pay £25 test deposit"}</button>
    </form>
  );
}
