import OpenAI from "openai";

export type TournamentSignal = {
  id: number;
  tournamentName: string | null;
  category: string | null;
  ageGroup: string | null;
  eventDate: string | null;
  registrationDate: string | null;
  summary: string | null;
  confidence: number | null;
  source: string | null;
  sourceUrl: string | null;
  postSnippet: string | null;
};

export type ClusteredEvent = {
  name: string;
  category: string;
  ageGroups: string;
  startDate: string | null;
  endDate: string | null;
  registrationDate: string | null;
  summary: string;
  confidence: number;
  tournamentIds: number[];
};

export type ClusterResult = {
  events: ClusteredEvent[];
};

const SYSTEM_PROMPT = `You cluster tournament signals from one football club into distinct club-organised tournament events.

Rules:
- Merge the same named cup across registration pages, overview pages, day-specific pages, and age-group pages into ONE event.
- For multi-day tournaments, set startDate to the first day and endDate to the last day.
- Combine age groups (e.g. U8-U13 and U14-U17 → U8-U17 or list them).
- Different tournament names stay separate (e.g. "Absolute Teamsport Cup" vs "Young Talents Cup").
- Different years of the same named cup are separate events.
- Federation / association cups the club only plays in are already filtered out — do not invent them.
- Every input tournament id must appear in exactly one event's tournamentIds.
- Prefer a clear event name, concise summary, and confidence 0-1 (max of contributing signals when unsure).

Return JSON only.`;

function getClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: key });
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("No JSON in model response");
  }
}

function outputText(response: OpenAI.Responses.Response): string {
  if (response.output_text) return response.output_text;
  const chunks: string[] = [];
  for (const item of response.output || []) {
    if (item.type !== "message") continue;
    for (const c of item.content || []) {
      if (c.type === "output_text") chunks.push(c.text);
    }
  }
  return chunks.join("\n");
}

function normalizeDate(value: unknown): string | null {
  if (value == null) return null;
  const v = String(value).trim();
  if (!v || v.toLowerCase() === "null") return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const t = Date.parse(v);
  if (!Number.isNaN(t)) return new Date(t).toISOString().slice(0, 10);
  return null;
}

function normalizeEvent(
  raw: unknown,
  validIds: Set<number>,
): ClusteredEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const conf = Number(o.confidence);
  const idsRaw = Array.isArray(o.tournamentIds) ? o.tournamentIds : [];
  const tournamentIds = [
    ...new Set(
      idsRaw
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id) && validIds.has(id)),
    ),
  ];
  if (!tournamentIds.length) return null;

  let startDate = normalizeDate(o.startDate);
  let endDate = normalizeDate(o.endDate);
  if (startDate && endDate && endDate < startDate) {
    const tmp = startDate;
    startDate = endDate;
    endDate = tmp;
  }
  if (startDate && !endDate) endDate = startDate;

  return {
    name: String(o.name || "").trim() || "Tournament",
    category: String(o.category || "").trim(),
    ageGroups: String(o.ageGroups || o.ageGroup || "").trim(),
    startDate,
    endDate,
    registrationDate: normalizeDate(o.registrationDate),
    summary: String(o.summary || "").trim(),
    confidence: Number.isFinite(conf)
      ? Math.min(1, Math.max(0, conf))
      : 0.5,
    tournamentIds,
  };
}

function fallbackCluster(signals: TournamentSignal[]): ClusterResult {
  return {
    events: signals.map((s) => ({
      name: s.tournamentName?.trim() || "Tournament",
      category: s.category || "",
      ageGroups: s.ageGroup || "",
      startDate: normalizeDate(s.eventDate),
      endDate: normalizeDate(s.eventDate),
      registrationDate: normalizeDate(s.registrationDate),
      summary: s.summary || "",
      confidence:
        s.confidence != null && Number.isFinite(s.confidence)
          ? Math.min(1, Math.max(0, s.confidence))
          : 0.5,
      tournamentIds: [s.id],
    })),
  };
}

function ensureAllIdsCovered(
  events: ClusteredEvent[],
  signals: TournamentSignal[],
): ClusteredEvent[] {
  const seen = new Set<number>();
  const cleaned: ClusteredEvent[] = [];
  for (const ev of events) {
    const ids = ev.tournamentIds.filter((id) => !seen.has(id));
    for (const id of ids) seen.add(id);
    if (ids.length) cleaned.push({ ...ev, tournamentIds: ids });
  }

  const byId = new Map(signals.map((s) => [s.id, s]));
  for (const s of signals) {
    if (seen.has(s.id)) continue;
    cleaned.push(...fallbackCluster([s]).events);
  }

  // Drop any unknown ids that slipped through
  return cleaned.map((ev) => ({
    ...ev,
    tournamentIds: ev.tournamentIds.filter((id) => byId.has(id)),
  })).filter((ev) => ev.tournamentIds.length > 0);
}

export async function clusterClubTournaments(
  clubName: string,
  signals: TournamentSignal[],
): Promise<ClusterResult> {
  if (!signals.length) return { events: [] };
  if (signals.length === 1) return fallbackCluster(signals);

  const validIds = new Set(signals.map((s) => s.id));
  const client = getClient();

  const payload = signals.map((s) => ({
    id: s.id,
    tournamentName: s.tournamentName,
    category: s.category,
    ageGroup: s.ageGroup,
    eventDate: s.eventDate,
    registrationDate: s.registrationDate,
    summary: s.summary,
    confidence: s.confidence,
    source: s.source,
    sourceUrl: s.sourceUrl,
    postSnippet: s.postSnippet ? s.postSnippet.slice(0, 400) : null,
  }));

  const userPrompt = `Club: ${clubName}

Cluster these tournament signals into distinct events.

Return JSON:
{
  "events": [
    {
      "name": "",
      "category": "",
      "ageGroups": "",
      "startDate": "YYYY-MM-DD or null",
      "endDate": "YYYY-MM-DD or null",
      "registrationDate": "YYYY-MM-DD or null",
      "summary": "",
      "confidence": 0-1,
      "tournamentIds": [signal ids that belong to this event]
    }
  ]
}

Signals:
${JSON.stringify(payload, null, 2)}`;

  const response = await client.responses.create({
    model: "gpt-5.6-luna",
    reasoning: { effort: "medium" },
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const text = outputText(response);
  const parsed = extractJson(text);
  const root =
    parsed && typeof parsed === "object"
      ? (parsed as { events?: unknown })
      : null;
  const list = Array.isArray(root?.events)
    ? root!.events
    : Array.isArray(parsed)
      ? parsed
      : [];

  const events: ClusteredEvent[] = [];
  for (const item of list) {
    const ev = normalizeEvent(item, validIds);
    if (ev) events.push(ev);
  }

  if (!events.length) return fallbackCluster(signals);
  return { events: ensureAllIdsCovered(events, signals) };
}
