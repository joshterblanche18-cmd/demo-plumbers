import type { Metadata } from "next";
import "./globals.css";

const description = "Demo website for a fictional business. Nothing is sold.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: "Kirkgate Heating & Plumbing: demo website",
  description,
  robots: { index: false, follow: false },
  openGraph: {
    title: "Kirkgate Heating & Plumbing: a demo website by Tarnfield",
    description,
    type: "website",
    locale: "en_GB",
    images: [{ url: "/photos/share.jpg", width: 1200, height: 630, alt: "Granite terraced houses in Aberdeen" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-GB" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <p role="note" className="demo-banner">Demo website for a fictional business. Nothing is sold.</p>
        {children}
      </body>
    </html>
  );
}
