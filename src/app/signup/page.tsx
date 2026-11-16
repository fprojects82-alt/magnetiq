"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signup } from "@/app/account/actions";
import { useLang } from "@/context/LangContext";

const initialState: { error?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLang();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? t.account.creating : t.account.createBtn}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useFormState(signup, initialState);
  const { t } = useLang();
  const a = t.account;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-center text-3xl font-bold text-stone-800">{a.create}</h1>
      <p className="mt-2 text-center text-stone-500">
        {a.createSub}
      </p>

      <form action={formAction} className="card-surface mt-8 space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">{a.fullName}</label>
          <input name="name" required className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">{a.email}</label>
          <input name="email" type="email" required className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">{a.phone}</label>
          <input name="phone" type="tel" required className="input-field" placeholder="01xxxxxxxxx" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">{a.password}</label>
          <input name="password" type="password" required minLength={6} className="input-field" />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        {a.haveAccount}{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          {a.login}
        </Link>
      </p>
    </div>
  );
}
