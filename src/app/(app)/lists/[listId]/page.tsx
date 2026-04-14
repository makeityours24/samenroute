import Link from "next/link";
import { notFound } from "next/navigation";
import { AppTopBar } from "@/components/navigation/app-topbar";
import { CsvImportForm } from "@/components/lists/csv-import-form";
import { InviteMemberForm } from "@/components/members/invite-member-form";
import { MemberRow } from "@/components/members/member-row";
import { LazyMap } from "@/components/map/lazy-map";
import { MapPinsPanel } from "@/components/map/map-pins-panel";
import { ListDetailHeader } from "@/components/lists/list-detail-header";
import { ListPlacesPanel } from "@/components/lists/list-places-panel";
import { PlaceForm } from "@/components/places/place-form";
import { getCurrentUser } from "@/lib/auth/auth";
import { env } from "@/lib/env/env";
import { archiveListAction } from "@/app/(app)/actions";
import { ListRepository } from "@/server/repositories/list.repository";
import { PlaceRepository } from "@/server/repositories/place.repository";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import { addPlaceAction, importListPlacesAction, submitShareListAction, updateListAction, updateListPlaceAndPlaceAction } from "@/app/(app)/actions";
import { getDictionary } from "@/lib/i18n/server";
import { ListMemberRole } from "@/server/domain/enums";
import { getUserBehaviorInsightsService } from "@/server/services/behavior/get-user-behavior-insights.service";
import { suggestDayPlans } from "@/server/services/routes/suggest-day-plans.service";

const listRepository = new ListRepository();
const placeRepository = new PlaceRepository();

export default async function ListDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ listId: string }>;
  searchParams?: Promise<{ edit?: string; import?: string; count?: string; skipped?: string; message?: string }>;
}) {
  const { listId } = await params;
  const query = searchParams ? await searchParams : undefined;
  const { dict } = await getDictionary();
  const user = await getCurrentUser();
  const list = user ? await listRepository.findDetail(listId, user.id) : null;
  const categories = await placeRepository.listCategories();

  if (!list) {
    notFound();
  }

  const plannedCount = list.listPlaces.filter((item) => item.status === "PLANNED").length;
  const visitedCount = list.listPlaces.filter((item) => item.status === "VISITED").length;
  const editingListPlace = query?.edit ? list.listPlaces.find((item) => item.id === query.edit) : null;
  const importStatus = query?.import;
  const importedCount = Number(query?.count ?? 0);
  const skippedCount = Number(query?.skipped ?? 0);
  const importMessage = query?.message ?? "";
  const membershipRole = list.ownerUserId === user?.id ? ListMemberRole.OWNER : (list.members.find((member) => member.userId === user?.id)?.role ?? undefined);
  const canMutateList = membershipRole === ListMemberRole.OWNER || membershipRole === ListMemberRole.EDITOR;
  const canManageMembers = membershipRole === ListMemberRole.OWNER;
  const behavior = user ? await getUserBehaviorInsightsService(user.id) : null;
  const dayPlans =
    behavior
      ? suggestDayPlans({
          candidates: list.listPlaces
            .filter((item) => item.status === "PLANNED" && item.includeInRoute)
            .map((item) => ({
              id: item.id,
              priority: item.priority,
              sortOrder: item.sortOrder,
              place: {
                name: item.place.name,
                latitude: item.place.latitude,
                longitude: item.place.longitude,
                categoryName: item.place.category?.name
              }
            })),
          stopsPerDay: behavior.recommendedDayStopCount,
          transportMode: behavior.recommendedTransportMode
        })
      : [];

  return (
    <PageContainer className="gap-4">
      <AppTopBar
        title={list.name}
        subtitle={dict.listDetail.topSubtitle}
        backHref="/lists"
        backLabel={dict.common.back}
      />
      <ListDetailHeader
        title={list.name}
        description={list.description}
        plannedCount={plannedCount}
        visitedCount={visitedCount}
        shareHref={canManageMembers ? `/lists/${list.id}/members` : undefined}
        editHref={canMutateList ? "#list-settings" : undefined}
        copy={{
          headerBadge: dict.listDetail.headerBadge,
          noDescription: dict.listDetail.noDescription,
          planned: dict.listDetail.planned,
          visited: dict.listDetail.visited,
          planToday: dict.listDetail.planToday,
          actionsHint: dict.listDetail.actionsHint,
          todayLabel: dict.listDetail.todayLabel,
          manageLabel: dict.listDetail.manageLabel,
          edit: dict.listDetail.editListCta,
          editDisabled: dict.listDetail.viewOnlyCta,
          map: dict.listDetail.mapTitle,
          share: dict.listDetail.sharedMembers,
          shareDisabled: dict.listDetail.sharedViewOnly
        }}
        planTodayHref={`/today?listId=${list.id}`}
      />
      {dayPlans.length > 1 ? (
        <Card className="space-y-3 border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)]">
          <SectionHeader
            title={dict.listDetail.multiDayTitle.replace("{count}", String(dayPlans.length))}
            subtitle={dict.listDetail.multiDayBody
              .replace("{day}", dayPlans[0]?.title ?? "Dag 1")
              .replace("{mode}", canManageMembers ? dict.listDetail.multiDayGroupMode : dict.listDetail.multiDaySoloMode)}
            action={
              <Link href={`/today?listId=${list.id}&day=1`} className="text-sm font-semibold text-[var(--accent)]">
                {dict.listDetail.multiDayAction}
              </Link>
            }
          />
        </Card>
      ) : null}
      <section className="space-y-3 pt-1">
        <SectionHeader title={dict.listDetail.placesTitle} subtitle={dict.listDetail.placesSubtitle} />
        {importStatus === "success" ? (
          <div className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--foreground)] shadow-[var(--shadow-soft)]">
            {importedCount} plekken geimporteerd.
            {skippedCount > 0 ? ` ${skippedCount} regels zijn overgeslagen omdat ze leeg of dubbel waren.` : ""}
          </div>
        ) : null}
        {importStatus === "error" && importMessage ? (
          <div className="rounded-[var(--radius)] border border-[color:rgba(185,56,47,0.16)] bg-[color:rgba(185,56,47,0.08)] px-4 py-3 text-sm text-[var(--foreground)] shadow-[var(--shadow-soft)]">
            {importMessage}
          </div>
        ) : null}
        <ListPlacesPanel
          items={list.listPlaces.map((item) => ({
            id: item.id,
            listId: list.id,
            name: item.place.name,
            location: [item.place.addressLine, item.place.city, item.place.country].filter(Boolean).join(", ") || dict.listDetail.noAddress,
            category: item.place.category?.name,
            note: item.note,
            status: item.status,
            priority: item.priority,
            sortOrder: item.sortOrder,
            isFavorite: item.isFavorite,
            includeInRoute: item.includeInRoute,
            createdAt: item.createdAt.toISOString(),
            visitedAt: item.visitedAt?.toISOString() ?? null,
            visitedByName: item.visitedByUser?.name ?? item.visitedByUser?.email ?? null
          }))}
          returnPath={`/lists/${list.id}`}
          copy={dict.listDetail}
        />
      </section>
      {canMutateList ? (
        <details className="rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
          <summary className="cursor-pointer list-none text-[15px] font-semibold">CSV importeren</summary>
          <div className="mt-4 space-y-4">
            <SectionHeader
              title="Plekken in bulk toevoegen"
              subtitle="Handig als je al een adressenlijst uit Excel, CRM of planning hebt."
            />
            <CsvImportForm action={importListPlacesAction} listId={list.id} />
          </div>
        </details>
      ) : null}
      {canMutateList ? (
        <details
          id="list-settings"
          className="rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]"
        >
          <summary className="cursor-pointer list-none text-[15px] font-semibold">{dict.listDetail.editListSummary}</summary>
          <div className="mt-4 space-y-4">
            <SectionHeader title={dict.listDetail.editListTitle} subtitle={dict.listDetail.editListSubtitle} />
            <form action={updateListAction} className="space-y-3">
              <input type="hidden" name="listId" value={list.id} />
              <Input
                name="name"
                defaultValue={list.name}
                placeholder={dict.lists.namePlaceholder}
                aria-label={dict.lists.nameLabel}
                required
              />
              <Textarea
                name="description"
                defaultValue={list.description ?? ""}
                placeholder={dict.lists.descriptionPlaceholder}
                aria-label={dict.lists.descriptionLabel}
              />
              <Input
                name="coverColor"
                defaultValue={list.coverColor ?? ""}
                placeholder={dict.lists.colorPlaceholder}
                aria-label={dict.lists.colorLabel}
              />
              <Button type="submit" fullWidth>
                {dict.listDetail.saveList}
              </Button>
            </form>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">{dict.listDetail.removeListTitle}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{dict.listDetail.removeListBody}</p>
              <form action={archiveListAction} className="mt-3">
                <input type="hidden" name="listId" value={list.id} />
                <Button variant="danger" type="submit" fullWidth>
                  {dict.listDetail.removeListButton}
                </Button>
              </form>
            </div>
          </div>
        </details>
      ) : null}
      {canMutateList ? (
        <details id="add-place" className="rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]" open={Boolean(editingListPlace)}>
        <summary className="cursor-pointer list-none text-[15px] font-semibold">
          {editingListPlace ? dict.listDetail.edit : dict.listDetail.addPlaceSummary}
        </summary>
        <div className="mt-4">
          <PlaceForm
            action={editingListPlace ? updateListPlaceAndPlaceAction : addPlaceAction}
            listId={list.id}
            categories={categories.map((category) => ({ id: category.id, name: category.name }))}
            enableLookup={Boolean(env.GOOGLE_MAPS_PLACE_API_KEY)}
            initialValues={
              editingListPlace
                ? {
                    name: editingListPlace.place.name,
                    addressLine: editingListPlace.place.addressLine ?? "",
                    city: editingListPlace.place.city ?? "",
                    country: editingListPlace.place.country ?? "",
                    categoryId: editingListPlace.place.categoryId ?? "",
                    note: editingListPlace.note ?? "",
                    priority: editingListPlace.priority,
                    includeInRoute: editingListPlace.includeInRoute,
                    isFavorite: editingListPlace.isFavorite,
                    externalSourceId: editingListPlace.place.externalSourceId ?? "",
                    latitude: editingListPlace.place.latitude ? Number(editingListPlace.place.latitude) : null,
                    longitude: editingListPlace.place.longitude ? Number(editingListPlace.place.longitude) : null,
                    googleMapsUrl: editingListPlace.place.googleMapsUrl ?? ""
                  }
                : undefined
            }
            copy={dict.listDetail.placeForm}
            footer={
              <>
                {editingListPlace ? <input type="hidden" name="listPlaceId" value={editingListPlace.id} /> : null}
                {editingListPlace ? <input type="hidden" name="placeId" value={editingListPlace.placeId} /> : null}
                <div className="grid grid-cols-2 gap-2">
                  {editingListPlace ? (
                    <Link
                      href={`/lists/${list.id}`}
                      className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                    >
                      {dict.common.back}
                    </Link>
                  ) : (
                    <span />
                  )}
                  <Button type="submit" fullWidth>
                    {editingListPlace ? dict.listDetail.edit : dict.listDetail.savePlace}
                  </Button>
                </div>
              </>
            }
          />
        </div>
        </details>
      ) : null}
      <section className="space-y-3">
        <SectionHeader title={dict.listDetail.mapTitle} subtitle={dict.listDetail.mapSubtitle} />
        {list.listPlaces.length > 0 ? (
          <>
            <LazyMap
              title={dict.listDetail.mapCardTitle}
              items={list.listPlaces.map((item) => ({ id: item.id, name: item.place.name }))}
              browserKeyAvailable={Boolean(env.GOOGLE_MAPS_BROWSER_KEY)}
              copy={{
                unavailableTitle: dict.listDetail.mapUnavailable,
                unavailableBody: dict.listDetail.mapUnavailableBody,
                loaded: dict.listDetail.mapLoaded,
                selectedPlaces: dict.listDetail.mapSelectedPlaces
              }}
            />
            <MapPinsPanel
              items={list.listPlaces.map((item) => ({ id: item.id, name: item.place.name }))}
              copy={{
                title: dict.listDetail.selectedPlaces,
                pins: dict.listDetail.pins,
                current: dict.listDetail.current
              }}
            />
          </>
        ) : (
          <EmptyState title={dict.listDetail.noMapItems} description={dict.listDetail.noMapItemsBody} />
        )}
      </section>
      <details className="rounded-[var(--radius)] border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
        <summary className="cursor-pointer list-none text-[15px] font-semibold">{dict.listDetail.sharedMembers}</summary>
        <div className="mt-4 space-y-4">
          <SectionHeader
            title={dict.listDetail.membersTitle}
            subtitle={dict.listDetail.membersSubtitle}
            action={
              canManageMembers ? (
              <Link href={`/lists/${list.id}/members`} className="text-sm font-semibold text-[var(--accent)]">
                {dict.listDetail.openMembers}
              </Link>
              ) : null
            }
          />
          {list.members.slice(0, 3).map((member) => (
            <MemberRow
              key={member.id}
              email={member.user.email}
              role={member.role}
              labels={{ owner: dict.members.owner, editor: dict.members.editor, viewer: dict.members.viewer }}
            />
          ))}
          {canManageMembers ? (
            <InviteMemberForm
              action={submitShareListAction}
              listId={list.id}
              submitLabel={dict.listDetail.inviteMember}
              copy={{
                emailPlaceholder: dict.members.emailPlaceholder,
                emailLabel: dict.members.emailLabel,
                roleLabel: dict.members.roleLabel,
                viewer: dict.members.viewer,
                editor: dict.members.editor,
                successMessage: "Uitnodiging verstuurd."
              }}
            />
          ) : null}
        </div>
      </details>
      <StickyActionBar>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/today?listId=${list.id}`}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
          >
            {dict.listDetail.planToday}
          </Link>
          {list.routePlans[0] ? (
            <Link
              href={`/route/${list.routePlans[0].id}`}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow)]"
            >
              {dict.listDetail.openRoute}
            </Link>
          ) : (
            <Link
              href={`/today?listId=${list.id}`}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow)]"
            >
              {dict.listDetail.addToRoute}
            </Link>
          )}
        </div>
      </StickyActionBar>
    </PageContainer>
  );
}
