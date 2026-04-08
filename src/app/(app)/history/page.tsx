import { AppTopBar } from "@/components/navigation/app-topbar";
import { HistoryGroup } from "@/components/history/history-group";
import { HistorySummary } from "@/components/history/history-summary";
import { getCurrentUser } from "@/lib/auth/auth";
import { getHistoryService } from "@/server/services/history/get-history.service";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { getDictionary } from "@/lib/i18n/server";

export default async function HistoryPage() {
  const user = await getCurrentUser();
  const { locale, dict } = await getDictionary();
  const history = user ? await getHistoryService(user) : [];
  const localeTag = locale === "nl" ? "nl-NL" : locale === "tr" ? "tr-TR" : "en-US";
  const visitedLogs = history.filter((item) => item.actionType === "list.place_visited");
  const grouped = history.reduce<Record<string, typeof history>>((accumulator, item) => {
    const key = item.createdAt.toISOString().slice(0, 10);
    const existing = accumulator[key] ?? [];
    existing.push(item);
    accumulator[key] = existing;
    return accumulator;
  }, {});
  const groupedEntries = Object.entries(grouped).sort(([left], [right]) => right.localeCompare(left));

  return (
    <PageContainer>
      <AppTopBar title={dict.history.topTitle} subtitle={dict.history.topSubtitle} />
      <HistorySummary
        visitedCount={visitedLogs.length}
        logCount={history.length}
        visitedLabel={dict.history.visited}
        entriesLabel={dict.history.entries}
      />
      <section className="space-y-3">
        <SectionHeader title={dict.history.topTitle} subtitle={dict.history.topSubtitle} />
        <p className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">{dict.history.flowHint}</p>
        {history.length > 0 ? (
          groupedEntries.map(([date, items]) =>
            items ? (
              <HistoryGroup
                key={date}
                heading={new Date(`${date}T12:00:00.000Z`).toLocaleDateString(localeTag)}
                items={items.map((item) => ({
                  id: item.id,
                  action: dict.history.actions[item.actionType as keyof typeof dict.history.actions] ?? item.actionType,
                  listName: item.list?.name ?? dict.history.listRemoved,
                  dateLabel: item.createdAt.toLocaleString(localeTag)
                }))}
              />
            ) : null
          )
        ) : (
          <EmptyState title={dict.history.empty} description={dict.history.emptyBody} />
        )}
      </section>
    </PageContainer>
  );
}
