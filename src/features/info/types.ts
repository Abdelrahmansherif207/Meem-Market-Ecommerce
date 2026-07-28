export interface InfoSection {
  type: "text" | "image" | "video";
  title?: string;
  content?: string;
  src?: string;
  alt?: string;
  url?: string;
  caption?: string;
}

export interface InfoPage {
  title: string;
  slug: string;
  sections: InfoSection[];
}
