import type { SeoPageContent } from "./types";

export const content: SeoPageContent = {
  slug: "wedstrijdschema-voetbal-maken",
  intro: [
    "Een wedstrijdschema voor een voetbaltoernooi maken is vaak het moment waarop Excel begint te kraken: te weinig velden, te korte pauzes, teams die twee keer na elkaar moeten spelen.",
    "Hier lees je hoe je een speelbaar schema bouwt — en hoe UwTornooi dat werk grotendeels overneemt.",
  ],
  sections: [
    {
      id: "basis",
      heading: "De basis van een goed speelschema",
      blocks: [
        {
          type: "ul",
          items: [
            "Aantal teams en poulegrootte",
            "Wedstrijdduur + wissel-/rusttijd",
            "Beschikbare velden en hun afmetingen",
            "Start- en einduur (denk aan kantine en scheidsrechters)",
            "Doorstroming naar kwartfinale / troosting",
          ],
        },
        {
          type: "p",
          text: "Als één van die inputs wijzigt, moet het schema mee kunnen. Daarom is manueel werken zo fragiel.",
        },
      ],
    },
    {
      id: "aanpak",
      heading: "Praktische aanpak in 5 stappen",
      blocks: [
        {
          type: "ol",
          items: [
            "Fix eerst je poules — schema volgt op de indeling.",
            "Bereken hoeveel wedstrijden je écht speelt per fase.",
            "Verdeel over velden; vermijd dat één veld alles trekt.",
            "Bouw buffers in (blessure, discussie, late aankomst).",
            "Publiceer pas als check-in en veldbezetting kloppen — en communiceer wijzigingen via één link.",
          ],
        },
        {
          type: "callout",
          text: "Tip: plan geen back-to-back voor hetzelfde team zonder minstens één slot pauze, zeker bij jeugd.",
        },
      ],
    },
    {
      id: "fouten",
      heading: "Veelgemaakte fouten",
      blocks: [
        {
          type: "ul",
          items: [
            "Geen rekening houden met veldwissels tussen 5v5 en 8v8",
            "Schema publiceren vóór de inschrijvingen dicht zijn",
            "Te krappe lunchpauzes waardoor alles opschuift",
            "Geen zichtbare live-update wanneer een wedstrijd verplaatst",
          ],
        },
      ],
    },
    {
      id: "software",
      heading: "Wedstrijdschema maken met UwTornooi",
      blocks: [
        {
          type: "p",
          text: "In UwTornooi genereer je een schema op basis van je poules en velden, stuur je bij waar nodig, en deel je het resultaat op de publieke tornooiwebsite. Coaches kijken daar — niet in een PDF van dinsdagavond.",
        },
        {
          type: "p",
          text: "Kom je van Tournify? Dan ken je dit principe al. Overstappen betekent vooral: dezelfde flow, met migratiehulp zodat je settings niet manueel hoeft over te tikken.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Hoe maak ik snel een wedstrijdschema voor een voetbaltoernooi?",
      answer:
        "Bepaal poules en velden, kies wedstrijdduur, en laat software een eerste versie genereren. Stuur daarna alleen de uitzonderingen bij — dat is sneller dan alles manueel te tekenen.",
    },
    {
      question: "Wat is een goede wedstrijdduur op een tornooi?",
      answer:
        "Hangt af van de leeftijd. Jeugd speelt vaak 1×10 tot 2×15 minuten. Belangrijker dan de exacte minuten: genoeg rust en realistische veldrotatie.",
    },
    {
      question: "Moet het schema op papier?",
      answer:
        "Een print aan het secretariaat kan, maar de bron van waarheid hoort digitaal en live te zijn. Zo vermijd je dat drie versies circuleren.",
    },
    {
      question: "Kan UwTornooi ook knock-outs plannen?",
      answer:
        "Ja. Poulefase en verdere rondes horen bij een normaal clubtornooi — plan die mee vanaf het begin zodat velden niet plots tekortschieten.",
    },
  ],
  cta: {
    heading: "Maak je volgende schema in UwTornooi",
    text: "Minder sleutelen, sneller publiceren. Start een tornooi of zet er één over van Tournify.",
    primaryLabel: "Probeer UwTornooi",
    primaryHref: "https://uwtornooi.be",
    secondaryLabel: "Gratis overstappen",
    secondaryHref: "/ideeen/seo-concurrent/overstappen-van-tournify",
  },
  internalLinks: [
    {
      label: "Poules maken",
      href: "/ideeen/seo-concurrent/poules-maken-voetbal",
    },
    {
      label: "Voetbaltoernooi organiseren",
      href: "/ideeen/seo-concurrent/voetbaltoernooi-organiseren",
    },
    {
      label: "Voetbal tornooi software",
      href: "/ideeen/seo-concurrent/voetbal-tornooi-software",
    },
    {
      label: "Jeugdtornooi organiseren",
      href: "/ideeen/seo-concurrent/jeugdtornooi-organiseren",
    },
  ],
};
