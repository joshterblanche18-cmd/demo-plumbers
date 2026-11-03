import type { Metadata } from "next";
import { PageCta } from "@/components/PageCta";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "About Kirkgate Heating & Plumbing (demo)",
  description: "How this fictional family firm in Aberdeen works, and what this demo website is for. It was made by Tarnfield. Nothing is sold.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <h1>About us</h1>
      <p className={styles.lead}>Kirkgate Heating &amp; Plumbing is a fictional family firm in Aberdeen. It does not exist, so you will not find reviews, awards or registrations here.</p>
      <div className={styles.prose}>
        <h2>How we would work with you</h2>
        <p>Heating and plumbing problems are stressful enough without confusing answers. We tell you what we found, what the options are and what each one is likely to cost, before any work starts.</p>
        <p>We answer in plain words. If a repair is the sensible choice, we say so. If it is not worth fixing, we say that too, and you decide.</p>
        <h2>Why this website exists</h2>
        <p>Tarnfield made this demo to show small businesses what a website can do for them. It has a working enquiry form, a test-money deposit payment and an AI assistant that answers questions.</p>
        <p>Everything about the firm is made up, including the phone number and address. The photos show real places and objects, not this firm&apos;s work. Tarnfield is real: <a className={styles.inlineLink} href="https://tarnfield.pages.dev/">see what else Tarnfield builds</a>.</p>
      </div>
      <PageCta />
    </div>
  );
}
