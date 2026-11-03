import type { Metadata } from "next";
import { PageCta } from "@/components/PageCta";
import { faqs } from "@/config/content";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "Questions about heating and plumbing call-outs (demo)",
  description: "Answers about call-outs, deposits, cancelling, areas covered and gas safety, from a fictional Aberdeen plumber's demo website.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  return (
    <div className={styles.page}>
      <h1>Frequently asked questions</h1>
      <div className={styles.faq}>
        {faqs.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      <PageCta heading="Question not here?" />
    </div>
  );
}
