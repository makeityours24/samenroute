import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileSpreadsheet } from "lucide-react";
import { AppTopBar } from "@/components/navigation/app-topbar";
import { ActiveListCard } from "@/components/home/active-list-card";
import { ActiveDayStatusCard } from "@/components/home/active-day-status-card";
import { ActiveRouteBanner } from "@/components/home/active-route-banner";
import { BehaviorInsightsCard } from "@/components/behavior/behavior-insights-card";
import { ProactivePlanningCard } from "@/components/home/proactive-planning-card";
import { ProgressSummaryCard } from "@/components/home/progress-summary-card";
import { QuickActions } from "@/components/home/quick-actions";
import { RecentVisitedList } from "@/components/home/recent-visited-list";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { ListRepository } from "@/server/repositories/list.repository";
import { getCurrentUser } from "@/lib/auth/auth";
import { getDictionary } from "@/lib/i18n/server";
import { getUserBehaviorInsightsService } from "@/server/services/behavior/get-user-behavior-insights.service";
import { ListDayPlanSelectionRepository } from "@/server/repositories/list-day-plan-selection.repository";
import { suggestDayPlans } from "@/server/services/routes/suggest-day-plans.service";

const listRepository = new ListRepository();
const listDayPlanSelectionRepository = new ListDayPlanSelectionRepository();

export default async function HomePage() {
  const user = await getCurrentUser();
  const { dict } = await getDictionary();
  const summary = user ? await listRepository.getHomeSummary(user.id) : null;
  const behavior = user ? await getUserBehaviorInsightsService(user.id) : null;
  const activeListDetail = user && summary ? await listRepository.findDetail(summary.id, user.id) : null;
  const confirmedDayPlan = summary ? await listDayPlanSelectionRepository.findLatest(summary.id) : null;
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
  const selectedConfirmedPlan = confirmedDayPlan?.dayNumber ? dayPlans.find((plan) => plan.dayNumber === confirmedDayPlan.dayNumber) : null;
  const proactiveDayBody = proactiveDayPlan
    ? dict.home.proactiveMultiDayBody
        .replace("{day}", proactiveDayPlan.title)
        .replace("{count}", String(proactiveDayPlan.stopIds.length))
    : "";
  const confirmedDayBody = selectedConfirmedPlan
    ? dict.home.confirmedDayBody
        .replace("{day}", selectedConfirmedPlan.title)
        .replace("{count}", String(selectedConfirmedPlan.stopIds.length))
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
          <Card className="space-y-3 border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <BriefcaseBusiness className="h-4 w-4 text-[var(--accent)]" />
              Zakelijke werkflow
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--foreground)]">Werk verder in je actieve lijst</p>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                Gebruik je huidige lijst als vertrekpunt: open direct de CSV-import voor extra adressen of werk meteen de dagvolgorde uit.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={`/lists/${summary.id}?focus=csv-import#csv-import`}
                className="flex items-center justify-between rounded-2xl bg-[var(--accent)] px-4 py-4 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Open CSV-import
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/today?listId=${summary.id}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-sm font-semibold text-[var(--foreground)]"
              >
                <span>Werk de dagvolgorde uit</span>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </Link>
            </div>
          </Card>
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
            addPlaceHref={`/lists/${summary.id}?focus=add-place#add-place`}
            importCsvLabel={dict.home.importCsv}
            importCsvHint={dict.home.importCsvHint}
            importCsvHref={`/lists/${summary.id}?focus=csv-import#csv-import`}
            planTodayLabel={dict.home.planToday}
            planTodayHint={dict.home.planTodayHint}
            planTodayHref={`/today?listId=${summary.id}`}
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
              eyebrow={selectedConfirmedPlan ? dict.home.confirmedDayEyebrow : dict.home.proactivePlanningEyebrow}
              title={
                selectedConfirmedPlan
                  ? dict.home.confirmedDayTitle.replace("{day}", selectedConfirmedPlan.title)
                  : dict.home.proactiveMultiDayTitle.replace("{count}", String(dayPlans.length))
              }
              body={selectedConfirmedPlan ? confirmedDayBody : proactiveDayBody}
              steps={[
                selectedConfirmedPlan
                  ? dict.home.confirmedStepOne.replace("{day}", selectedConfirmedPlan.title)
                  : dict.home.proactiveStepList,
                selectedConfirmedPlan
                  ? dict.home.confirmedStepTwo
                  : dict.home.proactiveStepDay.replace("{day}", proactiveDayPlan.title),
                selectedConfirmedPlan
                  ? dict.home.confirmedStepThree
                  : dict.home.proactiveStepRoute
              ]}
              buttonLabel={selectedConfirmedPlan ? dict.home.confirmedDayCta : dict.home.proactiveMultiDayCta}
              href={`/today?listId=${summary.id}&day=${selectedConfirmedPlan?.dayNumber ?? proactiveDayPlan.dayNumber}`}
              secondaryLabel={isSharedList ? dict.home.proactiveShareCta : undefined}
              secondaryHref={
                isSharedList
                  ? `/today?listId=${summary.id}&day=${selectedConfirmedPlan?.dayNumber ?? proactiveDayPlan.dayNumber}`
                  : undefined
              }
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
            <ActiveDayStatusCard
              title={dict.home.currentRoute}
              body={dict.home.activeDayBody}
              progressLabel={dict.home.activeDayProgress}
              completedCount={summary.routePlans[0].stops.filter((stop) => stop.isCompleted).length}
              totalCount={summary.routePlans[0].stops.length}
              currentStopLabel={dict.home.activeDayCurrentStop}
              currentStop={summary.routePlans[0].stops.find((stop) => !stop.isCompleted)?.listPlace.place.name ?? dict.home.activeDayDone}
              nextStopLabel={dict.home.activeDayNextStop}
              nextStop={
                summary.routePlans[0].stops.find((stop) => stop.stopOrder === (summary.routePlans[0].stops.find((item) => !item.isCompleted)?.stopOrder ?? 0) + 1)?.listPlace.place.name ??
                dict.home.activeDayDone
              }
              buttonLabel={dict.home.resumeRoute}
              href={`/route/${summary.routePlans[0].id}`}
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
          <section className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              Zakelijke start
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">Begin je dag met een adressenlijst, niet met losse notities.</h2>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                Voor makelaars en andere afspraakgedreven teams is dit de snelste route: maak eerst een lijst, open meteen de
                CSV-import en werk daarna de dagvolgorde uit.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/lists"
                className="flex items-center justify-between rounded-2xl bg-[var(--accent)] px-4 py-4 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
              >
                <span className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Start met CSV-import
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Eerst lijst maken, daarna importeren, daarna pas je dag plannen. Zo voelt de flow direct zakelijker en rustiger.
              </div>
            </div>
          </section>
          <EmptyState title={dict.home.noActiveList} description={dict.home.noActiveListBody} />
          <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {dict.home.flowHint}
          </div>
          <QuickActions
            addPlaceLabel={dict.home.addPlace}
            addPlaceHint={dict.home.addPlaceHint}
            importCsvLabel={dict.home.importCsv}
            importCsvHint={dict.home.importCsvHint}
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
