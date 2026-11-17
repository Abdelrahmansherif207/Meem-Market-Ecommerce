"use client";

import { FaFacebook, FaInstagram, FaTiktok, FaSnapchat, FaLinkedin, FaWhatsapp } from "react-icons/fa6";
import type { IconType } from "react-icons";

const ICON_MAP: Record<string, IconType> = {
  facebook: FaFacebook,
  instagram: FaInstagram,
  tiktok: FaTiktok,
  snapchat: FaSnapchat,
  linkedin: FaLinkedin,
  whatsapp: FaWhatsapp,
};

interface SocialIconProps {
  platform: string;
  className?: string;
}

export function SocialIcon({ platform, className = "h-5 w-5" }: SocialIconProps) {
  const Icon = ICON_MAP[platform];
  if (!Icon) return null;
  return <Icon className={className} />;
}
