import { location } from "../../config/location";

export const DEPOSIT_PENCE = location.depositPounds * 100;
export const DAYS_AHEAD = 14;

export type VisitWindow = "morning" | "afternoon";

const WINDOW_TEXT = {
  weekday: { morning: "Morning, 08:00 to 12:00", afternoon: "Afternoon, 12:00 to 18:00" },
  saturday: { morning: "Morning, 09:00 to 13:00" },
} as const;

function londonDate(now: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: location.timeZone, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

const iso = (date: Date) => date.toISOString().slice(0, 10);

export type BookableDay = { value: string; label: string; windows: { value: VisitWindow; label: string }[] };

// From the next day up to 14 days ahead, by the London calendar. No Sundays, and Saturday is mornings only.
export function bookableDays(now: Date): BookableDay[] {
  const { y, m, d } = londonDate(now);
  const days: BookableDay[] = [];
  for (let offset = 1; offset <= DAYS_AHEAD; offset++) {
    const date = new Date(Date.UTC(y, m - 1, d + offset));
    const weekday = date.getUTCDay();
    if (weekday === 0) continue;
    const label = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long" }).format(date);
    const text = weekday === 6 ? WINDOW_TEXT.saturday : WINDOW_TEXT.weekday;
    days.push({
      value: iso(date),
      label,
      windows: Object.entries(text).map(([value, windowLabel]) => ({ value: value as VisitWindow, label: windowLabel })),
    });
  }
  return days;
}

export function isBookable(date: string, visitWindow: string, now: Date): boolean {
  const day = bookableDays(now).find((d) => d.value === date);
  return Boolean(day?.windows.some((w) => w.value === visitWindow));
}

export function windowLabel(date: string, visitWindow: string): string {
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  if (weekday === 6) return WINDOW_TEXT.saturday.morning;
  return visitWindow === "afternoon" ? WINDOW_TEXT.weekday.afternoon : WINDOW_TEXT.weekday.morning;
}
