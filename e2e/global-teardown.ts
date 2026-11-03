import { ADMIN_EMAIL, E2E_EMAIL, testDb } from "./helpers";

export default async function globalTeardown() {
  const db = testDb();
  await db.from("enquiries").delete().eq("email", E2E_EMAIL);
  await db.from("bookings").delete().eq("email", E2E_EMAIL);
  const { data } = await db.auth.admin.listUsers();
  for (const user of data?.users ?? []) if (user.email === ADMIN_EMAIL) await db.auth.admin.deleteUser(user.id);
}
