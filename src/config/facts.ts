// Everything the chatbot may say about the firm. All prices are demo prices for a fictional firm.
import { location } from "./location";
import { areas, services } from "./site";

export const demoPrices = [
  { item: "Boiler service", from: 85 },
  { item: "Boiler repair visit", from: 95 },
  { item: "Emergency call-out outside opening hours", from: 120 },
  { item: "New boiler, fitted", from: 2200 },
  { item: "Bathroom refit", from: 4800 },
] as const;

export const callOutWindows = {
  weekday: "08:00 to 12:00 or 12:00 to 18:00",
  saturday: "09:00 to 13:00",
};

const pounds = (n: number) => `${location.currencySymbol}${n.toLocaleString("en-GB")}`;

// Every £ figure the chatbot is allowed to say. Anything else is treated as invented.
export const allowedPounds = new Set<string>([pounds(location.depositPounds), ...demoPrices.map((p) => pounds(p.from))]);

export function factsText(): string {
  const { businessName, city, phone, hours, depositPounds, currencySymbol } = location;
  return [
    `Firm: ${businessName}, a fictional family firm in ${city}. This website is a demo by Tarnfield, a company that builds websites. Nothing is sold and nobody will really come out.`,
    `Phone (fictional): ${phone.display}. Enquiry form: the Contact page.`,
    `Services: ${services.map((s) => `${s.name}: ${s.summary}`).join(" ")}`,
    `Areas: Aberdeen and the places around it, including ${areas.map((a) => a.name).join(", ")}. No other towns are confirmed.`,
    `Opening hours (Europe/London): ${hours.map((h) => `${h.days} ${h.times}`).join(". ")}. Closed on Sundays except for emergencies. Emergency call-outs: 24 hours, every day.`,
    `Demo prices, all marked "from" and all fictional: ${demoPrices.map((p) => `${p.item} from ${pounds(p.from)}`).join(". ")}. There are no other prices. There are no discounts or offers.`,
    `Booking a call-out: pick a date and a window, then pay a ${currencySymbol}${depositPounds} deposit, which comes off the final bill. Weekday windows: ${callOutWindows.weekday}. Saturday window: ${callOutWindows.saturday}. No Sunday bookings. Dates run from the next day up to 14 days ahead. Payment uses test money only, because this is a demo.`,
    `Cancelling: free up to 24 hours before the appointment, and the deposit is refunded.`,
    `Registrations: the firm is fictional and holds no registrations.`,
    `Privacy: chats are not saved after the visit.`,
  ].join("\n");
}
