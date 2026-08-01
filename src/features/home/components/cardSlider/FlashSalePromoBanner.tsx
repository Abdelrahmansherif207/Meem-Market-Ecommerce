import { Link } from "@/i18n/navigation";

interface FlashSalePromoBannerProps {
  locale: string;
  title?: string;
}

export default function FlashSalePromoBanner({ locale, title }: FlashSalePromoBannerProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF5500] min-h-[180px] sm:min-h-[200px]">
      {/* Diagonal overlay for depth */}
      <div className="absolute inset-0">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-white/10" />
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-6 sm:px-10 sm:py-8">
        {/* Text Content */}
        <div className="flex flex-col gap-1">
          <span className="text-white/80 text-xs sm:text-sm font-medium tracking-widest uppercase">
            {title ?? "Flash Sale"}
          </span>
          <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-black italic leading-none tracking-tight">
            LUCKY SIZES
          </h2>
          <p className="text-white/90 text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
            UP TO 60% OFF
          </p>
          <p className="text-white/70 text-sm sm:text-base font-medium">
            Adidas, Nike &amp; more!
          </p>
        </div>

        {/* CTA */}
        <Link
          href={`/${locale}/flash-sales`}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-gray-900 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md shrink-0"
        >
          SHOP NOW
          <span className="text-base leading-none" aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
