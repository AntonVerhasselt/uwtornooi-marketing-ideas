export type ScrapedPost = {
  source: "facebook" | "instagram" | "blog";
  sourcePostId: string;
  sourceUrl: string | null;
  postDate: string | null; // YYYY-MM-DD
  postText: string;
};

export function monthsAgoIsoDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

export function isWithinMonths(isoDate: string | null, months: number): boolean {
  if (!isoDate) return true; // keep undated; analyzer can discard
  return isoDate >= monthsAgoIsoDate(months);
}

export function decodeJsString(raw: string): string {
  try {
    return JSON.parse(`"${raw}"`) as string;
  } catch {
    return raw
      .replace(/\\n/g, "\n")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\")
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, h: string) =>
        String.fromCharCode(parseInt(h, 16)),
      );
  }
}
