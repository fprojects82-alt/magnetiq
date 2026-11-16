interface OfferBannerProps {
  title: string;
  description: string;
  badgeText?: string | null;
}

export function OfferBanner({ title, description, badgeText }: OfferBannerProps) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-2xl bg-brand px-5 py-4 text-white shadow-md sm:flex-row sm:items-center sm:gap-4 sm:px-6">
      {badgeText && (
        <span className="shrink-0 rounded-full bg-white/20 px-3 py-1 text-xs font-bold sm:text-sm">{badgeText}</span>
      )}
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-white/85">{description}</p>
      </div>
    </div>
  );
}
