export type IdeaStatus = "ready-for-agent" | "details-later" | "outline";

export type Idea = {
  number: number;
  slug: string;
  href: string;
  title: string;
  shortTitle: string;
  summary: string;
  status: IdeaStatus;
  statusLabel: string;
  outcome: string;
};

export const ideas: Idea[] = [
  {
    number: 1,
    slug: "club-data",
    href: "/ideeen/club-data",
    title: "Club data & tournament signals",
    shortTitle: "Club data",
    summary:
      "Scrape Voetbal Vlaanderen clubs into SQLite, find Facebook/Instagram from club websites, then scan ~16 months of posts for tournaments the club organised.",
    status: "details-later",
    statusLabel: "Spec later — do not implement yet",
    outcome: "A local lead list of clubs that recently ran tournaments.",
  },
  {
    number: 2,
    slug: "cold-outreach",
    href: "/ideeen/cold-outreach",
    title: "Cold outreach via social",
    shortTitle: "Cold outreach",
    summary:
      "Use tournament signals from club data for a cold outreach sequence on social (Facebook / Instagram). Sequence to be proposed next.",
    status: "outline",
    statusLabel: "Sequence to propose",
    outcome: "Warm, contextual DMs and comments that convert organisers.",
  },
  {
    number: 3,
    slug: "seo-concurrent",
    href: "/ideeen/seo-concurrent",
    title: "SEO content vs competitor",
    shortTitle: "SEO content",
    summary:
      "Publish SEO content that captures people searching for the main competitor and routes them to UwTornooi.be.",
    status: "ready-for-agent",
    statusLabel: "Ready for agent",
    outcome: "Organic traffic from competitor-intent searches.",
  },
];

export function getIdea(slug: string): Idea | undefined {
  return ideas.find((idea) => idea.slug === slug);
}
