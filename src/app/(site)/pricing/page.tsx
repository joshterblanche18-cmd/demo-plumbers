import type { Metadata } from "next";
import { PageCta } from "@/components/PageCta";
import { demoPrices } from "@/config/facts";
import { location } from "@/config/location";
import styles from "../content.module.css";

export const metadata: Metadata = {
  title: "Pricing guide: heating and plumbing in Aberdeen (demo)",
  description: "A guide to 'from' prices for boiler services, repairs, new boilers, call-outs and bathrooms at a fictional firm. All prices are demo prices.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  const { currencySymbol, depositPounds } = location;
  return (
    <div className={styles.page}>
      <h1>Pricing guide</h1>
      <p className={styles.lead}>All of these are demo prices for a fictional firm, marked &quot;from&quot; because every job is different. They are not real quotes.</p>
      <table className={styles.priceTable}>
        <caption className="sr-only">Demo prices</caption>
        <thead><tr><th scope="col">Job</th><th scope="col">From (demo price)</th></tr></thead>
        <tbody>
          {demoPrices.map((p) => (
            <tr key={p.item}>
              <th scope="row">{p.item}</th>
              <td>{currencySymbol}{p.from.toLocaleString("en-GB")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.prose}>
        <h2>The call-out deposit</h2>
        <p>Booking a call-out online takes a {currencySymbol}{depositPounds} deposit, which comes off your final bill. Cancelling is free up to 24 hours before. On this demo it uses test money only.</p>
        <h2>Before any work starts</h2>
        <p>An engineer tells you what the work is likely to cost once they have seen it, and you decide whether to go ahead.</p>
      </div>
      <PageCta />
    </div>
  );
}
