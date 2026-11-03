"use server";

import { redirect } from "next/navigation";
import { sendDemoEmail } from "@/lib/email";
import { isSpam, keepValues, validateEnquiry, type FormState } from "@/lib/forms";
import { allowAction, serverDb } from "@/lib/server";

const ENQUIRIES_PER_DAY = 5;
const FAILED = "Your enquiry did not send. Please try again, or call the number at the top of this page.";

export async function sendEnquiry(_previous: FormState, data: FormData): Promise<FormState> {
  // Spam is shown the same thank-you page, so it learns nothing, and nothing is saved.
  if (isSpam(data)) redirect("/contact/thanks");

  const result = validateEnquiry(data);
  if (!result.ok) return { errors: result.errors, values: keepValues(data) };

  try {
    const db = serverDb();
    if (!(await allowAction(db, "enquiry", ENQUIRIES_PER_DAY))) {
      return { errors: {}, values: keepValues(data), message: "You have sent several enquiries today. Please call the number at the top of this page instead." };
    }
    const { data: row, error } = await db.from("enquiries").insert(result.value).select("id").single();
    if (error) return { errors: {}, values: keepValues(data), message: FAILED };

    // The enquiry is already saved here, so a failed email loses nothing.
    const v = result.value;
    const sent = await sendDemoEmail(
      `New enquiry from ${v.name} (${v.urgency})`,
      [`Name: ${v.name}`, `Phone: ${v.phone}`, `Email: ${v.email}`, `Postcode area: ${v.postcode_area}`, `Urgency: ${v.urgency}`, `Contact by: ${v.contact_method}`, `Best time: ${v.preferred_time}`, "", v.problem].join("\n"),
    );
    if (sent) await db.from("enquiries").update({ email_sent: true }).eq("id", row.id);
  } catch {
    return { errors: {}, values: keepValues(data), message: FAILED };
  }
  redirect("/contact/thanks");
}
