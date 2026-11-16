import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <img src="/logo-badge.png" alt="Magnetiq — Moments That Stick" className="h-9 w-auto rounded-lg shadow-sm sm:h-10" />
    </Link>
  );
}
