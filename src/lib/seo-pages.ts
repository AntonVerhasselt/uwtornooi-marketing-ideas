export type SeoCluster =
  | "competitor"
  | "migration"
  | "informational"
  | "feature";

export type SeoPageMeta = {
  slug: string;
  href: string;
  targetPath: string;
  cluster: SeoCluster;
  clusterLabel: string;
  title: string;
  shortTitle: string;
  h1: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  purpose: string;
  priority: "P0" | "P1" | "P2";
};

export const seoPages: SeoPageMeta[] = [
  {
    slug: "uwtornooi-vs-tournify",
    href: "/ideeen/seo-concurrent/uwtornooi-vs-tournify",
    targetPath: "/uwtornooi-vs-tournify",
    cluster: "competitor",
    clusterLabel: "Vergelijking",
    title: "UwTornooi vs Tournify: welke tornooisoftware past bij jouw voetbalclub?",
    shortTitle: "UwTornooi vs Tournify",
    h1: "UwTornooi vs Tournify: welke tornooisoftware past bij jouw voetbalclub?",
    metaDescription:
      "Vergelijk UwTornooi en Tournify voor jouw voetbalclub. Zelfde kernfuncties — teams, poules, schema en live standen — met focus op eenvoud en een lagere prijs.",
    primaryKeyword: "Tournify vs UwTornooi",
    secondaryKeywords: [
      "Tournify alternatief",
      "tornooi software vergelijking",
      "goedkope Tournify oplossing",
    ],
    purpose: "Capture comparison searches and reduce switching doubt.",
    priority: "P0",
  },
  {
    slug: "tournify-alternatief",
    href: "/ideeen/seo-concurrent/tournify-alternatief",
    targetPath: "/tournify-alternatief",
    cluster: "competitor",
    clusterLabel: "Vergelijking",
    title: "Tournify alternatief voor voetbalclubs | UwTornooi",
    shortTitle: "Tournify alternatief",
    h1: "Het beste Tournify alternatief voor voetbalclubs",
    metaDescription:
      "Op zoek naar een Tournify alternatief? UwTornooi is eenvoudige tornooisoftware voor Vlaamse voetbalclubs: poules, schema, live standen en een publieke tornooiwebsite.",
    primaryKeyword: "Tournify alternatief",
    secondaryKeywords: [
      "Tournify alternatief voetbalclub",
      "alternatief voor Tournify",
      "tornooi software goedkoop",
    ],
    purpose: "Own the high-intent alternative keyword.",
    priority: "P0",
  },
  {
    slug: "overstappen-van-tournify",
    href: "/ideeen/seo-concurrent/overstappen-van-tournify",
    targetPath: "/overstappen-van-tournify",
    cluster: "migration",
    clusterLabel: "Overstap",
    title: "Overstappen van Tournify naar UwTornooi | gratis migratie",
    shortTitle: "Overstappen van Tournify",
    h1: "Wij zetten jouw Tournify tornooi gratis over",
    metaDescription:
      "Overstappen van Tournify? Plak je oude Tournify-URL en wij zetten teams, poules en settings over naar UwTornooi. Geen tornooi opnieuw maken.",
    primaryKeyword: "overstappen van Tournify",
    secondaryKeywords: [
      "Tournify migratie",
      "Tournify overzetten",
      "tornooi importeren",
    ],
    purpose: "Remove switching friction with a clear migration offer.",
    priority: "P0",
  },
  {
    slug: "wat-is-tournify",
    href: "/ideeen/seo-concurrent/wat-is-tournify",
    targetPath: "/wat-is-tournify",
    cluster: "informational",
    clusterLabel: "Info",
    title: "Wat is Tournify? Uitleg over tornooisoftware | UwTornooi",
    shortTitle: "Wat is Tournify?",
    h1: "Wat is Tournify?",
    metaDescription:
      "Tournify is software om sporttoernooien te organiseren. Lees wat het doet, voor wie het bedoeld is, en welke alternatieven er zijn voor voetbalclubs.",
    primaryKeyword: "wat is Tournify",
    secondaryKeywords: [
      "Tournify uitleg",
      "tornooi software",
      "sporttoernooi software",
    ],
    purpose: "Capture informational brand searches and introduce UwTornooi.",
    priority: "P1",
  },
  {
    slug: "voetbal-tornooi-software",
    href: "/ideeen/seo-concurrent/voetbal-tornooi-software",
    targetPath: "/voetbal-tornooi-software",
    cluster: "feature",
    clusterLabel: "Feature",
    title: "Voetbal tornooi software voor clubs | UwTornooi",
    shortTitle: "Voetbal tornooi software",
    h1: "Voetbal tornooi software voor lokale clubs",
    metaDescription:
      "Organiseer je voetbaltoernooi zonder Excel. UwTornooi is tornooisoftware voor voetbalclubs: inschrijvingen, poules, wedstrijdschema en live standen.",
    primaryKeyword: "voetbal tornooi software",
    secondaryKeywords: [
      "tornooi software voetbal",
      "voetbaltoernooi software",
      "software voetbaltoernooi",
    ],
    purpose: "Attack category keywords Tournify ranks for with /nl/sporten/voetbal.",
    priority: "P0",
  },
  {
    slug: "voetbaltoernooi-organiseren",
    href: "/ideeen/seo-concurrent/voetbaltoernooi-organiseren",
    targetPath: "/voetbaltoernooi-organiseren",
    cluster: "feature",
    clusterLabel: "Feature",
    title: "Voetbaltoernooi organiseren: stappenplan voor clubs | UwTornooi",
    shortTitle: "Voetbaltoernooi organiseren",
    h1: "Hoe organiseer je een voetbaltoernooi?",
    metaDescription:
      "Praktisch stappenplan om een voetbaltoernooi te organiseren: teams, poules, wedstrijdschema, live standen en een publieke tornooiwebsite.",
    primaryKeyword: "voetbaltoernooi organiseren",
    secondaryKeywords: [
      "voetbal toernooi organiseren",
      "tornooi organiseren voetbal",
      "voetbaltoernooi plannen",
    ],
    purpose: "Match easy, high-intent organizer keywords (low KD in BE).",
    priority: "P0",
  },
  {
    slug: "jeugdtornooi-organiseren",
    href: "/ideeen/seo-concurrent/jeugdtornooi-organiseren",
    targetPath: "/jeugdtornooi-organiseren",
    cluster: "feature",
    clusterLabel: "Feature",
    title: "Jeugdtornooi organiseren voor jouw voetbalclub | UwTornooi",
    shortTitle: "Jeugdtornooi organiseren",
    h1: "Jeugdtornooi organiseren zonder stress",
    metaDescription:
      "Tips om een jeugdtornooi te organiseren: leeftijdscategorieën, inschrijvingen, speelschema en live uitslagen. Speciaal voor vrijwilligers in Vlaanderen.",
    primaryKeyword: "jeugdtornooi organiseren",
    secondaryKeywords: [
      "jeugdtoernooi organiseren",
      "jeugd voetbaltoernooi",
      "tornooi jeugdvoetbal",
    ],
    purpose: "Speak to jeugdcoördinatoren — core UwTornooi audience.",
    priority: "P1",
  },
  {
    slug: "wedstrijdschema-voetbal-maken",
    href: "/ideeen/seo-concurrent/wedstrijdschema-voetbal-maken",
    targetPath: "/wedstrijdschema-voetbal-maken",
    cluster: "feature",
    clusterLabel: "Feature",
    title: "Wedstrijdschema voetbal maken | UwTornooi",
    shortTitle: "Wedstrijdschema maken",
    h1: "Wedstrijdschema voor een voetbaltoernooi maken",
    metaDescription:
      "Maak snel een wedstrijdschema voor je voetbaltoernooi. Van poulefase tot knock-out — zonder eindeloos sleutelen in Excel.",
    primaryKeyword: "wedstrijdschema voetbal maken",
    secondaryKeywords: [
      "speelschema voetbaltoernooi",
      "wedstrijdplanning tornooi",
      "schema voetbaltoernooi",
    ],
    purpose: "Feature page for a pain-point keyword Tournify FAQs also target.",
    priority: "P1",
  },
  {
    slug: "poules-maken-voetbal",
    href: "/ideeen/seo-concurrent/poules-maken-voetbal",
    targetPath: "/poules-maken-voetbal",
    cluster: "feature",
    clusterLabel: "Feature",
    title: "Poules maken voor een voetbaltoernooi | UwTornooi",
    shortTitle: "Poules maken",
    h1: "Poules maken voor je voetbaltoernooi",
    metaDescription:
      "Leer hoe je poules maakt voor een voetbaltoernooi: aantal teams, ranking, doorstroming naar knock-out en live standen voor ouders en coaches.",
    primaryKeyword: "poules maken voetbal",
    secondaryKeywords: [
      "poulefase tornooi",
      "poules voetbaltoernooi",
      "groepswedstrijden organiseren",
    ],
    purpose: "Support page that feeds the organizer cluster.",
    priority: "P2",
  },
];

export function getSeoPage(slug: string): SeoPageMeta | undefined {
  return seoPages.find((page) => page.slug === slug);
}

export function getSeoPagesByCluster(cluster: SeoCluster): SeoPageMeta[] {
  return seoPages.filter((page) => page.cluster === cluster);
}

export const seoClusters: {
  id: SeoCluster;
  label: string;
  description: string;
}[] = [
  {
    id: "competitor",
    label: "Competitor cluster",
    description:
      "Pages that intercept people already searching for Tournify.",
  },
  {
    id: "migration",
    label: "Migration / conversion",
    description: "Remove switching risk with a free transfer offer.",
  },
  {
    id: "informational",
    label: "Informational",
    description: "Explain the category and the competitor neutrally.",
  },
  {
    id: "feature",
    label: "Feature / organizer",
    description:
      "Help clubs organise tournaments — and naturally present UwTornooi.",
  },
];
