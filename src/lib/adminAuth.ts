import { db } from "./db";
import { getSession } from "./auth";

/**
 * The signed-in admin, or null. Checks the database too, so an admin who was
 * removed from the Admins page loses access right away even with an old cookie.
 */
export async function getAdmin() {
  const session = await getSession();
  if (!session) return null;
  return db.adminUser.findUnique({ where: { email: session.email }, select: { id: true, email: true } });
}

export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error("Unauthorized");
  return admin;
}
