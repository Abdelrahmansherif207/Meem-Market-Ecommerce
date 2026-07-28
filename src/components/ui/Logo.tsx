import Image from "next/image";
import { Link } from "@/i18n/navigation";

type LogoProps = {
  src: string;
  alt?: string;
  priority?: boolean;
  className?: string;
  textFallback?: string;
};

export default function Logo({
  src,
  alt = "Logo",
  priority = false,
  className,
  textFallback,
}: LogoProps) {
  if (textFallback && !src) {
    return (
      <Link href="/" aria-label={alt} className="text-lg font-bold text-text-primary no-underline shrink-0">
        {textFallback}
      </Link>
    );
  }

  return (
    <Link href="/" aria-label={alt}>
      <Image
        src={src}
        alt={alt}
        width={120}
        height={52}
        priority={priority}
        className={className}
        style={{ maxWidth: "100%", height: "auto" }}
      />
    </Link>
  );
}
