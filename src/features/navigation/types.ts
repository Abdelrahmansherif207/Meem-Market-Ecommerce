export interface FooterLink {
  id: number;
  label: string;
  slug: string;
}

export interface FooterColumn {
  id: number;
  title: string | null;
  links: FooterLink[];
}

export interface SocialLink {
  platform:
    | "facebook"
    | "twitter"
    | "instagram"
    | "tiktok"
    | "snapchat"
    | "linkedin"
    | "whatsapp";
  url: string;
  label: string;
}

export interface ContactInfo {
  stayInTouchText: string;
  whatsappUrl: string;
  assistanceText: string;
  callUsText: string;
  phoneNumber: string;
  email: string;
}

export interface FooterData {
  columns: FooterColumn[];
  socialLinks: SocialLink[];
  contactInfo: ContactInfo;
  cookieSettingsLabel: string;
}

