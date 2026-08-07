import type { SeoPageContent } from "./types";

export const content: SeoPageContent = {
  slug: "overstappen-van-tournify",
  intro: [
    "Je hoeft jouw tornooi niet opnieuw te maken. Wij zetten jouw Tournify tornooi gratis over naar UwTornooi — zodat je in enkele minuten verder kunt met teams, poules en settings die je al kent.",
    "Deze pagina is voor clubs die Tournify al vertrouwen, maar een eenvoudiger of betaalbaarder pad willen zonder opnieuw van nul te beginnen.",
  ],
  sections: [
    {
      id: "aanbod",
      heading: "Wij zetten jouw Tournify tornooi gratis over",
      blocks: [
        {
          type: "p",
          text: "De grootste drempel bij wisselen van software is herwerk. Nieuwe tool openen, alles opnieuw intypen, hopen dat je niets vergeet. Dat hoeft niet.",
        },
        {
          type: "callout",
          text: "Plak je oude Tournify-URL. Wij analyseren het tornooi en zetten de basis klaar in UwTornooi.",
        },
        {
          type: "ul",
          items: [
            "Teams overzetten",
            "Poules en groepsindeling reconstrueren",
            "Belangrijke settings meenemen waar mogelijk",
            "Jij controleert en publiceert wanneer het past",
          ],
        },
      ],
    },
    {
      id: "stappen",
      heading: "Hoe de overstap werkt",
      blocks: [
        {
          type: "ol",
          items: [
            "Plak de URL van je (vorige) Tournify-tornooi.",
            "UwTornooi analyseert de publieke tornooigegevens.",
            "Teams, poules en settings worden nagebouwd in UwTornooi.",
            "Jij krijgt een klaarstaande setup om te checken en aan te passen.",
            "Publiceer je tornooiwebsite en deel die met clubs en ouders.",
          ],
        },
        {
          type: "p",
          text: "Wij helpen je overstappen in enkele minuten — niet in enkele avonden.",
        },
      ],
    },
    {
      id: "wat-je-behoudt",
      heading: "Wat je behoudt qua werkwijze",
      blocks: [
        {
          type: "p",
          text: "De bedoeling is herkenbaarheid. Als je vorig jaar met poules en een speelschema werkte, moet dat dit jaar opnieuw aanvoelen — alleen met minder gedoe.",
        },
        {
          type: "ul",
          items: [
            "Teams en categorieën",
            "Poulefase en doorstroming",
            "Wedstrijdschema dat je kunt bijsturen",
            "Live standen op een publieke pagina",
            "Mobiel uitslagen ingeven op tornooidag",
          ],
        },
      ],
    },
    {
      id: "twijfel",
      heading: "Nog twijfel? Dat is normaal",
      blocks: [
        {
          type: "p",
          text: "Veel clubs stellen niet de vraag “is UwTornooi goedkoper?”, maar: “Doet UwTornooi alles wat Tournify doet voor ons tornooi?”",
        },
        {
          type: "p",
          text: "Het eerlijke antwoord: voor de kern van een club- en jeugdtornooi — ja. Voor niche-sporten of discovery van toernooien wereldwijd is Tournify breder. Voor jouw voetbalweekend in Vlaanderen is UwTornooi vaak precies genoeg.",
        },
        {
          type: "callout",
          text: "Vergelijk rustig op de vs-pagina, of start met migratie zodat je het verschil in de praktijk ziet.",
        },
      ],
    },
    {
      id: "checklist",
      heading: "Checklist voor een vlotte overstap",
      blocks: [
        {
          type: "ol",
          items: [
            "Zoek de publieke link van je vorige Tournify-editie.",
            "Noteer wat vorig jaar anders moest (extra veld, andere speeltijden, meer categorieën).",
            "Laat de basis overzetten via UwTornooi.",
            "Controleer teams en poules vóór inschrijvingen openen.",
            "Test de publieke pagina op gsm — daar kijken ouders.",
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Is de overzetting echt gratis?",
      answer:
        "Ja. Het doel is om de drempel weg te nemen. Je betaalt niet om te laten kijken of UwTornooi past bij jouw tornooi-opzet.",
    },
    {
      question: "Welke gegevens kunnen jullie overzetten?",
      answer:
        "We focussen op wat publiek of structureel beschikbaar is: teams, poules en settings. Exacte details hangen af van hoe het oude tornooi was opgezet — daarom check je altijd zelf na.",
    },
    {
      question: "Hoe lang duurt de migratie?",
      answer:
        "Vaak slechts enkele minuten voor de technische overzetting. Reken zelf nog wat tijd voor controle en kleine aanpassingen — dat blijft veel sneller dan alles manueel herbouwen.",
    },
    {
      question: "Wat als iets niet perfect overkomt?",
      answer:
        "Dan pas je het aan in UwTornooi. Migratie haalt de zware last weg; jij houdt de finale controle, zoals bij elke editie.",
    },
  ],
  cta: {
    heading: "Start je gratis overstap",
    text: "Plak je Tournify-URL op uwtornooi.be of begin met een nieuw tornooi. Wij helpen je verder.",
    primaryLabel: "Naar uwtornooi.be",
    primaryHref: "https://uwtornooi.be",
    secondaryLabel: "Eerst vergelijken: UwTornooi vs Tournify",
    secondaryHref: "/ideeen/seo-concurrent/uwtornooi-vs-tournify",
  },
  internalLinks: [
    {
      label: "Tournify alternatief",
      href: "/ideeen/seo-concurrent/tournify-alternatief",
    },
    {
      label: "UwTornooi vs Tournify",
      href: "/ideeen/seo-concurrent/uwtornooi-vs-tournify",
    },
    {
      label: "Voetbal tornooi software",
      href: "/ideeen/seo-concurrent/voetbal-tornooi-software",
    },
    {
      label: "Wedstrijdschema maken",
      href: "/ideeen/seo-concurrent/wedstrijdschema-voetbal-maken",
    },
  ],
};
