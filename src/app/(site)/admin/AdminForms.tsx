"use client";

import { useActionState } from "react";
import styles from "@/components/Form.module.css";
import { refundBooking, signIn, type RefundState, type SignInState } from "./actions";

export function SignInForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});
  return (
    <form className={styles.form} action={action}>
      {state.message && <p className={styles.summary} role="alert">{state.message}</p>}
      <div className={styles.field}>
        <label htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className={styles.field}>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required style={{ width: "100%", minHeight: "3rem", padding: "0.5rem 0.7rem", background: "var(--canvas)", color: "inherit", font: "inherit", border: "1px solid var(--ink-soft)" }} />
      </div>
      <button className={styles.submit} type="submit" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</button>
    </form>
  );
}

export function RefundButton({ id, name }: { id: string; name: string }) {
  const [state, action, pending] = useActionState<RefundState, FormData>(refundBooking, {});
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button className={styles.submit} type="submit" disabled={pending} aria-label={`Refund the deposit for ${name}`}>{pending ? "Refunding..." : "Refund"}</button>
      {state.message && <p role="status">{state.message}</p>}
    </form>
  );
}
