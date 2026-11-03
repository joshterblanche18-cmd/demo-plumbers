import Link from "next/link";
import styles from "@/app/(site)/content.module.css";
import { location } from "@/config/location";
import { routes } from "@/config/site";

export function PageCta({ heading = "Got a problem at home?" }: { heading?: string }) {
  return (
    <aside className={styles.cta}>
      <h2>{heading}</h2>
      <p>Send an enquiry, book a call-out, or call {location.phone.display}. This firm is fictional, so nobody will really reply.</p>
      <div className={styles.ctaActions}>
        <Link className={styles.ctaPrimary} href={routes.contact}>Send an enquiry</Link>
        <Link className={styles.ctaSecondary} href={routes.book}>Book a call-out</Link>
      </div>
    </aside>
  );
}
