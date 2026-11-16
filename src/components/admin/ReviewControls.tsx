"use client";

import { useTransition } from "react";
import { deleteReview, setReviewVisible } from "@/app/admin/(dashboard)/reviews/actions";

export function ReviewControls({ id, visible }: { id: string; visible: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => setReviewVisible(id, !visible))}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${
          visible ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-600"
        }`}
      >
        {visible ? "Shown on site · Hide" : "Hidden · Show"}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm("Delete this review permanently?")) start(() => deleteReview(id));
        }}
        className="rounded-full px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
