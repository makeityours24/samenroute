import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileSpreadsheet, FolderOpen, Route } from "lucide-react";
import { AppTopBar } from "@/components/navigation/app-topbar";
import { ActiveListCard } from "@/components/home/active-list-card";
import { ActiveDayStatusCard } from "@/components/home/active-day-status-card";
import { BehaviorInsightsCard } from "@/components/behavior/behavior-insights-card";
import { GroupSignalsCard } from "@/components/home/group-signals-card";
import { NextBestStepCard } from "@/components/home/next-best-step-card";
import { ProactivePlanningCard } from "@/components/home/proactive-planning-card";
import { ProgressSummaryCard } from "@/components/home/progress-summary-card";
import { QuickActions } from "@/components/home/quick-actions";
import { RecentVisitedList } from "@/components/home/recent-visited-list";
import { ReplanSupportCard } from "@/components/home/replan-support-card";
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
  const activeListId = summary?.id ?? "";
  const activeRoute = summary?.routePlans[0];
  const currentRouteStop = activeRoute?.stops.find((stop) => !stop.isCompleted);
  const nextRouteStop = activeRoute?.stops.find((stop) => stop.stopOrder === (currentRouteStop?.stopOrder ?? 0) + 1);
  const memberInsights = activeListDetail
    ? activeListDetail.members.map((member) => {
        const addedCount = activeListDetail.listPlaces.filter((item) => item.place.createdByUser?.id === member.userId).length;
        const visitedCount = activeListDetail.listPlaces.filter((item) => item.visitedByUser?.id === member.userId).length;

        return {
          email: member.user.email,
          addedCount,
          visitedCount
        };
      })
    : [];
  const topAdder = [...memberInsights].sort((left, right) => right.addedCount - left.addedCount)[0];
  const topVisitor = [...memberInsights].sort((left, right) => right.visitedCount - left.visitedCount)[0];
  const preferredCategory = behavior?.topCategories[0] ?? dict.home.learningFallbackCategory;
  const preferredModeLabel =
    behavior?.recommendedTransportMode === "BICYCLING"
      ? dict.today.bicycling
      : behavior?.recommendedTransportMode === "DRIVING"
        ? dict.today.driving
        : behavior?.recommendedTransportMode === "TRANSIT"
          ? dict.today.transit
          : dict.today.walking;
  const nextBestStep = activeRoute
    ? {
        eyebrow: dict.home.nextStepRouteEyebrow,
        title: dict.home.nextStepRouteTitle,
        body: dict.home.nextStepRouteBody
          .replace("{current}", currentRouteStop?.listPlace.place.name ?? dict.home.activeDayDone)
          .replace("{next}", nextRouteStop?.listPlace.place.name ?? dict.home.activeDayDone),
        bullets: [
          dict.home.nextStepRouteBulletProgress
            .replace("{done}", String(activeRoute.stops.filter((stop) => stop.isCompleted).length))
            .replace("{total}", String(activeRoute.stops.length)),
          dict.home.nextStepRouteBulletCurrent.replace("{place}", currentRouteStop?.listPlace.place.name ?? dict.home.activeDayDone),
          dict.home.nextStepRouteBulletAdjust
        ],
        primaryLabel: dict.home.resumeRoute,
        primaryHref: `/route/${activeRoute.id}`,
        secondaryLabel: dict.home.nextStepAdjustDay,
        secondaryHref: `/today?listId=${activeListId}`
      }
    : selectedConfirmedPlan
      ? {
          eyebrow: dict.home.nextStepConfirmedEyebrow,
          title: dict.home.nextStepConfirmedTitle.replace("{day}", selectedConfirmedPlan.title),
          body: dict.home.nextStepConfirmedBody
            .replace("{count}", String(selectedConfirmedPlan.stopIds.length))
            .replace("{day}", selectedConfirmedPlan.title),
          bullets: [
            dict.home.nextStepConfirmedBulletOne,
            dict.home.nextStepConfirmedBulletTwo.replace("{count}", String(selectedConfirmedPlan.mustSeeVotes)),
            dict.home.nextStepConfirmedBulletThree.replace("{count}", String(selectedConfirmedPlan.todayVotes))
          ],
          primaryLabel: dict.home.confirmedDayCta,
          primaryHref: `/today?listId=${activeListId}&day=${selectedConfirmedPlan.dayNumber}`,
          secondaryLabel: isSharedList ? dict.home.proactiveShareCta : dict.home.openActiveList,
          secondaryHref: isSharedList ? `/today?listId=${activeListId}&day=${selectedConfirmedPlan.dayNumber}` : `/lists/${activeListId}`
        }
      : proactiveDayPlan
        ? {
            eyebrow: dict.home.nextStepPlanEyebrow,
            title: dict.home.nextStepPlanTitle.replace("{day}", proactiveDayPlan.title),
            body: dict.home.nextStepPlanBody
              .replace("{day}", proactiveDayPlan.title)
              .replace("{count}", String(proactiveDayPlan.stopIds.length)),
            bullets: [
              dict.home.nextStepPlanBulletOne.replace("{count}", String(dayPlans.length)),
              dict.home.nextStepPlanBulletTwo.replace("{pace}", String(behavior?.recommendedDayStopCount ?? proactiveDayPlan.stopIds.length)),
              dict.home.nextStepPlanBulletThree
            ],
            primaryLabel: dict.home.proactiveMultiDayCta,
            primaryHref: `/today?listId=${activeListId}&day=${proactiveDayPlan.dayNumber}`,
            secondaryLabel: dict.home.openActiveList,
            secondaryHref: `/lists/${activeListId}`
          }
        : {
            eyebrow: dict.home.nextStepDefaultEyebrow,
            title: dict.home.nextStepDefaultTitle,
            body: dict.home.nextStepDefaultBody,
            bullets: [
              dict.home.nextStepDefaultBulletOne,
              dict.home.nextStepDefaultBulletTwo,
              dict.home.nextStepDefaultBulletThree
            ],
            primaryLabel: dict.home.planToday,
            primaryHref: `/today?listId=${activeListId}`,
            secondaryLabel: dict.home.openActiveList,
            secondaryHref: `/lists/${activeListId}`
          };
  const learningSignals = [
    dict.home.learningSignalCategory.replace("{category}", preferredCategory),
    dict.home.learningSignalPace.replace(
      "{count}",
      String(behavior?.recommendedDayStopCount ?? Math.max(2, Math.min(pendingCount, 4)))
    ),
    dict.home.learningSignalTransport.replace("{mode}", preferredModeLabel)
  ];
  const groupSignals = isSharedList
    ? [
        topAdder?.addedCount
          ? dict.home.groupAddsSignal.replace("{email}", topAdder.email).replace("{count}", String(topAdder.addedCount))
          : null,
        topVisitor?.visitedCount
          ? dict.home.groupVisitsSignal.replace("{email}", topVisitor.email).replace("{count}", String(topVisitor.visitedCount))
          : null,
        selectedConfirmedPlan
          ? dict.home.groupConfirmedSignal.replace("{day}", selectedConfirmedPlan.title)
          : proactiveDayPlan
            ? dict.home.groupSuggestedSignal.replace("{day}", proactiveDayPlan.title)
            : dict.home.groupNeedsChoiceSignal
      ].filter((signal): signal is string => Boolean(signal))
    : [];

  return (
    <PageContainer className="gap-4">
      <AppTopBar title={dict.home.topTitle} subtitle={dict.home.topSubtitle} />
      {summary ? (
        <>
          <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {dict.home.flowHint}
          </div>
          <Card className="space-y-4 border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              <BriefcaseBusiness className="h-3.5 w-3.5" />
              Werkdag-dashboard
            </div>
            <div className="space-y-2">
              <h2 className="max-w-2xl text-xl font-semibold leading-tight text-[var(--foreground)] sm:text-2xl">
                Werk eerst je adressenlijst bij, bepaal daarna pas de dagvolgorde.
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
                Gebruik je actieve lijst als vaste basis. Vul nieuwe adressen aan via CSV of handmatig, controleer daarna de
                volgorde voor vandaag en open pas dan navigatie.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/85 p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Open adressen</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{pendingCount}</p>
              </div>
              <div className="rounded-2xl bg-white/85 p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Afgerond</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--foreground)]">{visited.length}</p>
              </div>
              <div className="rounded-2xl bg-white/85 p-3">
                <p className="text-xs text-[var(--muted-foreground)]">Routesessie</p>
                <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">
                  {summary.routePlans[0] ? dict.home.yes : dict.home.no}
                </p>
              </div>
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <Link
                href={`/lists/${summary.id}?focus=csv-import#csv-import`}
                className="flex min-h-24 items-start justify-between rounded-2xl bg-[var(--accent)] px-4 py-4 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
              >
                <div className="space-y-2">
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Open CSV-import
                  </span>
                  <p className="text-left text-xs font-medium leading-5 text-white/80">Voeg extra adressen toe uit een bestand</p>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/today?listId=${summary.id}`}
                className="flex min-h-24 items-start justify-between rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-sm font-semibold text-[var(--foreground)]"
              >
                <div className="space-y-2">
                  <span className="flex items-center gap-2">
                    <Route className="h-4 w-4 text-[var(--accent)]" />
                    Werk dagvolgorde uit
                  </span>
                  <p className="text-left text-xs font-medium leading-5 text-[var(--muted-foreground)]">Laat SamenRoute de dag rustig ordenen</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </Link>
              <Link
                href={`/lists/${summary.id}`}
                className="flex min-h-24 items-start justify-between rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-sm font-semibold text-[var(--foreground)]"
              >
                <div className="space-y-2">
                  <span className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-[var(--accent)]" />
                    Open actieve lijst
                  </span>
                  <p className="text-left text-xs font-medium leading-5 text-[var(--muted-foreground)]">Bekijk, corrigeer of vul handmatig aan</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </Link>
            </div>
          </Card>
          <NextBestStepCard
            eyebrow={nextBestStep.eyebrow}
            title={nextBestStep.title}
            body={nextBestStep.body}
            bullets={nextBestStep.bullets}
            primaryLabel={nextBestStep.primaryLabel}
            primaryHref={nextBestStep.primaryHref}
            secondaryLabel={nextBestStep.secondaryLabel}
            secondaryHref={nextBestStep.secondaryHref}
          />
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
          <ProgressSummaryCard
            placesLeft={pendingCount}
            hasActiveRoute={Boolean(summary.routePlans[0])}
            placesLeftLabel={dict.home.placesLeft}
            routeInProgressLabel={dict.home.routeInProgress}
            yesLabel={dict.home.yes}
            noLabel={dict.home.no}
          />
          <BehaviorInsightsCard
            title={dict.home.learningTitle}
            subtitle={dict.home.learningSubtitle}
            categories={learningSignals}
            topCategoriesLabel={dict.home.learningSignalsLabel}
            favoritesLabel={dict.home.behaviorFavorites}
            favoritesCount={behavior?.favoriteCount ?? 0}
            visitsLabel={dict.home.behaviorVisits}
            visitsCount={behavior?.visitedCount ?? 0}
          />
          <GroupSignalsCard
            badge={dict.home.groupBadge}
            title={dict.home.groupTitle}
            body={dict.home.groupBody}
            signals={groupSignals}
            ctaLabel={dict.home.groupCta}
            ctaHref={`/lists/${activeListId}/members`}
          />
          <ReplanSupportCard
            badge={dict.home.replanBadge}
            title={dict.home.replanTitle}
            body={activeRoute ? dict.home.replanBodyActive : dict.home.replanBodyIdle}
            options={[
              dict.home.replanOptionToday,
              dict.home.replanOptionList,
              activeRoute ? dict.home.replanOptionRoute : dict.home.replanOptionConfirm
            ]}
            primaryLabel={dict.home.replanPrimary}
            primaryHref={`/today?listId=${activeListId}`}
            secondaryLabel={dict.home.replanSecondary}
            secondaryHref={`/lists/${activeListId}`}
          />
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
