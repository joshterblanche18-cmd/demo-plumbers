import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { location } from "@/config/location";
import { windowLabel } from "@/lib/booking/dates";
import { serverDb } from "@/lib/server";
import { isAdmin, signOut } from "./actions";
import { RefundButton } from "./AdminForms";
import styles from "../content.module.css";

export const metadata: Metadata = { title: "Admin (demo)", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const when = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: location.timeZone, dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ refunded?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { refunded } = await searchParams;
  const db = serverDb();
  const [{ data: enquiries }, { data: bookings }] = await Promise.all([
    db.from("enquiries").select("id, created_at, name, phone, email, postcode_area, problem, urgency, contact_method, preferred_time, email_sent").order("created_at", { ascending: false }).limit(100),
    db.from("bookings").select("id, created_at, status, visit_date, visit_window, name, phone, postcode_area, amount_pence, email_sent").order("created_at", { ascending: false }).limit(100),
  ]);

  return (
    <div className={styles.wide}>
      <h1>Admin</h1>
      <p className={styles.lead}>Demo data only. Everything here is deleted after 7 days, and payments are test money.</p>
      {refunded && <p role="status" className={styles.price}>Refunded in test mode.</p>}
      <form action={signOut}><button type="submit" className={styles.linkButton}>Sign out</button></form>

      <h2>Deposits</h2>
      <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Deposits table">
        <table className={styles.table}>
          <thead><tr><th scope="col">Booked</th><th scope="col">Visit</th><th scope="col">Customer</th><th scope="col">Deposit</th><th scope="col">Status</th><th scope="col">Email</th><th scope="col">Action</th></tr></thead>
          <tbody>
            {(bookings ?? []).map((b) => (
              <tr key={b.id}>
                <td>{when(b.created_at)}</td>
                <td>{b.visit_date}<br />{windowLabel(b.visit_date, b.visit_window)}</td>
                <td>{b.name}<br />{b.phone}<br />{b.postcode_area}</td>
                <td>{location.currencySymbol}{(b.amount_pence / 100).toFixed(2)}</td>
                <td>{b.status}</td>
                <td>{b.email_sent ? "Sent" : "Not sent"}</td>
                <td>{b.status === "paid" ? <RefundButton id={b.id} name={b.name} /> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!bookings?.length && <p>No deposits yet.</p>}

      <h2>Enquiries</h2>
      <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Enquiries table">
        <table className={styles.table}>
          <thead><tr><th scope="col">Received</th><th scope="col">Customer</th><th scope="col">Urgency</th><th scope="col">Contact</th><th scope="col">Problem</th><th scope="col">Email</th></tr></thead>
          <tbody>
            {(enquiries ?? []).map((e) => (
              <tr key={e.id}>
                <td>{when(e.created_at)}</td>
                <td>{e.name}<br />{e.phone}<br />{e.email}<br />{e.postcode_area}</td>
                <td>{e.urgency}</td>
                <td>{e.contact_method}, {e.preferred_time}</td>
                <td style={{ whiteSpace: "pre-wrap", minWidth: "16rem" }}>{e.problem}</td>
                <td>{e.email_sent ? "Sent" : "Not sent"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!enquiries?.length && <p>No enquiries yet.</p>}
    </div>
  );
}
