import { AppTopBar } from "@/components/navigation/app-topbar";
import { ActiveListCard } from "@/components/home/active-list-card";
import { ActiveRouteBanner } from "@/components/home/active-route-banner";
import { ProgressSummaryCard } from "@/components/home/progress-summary-card";
import { QuickActions } from "@/components/home/quick-actions";
import { RecentVisitedList } from "@/components/home/recent-visited-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { ListRepository } from "@/server/repositories/list.repository";
import { getCurrentUser } from "@/lib/auth/auth";
import { getDictionary } from "@/lib/i18n/server";

const listRepository = new ListRepository();

export default async function HomePage() {
  const user = await getCurrentUser();
  const { dict } = await getDictionary();
  const summary = user ? await listRepository.getHomeSummary(user.id) : null;
  const pendingCount = summary?.listPlaces.filter((item) => item.status === "PLANNED").length ?? 0;
  const visited = summary?.listPlaces.filter((item) => item.status === "VISITED").slice(0, 3) ?? [];

  return (
    <PageContainer className="gap-4">
      <AppTopBar title={dict.home.topTitle} subtitle={dict.home.topSubtitle} />
      {summary ? (
        <>
          <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {dict.home.flowHint}
          </div>
          <ActiveListCard
            listName={summary.name}
            pendingCount={pendingCount}
            visitedCount={visited.length}
            href={`/lists/${summary.id}`}
            badgeLabel={dict.home.activeList}
            pendingLabel={dict.home.leftToVisit}
            visitedLabel={dict.home.alreadyVisited}
            openLabel={dict.home.openActiveList}
          />
          <QuickActions
            addPlaceLabel={dict.home.addPlace}
            addPlaceHint={dict.home.addPlaceHint}
            planTodayLabel={dict.home.planToday}
            planTodayHint={dict.home.planTodayHint}
          />
          <ProgressSummaryCard
            placesLeft={pendingCount}
            hasActiveRoute={Boolean(summary.routePlans[0])}
            placesLeftLabel={dict.home.placesLeft}
            routeInProgressLabel={dict.home.routeInProgress}
            yesLabel={dict.home.yes}
            noLabel={dict.home.no}
          />
          {summary.routePlans[0] ? (
            <ActiveRouteBanner
              href={`/route/${summary.routePlans[0].id}`}
              eyebrow={dict.home.currentRoute}
              title={dict.home.continueRoute}
              buttonLabel={dict.home.resumeRoute}
            />
          ) : null}
          <section className="space-y-3 pt-1">
            <SectionHeader title={dict.home.recentVisited} subtitle={dict.home.recentVisitedSubtitle} />
            {visited.length > 0 ? (
              <RecentVisitedList
                items={visited.map((item) => ({
                  id: item.id,
                  name: item.place.name,
                  location: item.place.city ?? item.place.country ?? dict.common.unknownLocation
                }))}
                badgeLabel={dict.history.visited}
              />
            ) : (
              <EmptyState title={dict.home.noVisits} description={dict.home.noVisitsBody} />
            )}
          </section>
        </>
      ) : (
        <>
          <EmptyState title={dict.home.noActiveList} description={dict.home.noActiveListBody} />
          <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {dict.home.flowHint}
          </div>
          <QuickActions
            addPlaceLabel={dict.home.addPlace}
            addPlaceHint={dict.home.addPlaceHint}
            planTodayLabel={dict.home.planToday}
            planTodayHint={dict.home.planTodayHint}
          />
        </>
      )}
    </PageContainer>
  );
}
