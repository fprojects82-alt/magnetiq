"use client";

import { useFormState, useFormStatus } from "react-dom";
import { trackOrder } from "./actions";
import { useLang } from "@/context/LangContext";

function Submit() {
  const { pending } = useFormStatus();
  const { t } = useLang();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? t.track.looking : t.track.btn}
    </button>
  );
}

export default function TrackPage() {
  const [state, action] = useFormState(trackOrder, {});
  const { t } = useLang();
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-display text-3xl font-bold italic text-brand sm:text-4xl">{t.track.title}</h1>
      <p className="mt-2 text-stone-600">{t.track.sub}</p>
      <form action={action} className="card-surface mt-6 space-y-4 p-5">
        <div>
          <label htmlFor="track-number" className="mb-1 block text-sm font-medium text-stone-700">{t.track.label}</label>
          <input
            id="track-number"
            name="orderNumber"
            required
            autoCapitalize="characters"
            autoComplete="off"
            dir="ltr"
            className="input-field font-mono uppercase tracking-wider"
            placeholder="MQ-XXXXXXX"
          />
        </div>
        <p role="alert" className="text-sm text-red-600 empty:hidden">{state?.error}</p>
        <Submit />
      </form>
    </div>
  );
}
