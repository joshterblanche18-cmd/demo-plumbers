// Page wording for services and areas. Area facts checked on 3 November 2026 against Wikipedia:
// https://en.wikipedia.org/wiki/Bridge_of_Don , https://en.wikipedia.org/wiki/Cults,_Aberdeen ,
// https://en.wikipedia.org/wiki/Westhill,_Aberdeenshire

export type ServiceContent = {
  slug: string;
  name: string;
  title: string;
  description: string;
  intro: string;
  photo: { src: string; alt: string; width: number; height: number };
  listHeading: string;
  list: string[];
  whatHappens: string;
  priceItem: string;
  emergency?: boolean;
};

export const serviceContent: ServiceContent[] = [
  {
    slug: "emergency-plumbing",
    name: "Emergency plumbing",
    title: "Emergency plumber in Aberdeen, 24 hours (demo)",
    description: "Burst pipe or bad leak in Aberdeen? What to do first, and how a 24-hour emergency call-out works at this fictional demo firm.",
    intro: "A burst pipe or a bad leak can do a lot of damage quickly. Here is what to do first, and what happens when you call.",
    photo: { src: "/photos/dripping-tap.webp", alt: "Water dripping from an old outdoor tap, in black and white", width: 800, height: 1200 },
    listHeading: "What to do while you wait",
    list: [
      "Turn off the water at the stopcock. It is often under the kitchen sink.",
      "Move what you can out of the way of the water.",
      "If water is near sockets, a fuse box or light fittings, stay clear of them.",
      "Tell us where the water is coming from, if you can see.",
    ],
    whatHappens: "In real life you would call at any hour, and the firm would ask what is happening, tell you what to do next, and agree when an engineer could reach you. This firm is fictional, so please do not rely on it in a real emergency.",
    priceItem: "Emergency call-out outside opening hours",
    emergency: true,
  },
  {
    slug: "boiler-repair-and-replacement",
    name: "Boiler repair and replacement",
    title: "Boiler repair and replacement in Aberdeen (demo)",
    description: "No heating or hot water in Aberdeen? How this fictional demo firm finds a boiler fault, and how it decides between a repair and a new boiler.",
    intro: "If the heating or hot water has stopped, we find out why first. Then we tell you plainly whether a repair makes sense or a new boiler would be better value.",
    photo: { src: "/photos/radiator.webp", alt: "An old cast iron radiator under a tiled window sill", width: 560, height: 373 },
    listHeading: "Worth telling us when you get in touch",
    list: [
      "Any fault code or light showing on the boiler.",
      "Whether you have lost the heating, the hot water, or both.",
      "Any unusual noises, or water around the boiler.",
      "The make of the boiler and roughly how old it is, if you know.",
    ],
    whatHappens: "An engineer checks the boiler, explains the fault and gives you a price before starting. If replacing it makes more sense, we explain why and you decide.",
    priceItem: "Boiler repair visit",
  },
  {
    slug: "boiler-servicing",
    name: "Boiler servicing",
    title: "Boiler servicing in Aberdeen (demo)",
    description: "A yearly boiler service in Aberdeen, explained in plain terms: what gets checked and when to book. Fictional demo firm, nothing is sold.",
    intro: "A yearly service helps catch small problems before they leave you without heating. It is easiest to book before the cold weather arrives.",
    photo: { src: "/photos/wrenches.webp", alt: "A pipe wrench and an adjustable spanner", width: 560, height: 426 },
    listHeading: "What a service covers",
    list: [
      "Checking the boiler is working safely and burning properly.",
      "Looking over the flue and the pipework around the boiler.",
      "Checking the controls and the system pressure.",
      "Telling you about anything likely to need attention soon.",
    ],
    whatHappens: "Book a morning or an afternoon. We tell you what we found when we finish, in plain words.",
    priceItem: "Boiler service",
  },
  {
    slug: "bathrooms",
    name: "Bathrooms",
    title: "Bathroom fitting in Aberdeen (demo)",
    description: "New basin or a complete bathroom refit in Aberdeen? How this fictional demo firm plans the work with you. Nothing is sold.",
    intro: "From a new basin to a complete refit, we plan the work with you first, so you know what is happening and in what order.",
    photo: { src: "/photos/basin.webp", alt: "A white bathroom basin with a black wall-mounted tap", width: 560, height: 420 },
    listHeading: "How we plan a bathroom",
    list: [
      "We look at the room and the pipework that is already there.",
      "You tell us what you want to change and what you want to keep.",
      "We give you a written price and a rough timetable.",
      "We agree how you will manage without the bathroom during the work.",
    ],
    whatHappens: "Send an enquiry with a rough idea of what you want. Photos and measurements can come later.",
    priceItem: "Bathroom refit",
  },
];

export type AreaContent = {
  slug: string;
  name: string;
  title: string;
  description: string;
  intro: string;
  sections: { heading: string; text: string }[];
  serviceSlug: string;
  serviceLine: string;
};

export const areaContent: AreaContent[] = [
  {
    slug: "bridge-of-don",
    name: "Bridge of Don",
    title: "Plumber and heating engineer in Bridge of Don (demo)",
    description: "Boiler servicing, repairs and emergency plumbing in Bridge of Don, north Aberdeen, from a fictional demo firm. Nothing is sold.",
    intro: "Bridge of Don is a large residential suburb in the north of Aberdeen. It is close enough to the city that a planned visit is easy to fit into a morning or an afternoon.",
    sections: [
      { heading: "Booking ahead", text: "Most boiler servicing is planned, so choose a date up to 14 days ahead and pick a morning or an afternoon. A service before winter means fewer surprises when the heating goes on for the season." },
      { heading: "If something goes wrong out of hours", text: "Emergency call-outs run 24 hours. If a pipe has burst, turn the water off at the stopcock first, then call us." },
    ],
    serviceSlug: "boiler-servicing",
    serviceLine: "Read about boiler servicing",
  },
  {
    slug: "cults",
    name: "Cults",
    title: "Plumber and heating engineer in Cults, Aberdeen (demo)",
    description: "Heating and plumbing for older granite homes in Cults, on Aberdeen's western edge beside the River Dee, from a fictional demo firm.",
    intro: "Cults sits on Aberdeen's western edge beside the River Dee, and it is known for its historic granite housing. Older homes like these often need a little more planning.",
    sections: [
      { heading: "Working in older homes", text: "Thick stone walls and older pipework can change how a new bathroom or a heating job is planned. We look at what is already there before giving you a price." },
      { heading: "Bathrooms in older houses", text: "If you are changing a bathroom, tell us about the age of the house and any work done before. It helps us plan the route for new pipes and how water will reach the room." },
    ],
    serviceSlug: "bathrooms",
    serviceLine: "Read about bathrooms",
  },
  {
    slug: "westhill",
    name: "Westhill",
    title: "Plumber and heating engineer in Westhill (demo)",
    description: "Boiler repair and replacement in Westhill, about 7 miles west of Aberdeen on the A944, from a fictional demo firm. Nothing is sold.",
    intro: "Westhill is a town about 7 miles (11 km) west of Aberdeen, on the A944. Its first houses went up in 1968, and it has grown gradually since, so homes here vary a lot in age.",
    sections: [
      { heading: "Heating in homes of different ages", text: "A heating system in an older home here may have been changed several times, while a newer one may still have its first boiler. If yours is getting old, it is worth asking whether a repair or a replacement makes more sense." },
      { heading: "Getting to you", text: "Tell us the first part of your postcode when you get in touch, and which time window suits you. On a call-out, the engineer arrives at some point during the window you choose." },
    ],
    serviceSlug: "boiler-repair-and-replacement",
    serviceLine: "Read about boiler repair and replacement",
  },
];

export const faqs = [
  { q: "Is this a real firm?", a: "No. Kirkgate Heating & Plumbing is fictional, and this is a demo website made by Tarnfield. Nobody will come out, and the phone number and address are not real." },
  { q: "Do you do 24-hour call-outs?", a: "Yes, for emergencies such as burst pipes and bad leaks. Normal opening hours are Monday to Friday 08:00 to 18:00, and Saturday 09:00 to 13:00." },
  { q: "What should I do if I smell gas?", a: "Do not wait for us. Open doors and windows, get into fresh air, and call the National Gas Emergency Service free on 0800 111 999. That number is real." },
  { q: "How does the £25 deposit work?", a: "You pay it when you book a call-out, and it comes off your final bill. On this demo it uses test money only, so no real card is charged." },
  { q: "Can I cancel a booking?", a: "Yes. Cancelling is free up to 24 hours before the appointment, and the deposit is refunded." },
  { q: "Which areas do you cover?", a: "Aberdeen and the places around it, including Bridge of Don, Cults and Westhill. If you are not sure, send an enquiry with your postcode area." },
  { q: "Are your engineers registered?", a: "This firm is fictional and holds no registrations. A real firm doing gas work in the UK must be on the Gas Safe Register, so always check when you hire one." },
  { q: "Is the chat box a real person?", a: "No. It is an AI assistant that answers from a fixed list of facts about this fictional firm. It cannot book anything, and chats are not saved after your visit." },
];
