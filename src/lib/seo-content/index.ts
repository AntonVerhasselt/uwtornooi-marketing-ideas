import type { SeoPageContent } from "./types";
import { content as jeugdtornooiOrganiseren } from "./jeugdtornooi-organiseren";
import { content as overstappenVanTournify } from "./overstappen-van-tournify";
import { content as poulesMakenVoetbal } from "./poules-maken-voetbal";
import { content as tournifyAlternatief } from "./tournify-alternatief";
import { content as uwtornooiVsTournify } from "./uwtornooi-vs-tournify";
import { content as voetbalTornooiSoftware } from "./voetbal-tornooi-software";
import { content as voetbaltoernooiOrganiseren } from "./voetbaltoernooi-organiseren";
import { content as watIsTournify } from "./wat-is-tournify";
import { content as wedstrijdschemaVoetbalMaken } from "./wedstrijdschema-voetbal-maken";

const bySlug: Record<string, SeoPageContent> = {
  [uwtornooiVsTournify.slug]: uwtornooiVsTournify,
  [tournifyAlternatief.slug]: tournifyAlternatief,
  [overstappenVanTournify.slug]: overstappenVanTournify,
  [watIsTournify.slug]: watIsTournify,
  [voetbalTornooiSoftware.slug]: voetbalTornooiSoftware,
  [voetbaltoernooiOrganiseren.slug]: voetbaltoernooiOrganiseren,
  [jeugdtornooiOrganiseren.slug]: jeugdtornooiOrganiseren,
  [wedstrijdschemaVoetbalMaken.slug]: wedstrijdschemaVoetbalMaken,
  [poulesMakenVoetbal.slug]: poulesMakenVoetbal,
};

export function getSeoContent(slug: string): SeoPageContent | undefined {
  return bySlug[slug];
}

export type { SeoPageContent, ContentBlock, ContentSection, FaqItem } from "./types";
