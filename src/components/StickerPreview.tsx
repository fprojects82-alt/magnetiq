"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "@/context/LangContext";

interface Props {
  /** Local preview URLs of the photos the customer added. */
  photos: string[];
}

/** One glossy domed sticker. `tilt` is -1..1 on each axis and moves the shine. */
function Dome({ src, tilt = { x: 0, y: 0 }, className = "" }: { src: string; tilt?: { x: number; y: number }; className?: string }) {
  const shineX = 35 + tilt.x * 25;
  const shineY = 25 + tilt.y * 25;
  return (
    <span
      className={`relative block overflow-hidden rounded-[22%] bg-white p-[5%] ${className}`}
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,.9) inset, 0 -2px 4px rgba(0,0,0,.12) inset, 0 6px 14px rgba(0,0,0,.35)" }}
    >
      <span className="relative block h-full w-full overflow-hidden rounded-[18%]">
        <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
        {/* Resin dome: bright highlight, soft edge falloff, thin rim. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.25) 18%, rgba(255,255,255,0) 42%),
              radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,.28) 100%)`,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,.55), inset 0 6px 10px rgba(255,255,255,.35), inset 0 -8px 12px rgba(0,0,0,.25)",
          }}
        />
      </span>
    </span>
  );
}

/** Live mock-up of the customer's photos as 3D stickers on a laptop lid. */
export function StickerPreview({ photos }: Props) {
  const { t } = useLang();
  const tb = t.builder;
  const [active, setActive] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [interacting, setInteracting] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active >= photos.length) setActive(Math.max(0, photos.length - 1));
  }, [photos.length, active]);

  // Gentle idle sway so the shine is visible without touching it.
  useEffect(() => {
    if (interacting || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const s = (now - start) / 1000;
      setTilt({ x: Math.sin(s * 0.9) * 0.6, y: Math.cos(s * 0.7) * 0.4 });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [interacting]);

  if (photos.length === 0) return null;
  const main = photos[Math.min(active, photos.length - 1)];
  // Up to 6 other photos scattered around the lid like real stickers.
  const scattered = photos.filter((_, i) => i !== active).slice(0, 6);
  const spots = [
    "left-[6%] top-[10%] w-[18%] -rotate-12",
    "right-[7%] top-[8%] w-[16%] rotate-[10deg]",
    "left-[8%] bottom-[10%] w-[15%] rotate-6",
    "right-[6%] bottom-[12%] w-[19%] -rotate-6",
    "left-[30%] top-[4%] w-[12%] rotate-3",
    "right-[30%] bottom-[5%] w-[12%] -rotate-3",
  ];

  function onMove(e: React.PointerEvent) {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    setTilt({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  }

  return (
    <section className="mt-8" aria-labelledby="sticker-preview-title">
      <h2 id="sticker-preview-title" className="step-title">✨ {tb.stickerPreview}</h2>
      <p className="mt-1 text-sm text-stone-500">{tb.stickerPreviewSub}</p>

      <div
        ref={stageRef}
        onPointerEnter={() => setInteracting(true)}
        onPointerMove={onMove}
        onPointerLeave={() => setInteracting(false)}
        className="relative mx-auto mt-3 aspect-[16/10] max-w-xl touch-none select-none overflow-hidden rounded-3xl"
        style={{
          background: "linear-gradient(145deg, #d9dbe0 0%, #b8bcc4 45%, #9ea3ad 100%)",
          boxShadow: "inset 0 2px 0 rgba(255,255,255,.6), inset 0 -10px 30px rgba(0,0,0,.15)",
          perspective: "900px",
        }}
        aria-hidden
      >
        {/* Laptop logo dimple */}
        <span className="absolute left-1/2 top-1/2 h-[14%] w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25" />
        {scattered.map((src, i) => (
          <span key={`${src}-${i}`} className={`absolute ${spots[i]}`} style={{ aspectRatio: "1 / 1" }}>
            <Dome src={src} tilt={tilt} className="h-full w-full" />
          </span>
        ))}
        <span
          className="absolute left-1/2 top-1/2 w-[34%] transition-transform duration-75"
          style={{
            aspectRatio: "1 / 1",
            transform: `translate(-50%, -50%) rotateX(${-tilt.y * 14}deg) rotateY(${tilt.x * 18}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          <Dome src={main} tilt={tilt} className="h-full w-full" />
        </span>
      </div>

      {photos.length > 1 && (
        <ul className="mx-auto mt-3 flex max-w-xl gap-2 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <li key={`${src}-${i}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={tb.stickerOf(i + 1)}
                aria-pressed={i === active}
                className={`block h-14 w-14 rounded-[22%] p-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 ${
                  i === active ? "ring-2 ring-brand" : ""
                }`}
              >
                <Dome src={src} className="h-full w-full" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
