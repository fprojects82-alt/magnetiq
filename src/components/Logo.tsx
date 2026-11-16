import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <img src="/logo-red.png" alt="Magnetiq — Moments That Stick" className="h-10 w-auto sm:h-12" />
    </Link>
  );
}
