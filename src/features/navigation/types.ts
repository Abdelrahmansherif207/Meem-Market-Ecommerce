export interface NavbarMenu {
  id: number;
  name: string;
  slug: string;
  level: number;
  image: {
    desktop: string;
    mobile: string;
  };
  children: NavbarMenu[];
}

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
  platform: "facebook" | "twitter" | "instagram" | "youtube";
  url: string;
  label: string;
}

export interface AppStoreBadge {
  platform: "ios" | "android";
  imageSrc: string;
  url: string;
  alt?: string;
}

export interface ContactInfo {
  stayInTouchText: string;
  whatsappUrl: string;
  assistanceText: string;
  callUsText: string;
  phoneNumber: string;
}

export interface FooterData {
  columns: FooterColumn[];
  socialLinks: SocialLink[];
  contactInfo: ContactInfo;
  bottomRow: {
    title: string;
    appStore: AppStoreBadge;
    googlePlay: AppStoreBadge;
  };
  cookieSettingsLabel: string;
}

