const RBFA_URL = "https://datalake-prod2018.rbfa.be/graphql";

const HEADERS: Record<string, string> = {
  accept: "*/*",
  "content-type": "application/json",
  origin: "https://www.voetbalvlaanderen.be",
  referer: "https://www.voetbalvlaanderen.be/",
  "user-agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
};

export const SERIES_LIST = [
  { seriesId: "CHP_130005", name: "1 Provinciaal Antw" },
  { seriesId: "CHP_136335", name: "2 Provinciaal Antw A" },
  { seriesId: "CHP_136336", name: "2 Provinciaal Antw B" },
  { seriesId: "CHP_134280", name: "3 Provinciaal Antw A" },
  { seriesId: "CHP_136223", name: "3 Provinciaal Antw B" },
  { seriesId: "CHP_136224", name: "3 Provinciaal Antw C" },
  { seriesId: "CHP_134504", name: "4 Provinciaal Antw A" },
  { seriesId: "CHP_134505", name: "4 Provinciaal Antw B" },
  { seriesId: "CHP_134506", name: "4 Provinciaal Antw C" },
  { seriesId: "CHP_134507", name: "4 Provinciaal Antw D" },
  { seriesId: "CHP_134508", name: "4 Provinciaal Antw E" },
  { seriesId: "CHP_134509", name: "4 Provinciaal Antw F" },
  { seriesId: "CHP_130513", name: "4 Provinciaal Antw G" },
] as const;

export type SeriesTeam = {
  clubId: string;
  clubName: string;
  teamId: string;
};

export type ClubInfo = {
  id: string;
  name: string;
  website: string | null;
  locality: string | null;
};

async function rbfaGraphql<T>(
  operationName: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const res = await fetch(RBFA_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ operationName, query, variables }),
  });
  if (!res.ok) {
    throw new Error(`RBFA ${operationName} HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };
  if (json.errors?.length) {
    throw new Error(
      `RBFA ${operationName}: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }
  if (!json.data) {
    throw new Error(`RBFA ${operationName}: empty data`);
  }
  return json.data;
}

export async function getTeamsInSeries(seriesId: string): Promise<SeriesTeam[]> {
  const data = await rbfaGraphql<{
    teamsInSeries: Array<{
      clubId: string;
      clubName: string;
      id: string;
    }> | null;
  }>(
    "getTeamsInSeries",
    `query getTeamsInSeries($seriesId: ID!, $language: Language!) {
      teamsInSeries(seriesId: $seriesId, language: $language) {
        clubId
        clubName
        id
      }
    }`,
    { seriesId, language: "nl" },
  );

  return (data.teamsInSeries || []).map((t) => ({
    clubId: t.clubId,
    clubName: t.clubName,
    teamId: t.id,
  }));
}

export async function getClubInfo(clubId: string): Promise<ClubInfo | null> {
  // Use the public persisted query hash from voetbalvlaanderen.be — the full
  // clubInfo selection set is large and language-dependent.
  const res = await fetch(RBFA_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      operationName: "getClubInfo",
      variables: { clubId, language: "nl" },
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash:
            "7c1bd99f0001a20d60208c60d4fb7c99aefdb810b9ee1c4de21a6d6ba4804b58",
        },
      },
    }),
  });
  if (!res.ok) throw new Error(`RBFA getClubInfo HTTP ${res.status}`);
  const json = (await res.json()) as {
    data?: {
      clubInfo: {
        id: string;
        name: string;
        website: string | null;
        address?: { localityName?: string | null } | null;
      } | null;
    };
    errors?: Array<{ message: string }>;
  };
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  const info = json.data?.clubInfo;
  if (!info) return null;
  const website =
    info.website &&
    info.website !== "null" &&
    /^https?:\/\//i.test(info.website.trim())
      ? info.website.trim()
      : null;

  return {
    id: info.id,
    name: info.name,
    website,
    locality: info.address?.localityName || null,
  };
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
