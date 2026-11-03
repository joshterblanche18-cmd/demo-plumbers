import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageCta } from "@/components/PageCta";
import { areaContent, serviceContent } from "@/config/content";
import styles from "../../content.module.css";

type Props = { params: Promise<{ slug: string }> };

const find = (slug: string) => areaContent.find((a) => a.slug === slug);

export const dynamicParams = false;
export function generateStaticParams() {
  return areaContent.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const area = find((await params).slug);
  if (!area) return {};
  return { title: area.title, description: area.description, alternates: { canonical: `/areas/${area.slug}` } };
}

export default async function AreaPage({ params }: Props) {
  const area = find((await params).slug);
  if (!area) notFound();
  return (
    <div className={styles.page}>
      <h1>Heating and plumbing in {area.name}</h1>
      <p className={styles.lead}>{area.intro}</p>
      <div className={styles.prose}>
        {area.sections.map((s) => (
          <section key={s.heading}>
            <h2>{s.heading}</h2>
            <p>{s.text}</p>
          </section>
        ))}
        <p style={{ marginTop: "1rem" }}><Link className={styles.inlineLink} href={`/services/${area.serviceSlug}`}>{area.serviceLine}</Link></p>
        <h2>All our services in {area.name}</h2>
        <ul className={styles.links}>
          {serviceContent.map((s) => <li key={s.slug}><Link href={`/services/${s.slug}`}>{s.name}</Link></li>)}
        </ul>
      </div>
      <PageCta />
    </div>
  );
}
