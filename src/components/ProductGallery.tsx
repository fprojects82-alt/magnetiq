"use client";

import { useState } from "react";

export function ProductGallery({ images }: { images: { src: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  if (!current) return null;

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-3xl sm:aspect-[4/3] bg-white shadow-md">
        <img src={current.src} alt={current.alt} className="absolute inset-0 h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2" role="tablist" aria-label="Product photos">
          {images.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show photo ${i + 1}: ${img.alt}`}
              onClick={() => setIndex(i)}
              className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-20 ${
                i === index ? "border-brand" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img.src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
