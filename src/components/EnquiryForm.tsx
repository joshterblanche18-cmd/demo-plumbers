"use client";

import { useActionState, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { sendEnquiry } from "@/app/(site)/contact/actions";
import { location } from "@/config/location";
import type { FormState } from "@/lib/forms";
import { CHAT_HANDOVER_KEY } from "./ChatWidget";
import { ErrorSummary, errorProps, FieldError, HoneyPot, LABELS, TextField } from "./Field";
import styles from "./Form.module.css";

const initial: FormState = { errors: {} };
const noSubscribe = () => () => undefined;

function readHandover(): string {
  try {
    return sessionStorage.getItem(CHAT_HANDOVER_KEY) ?? "";
  } catch {
    return "";
  }
}

export function EnquiryForm() {
  const [state, action, pending] = useActionState(sendEnquiry, initial);
  const summaryRef = useRef<HTMLDivElement>(null);
  const handover = useSyncExternalStore(noSubscribe, readHandover, () => "");
  const [urgency, setUrgency] = useState(state.values?.urgency ?? "");
  const { errors, values, message } = state;
  const { gasEmergency } = location;

  useEffect(() => {
    if (Object.keys(errors).length || message) summaryRef.current?.focus();
  }, [errors, message]);

  const radio = (name: string, value: string, label: string, onChange?: () => void) => (
    <label className={styles.choice} key={value}>
      <input type="radio" name={name} value={value} defaultChecked={values?.[name] === value} required onChange={onChange} />
      {label}
    </label>
  );

  return (
    <form className={styles.form} action={action} noValidate>
      <ErrorSummary errors={errors} message={message} focusRef={summaryRef} />
      <HoneyPot />
      <TextField name="name" autoComplete="name" errors={errors} values={values} />
      <TextField name="phone" type="tel" autoComplete="tel" inputMode="tel" errors={errors} values={values} />
      <TextField name="email" type="email" autoComplete="email" inputMode="email" errors={errors} values={values} />
      <TextField name="postcode" autoComplete="postal-code" errors={errors} values={values} hint="The first part is enough, like AB15." />

      <div className={styles.field}>
        <label htmlFor="problem">{LABELS.problem}</label>
        <FieldError name="problem" errors={errors} />
        <textarea id="problem" name="problem" key={handover} defaultValue={values?.problem ?? handover} maxLength={2000} required {...errorProps("problem", errors)} />
      </div>

      <fieldset id="urgency" className={styles.field} {...errorProps("urgency", errors)}>
        <legend>{LABELS.urgency}</legend>
        <FieldError name="urgency" errors={errors} />
        <div className={styles.choices}>
          {radio("urgency", "emergency", "Emergency, today", () => setUrgency("emergency"))}
          {radio("urgency", "soon", "Within a few days", () => setUrgency("soon"))}
          {radio("urgency", "flexible", "Flexible, just planning", () => setUrgency("flexible"))}
        </div>
      </fieldset>

      {urgency === "emergency" && (
        <p className={styles.safety} role="status">
          <strong>If you smell gas or think it could be carbon monoxide,</strong> do not wait for a reply. Get into fresh air and call the {gasEmergency.name} free on <a href={`tel:${gasEmergency.tel}`}>{gasEmergency.display}</a>.
        </p>
      )}

      <fieldset id="contact_method" className={styles.field} {...errorProps("contact_method", errors)}>
        <legend>{LABELS.contact_method}</legend>
        <FieldError name="contact_method" errors={errors} />
        <div className={styles.choices}>
          {radio("contact_method", "phone", "Phone call")}
          {radio("contact_method", "email", "Email")}
        </div>
      </fieldset>

      <div className={styles.field}>
        <label htmlFor="preferred_time">{LABELS.preferred_time}</label>
        <FieldError name="preferred_time" errors={errors} />
        <select id="preferred_time" name="preferred_time" defaultValue={values?.preferred_time ?? "any"} {...errorProps("preferred_time", errors)}>
          <option value="any">Any time</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </select>
      </div>

      <div className={styles.field} id="consent">
        <FieldError name="consent" errors={errors} />
        <label className={styles.checkbox}>
          <input type="checkbox" name="consent" value="yes" defaultChecked={values?.consent === "yes"} required {...errorProps("consent", errors)} />
          I agree to be contacted about this enquiry.
        </label>
        <p className={styles.hint}>This is a demo, so nobody will really contact you. Please do not enter anything private. Enquiries are deleted after 7 days.</p>
      </div>

      <button className={styles.submit} type="submit" disabled={pending}>{pending ? "Sending..." : "Send enquiry"}</button>
    </form>
  );
}
