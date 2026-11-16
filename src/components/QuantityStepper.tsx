"use client";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  labelledBy,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  labelledBy?: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-stone-300 bg-white" role="group" aria-labelledby={labelledBy}>
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center text-xl font-semibold text-brand disabled:text-stone-300"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-10 text-center text-sm font-semibold" aria-live="polite" aria-label={`Quantity ${value}`}>
        {value}
      </span>
      <button
        type="button"
        className="flex h-11 w-11 items-center justify-center text-xl font-semibold text-brand disabled:text-stone-300"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
