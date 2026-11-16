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

  // The ADMIN_EMAIL / ADMIN_PASSWORD set in Vercel always work as the owner
  // login: they create the account on first use, and if the account already
  // exists with an older password (e.g. from an earlier seed), they reset it.
  // This is how the owner recovers access: change the variables and redeploy.
  const envEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const envPassword = process.env.ADMIN_PASSWORD || "";
  const isEnvLogin = Boolean(envEmail && envPassword) && safeEqual(email, envEmail) && safeEqual(password, envPassword);

  if (isEnvLogin) {
    const passwordHash = await bcrypt.hash(password, 10);
    admin = admin
      ? await db.adminUser.update({ where: { id: admin.id }, data: { passwordHash } })
      : await db.adminUser.create({ data: { email, passwordHash } });
  } else if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await setSessionCookie({ email: admin.email });
  redirect("/admin");
}
