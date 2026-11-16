"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/adminAuth";

type Result = { ok?: string; error?: string };

const newAdminSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export async function addAdmin(_prev: Result, formData: FormData): Promise<Result> {
  await requireAdmin();
  const parsed = newAdminSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const exists = await db.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { error: "That email is already an admin." };
  await db.adminUser.create({
    data: { email: parsed.data.email, passwordHash: await bcrypt.hash(parsed.data.password, 10) },
  });
  revalidatePath("/admin/admins");
  return { ok: `${parsed.data.email} can now log in at /admin/login.` };
}

export async function removeAdmin(id: string): Promise<Result> {
  const me = await requireAdmin();
  if (id === me.id) return { error: "You can't remove yourself." };
  const count = await db.adminUser.count();
  if (count <= 1) return { error: "You need at least one admin." };
  await db.adminUser.delete({ where: { id } });
  revalidatePath("/admin/admins");
  return { ok: "Admin removed." };
}

const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password."),
    next: z.string().min(8, "New password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((d) => d.next === d.confirm, { message: "The new passwords don't match." });

export async function changeMyPassword(_prev: Result, formData: FormData): Promise<Result> {
  const me = await requireAdmin();
  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    next: formData.get("next"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const admin = await db.adminUser.findUnique({ where: { id: me.id } });
  if (!admin || !(await bcrypt.compare(parsed.data.current, admin.passwordHash))) {
    return { error: "Your current password is wrong." };
  }
  await db.adminUser.update({ where: { id: me.id }, data: { passwordHash: await bcrypt.hash(parsed.data.next, 10) } });
  return { ok: "Password changed." };
}
