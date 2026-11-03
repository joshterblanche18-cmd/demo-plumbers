import { location } from "../config/location";
import { areas, services } from "../config/site";

// Hidden labels that help search engines understand a local business. All the details here are fictional.
export function plumberJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Plumber",
    name: location.businessName,
    description: "A fictional plumbing and heating firm on a demo website. Nothing is sold.",
    url: siteUrl,
    telephone: location.phone.tel,
    image: new URL("/photos/share.jpg", siteUrl).toString(),
    currenciesAccepted: location.currency,
    address: {
      "@type": "PostalAddress",
      streetAddress: "1 Pretend Yard",
      addressLocality: location.city,
      addressCountry: "GB",
    },
    areaServed: [location.city, ...areas.map((a) => a.name)].map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "13:00" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s.name, url: new URL(s.href, siteUrl).toString() } })),
    },
  };
}
