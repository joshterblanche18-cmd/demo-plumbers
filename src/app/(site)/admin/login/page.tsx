import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "../actions";
import { SignInForm } from "../AdminForms";
import styles from "../../content.module.css";

export const metadata: Metadata = { title: "Admin sign-in (demo)", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className={styles.page}>
      <h1>Admin sign-in</h1>
      <p className={styles.lead}>This private page lists demo enquiries and deposits.</p>
      <SignInForm />
    </div>
  );
}
