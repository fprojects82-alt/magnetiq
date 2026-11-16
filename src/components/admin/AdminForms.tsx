"use client";

import { useRef, useTransition, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addAdmin, changeMyPassword, removeAdmin } from "@/app/admin/(dashboard)/admins/actions";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Saving…" : children}
    </button>
  );
}

function Message({ state }: { state: { ok?: string; error?: string } }) {
  if (state.error) return <p role="alert" className="text-sm text-red-600">{state.error}</p>;
  if (state.ok) return <p role="status" className="text-sm text-green-700">{state.ok}</p>;
  return null;
}

export function AddAdminForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action] = useFormState(async (prev: { ok?: string; error?: string }, fd: FormData) => {
    const res = await addAdmin(prev, fd);
    if (res.ok) ref.current?.reset();
    return res;
  }, {});
  return (
    <form ref={ref} action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="new-admin-email" className="mb-1 block text-sm font-medium text-stone-700">Email</label>
          <input id="new-admin-email" name="email" type="email" required autoComplete="off" className="input-field" />
        </div>
        <div>
          <label htmlFor="new-admin-password" className="mb-1 block text-sm font-medium text-stone-700">Password (8+ characters)</label>
          <input id="new-admin-password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input-field" />
        </div>
      </div>
      <Message state={state} />
      <Submit>Add admin</Submit>
    </form>
  );
}

export function RemoveAdminButton({ id, email }: { id: string; email: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Remove ${email} as admin? They won't be able to log in anymore.`)) return;
          start(async () => {
            const res = await removeAdmin(id);
            setError(res.error ?? null);
          });
        }}
        className="rounded-full px-3 py-1.5 text-sm font-medium text-stone-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}

export function ChangePasswordForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action] = useFormState(async (prev: { ok?: string; error?: string }, fd: FormData) => {
    const res = await changeMyPassword(prev, fd);
    if (res.ok) ref.current?.reset();
    return res;
  }, {});
  return (
    <form ref={ref} action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="pw-current" className="mb-1 block text-sm font-medium text-stone-700">Current password</label>
          <input id="pw-current" name="current" type="password" required autoComplete="current-password" className="input-field" />
        </div>
        <div>
          <label htmlFor="pw-next" className="mb-1 block text-sm font-medium text-stone-700">New password</label>
          <input id="pw-next" name="next" type="password" required minLength={8} autoComplete="new-password" className="input-field" />
        </div>
        <div>
          <label htmlFor="pw-confirm" className="mb-1 block text-sm font-medium text-stone-700">Repeat new password</label>
          <input id="pw-confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" className="input-field" />
        </div>
      </div>
      <Message state={state} />
      <Submit>Change password</Submit>
    </form>
  );
}
