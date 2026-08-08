import OpenAI from "openai";

export type TournamentAnalysis = {
  isTournament: boolean;
  confidence: number;
  tournamentName: string;
  category: string;
  ageGroup: string;
  eventDate: string;
  registrationDate: string;
  summary: string;
};

/** One post may mention several club-organised tournaments. */
export type PostAnalysis = {
  isTournament: boolean;
  tournaments: TournamentAnalysis[];
};

export type AnalyzablePost = {
  id: number;
  postText: string;
  postDate: string | null;
  source: string;
};

const SYSTEM_PROMPT = `You analyze football club Facebook/Instagram/blog posts.

Determine if this post is related to one or more football tournaments organized (hosted) by the club.

A club can organise several tournaments (different cups or years). Extract EACH truly distinct club-organised tournament mentioned.

When one cup spans multiple days or age categories (e.g. Absolute Teamsport Cup U8-U13 on Sat and U14-U17 on Sun, plus a registration form), prefer ONE tournament object: use the start day as eventDate and note the full date range / age span in summary. Do not explode the same cup into many objects. Still return multiple objects when names/years clearly differ (e.g. Absolute Teamsport Cup vs Young Talents Cup).

Tournament examples:
- youth tournaments
- amateur football tournaments
- cups organised by the club
- annual tournaments
- tournament registrations
- tournament schedules
- tournament results for events the club hosts

Not tournaments:
- normal league matches
- training updates
- player announcements
- general club news
- family days / fun days unless they are football tournaments
- federation / association cups the club only plays in (Croky Cup, Beker van België, Beker van Vlaanderen, Beker van Antwerpen, provincial cups) unless the club itself organises the event

Only mark isTournament=true when the club organises (hosts) at least one tournament.

Return JSON only.`;

function getClient(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: key });
}

function emptyTournament(): TournamentAnalysis {
  return {
    isTournament: false,
    confidence: 0,
    tournamentName: "",
    category: "",
    ageGroup: "",
    eventDate: "",
    registrationDate: "",
    summary: "",
  };
}

function emptyPostAnalysis(): PostAnalysis {
  return { isTournament: false, tournaments: [] };
}

function normalizeTournament(raw: unknown): TournamentAnalysis {
  if (!raw || typeof raw !== "object") return emptyTournament();
  const o = raw as Record<string, unknown>;
  const conf = Number(o.confidence);
  return {
    isTournament: Boolean(o.isTournament ?? true),
    confidence: Number.isFinite(conf) ? Math.min(1, Math.max(0, conf)) : 0,
    tournamentName: String(o.tournamentName || ""),
    category: String(o.category || ""),
    ageGroup: String(o.ageGroup || ""),
    eventDate: String(o.eventDate || ""),
    registrationDate: String(o.registrationDate || ""),
    summary: String(o.summary || ""),
  };
}

function normalizePostAnalysis(raw: unknown): PostAnalysis {
  if (!raw || typeof raw !== "object") return emptyPostAnalysis();
  const o = raw as Record<string, unknown>;

  const list: TournamentAnalysis[] = [];
  if (Array.isArray(o.tournaments)) {
    for (const item of o.tournaments) {
      const t = normalizeTournament(item);
      if (t.tournamentName || t.summary) {
        list.push({ ...t, isTournament: true });
      }
    }
  }

  // Back-compat: flat single-tournament object
  if (!list.length && (o.tournamentName || o.isTournament)) {
    const t = normalizeTournament(o);
    if (t.isTournament && (t.tournamentName || t.summary)) {
      list.push(t);
    }
  }

  const isTournament = Boolean(o.isTournament) || list.length > 0;
  return {
    isTournament,
    tournaments: isTournament ? list : [],
  };
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
    const aStart = trimmed.indexOf("[");
    const aEnd = trimmed.lastIndexOf("]");
    if (aStart >= 0 && aEnd > aStart) {
      return JSON.parse(trimmed.slice(aStart, aEnd + 1));
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

export async function analyzePostsBatch(
  posts: AnalyzablePost[],
): Promise<Map<number, PostAnalysis>> {
  const result = new Map<number, PostAnalysis>();
  if (!posts.length) return result;

  const client = getClient();
  const payload = posts.map((p) => ({
    id: p.id,
    source: p.source,
    postDate: p.postDate,
    text: p.postText.slice(0, 2500),
  }));

  const userPrompt = `Analyze each post. Return a JSON array with one object per post, same order, including the post id.

Schema per item:
{
  "id": number,
  "isTournament": true/false,
  "tournaments": [
    {
      "tournamentName": "",
      "category": "",
      "ageGroup": "",
      "eventDate": "",
      "registrationDate": "",
      "confidence": 0-1,
      "summary": ""
    }
  ]
}

If the post mentions multiple club-organised tournaments (e.g. U8 cup AND U13 cup, or spring + summer events), include one object per tournament in "tournaments".
If none, isTournament=false and tournaments=[].

Posts:
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
  const items = Array.isArray(parsed) ? parsed : [parsed];

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const id = Number((item as { id?: unknown }).id);
    if (!Number.isFinite(id)) continue;
    result.set(id, normalizePostAnalysis(item));
  }

  for (const p of posts) {
    if (!result.has(p.id)) result.set(p.id, emptyPostAnalysis());
  }

  return result;
}

export async function analyzeAllPosts(
  posts: AnalyzablePost[],
  options?: {
    batchSize?: number;
    onBatch?: (done: number, total: number) => void;
  },
): Promise<Map<number, PostAnalysis>> {
  const batchSize = options?.batchSize ?? 8;
  const all = new Map<number, PostAnalysis>();

  for (let i = 0; i < posts.length; i += batchSize) {
    const batch = posts.slice(i, i + batchSize);
    const part = await analyzePostsBatch(batch);
    for (const [id, analysis] of part) all.set(id, analysis);
    options?.onBatch?.(Math.min(i + batch.length, posts.length), posts.length);
  }

  return all;
}
