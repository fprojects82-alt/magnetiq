import { db } from "@/lib/db";
import { getAdmin } from "@/lib/adminAuth";
import { AddAdminForm, ChangePasswordForm, RemoveAdminButton } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

export default async function AdminsPage() {
  const [me, admins] = await Promise.all([
    getAdmin(),
    db.adminUser.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, email: true, createdAt: true } }),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-stone-800">Admins</h1>
      <p className="mt-1 text-sm text-stone-500">Everyone here can log in at /admin/login and manage orders.</p>

      <section className="card-surface mt-6 p-5">
        <h2 className="font-semibold text-stone-800">Admin accounts</h2>
        <ul className="mt-3 divide-y divide-stone-100">
          {admins.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 py-3">
              <span>
                <span className="font-medium text-stone-800">{a.email}</span>
                {me?.id === a.id && <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">You</span>}
                <span className="block text-xs text-stone-400">Added {a.createdAt.toLocaleDateString()}</span>
              </span>
              {me?.id !== a.id && <RemoveAdminButton id={a.id} email={a.email} />}
            </li>
          ))}
        </ul>
      </section>

      <section className="card-surface mt-6 p-5">
        <h2 className="mb-3 font-semibold text-stone-800">Add another admin</h2>
        <AddAdminForm />
        <p className="mt-3 text-xs text-stone-400">Share the email and password with them privately. They can change the password after logging in.</p>
      </section>

      <section className="card-surface mt-6 p-5">
        <h2 className="mb-3 font-semibold text-stone-800">Change my password</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
