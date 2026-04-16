import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/auth";
import { createListAction, createListAndOpenImportAction, deleteArchivedListAction, duplicateListAction } from "@/app/(app)/actions";
import { AppTopBar } from "@/components/navigation/app-topbar";
import { ListCard } from "@/components/lists/list-card";
import { EmptyState } from "@/components/ui/empty-state";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { ListRepository } from "@/server/repositories/list.repository";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import { getAppAudience } from "@/lib/audience/server";
import { getDictionary } from "@/lib/i18n/server";
import { ArrowRight, Download, FileSpreadsheet, FolderOpen, Route } from "lucide-react";

const listRepository = new ListRepository();

export default async function ListsPage({
  searchParams
}: {
  searchParams?: Promise<{ createError?: string }>;
}) {
  const user = await getCurrentUser();
  const params = searchParams ? await searchParams : undefined;
  const { locale, dict } = await getDictionary();
  const audience = await getAppAudience();
  const lists = user ? await listRepository.findAccessibleByUser(user.id) : [];
  const activeLists = lists.filter((list) => !list.isArchived);
  const archivedLists = lists.filter((list) => list.isArchived);
  const consumerCreateCopy =
    locale === "en"
      ? {
          title: "Create a new list",
          body: "Start with a simple list and decide later whether you want to add places manually or import them from a file.",
          stepTitle: "Name your list",
          stepBody: "Give it a clear name and optional description so you can keep building on it.",
          button: "Create list",
          helper: "CSV import stays available, but it is optional for regular use."
        }
      : locale === "tr"
        ? {
            title: "Yeni bir liste oluştur",
            body: "Basit bir listeyle başla; yerleri elle mi ekleyeceğine yoksa dosyadan mı içe aktaracağına sonra karar verebilirsin.",
            stepTitle: "Listene ad ver",
            stepBody: "Kolay tanınan bir ad ve istersen kısa bir açıklama ekle.",
            button: "Liste oluştur",
            helper: "CSV içe aktarma kullanılabilir, ama normal kullanım için zorunlu değil."
          }
        : {
            title: "Maak een nieuwe lijst",
            body: "Begin met een simpele lijst en beslis later of je plekken handmatig toevoegt of uit een bestand importeert.",
            stepTitle: "Geef je lijst een naam",
            stepBody: "Kies een herkenbare naam en eventueel een korte beschrijving, zodat je er makkelijk op verder kunt bouwen.",
            button: "Lijst maken",
            helper: "CSV-import blijft beschikbaar, maar is voor normaal gebruik optioneel."
          };
  const businessTopCopy =
    locale === "en"
      ? {
          title: "Work lists",
          subtitle: "Collect addresses, import in bulk, and keep every viewing day tidy.",
          activeTitle: "Active work lists",
          activeSubtitle: "Use these as the basis for today, imports, and team planning."
        }
      : locale === "tr"
        ? {
            title: "Is listeleri",
            subtitle: "Adresleri topla, toplu aktar ve gosterim gunlerini duzenli tut.",
            activeTitle: "Aktif is listeleri",
            activeSubtitle: "Bunlari bugun, ice aktarma ve ekip planlamasi icin temel olarak kullan."
          }
        : {
            title: "Werklijsten",
            subtitle: "Verzamel adressen, importeer in bulk en houd bezichtigingsdagen strak georganiseerd.",
            activeTitle: "Actieve werklijsten",
            activeSubtitle: "Gebruik deze als basis voor vandaag, import en teamafstemming."
          };

  return (
    <PageContainer className="gap-4">
      <AppTopBar
        title={audience === "business" ? businessTopCopy.title : dict.lists.topTitle}
        subtitle={audience === "business" ? businessTopCopy.subtitle : dict.lists.topSubtitle}
      />
      {params?.createError ? (
        <div className="rounded-[var(--radius)] border border-[color:rgba(185,56,47,0.16)] bg-[color:rgba(185,56,47,0.08)] px-4 py-3 text-sm text-[var(--foreground)] shadow-[var(--shadow-soft)]">
          {params.createError}
        </div>
      ) : null}
      {audience === "business" ? (
        <section className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Stap 1</p>
            <p className="mt-2 text-base font-semibold text-[var(--foreground)]">Maak of kies een werklijst</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Gebruik een lijst als vaste container voor een bezichtigingsdag, wijkronde of teamplanning.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Stap 2</p>
            <p className="mt-2 text-base font-semibold text-[var(--foreground)]">Importeer adressen of vul handmatig aan</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Werk vanuit CSV als je snelheid wilt. Handmatige invoer blijft beschikbaar voor losse uitzonderingen.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Stap 3</p>
            <p className="mt-2 text-base font-semibold text-[var(--foreground)]">Werk pas daarna de dagvolgorde uit</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Laat SamenRoute daarna rustig voorstellen hoe je de dag logisch plant rond al bekende afspraken.
            </p>
          </div>
        </section>
      ) : null}
      {audience === "business" ? (
        <section className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] px-4 py-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <FileSpreadsheet className="h-4 w-4 text-[var(--accent)]" />
            Zakelijke snelle start
          </div>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Werk je met adressen uit Excel, CRM of een bezichtigingsplanning? Maak hier direct een zakelijke lijst aan en open daarna
            meteen de CSV-import.
          </p>
          <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
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
                placeholder="Importeer adressen en werk daarna de dagvolgorde uit"
                aria-label="Zakelijke lijstomschrijving"
              />
              <Input name="coverColor" placeholder="#1F7A5C" aria-label="Lijstkleur" />
              <FormSubmitButton fullWidth pendingLabel="Bezig...">
                Maak lijst en open CSV-import
                <ArrowRight className="h-4 w-4" />
              </FormSubmitButton>
            </form>
            <div className="grid gap-3">
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
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
                <p className="text-sm font-semibold text-[var(--foreground)]">Wat hierna gebeurt</p>
                <div className="mt-3 space-y-2">
                  <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    SamenRoute opent direct je CSV-preview.
                  </div>
                  <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    Daarna controleer je regels, lege velden en dubbele adressen.
                  </div>
                  <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    Pas daarna werk je de dagvolgorde uit voor route en afspraken.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] px-4 py-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <FileSpreadsheet className="h-4 w-4 text-[var(--accent)]" />
            {consumerCreateCopy.title}
          </div>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">{consumerCreateCopy.body}</p>
          <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
            <form action={createListAction} className="space-y-3 rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)]">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">{consumerCreateCopy.stepTitle}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{consumerCreateCopy.stepBody}</p>
              </div>
              <Input name="name" placeholder={dict.lists.namePlaceholder} aria-label={dict.lists.nameLabel} required />
              <Textarea name="description" placeholder={dict.lists.descriptionPlaceholder} aria-label={dict.lists.descriptionLabel} />
              <Input name="coverColor" placeholder={dict.lists.colorPlaceholder} aria-label={dict.lists.colorLabel} />
              <FormSubmitButton fullWidth pendingLabel="Bezig...">
                {consumerCreateCopy.button}
                <ArrowRight className="h-4 w-4" />
              </FormSubmitButton>
            </form>
            <div className="rounded-2xl bg-white p-4 shadow-[var(--shadow-soft)] text-sm leading-6 text-[var(--muted-foreground)]">
              {consumerCreateCopy.helper}
            </div>
          </div>
        </section>
      )}
      {audience === "business" && activeLists.length > 0 ? (
        <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white px-4 py-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <FileSpreadsheet className="h-4 w-4 text-[var(--accent)]" />
            Werk verder in je laatste importlijst
          </div>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Je hoeft niet eerst door de lijst heen te zoeken. Open direct de CSV-import of ga meteen door naar de dagindeling van je
            meest recente actieve lijst.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href={`/lists/${activeLists[0].id}?focus=csv-import#csv-import`}
              className="flex min-h-[120px] flex-col items-start justify-between rounded-2xl bg-[var(--accent)] px-4 py-4 text-white shadow-[var(--shadow)]"
            >
              <FileSpreadsheet className="h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">Open CSV-import</p>
                <p className="mt-1 text-xs leading-5 text-white/80">Voeg adressen toe uit bestand of controleer je preview opnieuw.</p>
              </div>
            </Link>
            <Link
              href={`/today?listId=${activeLists[0].id}`}
              className="flex min-h-[120px] flex-col items-start justify-between rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-[var(--foreground)]"
            >
              <Route className="h-5 w-5 text-[var(--accent)]" />
              <div>
                <p className="text-sm font-semibold">Werk dagvolgorde uit</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">Laat de dag logisch ordenen rond open adressen en afspraken.</p>
              </div>
            </Link>
            <a
              href="/examples/makelaars-import-voorbeeld.csv"
              download
              className="flex min-h-[120px] flex-col items-start justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] px-4 py-4 text-[var(--foreground)]"
            >
              <Download className="h-5 w-5 text-[var(--accent)]" />
              <div>
                <p className="text-sm font-semibold">Download voorbeeld-CSV</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">Gebruik dit als sjabloon voor naam, adres, stad, notitie en categorie.</p>
              </div>
            </a>
          </div>
        </section>
      ) : null}
      <section className="space-y-3">
        <SectionHeader
          title={audience === "business" ? businessTopCopy.activeTitle : dict.lists.activeTitle}
          subtitle={audience === "business" ? businessTopCopy.activeSubtitle : dict.lists.activeSubtitle}
        />
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
              <div className="grid gap-2 sm:grid-cols-3">
                {audience === "business" ? (
                  <>
                    <Link
                      href={`/lists/${list.id}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                    >
                      <FolderOpen className="h-4 w-4 text-[var(--accent)]" />
                      Open lijst
                    </Link>
                    <Link
                      href={`/lists/${list.id}?focus=csv-import#csv-import`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--border)] bg-white px-3 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-[var(--accent)]" />
                      CSV-import
                    </Link>
                    <Link
                      href={`/today?listId=${list.id}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-3 text-sm font-semibold text-white shadow-[var(--shadow)]"
                    >
                      <Route className="h-4 w-4" />
                      Werk dagvolgorde uit
                    </Link>
                  </>
                ) : (
                  <div className="flex flex-wrap justify-end gap-2 pr-1 sm:col-span-3">
                    <form action={duplicateListAction}>
                      <input type="hidden" name="listId" value={list.id} />
                      <FormSubmitButton
                        type="submit"
                        variant="ghost"
                        size="sm"
                        pendingLabel="Bezig..."
                        className="min-h-8 rounded-xl px-2.5 text-xs font-medium text-[var(--muted-foreground)]"
                      >
                        {dict.lists.duplicate}
                      </FormSubmitButton>
                    </form>
                  </div>
                )}
              </div>
              {audience === "business" ? (
                <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
                  Handige volgorde: eerst import of controle, daarna pas dagvolgorde en navigatie.
                </div>
              ) : null}
            </div>
          ))
        ) : (
          <EmptyState
            title={audience === "business" ? "Nog geen werklijsten" : dict.lists.noLists}
            description={
              audience === "business"
                ? "Maak hierboven eerst een importlijst aan. Daarna kun je CSV uploaden, adressen controleren en pas dan de dagvolgorde uitwerken."
                : dict.lists.noListsBody
            }
          />
        )}
      </section>
      {archivedLists.length > 0 ? (
        <section className="space-y-3">
          <SectionHeader title={dict.lists.archivedTitle} subtitle={dict.lists.archivedSubtitle} />
          {archivedLists.map((list) => (
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
              {user && list.ownerUserId === user.id ? (
                <div className="flex justify-end pr-1">
                  <form action={deleteArchivedListAction}>
                    <input type="hidden" name="listId" value={list.id} />
                    <FormSubmitButton
                      type="submit"
                      variant="ghost"
                      size="sm"
                      pendingLabel="Bezig..."
                      className="min-h-8 rounded-xl px-2.5 text-xs font-medium text-[var(--danger)]"
                    >
                      {dict.lists.deleteArchivedButton}
                    </FormSubmitButton>
                  </form>
                </div>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}
      {audience === "business" ? (
        <details className="rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
          <summary className="cursor-pointer list-none text-[15px] font-semibold">Toch liever handmatig beginnen?</summary>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            Gebruik dit alleen voor losse adressen of uitzonderingen. Voor de meeste zakelijke dagen blijft CSV-import de snelste start.
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
      ) : null}
    </PageContainer>
  );
}
