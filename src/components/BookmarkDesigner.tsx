"use client";

import { useId } from "react";
import { useLang } from "@/context/LangContext";

export interface BookmarkDesign {
  shape: BookmarkShape;
  color: string;
  quote: string;
}

export const BOOKMARK_SHAPES = ["classic", "arch", "heart", "ornament"] as const;
export type BookmarkShape = (typeof BOOKMARK_SHAPES)[number];

// Shapes drawn in a 120 x 180 box.
const SHAPE_PATHS: Record<BookmarkShape, string> = {
  classic: "M16 2 H104 A14 14 0 0 1 118 16 V164 A14 14 0 0 1 104 178 H16 A14 14 0 0 1 2 164 V16 A14 14 0 0 1 16 2 Z",
  arch: "M2 60 A58 58 0 0 1 118 60 V166 A12 12 0 0 1 106 178 H14 A12 12 0 0 1 2 166 Z",
  heart:
    "M60 172 C20 132 2 100 2 62 C2 30 26 8 52 18 C56 20 58 23 60 26 C62 23 64 20 68 18 C94 8 118 30 118 62 C118 100 100 132 60 172 Z",
  ornament: "M60 2 L82 22 L118 40 V140 L82 158 L60 178 L38 158 L2 140 V40 L38 22 Z",
};

export const DEFAULT_BOOKMARK: BookmarkDesign = { shape: "arch", color: "#B7202E", quote: "" };

const SWATCHES = ["#B7202E", "#1F2937", "#F5E6D3", "#7C5CBF", "#3B82F6", "#16A34A", "#F59E0B", "#EC4899"];

function isDark(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return true;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255,
    g = (n >> 8) & 255,
    b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 150;
}

export function normalizeHex(v: string): string | null {
  const s = v.trim().replace(/^#?/, "#");
  if (/^#[0-9a-f]{6}$/i.test(s)) return s.toUpperCase();
  if (/^#[0-9a-f]{3}$/i.test(s)) return ("#" + s.slice(1).split("").map((c) => c + c).join("")).toUpperCase();
  return null;
}

/** Live preview of a bookmark: shape filled with the colour, photo inside, quote on top. */
export function BookmarkPreview({ design, photo, size = 150 }: { design: BookmarkDesign; photo?: string | null; size?: number }) {
  const clipId = useId().replace(/:/g, "");
  const color = normalizeHex(design.color) ?? "#B7202E";
  const textColor = photo ? "#ffffff" : isDark(color) ? "#ffffff" : "#1f2937";
  return (
    <svg viewBox="0 0 120 180" width={size} height={size * 1.5} role="img" aria-hidden className="drop-shadow-lg">
      <defs>
        <clipPath id={clipId}>
          <path d={SHAPE_PATHS[design.shape]} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="120" height="180" fill={color} />
        {photo && <image href={photo} width="120" height="180" preserveAspectRatio="xMidYMid slice" />}
        {design.quote && (
          <>
            {photo && <rect y="118" width="120" height="62" fill="rgba(0,0,0,0.45)" />}
            <foreignObject x="10" y={photo ? 122 : 40} width="100" height={photo ? 54 : 100}>
              <div
                style={{
                  color: textColor,
                  fontSize: design.quote.length > 60 ? 8 : 10,
                  lineHeight: 1.25,
                  fontWeight: 600,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
              >
                {design.quote}
              </div>
            </foreignObject>
          </>
        )}
      </g>
      <path d={SHAPE_PATHS[design.shape]} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" />
    </svg>
  );
}

/** Shape, colour (wheel or code) and quote controls for magnetic bookmarks. */
export function BookmarkDesigner({
  value,
  onChange,
  photo,
}: {
  value: BookmarkDesign;
  onChange: (v: BookmarkDesign) => void;
  photo?: string | null;
}) {
  const { t } = useLang();
  const b = t.bookmark;
  const ids = useId();
  const valid = normalizeHex(value.color);

  return (
    <section className="mt-8" aria-labelledby={`${ids}-title`}>
      <h2 id={`${ids}-title`} className="step-title">
        <span className="step-num">2</span> {b.title}
      </h2>
      <div className="mt-3 grid gap-5 rounded-2xl border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-5">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-stone-700">{b.shape}</legend>
            <div className="grid grid-cols-4 gap-2" role="radiogroup">
              {BOOKMARK_SHAPES.map((shape) => (
                <button
                  key={shape}
                  type="button"
                  role="radio"
                  aria-checked={value.shape === shape}
                  onClick={() => onChange({ ...value, shape })}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 text-xs font-medium transition ${
                    value.shape === shape ? "border-brand bg-brand/5 text-brand" : "border-stone-200 text-stone-600 hover:border-brand/50"
                  }`}
                >
                  <svg viewBox="0 0 120 180" className="h-12 w-8" aria-hidden>
                    <path d={SHAPE_PATHS[shape]} fill={value.shape === shape ? "#B7202E" : "#d6d3d1"} />
                  </svg>
                  {b.shapes[shape]}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor={`${ids}-hex`} className="mb-2 block text-sm font-medium text-stone-700">{b.color}</label>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                aria-label={b.colorWheel}
                value={valid ?? "#B7202E"}
                onChange={(e) => onChange({ ...value, color: e.target.value.toUpperCase() })}
                className="h-11 w-14 cursor-pointer rounded-lg border border-stone-300 bg-white p-1"
              />
              <input
                id={`${ids}-hex`}
                dir="ltr"
                className={`input-field w-32 py-2 font-mono uppercase ${valid ? "" : "border-red-400"}`}
                placeholder="#B7202E"
                maxLength={7}
                value={value.color}
                onChange={(e) => onChange({ ...value, color: e.target.value })}
              />
              <div className="flex gap-1.5">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => onChange({ ...value, color: c })}
                    className={`h-7 w-7 rounded-full border-2 ${valid === c ? "border-stone-900" : "border-white shadow"}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <p className={`mt-1 text-xs ${valid ? "text-stone-500" : "text-red-600"}`}>{valid ? b.colorHint : b.colorBad}</p>
          </div>

          <div>
            <label htmlFor={`${ids}-quote`} className="mb-1 block text-sm font-medium text-stone-700">{b.quote}</label>
            <textarea
              id={`${ids}-quote`}
              rows={2}
              maxLength={120}
              className="input-field"
              placeholder={b.quotePh}
              value={value.quote}
              onChange={(e) => onChange({ ...value, quote: e.target.value })}
            />
            <p className="mt-1 text-xs text-stone-400">{value.quote.length}/120</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-brand-cream p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{b.preview}</p>
          <BookmarkPreview design={{ ...value, color: valid ?? "#B7202E" }} photo={photo} />
          <p className="max-w-[170px] text-center text-[11px] text-stone-500">{b.previewNote}</p>
        </div>
      </div>
    </section>
  );
}
