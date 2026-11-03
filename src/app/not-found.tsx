import Link from "next/link";
import { location } from "@/config/location";
import SiteLayout from "./(site)/layout";
import styles from "./(site)/content.module.css";

export default function NotFound() {
  return (
    <SiteLayout>
      <div className={styles.page}>
        <h1>This page is not here</h1>
        <p className={styles.lead}>The link may be out of date. These should help:</p>
        <ul className={styles.links}>
          <li><Link href="/">Home page</Link></li>
          <li><Link href="/services">Our services</Link></li>
          <li><Link href="/contact">Send an enquiry</Link></li>
          <li><a href={`tel:${location.phone.tel}`}>Call {location.phone.display} (fictional)</a></li>
        </ul>
      </div>
    </SiteLayout>
  );
}
