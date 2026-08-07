export type IdeaStatus = "ready-for-agent" | "details-later" | "outline" | "drafted";

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
    status: "ready-for-agent",
    statusLabel: "MVP live in /intel",
    outcome: "A local lead list of clubs that recently ran tournaments.",
  },
  {
    number: 2,
    slug: "cold-outreach",
    href: "/ideeen/cold-outreach",
    title: "Cold outreach via social",
    shortTitle: "Cold outreach",
    summary:
      "Direct 5-day cold sequence from last year’s tournament data: IG DM → FB DM → email → call. No waiting for a new post.",
    status: "drafted",
    statusLabel: "Sequence drafted",
    outcome: "Direct multi-channel outreach that books demos with organisers.",
  },
  {
    number: 3,
    slug: "seo-concurrent",
    href: "/ideeen/seo-concurrent",
    title: "SEO + SEA vs Tournify",
    shortTitle: "SEO / SEA",
    summary:
      "Competitor content cluster + SEA on Tournify intent: strategy hub, 9 Dutch page drafts, migration offer, and football-vertical keywords.",
    status: "drafted",
    statusLabel: "Strategy + drafts ready",
    outcome: "Organic + paid traffic from competitor-intent searches.",
  },
  {
    number: 4,
    slug: "social-alerts",
    href: "/ideeen/social-alerts",
    title: "Daily social tournament alerts",
    shortTitle: "Social alerts",
    summary:
      "Daily cron over club Facebook/Instagram feeds to catch new tournament announcements, notify the team, then comment + DM while the post is hot.",
    status: "outline",
    statusLabel: "Outline — do not implement yet",
    outcome: "Same-day outreach on live tournament announcement posts.",
  },
];

export function getIdea(slug: string): Idea | undefined {
  return ideas.find((idea) => idea.slug === slug);
}
