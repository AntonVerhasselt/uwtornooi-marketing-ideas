import type { SeoPageContent } from "./types";

export const content: SeoPageContent = {
  slug: "poules-maken-voetbal",
  intro: [
    "Poules maken is het hart van de meeste voetbaltoernooien. Goede poules zorgen voor eerlijke wedstrijden, een vlot schema en minder geklaag aan de kantlijn.",
    "Hieronder: hoe je poules indelt, waar je op let bij jeugd, en hoe UwTornooi dit voor je structureert.",
  ],
  sections: [
    {
      id: "waarom",
      heading: "Waarom poules (bijna) altijd werken",
      blocks: [
        {
          type: "p",
          text: "Een poulefase garandeert speeltijd, maakt ranking duidelijk en voedt daarna een knock-out of plaatsingswedstrijden. Voor clubtornooien is het de meest voorspelbare formule.",
        },
        {
          type: "ul",
          items: [
            "Iedereen speelt minstens 2–3 wedstrijden",
            "Standen zijn transparant (punten, doelsaldo)",
            "Doorstroming naar de volgende ronde is uitlegbaar",
          ],
        },
      ],
    },
    {
      id: "regels",
      heading: "Vuistregels voor indeling",
      blocks: [
        {
          type: "ol",
          items: [
            "Mik op poules van 3 tot 5 teams.",
            "Spreid sterke clubs als je niveaus kent (vorige editie / competitie).",
            "Houd rekening met afzeggingen: een poule van 3 is kwetsbaar.",
            "Documenteer rankingregels vóór de eerste trap op de bal.",
            "Koppel poules meteen aan velden en tijden in je schema.",
          ],
        },
        {
          type: "callout",
          text: "Communiceer rankingregels (punten → doelsaldo → onderling) op de publieke pagina — dat voorkomt discussie.",
        },
      ],
    },
    {
      id: "jeugd",
      heading: "Poules bij jeugdtornooien",
      blocks: [
        {
          type: "p",
          text: "Bij de jongste jaren telt speeltijd zwaarder dan een keiharde ladder. Overweeg poules zonder vroege eliminatie, of een “iedereen speelt evenveel”-formule naast een eindfase.",
        },
        {
          type: "ul",
          items: [
            "Vermijd dat U7 een hele namiddag wacht op één finale",
            "Houd wissels en pauzes realistisch in het schema",
            "Laat standen live lopen — ouders volgen mee",
          ],
        },
      ],
    },
    {
      id: "uwtornooi",
      heading: "Poules maken in UwTornooi",
      blocks: [
        {
          type: "p",
          text: "In UwTornooi maak je poules, koppel je teams, en laat je standen automatisch meelopen met de uitslagen. Daarna genereer je het wedstrijdschema — zonder de poule-indeling opnieuw te moeten uittekenen.",
        },
        {
          type: "p",
          text: "Heb je vorig jaar in Tournify gewerkt? Neem je indeling mee via de gratis overstap, en stuur bij waar je dit jaar iets anders wilt.",
        },
      ],
    },
  ],
  faqs: [
    {
      question: "Hoeveel teams per poule is ideaal?",
      answer:
        "Meestal 4. Dan speel je een compacte reeks zonder dat het schema ontploft. Met 3 teams riskeer je gaten bij een afzegging; met 5+ heb je meer wedstrijden nodig.",
    },
    {
      question: "Hoe bepaal je wie doorstoot?",
      answer:
        "Spreek vooraf af: nummer 1 en 2 naar de halve finale, of een cross-over tussen poules. Zet de regel op de tornooiwebsite.",
    },
    {
      question: "Kunnen poules live aangepast worden?",
      answer:
        "Ja, maar doe dat spaarzaam en communiceer meteen. Software met live standen maakt zo’n wijziging dragelijk; Excel-versies niet.",
    },
    {
      question: "Helpt UwTornooi ook met het schema na de poules?",
      answer:
        "Ja. Poules en wedstrijdschema horen bij elkaar. Eens de groepen staan, plan je de speeltijden en velden in dezelfde tool.",
    },
  ],
  cta: {
    heading: "Maak poules zonder gedoe",
    text: "Start je tornooi in UwTornooi en laat standen automatisch meelopen — of zet een Tournify-opzet over.",
    primaryLabel: "Open uwtornooi.be",
    primaryHref: "https://uwtornooi.be",
    secondaryLabel: "Wedstrijdschema maken",
    secondaryHref: "/ideeen/seo-concurrent/wedstrijdschema-voetbal-maken",
  },
  internalLinks: [
    {
      label: "Wedstrijdschema maken",
      href: "/ideeen/seo-concurrent/wedstrijdschema-voetbal-maken",
    },
    {
      label: "Jeugdtornooi organiseren",
      href: "/ideeen/seo-concurrent/jeugdtornooi-organiseren",
    },
    {
      label: "Voetbaltoernooi organiseren",
      href: "/ideeen/seo-concurrent/voetbaltoernooi-organiseren",
    },
    {
      label: "Tournify alternatief",
      href: "/ideeen/seo-concurrent/tournify-alternatief",
    },
  ],
};
