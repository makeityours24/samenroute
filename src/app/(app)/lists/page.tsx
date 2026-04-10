import { getCurrentUser } from "@/lib/auth/auth";
import { duplicateListAction } from "@/app/(app)/actions";
import { AppTopBar } from "@/components/navigation/app-topbar";
import { ListCard } from "@/components/lists/list-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ListRepository } from "@/server/repositories/list.repository";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";
import { createListAction } from "@/app/(app)/actions";
import { getDictionary } from "@/lib/i18n/server";

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
                  <Button type="submit" variant="ghost" size="sm">
                    {dict.lists.duplicate}
                  </Button>
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
        <summary className="cursor-pointer list-none text-[15px] font-semibold">{dict.lists.createSummary}</summary>
        <form action={createListAction} className="mt-4 space-y-3">
          <Input name="name" placeholder={dict.lists.namePlaceholder} aria-label={dict.lists.nameLabel} required />
          <Textarea name="description" placeholder={dict.lists.descriptionPlaceholder} aria-label={dict.lists.descriptionLabel} />
          <Input name="coverColor" placeholder={dict.lists.colorPlaceholder} aria-label={dict.lists.colorLabel} />
          <StickyActionBar>
            <Button type="submit" fullWidth>
              {dict.lists.createButton}
            </Button>
          </StickyActionBar>
        </form>
      </details>
    </PageContainer>
  );
}
