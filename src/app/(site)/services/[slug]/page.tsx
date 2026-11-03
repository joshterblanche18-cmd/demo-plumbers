import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageCta } from "@/components/PageCta";
import { SafetyAdvice } from "@/components/SafetyAdvice";
import { areaContent, serviceContent } from "@/config/content";
import { demoPrices } from "@/config/facts";
import { location } from "@/config/location";
import { routes } from "@/config/site";
import styles from "../../content.module.css";

type Props = { params: Promise<{ slug: string }> };

const find = (slug: string) => serviceContent.find((s) => s.slug === slug);

export const dynamicParams = false;
export function generateStaticParams() {
  return serviceContent.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = find((await params).slug);
  if (!service) return {};
  return { title: service.title, description: service.description, alternates: { canonical: `/services/${service.slug}` } };
}

export default async function ServicePage({ params }: Props) {
  const service = find((await params).slug);
  if (!service) notFound();
  const price = demoPrices.find((p) => p.item === service.priceItem);
  return (
    <div className={styles.wide}>
      {service.emergency && <h1>{service.name}</h1>}
      {service.emergency && <SafetyAdvice className={styles.alertBox} />}
      <div className={styles.serviceHead} style={service.emergency ? { marginTop: "1.5rem" } : undefined}>
        <div>
          {!service.emergency && <h1>{service.name}</h1>}
          <p className={styles.lead}>{service.intro}</p>
          {price && (
            <p className={styles.price}>
              {price.item}: from <strong>{location.currencySymbol}{price.from.toLocaleString("en-GB")}</strong> (demo price)
            </p>
          )}
        </div>
        <Image src={service.photo.src} alt={service.photo.alt} width={service.photo.width} height={service.photo.height} sizes="(max-width: 760px) 100vw, 40vw" priority />
      </div>

      <div className={styles.prose} style={{ maxWidth: "46rem" }}>
        <h2>{service.listHeading}</h2>
        <ul className={styles.list}>
          {service.list.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <h2>What happens next</h2>
        <p>{service.whatHappens}</p>
        <p style={{ marginTop: "0.75rem" }}>See all the <Link className={styles.inlineLink} href={routes.pricing}>demo prices</Link>.</p>
        <h2>Where we do this</h2>
        <ul className={styles.links}>
          {areaContent.map((a) => <li key={a.slug}><Link href={`/areas/${a.slug}`}>{a.name}</Link></li>)}
        </ul>
      </div>
      <PageCta />
    </div>
  );
}
