"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "@/app/account/actions";
import { useLang } from "@/context/LangContext";

const initialState: { error?: string } = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useLang();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? t.account.loggingIn : t.account.login}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);
  const { t } = useLang();
  const a = t.account;

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-center text-3xl font-bold text-stone-800">{a.welcome}</h1>
      <p className="mt-2 text-center text-stone-500">{a.loginSub}</p>

      <form action={formAction} className="card-surface mt-8 space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">{a.email}</label>
          <input name="email" type="email" required className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-stone-700">{a.password}</label>
          <input name="password" type="password" required className="input-field" />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton />
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        {a.noAccount}{" "}
        <Link href="/signup" className="font-semibold text-brand hover:underline">
          {a.signup}
        </Link>
      </p>
    </div>
  );
}
