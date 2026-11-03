// Page addresses and the services and areas that link to them, all in one place.

export const routes = {
  home: "/",
  services: "/services",
  pricing: "/pricing",
  about: "/about",
  faq: "/faq",
  contact: "/contact",
  book: "/book",
  privacy: "/privacy",
  terms: "/terms",
} as const;

export const services = [
  {
    name: "Emergency plumbing",
    href: "/services/emergency-plumbing",
    summary: "Burst pipes and bad leaks, any hour of the day or night. Turn off the water at the stopcock if you can, then call us.",
  },
  {
    name: "Boiler repair and replacement",
    href: "/services/boiler-repair-and-replacement",
    summary: "No heating or no hot water. We find the fault, then tell you plainly if it is worth fixing or time for a new one.",
  },
  {
    name: "Boiler servicing",
    href: "/services/boiler-servicing",
    summary: "A yearly check, so the heating is ready before the cold arrives.",
  },
  {
    name: "Bathrooms",
    href: "/services/bathrooms",
    summary: "From a new basin to a full refit, planned with you in plain terms before work starts.",
  },
] as const;

export const photoCredits = [
  { what: "Skene Terrace, Aberdeen", who: "Bill Harrison", href: "https://www.geograph.org.uk/photo/5437021", licence: "CC BY-SA 2.0, cropped", licenceHref: "https://creativecommons.org/licenses/by-sa/2.0" },
  { what: "Dripping tap", who: "Malama Mushitu", href: "https://unsplash.com/photos/close-up-of-an-old-rusty-faucet-dripping-water-5jJ4Nux6Ros", licence: "Unsplash License", licenceHref: "https://unsplash.com/license" },
  { what: "Radiator", who: "Julian Hochgesang", href: "https://unsplash.com/photos/white-radiator-heater-beside-brown-wooden-window-ihx1LdtnGXw", licence: "Unsplash License", licenceHref: "https://unsplash.com/license" },
  { what: "Wrenches", who: "Matt Artz", href: "https://unsplash.com/photos/gray-adjustable-wrench-and-gray-pipe-wrench-4mAcustUNPs", licence: "Unsplash License, retouched", licenceHref: "https://unsplash.com/license" },
  { what: "Basin", who: "Sanibell BV", href: "https://unsplash.com/photos/white-ceramic-sink-with-stainless-steel-faucet-mFQo2uJNf2c", licence: "Unsplash License, cropped", licenceHref: "https://unsplash.com/license" },
  { what: "Copper pipes", who: "Kelsey Todd", href: "https://unsplash.com/photos/a-pair-of-copper-pipes-sitting-on-top-of-a-wall-c5aW5Xy-O7c", licence: "Unsplash License", licenceHref: "https://unsplash.com/license" },
] as const;

export const areas = [
  { name: "Bridge of Don", href: "/areas/bridge-of-don", note: "A large suburb in the north of Aberdeen." },
  { name: "Cults", href: "/areas/cults", note: "On the city's western edge, by the River Dee." },
  { name: "Westhill", href: "/areas/westhill", note: "About 7 miles west of Aberdeen, on the A944." },
] as const;
