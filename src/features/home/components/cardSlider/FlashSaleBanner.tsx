import { Link } from "@/i18n/navigation";

interface FlashSaleBannerProps {
  locale: string;
  title?: string;
}

export default function FlashSaleBanner({ locale, title }: FlashSaleBannerProps) {
  return (
    <div className="relative w-full">
      {/* Radial glow overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_rgba(255,255,255,0.25)_0%,_transparent_70%)]" />

      {/* Abstract decorative circles */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between h-[170px] sm:h-[230px] lg:h-[300px] px-6 sm:px-10 lg:px-12">
        {/* Left: Text Content */}
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <span className="text-white text-[12px] sm:text-[14px] lg:text-[16px] font-bold uppercase tracking-[1.5px] opacity-90">
            {title ?? "Flash Sale"}
          </span>
          <h2 className="text-white text-[28px] sm:text-[40px] lg:text-[52px] font-black leading-[1.05] tracking-tight">
            UP TO 60% OFF
          </h2>
          <p className="text-white/90 text-[16px] sm:text-[18px] lg:text-[22px] font-medium leading-tight">
            Adidas, Nike &amp; more!
          </p>
        </div>

        {/* Right: CTA */}
        <Link
          href={`/${locale}/flash-sales`}
          className="inline-flex items-center justify-center w-[140px] sm:w-[155px] lg:w-[170px] h-[48px] sm:h-[52px] lg:h-[56px] rounded-[16px] bg-white text-[#111] text-[16px] sm:text-[17px] lg:text-[18px] font-bold shadow-sm transition-all duration-200 hover:scale-103 hover:shadow-lg hover:bg-gray-50 shrink-0"
        >
          SHOP NOW
        </Link>
      </div>
    </div>
  );
}
