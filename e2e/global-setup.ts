import { ADMIN_EMAIL, E2E_EMAIL, testDb } from "./helpers";

export default async function globalSetup() {
  const db = testDb();
  await db.from("enquiries").delete().eq("email", E2E_EMAIL);
  await db.from("bookings").delete().eq("email", E2E_EMAIL);
  const { data } = await db.auth.admin.listUsers();
  for (const user of data?.users ?? []) if (user.email === ADMIN_EMAIL) await db.auth.admin.deleteUser(user.id);
  const { error } = await db.auth.admin.createUser({ email: ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD, email_confirm: true });
  if (error) throw new Error(`Could not create test admin: ${error.message}`);
}
