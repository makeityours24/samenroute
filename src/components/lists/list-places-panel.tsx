"use client";

import { useMemo, useState } from "react";
import { deleteListPlaceAction, markSkippedAction, markVisitedAction, reorderListPlaceAction, toggleFavoriteListPlaceAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { PlaceFilters } from "@/components/lists/place-filters";
import { PlaceRow } from "@/components/lists/place-row";

type PlaceItem = {
  id: string;
  listId: string;
  name: string;
  location: string;
  category?: string | null;
  note?: string | null;
  status: "PLANNED" | "VISITED" | "SKIPPED";
  priority: number;
  sortOrder: number;
  isFavorite: boolean;
  includeInRoute: boolean;
};

export function ListPlacesPanel({
  items,
  returnPath,
  copy
}: {
  items: PlaceItem[];
  returnPath: string;
  copy?: {
    filters: { all: string; planned: string; visited: string; skipped: string; favorites: string };
    sortLabel: string;
    listHint: string;
    sorts: { manual: string; recent: string; priority: string };
    emptyPlaces: string;
    emptyPlacesBody: string;
    emptyFilter: string;
    emptyFilterBody: string;
    markVisited: string;
    skip: string;
    edit: string;
    favorite: string;
    unfavorite: string;
    moveUp: string;
    moveDown: string;
    delete: string;
    inRoute: string;
    excluded: string;
    priorityLabel: string;
    openActions: string;
    status: { planned: string; visited: string; skipped: string };
  };
}) {
  const labels = copy ?? {
    filters: { all: "All", planned: "Planned", visited: "Visited", skipped: "Skipped", favorites: "Favorites" },
    sortLabel: "Sort places",
    listHint: "Handle quick actions here. Open the menu for editing, reordering, and deleting.",
    sorts: { manual: "Manual order", recent: "Alphabetical", priority: "Priority" },
    emptyPlaces: "No places yet",
    emptyPlacesBody: "Add your first place to start planning this list.",
    emptyFilter: "Nothing matches this filter",
    emptyFilterBody: "Try another filter or add more places.",
    markVisited: "Mark visited",
    skip: "Skip",
    edit: "Edit",
    favorite: "Favorite",
    unfavorite: "Unfavorite",
    moveUp: "Move up",
    moveDown: "Move down",
    delete: "Delete",
    inRoute: "In route",
    excluded: "Excluded",
    priorityLabel: "Priority",
    openActions: "Open actions",
    status: { planned: "Planned", visited: "Visited", skipped: "Skipped" }
  };

  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("manual");

  const filtered = useMemo(() => {
    const next = items.filter((item) => {
      if (filter === "favorites") return item.isFavorite;
      if (filter === "all") return true;
      return item.status.toLowerCase() === filter;
    });

    return next.sort((left, right) => {
      if (sort === "priority") return right.priority - left.priority;
      if (sort === "recent") return left.name.localeCompare(right.name);
      if (sort === "manual") return left.sortOrder - right.sortOrder;
      return 0;
    });
  }, [filter, items, sort]);

  if (items.length === 0) {
    return <EmptyState title={labels.emptyPlaces} description={labels.emptyPlacesBody} />;
  }

  return (
    <div className="min-w-0 space-y-3">
      <div className="min-w-0 space-y-2 overflow-hidden rounded-[22px] border border-[var(--border)] bg-white/86 p-2 shadow-[var(--shadow-soft)]">
        <PlaceFilters value={filter} onChange={setFilter} labels={labels.filters} />
        <Select aria-label={labels.sortLabel} value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="manual">{labels.sorts.manual}</option>
          <option value="recent">{labels.sorts.recent}</option>
          <option value="priority">{labels.sorts.priority}</option>
        </Select>
        <p className="px-1 pb-1 text-xs leading-5 text-[var(--muted-foreground)]">{labels.listHint}</p>
      </div>
      <div className="min-w-0 space-y-3" data-testid="filtered-places">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <PlaceRow
              key={item.id}
              name={item.name}
              location={item.location}
              category={item.category}
              note={item.note}
              status={item.status}
              priority={item.priority}
              isFavorite={item.isFavorite}
              includeInRoute={item.includeInRoute}
              copy={{
                inRoute: labels.inRoute,
                excluded: labels.excluded,
                priorityLabel: labels.priorityLabel,
                openActions: labels.openActions,
                status: labels.status
              }}
              primaryActions={
                <>
                  <form action={markVisitedAction}>
                    <input type="hidden" name="listPlaceId" value={item.id} />
                    <input type="hidden" name="returnPath" value={returnPath} />
                    <Button type="submit" size="sm" fullWidth className="truncate">
                      {labels.markVisited}
                    </Button>
                  </form>
                  <form action={markSkippedAction}>
                    <input type="hidden" name="listPlaceId" value={item.id} />
                    <input type="hidden" name="returnPath" value={returnPath} />
                    <Button type="submit" size="sm" variant="secondary" fullWidth className="truncate">
                      {labels.skip}
                    </Button>
                  </form>
                </>
              }
              secondaryActions={
                <>
                  <a
                    href={`${returnPath}?edit=${item.id}#add-place`}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 text-base font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
                  >
                    {labels.edit}
                  </a>
                  <form action={toggleFavoriteListPlaceAction}>
                    <input type="hidden" name="listPlaceId" value={item.id} />
                    <input type="hidden" name="returnPath" value={returnPath} />
                    <input type="hidden" name="nextValue" value={String(!item.isFavorite)} />
                    <Button type="submit" variant="secondary" fullWidth className="text-base">
                      {item.isFavorite ? labels.unfavorite : labels.favorite}
                    </Button>
                  </form>
                  {sort === "manual" ? (
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--surface-subtle)] p-2">
                      <form action={reorderListPlaceAction}>
                        <input type="hidden" name="listId" value={item.listId} />
                        <input type="hidden" name="listPlaceId" value={item.id} />
                        <input type="hidden" name="direction" value="up" />
                        <input type="hidden" name="returnPath" value={returnPath} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          fullWidth
                          className="truncate"
                          disabled={item.sortOrder === 0}
                        >
                          {labels.moveUp}
                        </Button>
                      </form>
                      <form action={reorderListPlaceAction}>
                        <input type="hidden" name="listId" value={item.listId} />
                        <input type="hidden" name="listPlaceId" value={item.id} />
                        <input type="hidden" name="direction" value="down" />
                        <input type="hidden" name="returnPath" value={returnPath} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="ghost"
                          fullWidth
                          className="truncate"
                          disabled={item.sortOrder === items.length - 1}
                        >
                          {labels.moveDown}
                        </Button>
                      </form>
                    </div>
                  ) : null}
                  <div className="pt-2">
                    <form action={deleteListPlaceAction}>
                      <input type="hidden" name="listPlaceId" value={item.id} />
                      <input type="hidden" name="returnPath" value={returnPath} />
                      <Button type="submit" variant="danger" fullWidth className="text-base">
                        {labels.delete}
                      </Button>
                    </form>
                  </div>
                </>
              }
            />
          ))
        ) : (
          <EmptyState title={labels.emptyFilter} description={labels.emptyFilterBody} />
        )}
      </div>
    </div>
  );
}
