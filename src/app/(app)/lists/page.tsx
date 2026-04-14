import { getCurrentUser } from "@/lib/auth/auth";
import { createListAction, createListAndOpenImportAction, duplicateListAction } from "@/app/(app)/actions";
import { AppTopBar } from "@/components/navigation/app-topbar";
import { ListCard } from "@/components/lists/list-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { ListRepository } from "@/server/repositories/list.repository";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import { getDictionary } from "@/lib/i18n/server";
import { ArrowRight, Download, FileSpreadsheet } from "lucide-react";

const listRepository = new ListRepository();

export default async function ListsPage() {
  const user = await getCurrentUser();
  const { dict } = await getDictionary();
  const lists = user ? await listRepository.findAccessibleByUser(user.id) : [];
  const activeLists = lists.filter((list) => !list.isArchived);
  const archivedLists = lists.filter((list) => list.isArchived);

  return (
    <PageContainer className="gap-4">
      <AppTopBar title={dict.lists.topTitle} subtitle={dict.lists.topSubtitle} />
      <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] px-4 py-4 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
          <FileSpreadsheet className="h-4 w-4 text-[var(--accent)]" />
          Zakelijke snelle start
        </div>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          Werk je met adressen uit Excel, CRM of een bezichtigingsplanning? Maak hier direct een zakelijke lijst aan en open daarna
          meteen de CSV-import.
        </p>
        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
          <form action={createListAndOpenImportAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">1. Maak je importlijst aan</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Geef de lijst een herkenbare naam en ga daarna meteen door naar upload en preview.
              </p>
            </div>
            <Input name="name" placeholder="Bezichtigingen week 16" aria-label="Zakelijke lijstnaam" required />
            <Textarea
              name="description"
              placeholder="Importeer adressen en laat daarna de slimste volgorde voorstellen"
              aria-label="Zakelijke lijstomschrijving"
            />
            <Input name="coverColor" placeholder="#1F7A5C" aria-label="Lijstkleur" />
            <FormSubmitButton fullWidth pendingLabel="Bezig...">
              Maak lijst en open CSV-import
              <ArrowRight className="h-4 w-4" />
            </FormSubmitButton>
          </form>
          <div className="space-y-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">2. Gebruik desnoods eerst het voorbeeldbestand</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                Zo zie je meteen welk formaat SamenRoute verwacht voor adres, stad, notitie en categorie.
              </p>
            </div>
            <a
              href="/examples/makelaars-import-voorbeeld.csv"
              download
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)]"
            >
              <Download className="h-4 w-4 text-[var(--accent)]" />
              Download voorbeeld-CSV
            </a>
            <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
              Na het aanmaken opent SamenRoute direct de import-preview, zodat je niet nog een keer hoeft te zoeken.
            </div>
          </div>
        </div>
      </section>
      <section className="space-y-3">
        <SectionHeader title={dict.lists.activeTitle} subtitle={dict.lists.activeSubtitle} />
        {activeLists.length > 0 ? (
          activeLists.map((list) => (
            <div key={list.id} className="space-y-2">
              <ListCard
                href={`/lists/${list.id}`}
                name={list.name}
                description={list.description}
                placeCount={list._count.listPlaces}
                visitedCount={0}
                shared={list.members.length > 1}
                membershipLabel={
                  user
                    ? list.ownerUserId === user.id
                      ? dict.members.owner
                      : (list.members.find((member) => member.userId === user.id)?.role === "EDITOR" ? dict.members.editor : dict.members.viewer)
                    : undefined
                }
                copy={{
                  shared: dict.lists.shared,
                  private: dict.lists.private,
                  noDescription: dict.lists.noDescription,
                  placesCount: dict.lists.placesCount,
                  visitedCount: dict.lists.visitedCount,
                  rolePrefix: dict.lists.rolePrefix
                }}
              />
              <div className="flex justify-end pr-1">
                <form action={duplicateListAction}>
                  <input type="hidden" name="listId" value={list.id} />
                  <FormSubmitButton type="submit" variant="ghost" size="sm" pendingLabel="Bezig...">
                    {dict.lists.duplicate}
                  </FormSubmitButton>
                </form>
              </div>
            </div>
          ))
        ) : (
          <EmptyState title={dict.lists.noLists} description={dict.lists.noListsBody} />
        )}
      </section>
      {archivedLists.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader title={dict.lists.archivedTitle} subtitle={dict.lists.archivedSubtitle} />
          {archivedLists.map((list) => (
            <ListCard
              key={list.id}
              href={`/lists/${list.id}`}
              name={list.name}
              description={list.description}
              placeCount={list._count.listPlaces}
              visitedCount={0}
              shared={list.members.length > 1}
              membershipLabel={
                user
                  ? list.ownerUserId === user.id
                    ? dict.members.owner
                    : (list.members.find((member) => member.userId === user.id)?.role === "EDITOR" ? dict.members.editor : dict.members.viewer)
                  : undefined
              }
              copy={{
                shared: dict.lists.shared,
                private: dict.lists.private,
                noDescription: dict.lists.noDescription,
                placesCount: dict.lists.placesCount,
                visitedCount: dict.lists.visitedCount,
                rolePrefix: dict.lists.rolePrefix
              }}
            />
          ))}
        </section>
      ) : null}
      <details className="rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
        <summary className="cursor-pointer list-none text-[15px] font-semibold">Handmatig lijst maken</summary>
        <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
          Liever zonder CSV beginnen? Maak hier een lege lijst aan en voeg later handmatig adressen of plekken toe.
        </p>
        <form action={createListAction} className="mt-4 space-y-3">
          <Input name="name" placeholder={dict.lists.namePlaceholder} aria-label={dict.lists.nameLabel} required />
          <Textarea name="description" placeholder={dict.lists.descriptionPlaceholder} aria-label={dict.lists.descriptionLabel} />
          <Input name="coverColor" placeholder={dict.lists.colorPlaceholder} aria-label={dict.lists.colorLabel} />
          <StickyActionBar>
            <FormSubmitButton fullWidth pendingLabel="Bezig...">
              {dict.lists.createButton}
            </FormSubmitButton>
          </StickyActionBar>
        </form>
      </details>
    </PageContainer>
  );
}
