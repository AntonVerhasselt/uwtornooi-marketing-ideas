import type { SeoPageContent } from "./types";

export const content: SeoPageContent = {
  slug: "jeugdtornooi-organiseren",
  intro: [
    "Een jeugdtornooi organiseren is een van de leukste — en drukste — momenten van het seizoen. Kleine spelers, veel ouders, strakke tijden, en vrijwilligers die alles draaiende houden.",
    "Met een duidelijk plan (en de juiste software) blijft het leuk. Dit artikel is voor jeugdcoördinatoren en tornooiverantwoordelijken in Vlaanderen.",
  ],
  sections: [
    {
      id: "voorbereiding",
      heading: "Voorbereiding: wat anders is bij jeugd",
      blocks: [
        {
          type: "ul",
          items: [
            "Kortere wedstrijden en meer pauzes",
            "Duidelijke leeftijdscategorieën (U7, U9, U11, …)",
            "Extra communicatie naar ouders (parking, kantine, first aid)",
            "Scheidsrechters of ouder-coaches die meefluiten",
            "Flexibiliteit als teams afzeggen de avond ervoor",
          ],
        },
        {
          type: "p",
          text: "Jeugdtornooien vergeven minder onduidelijkheid: als het schema warrig is, staan er meteen vijf ouders aan de inkom.",
        },
      ],
    },
    {
      id: "dag-van",
      heading: "Op de dag zelf",
      blocks: [
        {
          type: "ol",
          items: [
            "Check-in per team bij aankomst",
            "Speelschema zichtbaar (gsm + eventueel scherm)",
            "Eén aanspreekpunt per veld",
            "Uitslagen meteen ingeven — live standen verminderen discussie",
            "Kleine prijzen / fun-momenten inplannen tussen de reeksen",
          ],
        },
        {
          type: "callout",
          text: "Live standen zijn geen luxe: ze geven rust aan coaches én ouders.",
        },
      ],
    },
    {
      id: "software",
      heading: "Hoe UwTornooi jeugdtornooien ondersteunt",
      blocks: [
        {
          type: "p",
          text: "UwTornooi helpt je teams beheren, poules trekken, een schema maken en uitslagen live tonen. Precies de flow die je nodig hebt voor een jeugdweekend — zonder een tool die voor vijftig sporten tegelijk ontworpen is.",
        },
        {
          type: "ul",
          items: [
            "Meerdere categorieën naast elkaar",
            "Publieke pagina om te delen in ouderchats",
            "Mobiel scores bijwerken tussen twee wedstrijden",
            "Optioneel: overstap vanaf een vorig Tournify-tornooi",
          ],
        },
      ],
    },
    {
      id: "tips",
      heading: "Praktische tips van clubs",
      blocks: [
        {
          type: "ul",
          items: [
            "Sluit inschrijvingen vroeg genoeg om poules rustig te maken",
            "Voorzie waterpunten en schaduw bij zomerse edities",
            "Communiceer regenplan vóór de ochtend van het tornooi",
            "Laat minstens twee mensen admin-rechten hebben op de software",
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Hoe organiseer je een jeugdtornooi zonder stress?",
      answer:
        "Werk met een vaste checklist, sluit inschrijvingen op tijd, en gebruik software voor schema en live standen. De stress zit meestal in manuele communicatie — die kun je grotendeels automatiseren.",
    },
    {
      question: "Welke formule werkt voor U7–U11?",
      answer:
        "Korte wedstrijden, kleine velden, poules van 3–4 teams en genoeg speeltijd voor iedereen. Winnaars zijn leuk, maar speeltijd en sfeer winnen bij de jongste jaren.",
    },
    {
      question: "Kunnen ouders het schema volgen?",
      answer:
        "Ja — deel de publieke tornooiwebsite. Dat is vaak de feature waar clubs achteraf het meest dankbaar voor zijn.",
    },
    {
      question: "Is UwTornooi geschikt als we Tournify kennen?",
      answer:
        "Ja. De kernflow is herkenbaar. Veel clubs stappen over juist omdat ze Tournify kennen en een eenvoudiger, betaalbaarder alternatief willen voor hun jeugdtornooi.",
    },
  ],
  cta: {
    heading: "Organiseer jouw jeugdtornooi met UwTornooi",
    text: "Minder Excel, meer speeltijd. Start gratis of laat een vorig Tournify-tornooi overzetten.",
    primaryLabel: "Naar uwtornooi.be",
    primaryHref: "https://uwtornooi.be",
    secondaryLabel: "Bekijk Tournify alternatief",
    secondaryHref: "/ideeen/seo-concurrent/tournify-alternatief",
  },
  internalLinks: [
    {
      label: "Voetbaltoernooi organiseren",
      href: "/ideeen/seo-concurrent/voetbaltoernooi-organiseren",
    },
    {
      label: "Poules maken",
      href: "/ideeen/seo-concurrent/poules-maken-voetbal",
    },
    {
      label: "Wedstrijdschema maken",
      href: "/ideeen/seo-concurrent/wedstrijdschema-voetbal-maken",
    },
    {
      label: "Overstappen van Tournify",
      href: "/ideeen/seo-concurrent/overstappen-van-tournify",
    },
  ],
};
