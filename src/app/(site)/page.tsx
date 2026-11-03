import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { location } from "@/config/location";
import { areas, routes, services } from "@/config/site";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Kirkgate Heating & Plumbing, Aberdeen: boilers, leaks and bathrooms (demo)",
  description:
    "Demo website for a fictional Aberdeen plumber and heating engineer. Boiler repairs and servicing, emergency plumbing and bathrooms. Nothing is sold.",
};

const [emergency, repair, servicing, bathrooms] = services;

const otherServices = [
  { ...repair, photo: "/photos/radiator.webp", alt: "An old cast iron radiator under a tiled window sill", w: 560, h: 373 },
  { ...servicing, photo: "/photos/wrenches.webp", alt: "A pipe wrench and an adjustable spanner", w: 560, h: 426 },
  { ...bathrooms, photo: "/photos/basin.webp", alt: "A white bathroom basin with a black wall-mounted tap", w: 560, h: 420 },
];

const steps = [
  { title: "Tell us the problem", note: "Send an enquiry or call. A rough idea is enough, and we will ask what we need to know." },
  { title: "We come back to you", note: "By phone or email, whichever you chose, with what to do next and what it is likely to involve." },
  { title: "Book a call-out if you need one", note: "Pick a morning or an afternoon. The deposit comes off your final bill." },
];

export default function Home() {
  const { phone, gasEmergency, depositPounds, currencySymbol, hours } = location;
  const deposit = `${currencySymbol}${depositPounds}`;
  return (
    <>
      <p className={styles.gas}>
        <strong>Smell gas?</strong> Do not wait for us. Call the {gasEmergency.name} free on{" "}
        <a href={`tel:${gasEmergency.tel}`}>{gasEmergency.display}</a>.
      </p>

      <section className={styles.hero}>
        <picture>
          <source media="(max-width: 860px)" srcSet="/photos/granite-terrace-phone.webp" width={800} height={520} />
          <img
            className={styles.heroPhoto}
            src="/photos/granite-terrace.webp"
            alt="Granite terraced houses on Skene Terrace, Aberdeen"
            width={1800}
            height={1346}
            fetchPriority="high"
          />
        </picture>
        <div className={styles.heroInner}>
          <div className={styles.heroPanel}>
            <h1>Heating and plumbing for homes across Aberdeen.</h1>
            <p>Boiler stopped, or water coming through? Tell us what has gone wrong. We are a family firm, and we will tell you what happens next.</p>
            <div className={styles.actions}>
              <Link className={styles.onNavyPrimary} href={routes.contact}>Send an enquiry</Link>
              <a className={styles.onNavySecondary} href={`tel:${phone.tel}`}>Call {phone.display}</a>
            </div>
          </div>
        </div>
      </section>

      <ul className={styles.facts} aria-label="At a glance">
        <li><strong>24 hours</strong> emergency call-outs</li>
        <li><strong>{hours[0].times}</strong> {hours[0].days}</li>
        <li><strong>{hours[1].times}</strong> {hours[1].days}</li>
        <li><strong>{deposit} deposit</strong> off your final bill</li>
      </ul>

      <section className={styles.services} aria-labelledby="services-heading">
        <h2 id="services-heading">What we do</h2>
        <div className={styles.servicesGrid}>
          <article className={styles.feature}>
            <Image
              src="/photos/dripping-tap.webp"
              alt="Water dripping from an old outdoor tap, in black and white"
              width={800}
              height={1200}
              sizes="(max-width: 860px) 100vw, 40vw"
            />
            <div className={styles.featureText}>
              <h3><Link href={emergency.href}>{emergency.name}</Link></h3>
              <p>{emergency.summary}</p>
              <a className={styles.alertButton} href={`tel:${phone.tel}`}>Call {phone.display}</a>
            </div>
          </article>
          <ul className={styles.rows}>
            {otherServices.map((s) => (
              <li key={s.href}>
                <Image src={s.photo} alt={s.alt} width={s.w} height={s.h} sizes="(max-width: 560px) 34vw, 14rem" />
                <div>
                  <h3><Link href={s.href}>{s.name}</Link></h3>
                  <p>{s.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.next} aria-labelledby="steps-heading">
        <div className={styles.nextText}>
          <h2 id="steps-heading">What happens next</h2>
          <ol>
            {steps.map((s) => (
              <li key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.note}</p>
              </li>
            ))}
          </ol>
        </div>
        <Image
          className={styles.nextPhoto}
          src="/photos/copper-pipes.webp"
          alt="Two new copper pipes running through an opened-up wall"
          width={800}
          height={1200}
          sizes="(max-width: 860px) 100vw, 34vw"
        />
      </section>

      <section className={styles.where}>
        <div className={styles.whereInner}>
          <div>
            <h2>Where we work</h2>
            <p className={styles.whereLead}>Aberdeen and the places around it, including:</p>
            <ul className={styles.areas}>
              {areas.map((a) => (
                <li key={a.href}>
                  <Link href={a.href}>{a.name}</Link>
                  <span>{a.note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>When we are open</h2>
            <dl className={styles.hours}>
              {hours.map((h) => (
                <div key={h.days}>
                  <dt>{h.days}</dt>
                  <dd>{h.times}</dd>
                </div>
              ))}
              <div>
                <dt>Emergency call-outs</dt>
                <dd>24 hours</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className={styles.close} aria-labelledby="close-heading">
        <div className={styles.closeInner}>
          <div>
            <h2 id="close-heading">Got a problem at home?</h2>
            <p>Send an enquiry, or book a call-out with a {deposit} deposit that comes off your final bill. Payments here use test money only, because this is a demo.</p>
          </div>
          <div className={styles.actions}>
            <Link className={styles.onNavyPrimary} href={routes.contact}>Send an enquiry</Link>
            <Link className={styles.onNavySecondary} href={routes.book}>Book a call-out</Link>
          </div>
        </div>
      </section>
    </>
  );
}
