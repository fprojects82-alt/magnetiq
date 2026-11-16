"use client";

import { useState } from "react";
import { updateCardRequestStatus } from "@/app/admin/(dashboard)/card-requests/actions";
import { CARD_REQUEST_STATUSES } from "@/lib/cardRequest";

export function CardRequestStatusSelect({ id, status }: { id: string; status: string }) {
  const [current, setCurrent] = useState(status);
  const [saving, setSaving] = useState(false);

  return (
    <select
      aria-label="Request status"
      value={current}
      disabled={saving}
      onChange={async (e) => {
        const next = e.target.value;
        setCurrent(next);
        setSaving(true);
        try {
          await updateCardRequestStatus(id, next);
        } finally {
          setSaving(false);
        }
      }}
      className="input-field !w-auto py-2 text-sm"
    >
      {CARD_REQUEST_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.charAt(0) + s.slice(1).toLowerCase()}
        </option>
      ))}
    </select>
  );
}
