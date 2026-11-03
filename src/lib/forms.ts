export type FieldErrors = Record<string, string>;
export type FormState = { errors: FieldErrors; message?: string; values?: Record<string, string> };

const text = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
};

// A UK phone number: digits, spaces and an optional +, with 10 to 13 digits.
const PHONE = /^\+?[\d\s()-]{10,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// The first part of a UK postcode, such as AB15, or a full postcode.
const POSTCODE = /^[A-Za-z]{1,2}\d[A-Za-z\d]?(\s?\d[A-Za-z]{2})?$/;

export function validateContact(data: FormData, errors: FieldErrors) {
  const name = text(data, "name");
  const phone = text(data, "phone");
  const email = text(data, "email");
  const postcode = text(data, "postcode");
  const problem = text(data, "problem");
  const digits = phone.replace(/\D/g, "").length;

  if (!name) errors.name = "Enter your name.";
  else if (name.length > 100) errors.name = "Keep your name under 100 characters.";
  // Line breaks and control characters are refused, because the name goes into an email subject.
  else if (/[\u0000-\u001f\u007f]/.test(name)) errors.name = "Enter your name using ordinary letters.";
  if (!PHONE.test(phone) || digits < 10 || digits > 13) errors.phone = "Enter a phone number with the full area code, like 01632 960 472.";
  if (!EMAIL.test(email) || email.length > 254) errors.email = "Enter an email address, like name@example.com.";
  if (!POSTCODE.test(postcode)) errors.postcode = "Enter your postcode area, like AB15.";
  if (!problem) errors.problem = "Tell us what the problem is.";
  else if (problem.length > 2000) errors.problem = "Keep this under 2,000 characters.";

  return { name, phone, email, postcode_area: postcode.toUpperCase(), problem };
}

export type EnquiryInput = ReturnType<typeof validateContact> & {
  urgency: "emergency" | "soon" | "flexible";
  contact_method: "phone" | "email";
  preferred_time: "morning" | "afternoon" | "evening" | "any";
  consent: true;
};

export function validateEnquiry(data: FormData): { ok: true; value: EnquiryInput } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const contact = validateContact(data, errors);
  const urgency = text(data, "urgency");
  const method = text(data, "contact_method");
  const time = text(data, "preferred_time");
  if (!["emergency", "soon", "flexible"].includes(urgency)) errors.urgency = "Choose how urgent this is.";
  if (!["phone", "email"].includes(method)) errors.contact_method = "Choose how we should contact you.";
  if (!["morning", "afternoon", "evening", "any"].includes(time)) errors.preferred_time = "Choose a time.";
  if (data.get("consent") !== "yes") errors.consent = "Tick this box so we can contact you about your enquiry.";
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      ...contact,
      urgency: urgency as EnquiryInput["urgency"],
      contact_method: method as EnquiryInput["contact_method"],
      preferred_time: time as EnquiryInput["preferred_time"],
      consent: true,
    },
  };
}

// Real people never fill in the hidden field. Bots usually do.
export const isSpam = (data: FormData) => text(data, "kg_leave_blank").length > 0;

export function keepValues(data: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of data.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION") && key !== "kg_leave_blank") values[key] = value;
  }
  return values;
}
