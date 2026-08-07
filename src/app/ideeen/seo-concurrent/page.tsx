import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIdea } from "@/lib/ideas";
import { seoClusters, seoPages, type SeoCluster } from "@/lib/seo-pages";

const idea = getIdea("seo-concurrent");

export const metadata: Metadata = {
  title: "SEO + SEA vs Tournify",
  description:
    "Full competitor SEO/SEA strategy for UwTornooi.be: Tournify research, content cluster, migration funnel, and draft Dutch pages.",
};

const funnelSteps = [
  {
    title: "Awareness",
    detail:
      "Club zoekt Tournify, “Tournify alternatief”, of “voetbaltoernooi organiseren”.",
  },
  {
    title: "Trust",
    detail:
      "Vergelijking + “wat is Tournify” tonen: zelfde kernfuncties, eerlijke toon.",
  },
  {
    title: "Migration offer",
    detail:
      "“Wij zetten jouw Tournify tornooi gratis over” — drempel weg.",
  },
  {
    title: "Signup",
    detail: "CTA naar uwtornooi.be / demo / start tornooi.",
  },
];

const tournifyInsights = [
  {
    title: "Discovery is hun grootste traffic driver",
    detail:
      "In BE haalt /nl/explore ~29% van de organische traffic — mensen die toernooien zoeken, niet per se software. Live-pagina’s (/live/…) zitten ook in hun top 10.",
  },
  {
    title: "Voetbal-verticaal is een pilaar",
    detail:
      "/nl/sporten/voetbal ~12% traffic share, rank #2 op “voetbaltoernooi” (lage difficulty ~6). Exact de niche waar UwTornooi moet winnen.",
  },
  {
    title: "Homepage + FR pakken merkkracht",
    detail:
      "/nl (~21%) en /fr (~16%) scoren op brede “tornooi software”-intent. Voor Vlaanderen eerst NL; FR later als we BE willen verbreden.",
  },
  {
    title: "Volume is bescheiden, keywords zijn haalbaar",
    detail:
      "~151 organische bezoekers/maand in BE op ~399 keywords. Geen onneembare muur — wel sterke backlink-footprint (500k+). Wij winnen op focus + intent, niet op DA-oorlog.",
  },
  {
    title: "Publieke tornooiwebsites = SEO-vliegwiel",
    detail:
      "Elke live tornooi-URL is een landingspagina. Lange termijn: publieke UwTornooi-tornooien indexeerbaar maken (zorgvuldig, met club-opt-in).",
  },
];

const inspiration = [
  {
    name: "Notion vs Asana",
    href: "https://www.notion.com/en-gb/compare-against/asana",
    learn: [
      "Duidelijke “which fits you?” positioning",
      "Feature tables zonder smear",
      "Migratie/overstap als onderdeel van het verhaal",
    ],
  },
  {
    name: "Slack vs Microsoft Teams (blog)",
    href: "https://slack.com/blog/compare/slack-vs-microsoft-teams",
    learn: [
      "Eerlijke “what each is great at” secties",
      "Scenario’s i.p.v. enkel feature-ticks",
      "FAQ + migration CTA onderaan",
    ],
  },
  {
    name: "Slack vs Teams (compare hub)",
    href: "https://slack.com/compare/slack-vs-teams",
    learn: [
      "Dedicated compare URL-structuur",
      "Cluster van related compare pages",
      "Directe competitor-targeting zonder giftige toon",
    ],
  },
];

function priorityPages(priority: "P0" | "P1" | "P2") {
  return seoPages.filter((page) => page.priority === priority);
}

function PageCard({
  href,
  title,
  keyword,
  path,
  purpose,
  priority,
}: {
  href: string;
  title: string;
  keyword: string;
  path: string;
  purpose: string;
  priority: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-[11px] border border-border bg-bg-elevated p-5 shadow-[var(--shadow-soft)] transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-green-light"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-[11px] bg-green-tint px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-green-dark">
          {priority}
        </span>
        <span className="text-xs text-ink-faint">{path}</span>
      </div>
      <h3 className="ut-display mb-1 text-lg font-extrabold text-ink group-hover:text-green-dark">
        {title}
      </h3>
      <p className="mb-2 text-xs font-medium text-green-dark">{keyword}</p>
      <p className="flex-1 text-sm leading-relaxed text-ink-muted">{purpose}</p>
      <span className="mt-4 text-sm font-medium text-green-dark">
        Open draft →
      </span>
    </Link>
  );
}

export default function SeoConcurrentPage() {
  if (!idea) notFound();

  const byCluster = seoClusters.map((cluster) => ({
    ...cluster,
    pages: seoPages.filter((page) => page.cluster === (cluster.id as SeoCluster)),
  }));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:px-8 sm:py-16">
      <div className="ut-animate-fade-up mb-10 max-w-3xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-green-dark"
        >
          ← Back to overview
        </Link>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-green-tint text-sm font-bold text-green-dark">
            {idea.number}
          </span>
          <span className="rounded-[11px] bg-green-tint px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-green-dark">
            {idea.statusLabel}
          </span>
        </div>
        <h1 className="ut-display mb-4 text-4xl font-extrabold text-ink sm:text-5xl">
          SEO + SEA content strategy
          <span className="block text-green-dark">vs Tournify</span>
        </h1>
        <p className="text-lg leading-relaxed text-ink-muted">
          Doel is niet “UwTornooi is beter dan Tournify”. Doel is: mensen die al
          naar Tournify zoeken geruststellen, switching-risico verlagen, en
          UwTornooi positioneren als het eenvoudige, betaalbare alternatief voor
          voetbalclubs.
        </p>
      </div>

      <div className="ut-animate-fade-up ut-delay-1 mb-8 flex flex-wrap gap-2 text-sm">
        {[
          ["#funnel", "Funnel"],
          ["#tournify-research", "Tournify research"],
          ["#inspiration", "Inspiration"],
          ["#pages", "Content pages"],
          ["#sea", "SEA"],
          ["#linking", "Internal linking"],
          ["#ship", "Ship checklist"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-[11px] border border-border bg-bg-elevated px-3 py-1.5 text-ink-muted transition-colors hover:border-green-light hover:text-green-dark"
          >
            {label}
          </a>
        ))}
      </div>

      <div className="space-y-8">
        <section
          id="funnel"
          className="ut-animate-fade-up ut-delay-2 rounded-[11px] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)] sm:p-7"
        >
          <h2 className="ut-display mb-2 text-2xl font-extrabold text-ink">
            Funnel: awareness → trust → migration → signup
          </h2>
          <p className="mb-5 max-w-3xl text-[15px] leading-relaxed text-ink-muted">
            De grootste barrière is onzekerheid:{" "}
            <em className="text-ink">
              “Doet UwTornooi alles wat Tournify doet?”
            </em>{" "}
            Content beantwoordt die vraag; de migratie-CTA haalt de praktische
            drempel weg.
          </p>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {funnelSteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-[11px] border border-border bg-green-tint/40 p-4"
              >
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-green-dark">
                  {index + 1}. {step.title}
                </p>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {step.detail}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="tournify-research"
          className="rounded-[11px] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)] sm:p-7"
        >
          <h2 className="ut-display mb-2 text-2xl font-extrabold text-ink">
            Wat we leren uit Tournify’s SEO (BE)
          </h2>
          <p className="mb-5 max-w-3xl text-[15px] leading-relaxed text-ink-muted">
            Gebaseerd op SE Ranking competitive research voor{" "}
            <strong className="font-medium text-ink">tournifyapp.com</strong> in
            België: keywords, top pages, en hun voetbal-landingspagina.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {tournifyInsights.map((item) => (
              <div
                key={item.title}
                className="rounded-[11px] border border-border p-4"
              >
                <h3 className="mb-1.5 font-semibold text-ink">{item.title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 overflow-x-auto rounded-[11px] border border-border">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="bg-green-tint/60 text-ink">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Tournify URL</th>
                  <th className="px-3 py-2.5 font-semibold">~Traffic share</th>
                  <th className="px-3 py-2.5 font-semibold">Ons antwoord</th>
                </tr>
              </thead>
              <tbody className="text-ink-muted">
                <tr className="border-t border-border">
                  <td className="px-3 py-2.5">/nl/explore</td>
                  <td className="px-3 py-2.5">~29%</td>
                  <td className="px-3 py-2.5">
                    Later: discovery/opt-in publieke tornooien (niet fase 1)
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2.5">/nl</td>
                  <td className="px-3 py-2.5">~21%</td>
                  <td className="px-3 py-2.5">
                    Sterke product homepage + interne links vanuit cluster
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2.5">/fr</td>
                  <td className="px-3 py-2.5">~16%</td>
                  <td className="px-3 py-2.5">Fase 2: FR vertaling van P0 pages</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2.5">/nl/sporten/voetbal</td>
                  <td className="px-3 py-2.5">~12%</td>
                  <td className="px-3 py-2.5">
                    /voetbal-tornooi-software + /voetbaltoernooi-organiseren
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2.5">/live/…</td>
                  <td className="px-3 py-2.5">top 10</td>
                  <td className="px-3 py-2.5">
                    Product: indexeerbare publieke tornooi-URL’s
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-[11px] bg-green-tint px-4 py-3 text-sm text-green-dark">
            Enhancement t.o.v. het oorspronkelijke plan: we houden het competitor
            cluster, maar voegen expliciet een{" "}
            <strong className="font-semibold">voetbal-verticaal</strong> en een
            lange-termijn <strong className="font-semibold">live/discovery</strong>{" "}
            spoor toe — omdat dat Tournify’s echte organische motor is in BE.
          </p>
        </section>

        <section
          id="inspiration"
          className="rounded-[11px] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)] sm:p-7"
        >
          <h2 className="ut-display mb-2 text-2xl font-extrabold text-ink">
            SaaS-inspiratie (toon & structuur)
          </h2>
          <p className="mb-5 max-w-3xl text-[15px] leading-relaxed text-ink-muted">
            We kopiëren geen copy — wel de vergelijkingsarchitectuur van sterke
            B2B competitor pages.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {inspiration.map((item) => (
              <div
                key={item.href}
                className="rounded-[11px] border border-border p-4"
              >
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-green-dark underline-offset-2 hover:underline"
                >
                  {item.name} ↗
                </a>
                <ul className="mt-3 list-disc space-y-1.5 pl-4 text-sm text-ink-muted">
                  {item.learn.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 text-sm text-ink-muted sm:grid-cols-3">
            <p className="rounded-[11px] border border-border p-3">
              <strong className="text-ink">Tone:</strong> praktisch, betrouwbaar,
              Vlaams NL. Geen “wij zijn beter”. Wel “eenvoudig alternatief”.
            </p>
            <p className="rounded-[11px] border border-border p-3">
              <strong className="text-ink">Audience:</strong> voetbalclubs,
              tornooiverantwoordelijken, jeugdcoördinatoren, vrijwilligers.
            </p>
            <p className="rounded-[11px] border border-border p-3">
              <strong className="text-ink">Proof point:</strong> zelfde
              kernfuncties + gratis overzetting = risico omlaag.
            </p>
          </div>
        </section>

        <section id="pages" className="space-y-5">
          <div className="rounded-[11px] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)] sm:p-7">
            <h2 className="ut-display mb-2 text-2xl font-extrabold text-ink">
              Content pages (drafts)
            </h2>
            <p className="max-w-3xl text-[15px] leading-relaxed text-ink-muted">
              Volledige Nederlandse drafts met SEO title, meta, H1/H2, FAQ en
              CTA. Bedoeld om 1-op-1 over te zetten naar{" "}
              <a
                href="https://uwtornooi.be"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-green-dark underline-offset-2 hover:underline"
              >
                uwtornooi.be
              </a>{" "}
              op de paden hieronder.
            </p>
          </div>

          <div>
            <h3 className="ut-display mb-3 text-lg font-extrabold text-ink">
              P0 — ship first
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {priorityPages("P0").map((page) => (
                <PageCard
                  key={page.slug}
                  href={page.href}
                  title={page.shortTitle}
                  keyword={page.primaryKeyword}
                  path={page.targetPath}
                  purpose={page.purpose}
                  priority={page.priority}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="ut-display mb-3 text-lg font-extrabold text-ink">
              P1 — reinforce the cluster
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {priorityPages("P1").map((page) => (
                <PageCard
                  key={page.slug}
                  href={page.href}
                  title={page.shortTitle}
                  keyword={page.primaryKeyword}
                  path={page.targetPath}
                  purpose={page.purpose}
                  priority={page.priority}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="ut-display mb-3 text-lg font-extrabold text-ink">
              P2 — support pages
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {priorityPages("P2").map((page) => (
                <PageCard
                  key={page.slug}
                  href={page.href}
                  title={page.shortTitle}
                  keyword={page.primaryKeyword}
                  path={page.targetPath}
                  purpose={page.purpose}
                  priority={page.priority}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {byCluster.map((cluster) => (
              <div
                key={cluster.id}
                className="rounded-[11px] border border-border bg-bg-elevated p-5"
              >
                <h3 className="ut-display mb-1 text-lg font-extrabold text-ink">
                  {cluster.label}
                </h3>
                <p className="mb-3 text-sm text-ink-muted">
                  {cluster.description}
                </p>
                <ul className="space-y-1.5 text-sm">
                  {cluster.pages.map((page) => (
                    <li key={page.slug}>
                      <Link
                        href={page.href}
                        className="text-green-dark underline-offset-2 hover:underline"
                      >
                        {page.shortTitle}
                      </Link>
                      <span className="text-ink-faint"> · {page.targetPath}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section
          id="sea"
          className="rounded-[11px] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)] sm:p-7"
        >
          <h2 className="ut-display mb-2 text-2xl font-extrabold text-ink">
            SEA plan (Google Ads)
          </h2>
          <p className="mb-5 max-w-3xl text-[15px] leading-relaxed text-ink-muted">
            SEO bouwt ownership op lange termijn. SEA koopt intent nu — vooral
            op brand en high-intent alternatiefzoeken. Start klein, meet
            conversies naar signup / migratie-aanvraag.
          </p>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[11px] border border-border p-4">
              <h3 className="mb-2 font-semibold text-ink">
                1. Brand intercept (prioriteit)
              </h3>
              <p className="mb-2 text-sm text-ink-muted">
                Koop impressions op mensen die al “Tournify” typen.
              </p>
              <ul className="list-disc space-y-1 pl-4 text-sm text-ink-muted">
                <li>tournify</li>
                <li>tournify alternatief</li>
                <li>tournify prijs / kosten</li>
                <li>tournify voetbal</li>
              </ul>
              <p className="mt-3 text-sm text-ink-muted">
                Landingspagina’s:{" "}
                <Link
                  href="/ideeen/seo-concurrent/tournify-alternatief"
                  className="text-green-dark hover:underline"
                >
                  /tournify-alternatief
                </Link>{" "}
                en{" "}
                <Link
                  href="/ideeen/seo-concurrent/uwtornooi-vs-tournify"
                  className="text-green-dark hover:underline"
                >
                  /uwtornooi-vs-tournify
                </Link>
                .
              </p>
            </div>

            <div className="rounded-[11px] border border-border p-4">
              <h3 className="mb-2 font-semibold text-ink">
                2. Category / problem terms
              </h3>
              <p className="mb-2 text-sm text-ink-muted">
                Lagere CPC-concurrentie dan pure brand; sluit aan op P0 feature
                pages.
              </p>
              <ul className="list-disc space-y-1 pl-4 text-sm text-ink-muted">
                <li>voetbaltoernooi organiseren</li>
                <li>voetbal tornooi software</li>
                <li>wedstrijdschema tornooi maken</li>
                <li>jeugdtornooi software</li>
              </ul>
              <p className="mt-3 text-sm text-ink-muted">
                Geo: België, bij voorkeur Vlaanderen. Taal: Nederlands.
              </p>
            </div>

            <div className="rounded-[11px] border border-border p-4">
              <h3 className="mb-2 font-semibold text-ink">
                3. Remarketing + seizoen
              </h3>
              <ul className="list-disc space-y-1 pl-4 text-sm text-ink-muted">
                <li>
                  Remarketing op bezoekers van vs/alternatief die niet
                  converteerden → migratie-aanbod
                </li>
                <li>
                  Seizoensboosts: lente/zomer (zomertornooien) en nazomer
                  (start seizoen)
                </li>
                <li>
                  Negatives: jobs, API docs, irrelevante sporten (padel/darts)
                  tenzij we die ooit doen
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-5 overflow-x-auto rounded-[11px] border border-border">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-green-tint/60 text-ink">
                <tr>
                  <th className="px-3 py-2.5 font-semibold">Campaign</th>
                  <th className="px-3 py-2.5 font-semibold">Landing</th>
                  <th className="px-3 py-2.5 font-semibold">Primary KPI</th>
                  <th className="px-3 py-2.5 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="text-ink-muted">
                <tr className="border-t border-border">
                  <td className="px-3 py-2.5">Brand — Tournify</td>
                  <td className="px-3 py-2.5">/tournify-alternatief</td>
                  <td className="px-3 py-2.5">CTR + signup starts</td>
                  <td className="px-3 py-2.5">
                    Respecteer trademark policies; focus op “alternatief”
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2.5">Compare</td>
                  <td className="px-3 py-2.5">/uwtornooi-vs-tournify</td>
                  <td className="px-3 py-2.5">Time on page → migrate CTA</td>
                  <td className="px-3 py-2.5">Ad copy = “zelfde functies, eenvoudiger”</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2.5">Migration</td>
                  <td className="px-3 py-2.5">/overstappen-van-tournify</td>
                  <td className="px-3 py-2.5">Migration form submits</td>
                  <td className="px-3 py-2.5">Best for remarketing audiences</td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2.5">Category NL</td>
                  <td className="px-3 py-2.5">/voetbal-tornooi-software</td>
                  <td className="px-3 py-2.5">Cost / trial</td>
                  <td className="px-3 py-2.5">Scale only if CPA blijft gezond</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-ink-muted">
            Ad angle (voorbeeld):{" "}
            <em className="text-ink">
              “Ken je Tournify? UwTornooi biedt dezelfde kernfuncties voor
              voetbalclubs — eenvoudiger en betaalbaarder. Gratis overzetten.”
            </em>
          </p>
        </section>

        <section
          id="linking"
          className="rounded-[11px] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)] sm:p-7"
        >
          <h2 className="ut-display mb-2 text-2xl font-extrabold text-ink">
            Internal linking
          </h2>
          <p className="mb-4 max-w-3xl text-[15px] leading-relaxed text-ink-muted">
            Elke pagina linkt naar homepage, pricing/demo (op uwtornooi.be), en
            de migratiepagina. Feature pages linken onderling; competitor pages
            linken naar migratie als primaire conversie.
          </p>
          <ul className="list-disc space-y-2 pl-5 text-[15px] text-ink-muted">
            <li>
              Competitor → Migration (hoofdconversie) → Signup
            </li>
            <li>
              Feature guides → Software page → Vs / Alternatief
            </li>
            <li>
              Wat is Tournify → Alternatief + Vs (informational → commercial)
            </li>
            <li>
              Footer/nav op uwtornooi.be: “Voor clubs die Tournify kennen” hub
            </li>
          </ul>
        </section>

        <section
          id="ship"
          className="rounded-[11px] border border-border bg-bg-elevated p-6 shadow-[var(--shadow-soft)] sm:p-7"
        >
          <h2 className="ut-display mb-2 text-2xl font-extrabold text-ink">
            Ship checklist (naar uwtornooi.be)
          </h2>
          <ol className="list-decimal space-y-2 pl-5 text-[15px] text-ink-muted">
            <li>Publiceer P0 pages met de SEO titles/meta uit de drafts.</li>
            <li>
              Bouw op /overstappen-van-tournify een echt formulier: Tournify-URL
              plakken.
            </li>
            <li>Voeg FAQ schema (JSON-LD) toe per pagina.</li>
            <li>Interne links vanuit homepage + footer “Alternatief voor Tournify”.</li>
            <li>Start SEA brand campaign parallel zodra landingspagina’s live zijn.</li>
            <li>
              Meet in PostHog/analytics: landingspagina → CTA → signup /
              migration submit.
            </li>
            <li>
              Fase 2: FR pages, indexeerbare publieke tornooien, lichte
              discovery.
            </li>
          </ol>
          <p className="mt-5 rounded-[11px] bg-green-tint px-4 py-3 text-green-dark">
            Status: strategy + {seoPages.length} Nederlandse content drafts staan
            klaar in dit ideas board. Volgende stap op product-site: copy
            overzetten en migratie-flow bouwen.
          </p>
        </section>
      </div>
    </main>
  );
}
