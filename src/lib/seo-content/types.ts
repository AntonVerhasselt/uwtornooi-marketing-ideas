export type FaqItem = {
  question: string;
  answer: string;
};

export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export type ContentSection = {
  id: string;
  heading: string;
  blocks: ContentBlock[];
};

export type SeoPageContent = {
  slug: string;
  intro: string[];
  sections: ContentSection[];
  faqs: FaqItem[];
  cta: {
    heading: string;
    text: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  };
  internalLinks: { label: string; href: string }[];
};
