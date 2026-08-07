"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddClubForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, website_url: website }),
      });
      const data = (await res.json()) as { id?: number; error?: string };
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus(`Saved club #${data.id}`);
      setName("");
      setWebsite("");
      router.refresh();
      if (data.id) router.push(`/intel/clubs/${data.id}`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        <span className="mb-1 block text-ink-faint">Club name</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-[11px] border border-border bg-bg-elevated px-3 py-2.5 outline-none ring-green-dark/30 focus:ring-2"
          placeholder="KFC Example"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-ink-faint">Website URL</span>
        <input
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          className="w-full rounded-[11px] border border-border bg-bg-elevated px-3 py-2.5 outline-none ring-green-dark/30 focus:ring-2"
          placeholder="https://example.be"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[11px] bg-green-dark px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Add club"}
      </button>
      {status ? <p className="text-sm text-ink-muted">{status}</p> : null}
    </form>
  );
}

export function CsvImportForm() {
  const router = useRouter();
  const [csv, setCsv] = useState(
    "club_name,website_url\nClub A,https://club-a.be\nClub B,https://club-b.be\n",
  );
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/import/csv", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ csv }),
      });
      const data = (await res.json()) as {
        inserted?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus(`Imported ${data.inserted} clubs`);
      router.refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm">
        <span className="mb-1 block text-ink-faint">CSV</span>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          rows={8}
          className="w-full rounded-[11px] border border-border bg-bg-elevated px-3 py-2.5 font-mono text-xs outline-none ring-green-dark/30 focus:ring-2"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-[11px] bg-green-dark px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Importing…" : "Import CSV"}
      </button>
      {status ? <p className="text-sm text-ink-muted">{status}</p> : null}
    </form>
  );
}
