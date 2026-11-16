"use server";

import bcrypt from "bcryptjs";
import { timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function login(
  _prevState: { error?: string } | void,
  formData: FormData
): Promise<{ error?: string } | void> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  let admin = await db.adminUser.findUnique({ where: { email } });

  // First login on a fresh deployment: if the seed was never run, accept the
  // ADMIN_EMAIL / ADMIN_PASSWORD set in Vercel and create the admin account.
  if (!admin) {
    const envEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const envPassword = process.env.ADMIN_PASSWORD || "";
    if (envEmail && envPassword && safeEqual(email, envEmail) && safeEqual(password, envPassword)) {
      admin = await db.adminUser.create({ data: { email, passwordHash: await bcrypt.hash(password, 10) } });
    } else {
      return { error: "Invalid email or password." };
    }
  } else if (!(await bcrypt.compare(password, admin.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await setSessionCookie({ email: admin.email });
  redirect("/admin");
}
