import { IntelNav } from "@/components/intel/IntelNav";
import { AddClubForm, CsvImportForm } from "./ImportForms";

export const metadata = {
  title: "Import clubs",
};

export default function ImportPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14">
      <IntelNav current="/intel/import" />
      <h1 className="ut-display mb-3 text-4xl font-extrabold text-ink">
        Import clubs
      </h1>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Add clubs manually or via CSV. Bulk Antwerp provincial clubs are also
        imported from Voetbal Vlaanderen with{" "}
        <code className="rounded bg-green-tint px-1.5 py-0.5 text-xs">
          npm run intel:import
        </code>
        . Refresh RBFA contacts with{" "}
        <code className="rounded bg-green-tint px-1.5 py-0.5 text-xs">
          npm run intel:contacts
        </code>
        .
      </p>

      <section className="mb-10 rounded-[11px] border border-border bg-bg-elevated/70 px-5 py-5">
        <h2 className="ut-display mb-4 text-xl font-extrabold text-ink">
          Add one club
        </h2>
        <AddClubForm />
      </section>

      <section className="rounded-[11px] border border-border bg-bg-elevated/70 px-5 py-5">
        <h2 className="ut-display mb-4 text-xl font-extrabold text-ink">
          Bulk CSV import
        </h2>
        <CsvImportForm />
      </section>
    </main>
  );
}
