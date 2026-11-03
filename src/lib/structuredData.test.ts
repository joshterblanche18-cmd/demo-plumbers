import { describe, expect, it } from "vitest";
import { location } from "../config/location";
import { plumberJsonLd } from "./structuredData";

const data = plumberJsonLd("https://example.test");

describe("plumberJsonLd", () => {
  it("is valid JSON with the right type", () => {
    const parsed = JSON.parse(JSON.stringify(data));
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@type"]).toBe("Plumber");
  });
  it("matches the name, address and phone used on the pages", () => {
    expect(data.name).toBe(location.businessName);
    expect(data.telephone).toBe(location.phone.tel);
    expect(location.address.startsWith(data.address.streetAddress)).toBe(true);
    expect(data.address.addressLocality).toBe(location.city);
  });
  it("lists the city and all three areas", () => {
    expect(data.areaServed.map((a) => a.name)).toEqual(["Aberdeen", "Bridge of Don", "Cults", "Westhill"]);
  });
  it("has the opening hours", () => {
    expect(data.openingHoursSpecification[0].opens).toBe("08:00");
    expect(data.openingHoursSpecification[1].dayOfWeek).toBe("Saturday");
  });
  it("uses a reserved drama number, not a real one", () => {
    expect(data.telephone).toMatch(/^\+441632960\d{3}$/);
  });
  it("makes no claims of reviews, ratings or awards", () => {
    expect(JSON.stringify(data)).not.toMatch(/aggregateRating|review|award/i);
  });
});
