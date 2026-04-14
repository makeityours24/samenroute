import { AppTopBar } from "@/components/navigation/app-topbar";
import { ActiveListCard } from "@/components/home/active-list-card";
import { ActiveRouteBanner } from "@/components/home/active-route-banner";
import { BehaviorInsightsCard } from "@/components/behavior/behavior-insights-card";
import { ProactivePlanningCard } from "@/components/home/proactive-planning-card";
import { ProgressSummaryCard } from "@/components/home/progress-summary-card";
import { QuickActions } from "@/components/home/quick-actions";
import { RecentVisitedList } from "@/components/home/recent-visited-list";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { ListRepository } from "@/server/repositories/list.repository";
import { getCurrentUser } from "@/lib/auth/auth";
import { getDictionary } from "@/lib/i18n/server";
import { getUserBehaviorInsightsService } from "@/server/services/behavior/get-user-behavior-insights.service";
import { suggestDayPlans } from "@/server/services/routes/suggest-day-plans.service";

const listRepository = new ListRepository();

export default async function HomePage() {
  const user = await getCurrentUser();
  const { dict } = await getDictionary();
  const summary = user ? await listRepository.getHomeSummary(user.id) : null;
  const behavior = user ? await getUserBehaviorInsightsService(user.id) : null;
  const activeListDetail = user && summary ? await listRepository.findDetail(summary.id, user.id) : null;
  const pendingCount = summary?.listPlaces.filter((item) => item.status === "PLANNED").length ?? 0;
  const visited = summary?.listPlaces.filter((item) => item.status === "VISITED").slice(0, 3) ?? [];
  const dayPlans =
    activeListDetail && behavior
      ? suggestDayPlans({
          candidates: activeListDetail.listPlaces
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
  const proactiveDayPlan = !summary?.routePlans[0] && dayPlans.length > 1 ? dayPlans[0] : null;
  const proactiveDayBody = proactiveDayPlan
    ? dict.home.proactiveMultiDayBody
        .replace("{day}", proactiveDayPlan.title)
        .replace("{count}", String(proactiveDayPlan.stopIds.length))
    : "";
  const isSharedList = (activeListDetail?.members.length ?? 0) > 1;

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
          {proactiveDayPlan ? (
            <ProactivePlanningCard
              eyebrow={dict.home.proactivePlanningEyebrow}
              title={dict.home.proactiveMultiDayTitle.replace("{count}", String(dayPlans.length))}
              body={proactiveDayBody}
              steps={[
                dict.home.proactiveStepList,
                dict.home.proactiveStepDay.replace("{day}", proactiveDayPlan.title),
                dict.home.proactiveStepRoute
              ]}
              buttonLabel={dict.home.proactiveMultiDayCta}
              href={`/today?listId=${summary.id}&day=${proactiveDayPlan.dayNumber}`}
              secondaryLabel={isSharedList ? dict.home.proactiveShareCta : undefined}
              secondaryHref={isSharedList ? `/today?listId=${summary.id}&day=${proactiveDayPlan.dayNumber}` : undefined}
            />
          ) : null}
          {behavior ? (
            <BehaviorInsightsCard
              title={dict.home.behaviorTitle}
              subtitle={dict.home.behaviorSubtitle}
              categories={behavior.topCategories}
              topCategoriesLabel={dict.home.behaviorTopCategories}
              favoritesLabel={dict.home.behaviorFavorites}
              favoritesCount={behavior.favoriteCount}
              visitsLabel={dict.home.behaviorVisits}
              visitsCount={behavior.visitedCount}
            />
          ) : null}
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
          {behavior ? (
            <BehaviorInsightsCard
              title={dict.home.behaviorTitle}
              subtitle={dict.home.behaviorSubtitle}
              categories={behavior.topCategories}
              topCategoriesLabel={dict.home.behaviorTopCategories}
              favoritesLabel={dict.home.behaviorFavorites}
              favoritesCount={behavior.favoriteCount}
              visitsLabel={dict.home.behaviorVisits}
              visitsCount={behavior.visitedCount}
            />
          ) : null}
        </>
      )}
    </PageContainer>
  );
}
