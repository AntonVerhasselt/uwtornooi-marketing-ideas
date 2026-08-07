import type { SeoPageContent } from "./types";

export const content: SeoPageContent = {
  slug: "voetbaltoernooi-organiseren",
  intro: [
    "Een voetbaltoernooi organiseren vraagt meer dan velden boeken. Je regelt teams, poules, een speelschema, scheidsrechters, communicatie met clubs — en op de dag zelf willen álle ouders live weten hoe het staat.",
    "Dit stappenplan helpt jeugdcoördinatoren en vrijwilligers in Vlaanderen om een tornooi strak te plannen. Onderaan zie je hoe UwTornooi die stappen digitaliseert.",
  ],
  sections: [
    {
      id: "stappenplan",
      heading: "Stappenplan: van idee tot eindstand",
      blocks: [
        {
          type: "ol",
          items: [
            "Bepaal formule: één dag of weekend, 5v5 / 8v8 / 11v11, leeftijden.",
            "Zet inschrijvingen open: deadline, prijs, max. teams per categorie.",
            "Deel poules in zodra je veldbezetting en aantal teams kent.",
            "Maak een wedstrijdschema met pauzes, veldwissels en buffer.",
            "Communiceer de publieke link naar clubs en ouders.",
            "Op tornooidag: uitslagen ingeven, standen live houden, knopen doorhakken bij regen of blessures.",
            "Na afloop: eindstand delen en kort evalueren voor volgend jaar.",
          ],
        },
      ],
    },
    {
      id: "planning",
      heading: "Planning: teams, poules en schema",
      blocks: [
        {
          type: "p",
          text: "De meeste stress zit in de week vóór het tornooi. Teams die last-minute afzeggen, een poule die oneven wordt, een schema dat botst op één veld.",
        },
        {
          type: "ul",
          items: [
            "Houd een wachtlijst bij per categorie",
            "Maak poules pas “definitief” na de inschrijvingsdeadline",
            "Voorzie 5–10 minuten buffer tussen wedstrijden",
            "Zet een plan B klaar als een veld wegvalt",
          ],
        },
        {
          type: "callout",
          text: "Software helpt hier het meest: minder manueel herschikken, minder WhatsApp-verwarring.",
        },
      ],
    },
    {
      id: "live",
      heading: "Live standen en communicatie",
      blocks: [
        {
          type: "p",
          text: "Op tornooidag is communicatie half het werk. Een publieke tornooiwebsite met schema en standen bespaart tientallen berichten.",
        },
        {
          type: "ul",
          items: [
            "Deel één link in de clubchat en met bezoekende ploegen",
            "Geef 1–2 mensen rechten om scores in te geven",
            "Hang eventueel een scherm in de kantine met dezelfde pagina",
          ],
        },
      ],
    },
    {
      id: "met-uwtornooi",
      heading: "Organiseer jouw tornooi eenvoudig met UwTornooi",
      blocks: [
        {
          type: "p",
          text: "UwTornooi begeleidt precies dit parcours: registratie, poules, wedstrijdschema, live scores en een deelbare pagina. Ken je Tournify al? Dan herken je de workflow — met een eenvoudiger pad voor clubs.",
        },
        {
          type: "p",
          text: "Kom je van een vorige editie in Tournify? Laat het tornooi gratis overzetten zodat je niet opnieuw begint.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Hoeveel teams heb je nodig voor een goed tornooi?",
      answer:
        "Vanaf 6–8 teams per categorie is een poule + korte knock-out al leuk. Meer teams betekent meer velden of kortere speeltijden — plan dat vroeg.",
    },
    {
      question: "Wanneer maak je het wedstrijdschema definitief?",
      answer:
        "Idealiter pas na de inschrijvingsdeadline, met nog enkele dagen marge om clubs te informeren. Last-minute wijzigingen horen erbij — software maakt die dragelijker.",
    },
    {
      question: "Moet ik software gebruiken?",
      answer:
        "Niet verplicht, wel sterk aangeraden vanaf het moment dat meerdere velden of categorieën samenkomen. De kost weegt meestal niet op tegen de uren Excel.",
    },
    {
      question: "Wat is het verschil met Tournify?",
      answer:
        "Tournify is een bekende, brede tool. UwTornooi biedt dezelfde basis voor voetbalclubs, met nadruk op eenvoud, prijs en een vlotte overstap.",
    },
  ],
  cta: {
    heading: "Klaar om je tornooi te plannen?",
    text: "Zet je stappenplan om in een werkend tornooi op UwTornooi — of begin met de gratis migratie.",
    primaryLabel: "Start met UwTornooi",
    primaryHref: "https://uwtornooi.be",
    secondaryLabel: "Overstappen van Tournify",
    secondaryHref: "/ideeen/seo-concurrent/overstappen-van-tournify",
  },
  internalLinks: [
    {
      label: "Jeugdtornooi organiseren",
      href: "/ideeen/seo-concurrent/jeugdtornooi-organiseren",
    },
    {
      label: "Wedstrijdschema maken",
      href: "/ideeen/seo-concurrent/wedstrijdschema-voetbal-maken",
    },
    {
      label: "Poules maken",
      href: "/ideeen/seo-concurrent/poules-maken-voetbal",
    },
    {
      label: "Voetbal tornooi software",
      href: "/ideeen/seo-concurrent/voetbal-tornooi-software",
    },
  ],
};
