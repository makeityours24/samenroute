"use client";

import { useMemo, useState, useTransition } from "react";
import { FileSpreadsheet, Inbox, TriangleAlert, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { parseCsv } from "@/lib/utils/csv";
import { mapCsvRowToPlaceDraft, type CsvPlaceDraft } from "@/lib/utils/csv-import";

type PreviewRow = CsvPlaceDraft & {
  index: number;
};

export function CsvImportForm({
  action,
  listId
}: {
  action: (formData: FormData) => Promise<void>;
  listId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [previewError, setPreviewError] = useState<string>("");

  const validRows = useMemo(() => previewRows.filter((row) => row.isValid), [previewRows]);
  const invalidRows = useMemo(() => previewRows.filter((row) => !row.isValid), [previewRows]);
  const visibleRows = previewRows.slice(0, 8);

  async function handleFileChange(nextFile: File | null) {
    setFile(nextFile);
    setPreviewError("");
    setPreviewRows([]);

    if (!nextFile) {
      return;
    }

    try {
      const text = await nextFile.text();
      const rows = parseCsv(text);

      if (rows.length === 0) {
        setPreviewError("We konden geen bruikbare regels vinden in dit bestand.");
        return;
      }

      setPreviewRows(rows.map((row, index) => ({ index: index + 1, ...mapCsvRowToPlaceDraft(row) })));
    } catch {
      setPreviewError("We konden dit CSV-bestand niet lezen.");
    }
  }

  function submitImport() {
    if (!file || validRows.length === 0 || isPending) {
      return;
    }

    const formData = new FormData();
    formData.set("listId", listId);
    formData.set("file", file);

    startTransition(async () => {
      await action(formData);
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[var(--surface-subtle)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
        Gebruik voor deze eerste versie een CSV-bestand met bijvoorbeeld kolommen zoals <strong>naam</strong>, <strong>adres</strong>,
        <strong> postcode</strong>, <strong>stad</strong>, <strong>notitie</strong> of <strong>categorie</strong>. Excel-export met
        puntkomma&apos;s werkt ook.
      </div>

      <Card className="space-y-4 border-2 border-dashed p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <FileSpreadsheet className="h-4 w-4 text-[var(--accent)]" />
          Upload je adressenlijst
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-[var(--surface-subtle)] p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)]">
            <Inbox className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--foreground)]">Kies eerst je CSV, bekijk de preview en importeer daarna pas.</p>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              Zo zie je vooraf welke rijen bruikbaar zijn en welke regels waarschijnlijk worden overgeslagen.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted-foreground)]">
          Heb je nog geen bestand klaarstaan?
          {" "}
          <a href="/examples/makelaars-import-voorbeeld.csv" className="font-semibold text-[var(--accent)] underline-offset-4 hover:underline">
            Download hier eerst het voorbeeldbestand
          </a>
          .
        </div>
        <Input
          type="file"
          accept=".csv,text/csv,text/plain,application/vnd.ms-excel"
          onChange={(event) => {
            void handleFileChange(event.target.files?.[0] ?? null);
          }}
        />
      </Card>

      {previewError ? (
        <div className="rounded-[var(--radius)] border border-[color:rgba(185,56,47,0.16)] bg-[color:rgba(185,56,47,0.08)] px-4 py-3 text-sm text-[var(--foreground)] shadow-[var(--shadow-soft)]">
          {previewError}
        </div>
      ) : null}

      {previewRows.length > 0 ? (
        <Card className="space-y-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Import-preview</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {validRows.length} bruikbaar, {invalidRows.length} waarschijnlijk overslaan
              </p>
            </div>
            <div className="rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)]">
              {file?.name}
            </div>
          </div>

          <div className="space-y-2">
            {visibleRows.map((row) => (
              <div key={row.index} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)]">
                      Regel {row.index}: {row.name || row.addressLine || "Onvoldoende gegevens"}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {[row.addressLine, row.postalCode, row.city, row.country].filter(Boolean).join(", ") || "Geen volledig adres"}
                    </p>
                    {row.note ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">Notitie: {row.note}</p> : null}
                  </div>
                  <div
                    className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold ${
                      row.isValid
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "bg-[color:rgba(185,56,47,0.08)] text-[var(--danger)]"
                    }`}
                  >
                    {row.isValid ? "Klaar voor import" : "Wordt overgeslagen"}
                  </div>
                </div>

                {row.warnings.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {row.warnings.map((warning) => (
                      <span
                        key={warning}
                        className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)]"
                      >
                        <TriangleAlert className="h-3 w-3 text-[var(--warning)]" />
                        {warning}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          {previewRows.length > visibleRows.length ? (
            <p className="text-xs text-[var(--muted-foreground)]">
              Alleen de eerste {visibleRows.length} regels worden hier getoond. De rest gaat wel mee in de importcontrole.
            </p>
          ) : null}

          <Button type="button" fullWidth pending={isPending} onClick={submitImport} disabled={!file || validRows.length === 0}>
            <Upload className="h-4 w-4" />
            Import bevestigen
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
