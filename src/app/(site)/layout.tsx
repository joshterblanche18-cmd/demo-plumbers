import { Barlow, Barlow_Semi_Condensed } from "next/font/google";
import Link from "next/link";
import { ChatWidget } from "@/components/ChatWidget";
import { LogoMark } from "@/components/LogoMark";
import { PhoneMenu } from "@/components/PhoneMenu";
import { SafetyAdvice } from "@/components/SafetyAdvice";
import { location } from "@/config/location";
import { areas, photoCredits, routes, services } from "@/config/site";
import { plumberJsonLd } from "@/lib/structuredData";
import styles from "./site.module.css";

const display = Barlow_Semi_Condensed({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-display" });
const text = Barlow({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-text" });

const navItems = [
  { label: "Services", href: routes.services },
  { label: "Pricing", href: routes.pricing },
  { label: "About", href: routes.about },
  { label: "FAQ", href: routes.faq },
  { label: "Contact", href: routes.contact },
];

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const { phone, address, hours, businessName } = location;
  return (
    <div className={`${styles.site} ${display.variable} ${text.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(plumberJsonLd(process.env.SITE_URL || "http://localhost:3000")).replace(/</g, "\\u003c") }}
      />
      <a className={styles.skip} href="#content">Skip to the main content</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.logo} href={routes.home}>
            <LogoMark className={styles.logoMark} />
            <span className={styles.logoName}>
              Kirkgate
              <span className={styles.logoSub}> Heating &amp; Plumbing</span>
              <span className="sr-only"> home page</span>
            </span>
          </Link>
          <nav className={styles.nav} aria-label="Main">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </nav>
          <div className={styles.headerEnd}>
            <span className={styles.theme}>
              <input id="theme-toggle" type="checkbox" aria-label="Use dark mode" />
              <label htmlFor="theme-toggle" aria-hidden="true">
                <span className={styles.themeDark}>Dark</span>
                <span className={styles.themeLight}>Light</span>
              </label>
            </span>
            <a className={styles.call} href={`tel:${phone.tel}`}>
              <span className={styles.callNote}>Emergencies, 24 hours</span>
              {phone.display}
            </a>
            <PhoneMenu className={styles.menu} items={[...navItems, { label: "Book a call-out", href: routes.book }]} />
          </div>
        </div>
      </header>

      <main className={styles.main} id="content">{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <SafetyAdvice className={styles.safety} />
          <div className={styles.details}>
            <div>
              <h2>{businessName}</h2>
              <address>
                {address}<br />
                <a href={`tel:${phone.tel}`}>{phone.display}</a>
              </address>
            </div>
            <dl>
              {hours.map((h) => (
                <div key={h.days} style={{ display: "contents" }}>
                  <dt>{h.days}</dt>
                  <dd>{h.times}</dd>
                </div>
              ))}
              <dt>Emergencies</dt>
              <dd>24 hours</dd>
            </dl>
            <ul className={styles.footLinks} aria-label="Services and areas">
              {services.map((s) => <li key={s.href}><Link href={s.href}>{s.name}</Link></li>)}
              {areas.map((a) => <li key={a.href}><Link href={a.href}>{a.name}</Link></li>)}
            </ul>
            <ul className={styles.footLinks}>
              <li><Link href={routes.book}>Book a call-out</Link></li>
              <li><Link href={routes.privacy}>Privacy</Link></li>
              <li><Link href={routes.terms}>Cancellation and terms</Link></li>
            </ul>
            <p className={styles.small}>
              {businessName} is a fictional firm and holds no registrations. The address and phone number are not real.
              This is a demo by <a href="https://tarnfield.pages.dev/">Tarnfield</a>.
            </p>
          </div>
        </div>
        <div className={styles.credits}>
          <p>
            Photos:{" "}
            {photoCredits.map((c, i) => (
              <span key={c.href}>
                {i > 0 ? "; " : ""}
                <a href={c.href}>{c.what}</a> by {c.who} (<a href={c.licenceHref}>{c.licence}</a>)
              </span>
            ))}
            . The photos show real places and objects, not this fictional firm&apos;s work.
          </p>
        </div>
      </footer>

      {process.env.NEXT_PUBLIC_CHAT_OFF === "1" ? null : <ChatWidget />}

      <div className={styles.phoneBar}>
        <a href={`tel:${phone.tel}`}>Call {phone.display}</a>
        <Link href={routes.contact}>Send an enquiry</Link>
      </div>
    </div>
  );
}
