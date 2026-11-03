import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageCta } from "@/components/PageCta";
import { serviceContent } from "@/config/content";
import { services } from "@/config/site";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "Heating and plumbing services in Aberdeen (demo)",
  description: "Boiler servicing, repair and replacement, emergency plumbing and bathrooms in Aberdeen, from a fictional demo firm. Nothing is sold.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <div className={styles.wide}>
      <h1>Our services</h1>
      <p className={styles.lead}>Four things we do for homes across Aberdeen. Pick the one closest to your problem.</p>
      <ul className={styles.serviceGrid}>
        {serviceContent.map((s) => (
          <li key={s.slug}>
            <Image src={s.photo.src} alt={s.photo.alt} width={s.photo.width} height={s.photo.height} sizes="(max-width: 760px) 100vw, 50vw" />
            <h2><Link href={`/services/${s.slug}`}>{s.name}</Link></h2>
            <p>{services.find((x) => x.href === `/services/${s.slug}`)?.summary}</p>
          </li>
        ))}
      </ul>
      <PageCta />
    </div>
  );
}
