import Link from "next/link";
import type { Route as AppRoute } from "next";
import { AppTopBar } from "@/components/navigation/app-topbar";
import { BehaviorInsightsCard } from "@/components/behavior/behavior-insights-card";
import { DayPlanSuggestionsCard } from "@/components/today/day-plan-suggestions-card";
import { PlanningFlowCard } from "@/components/today/planning-flow-card";
import { PlannerForm } from "@/components/today/planner-form";
import { RoutePreviewCard } from "@/components/today/route-preview-card";
import { SmartDayExplanationCard } from "@/components/today/smart-day-explanation-card";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/auth";
import { ListRepository } from "@/server/repositories/list.repository";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { generateRouteAction } from "@/app/(app)/actions";
import { getAppAudience } from "@/lib/audience/server";
import { canMutateList } from "@/server/domain/policies/list-policy";
import { ListMemberRole } from "@/server/domain/enums";
import { getDictionary } from "@/lib/i18n/server";
import { getUserBehaviorInsightsService } from "@/server/services/behavior/get-user-behavior-insights.service";
import { getListPlacePreferenceInsightsService } from "@/server/services/list-places/get-list-place-preference-insights.service";
import { ListDayPlanSelectionRepository } from "@/server/repositories/list-day-plan-selection.repository";
import { suggestDayPlans } from "@/server/services/routes/suggest-day-plans.service";
import { ArrowRight, BriefcaseBusiness, FileSpreadsheet } from "lucide-react";

const listRepository = new ListRepository();
const listDayPlanSelectionRepository = new ListDayPlanSelectionRepository();

export default async function TodayPage({
  searchParams
}: {
  searchParams?: Promise<{ listId?: string; error?: string; day?: string }>;
}) {
  const { locale, dict } = await getDictionary();
  const audience = await getAppAudience();
  const params = searchParams ? await searchParams : undefined;
  const user = await getCurrentUser();
  const lists = user ? await listRepository.findAccessibleByUser(user.id) : [];
  const mutableLists = user
    ? lists.filter((list) =>
        canMutateList(user.id, {
          listId: list.id,
          ownerUserId: list.ownerUserId,
          membershipRole:
            list.ownerUserId === user.id
              ? ListMemberRole.OWNER
              : (list.members.find((member) => member.userId === user.id)?.role ?? undefined)
        })
      )
    : [];
  const requestedListId = params?.listId;
  const selectedDay = Number(params?.day ?? "");
  const defaultList = requestedListId
    ? mutableLists.find((list) => list.id === requestedListId) ?? mutableLists[0]
    : mutableLists[0];
  const detail = defaultList && user ? await listRepository.findDetail(defaultList.id, user.id) : null;
  const behavior =
    user && detail
      ? await getUserBehaviorInsightsService(
          user.id,
          detail.listPlaces.map((item) => ({
            id: item.id,
            status: item.status,
            priority: item.priority,
            includeInRoute: item.includeInRoute,
            isFavorite: item.isFavorite,
            createdAt: item.createdAt,
            place: {
              category: item.place.category ? { name: item.place.category.name } : null
            }
          }))
        )
      : user
        ? await getUserBehaviorInsightsService(user.id)
        : null;
  const recommendedStopIds = new Set(behavior?.recommendedListPlaceIds ?? []);
  const hasSuggestedDayPlan = !detail?.routePlans[0] && recommendedStopIds.size > 0;
  const preferenceInsights = detail
    ? await getListPlacePreferenceInsightsService({
        listId: detail.id,
        listPlaceIds: detail.listPlaces.map((item) => item.id)
      })
    : new Map();
  const confirmedDayPlan = detail ? await listDayPlanSelectionRepository.findLatest(detail.id) : null;
  const dayPlans =
    detail && behavior
      ? suggestDayPlans({
          candidates: detail.listPlaces
            .filter((item) => item.status === "PLANNED")
            .map((item) => ({
              id: item.id,
              priority: item.priority,
              sortOrder: item.sortOrder,
              preferenceSignals: preferenceInsights.get(item.id),
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
  const selectedDayPlan = dayPlans.find((plan) => plan.dayNumber === selectedDay);
  const selectedDayStopIds = new Set(selectedDayPlan?.stopIds ?? []);
  const selectedDayTypeLabel = selectedDayPlan
    ? selectedDayPlan.dayType === "CALM"
      ? dict.today.dayPlansCalmType
      : selectedDayPlan.dayType === "HIGHLIGHTS"
        ? dict.today.dayPlansHighlightsType
        : dict.today.dayPlansBalancedType
    : null;
  const selectedDayThemeLabel = selectedDayPlan
    ? selectedDayPlan.dayTheme === "CULTURE"
      ? dict.today.dayPlansCultureTheme
      : selectedDayPlan.dayTheme === "FOOD_WALK"
        ? dict.today.dayPlansFoodWalkTheme
        : selectedDayPlan.dayTheme === "OUTDOOR"
          ? dict.today.dayPlansOutdoorTheme
          : dict.today.dayPlansMixTheme
    : null;
  const selectedDayMomentLabel = selectedDayPlan
    ? selectedDayPlan.dayMoment === "MORNING"
      ? dict.today.dayPlansMorningMoment
      : selectedDayPlan.dayMoment === "LUNCH"
        ? dict.today.dayPlansLunchMoment
        : selectedDayPlan.dayMoment === "EVENING"
          ? dict.today.dayPlansEveningMoment
          : dict.today.dayPlansAfternoonMoment
    : null;
  const smartReasonItems = selectedDayPlan
    ? [
        dict.today.smartReasonVotes
          .replace("{mustSee}", String(selectedDayPlan.mustSeeVotes))
          .replace("{todayVotes}", String(selectedDayPlan.todayVotes)),
        dict.today.smartReasonTheme
          .replace("{theme}", selectedDayThemeLabel ?? dict.today.dayPlansMixTheme)
          .replace("{moment}", selectedDayMomentLabel ?? dict.today.dayPlansAfternoonMoment),
        dict.today.smartReasonPace
          .replace("{count}", String(selectedDayPlan.stopIds.length))
          .replace("{pace}", String(behavior?.recommendedDayStopCount ?? selectedDayPlan.stopIds.length))
          .replace("{type}", selectedDayTypeLabel ?? dict.today.dayPlansBalancedType)
      ]
    : hasSuggestedDayPlan
      ? [
          dict.today.smartReasonAutoSelected
            .replace("{count}", String(recommendedStopIds.size))
            .replace("{pace}", String(behavior?.recommendedDayStopCount ?? recommendedStopIds.size)),
          dict.today.smartReasonBehavior.replace(
            "{category}",
            behavior?.topCategories[0] ?? dict.today.smartReasonFallbackCategory
          ),
          dict.today.smartReasonLearning
        ]
      : [];
  const recommendedStopLabel =
    audience === "business"
      ? dict.today.recommendedStopLabel
      : locale === "en"
        ? "Fits your day"
        : locale === "tr"
          ? "Gününe uyuyor"
          : "Past bij jouw dag";
  const plannerStops = detail
    ? detail.listPlaces
        .filter((item) => item.status === "PLANNED")
        .map((item) => ({
          id: item.id,
          name: item.place.name,
          detail: recommendedStopIds.has(item.id)
            ? `${recommendedStopLabel} • ${dict.listDetail.priorityLabel} ${item.priority}`
            : `${dict.listDetail.priorityLabel} ${item.priority}`,
          defaultChecked: selectedDayPlan
            ? selectedDayStopIds.has(item.id)
            : hasSuggestedDayPlan
              ? recommendedStopIds.has(item.id)
              : item.includeInRoute,
          recommended: recommendedStopIds.has(item.id)
        }))
        .sort((left, right) => Number(right.recommended) - Number(left.recommended))
    : [];
  const todayIntroCopy =
    audience === "business"
      ? {
          title:
            locale === "en"
              ? "Prepare the workday before navigation"
              : locale === "tr"
                ? "Navigasyondan once is gununu hazirla"
                : "Bereid eerst de werkdag voor",
          body:
            locale === "en"
              ? "First update the work list, then pin fixed appointments, and only after that let SamenRoute work out the practical order."
              : locale === "tr"
                ? "Once is listesini guncelle, sonra sabit randevulari sabitle, en son SamenRoute pratik sirayi cikarsin."
                : "Werk eerst de werklijst bij, zet daarna vaste afspraken vast en laat SamenRoute pas daarna de praktische volgorde uitwerken.",
          primary:
            locale === "en"
              ? "Back to CSV import"
              : locale === "tr"
                ? "CSV ice aktarmaya don"
                : "Terug naar CSV-import",
          secondary:
            locale === "en"
              ? "Open work list"
              : locale === "tr"
                ? "Is listesini ac"
                : "Open werklijst",
          primaryHref: `/lists/${detail?.id ?? ""}?focus=csv-import#csv-import`,
          badgeBusiness: true
        }
      : locale === "en"
        ? {
            title: "Plan calmly before you navigate",
            body: "Choose what fits today first, check the order, and only then continue in Google Maps.",
            primary: "Open active list",
            secondary: "Review places",
            primaryHref: `/lists/${detail?.id ?? ""}`,
            badgeBusiness: false
          }
        : locale === "tr"
          ? {
              title: "Navigasyondan önce planını sakin kur",
              body: "Önce bugüne uyan yerleri seç, sırayı kontrol et ve ancak ondan sonra Google Maps'e geç.",
              primary: "Aktif listeyi aç",
              secondary: "Yerleri gözden geçir",
              primaryHref: `/lists/${detail?.id ?? ""}`,
              badgeBusiness: false
            }
          : {
              title: "Plan eerst rustig voordat je gaat navigeren",
              body: "Kies eerst wat vandaag past, controleer de volgorde en ga pas daarna verder in Google Maps.",
              primary: "Open actieve lijst",
              secondary: "Bekijk je plekken",
              primaryHref: `/lists/${detail?.id ?? ""}`,
              badgeBusiness: false
            };
  const dayPlanHeader =
    audience === "business"
      ? {
          badge: dict.today.dayPlansBadge,
          title: dict.today.dayPlansTitle,
          subtitle: dict.today.dayPlansSubtitle.replace("{count}", String(dayPlans.length))
        }
      : locale === "en"
        ? {
            badge: "Multiple day suggestions",
            title: "SamenRoute can split this into calmer days",
            subtitle: `This list seems to fit better across ${dayPlans.length} separate day suggestions.`
          }
        : locale === "tr"
          ? {
              badge: "Birden fazla gün önerisi",
              title: "SamenRoute bunu daha sakin günlere bölebilir",
              subtitle: `Bu liste ${dayPlans.length} ayrı gün önerisine daha uygun görünüyor.`
          }
        : {
            badge: "Meerdere dagvoorstellen",
            title: "SamenRoute kan dit verdelen over rustigere dagen",
          subtitle: `Deze lijst lijkt beter te passen in ${dayPlans.length} losse dagvoorstellen.`
        };
  const planningFlowCopy =
    audience === "business"
      ? locale === "en"
        ? {
            title: "Business order",
            subtitle: "First choose the right addresses, then respect fixed appointments, and only after that open navigation.",
            steps: [
              "Choose the addresses that truly belong to this workday",
              "Pin time-sensitive stops so they stay in place",
              "Let SamenRoute fill the open gaps in the most practical order"
            ]
          }
        : locale === "tr"
          ? {
              title: "Is gunu sirasi",
              subtitle: "Once dogru adresleri sec, sonra sabit randevulari koru, en son navigasyona gec.",
              steps: [
                "Bu is gunune ait dogru adresleri sec",
                "Saati belli duraklari sabitle",
                "SamenRoute kalan bosluklari en mantikli sirayla doldursun"
              ]
            }
          : {
              title: "Werkdagvolgorde",
              subtitle: "Kies eerst de juiste adressen, houd vaste afspraken op hun plek en open pas daarna navigatie.",
              steps: [
                "Selecteer alleen de adressen die echt bij deze werkdag horen",
                "Zet tijdsgebonden stops vast zodat ze op hun plek blijven",
                "Laat SamenRoute de open ruimte daartussen logisch invullen"
              ]
            }
      : {
          title: dict.today.flowTitle,
          subtitle: dict.today.flowSubtitle,
          steps: [
            dict.today.flowStepChooseDay,
            dict.today.flowStepConfirmRoute,
            dict.today.flowStepOpenMaps
          ]
        };
  const businessTeamCount = detail?.members.length ?? 0;
  const todayTopCopy =
    audience === "business"
      ? locale === "en"
        ? {
            title: "Workday order",
            subtitle: "Check the work list first, pin fixed appointments, then let SamenRoute order the rest."
          }
        : locale === "tr"
          ? {
              title: "Is gunu sirasi",
              subtitle: "Once listeyi kontrol et, sabit randevulari sabitle, sonra kalani SamenRoute duzenlesin."
            }
          : {
              title: "Werkdagvolgorde",
              subtitle: "Controleer eerst de lijst, zet vaste afspraken vast en laat daarna SamenRoute de rest ordenen."
            }
      : {
          title: dict.today.topTitle,
          subtitle: dict.today.topSubtitle
        };

  return (
    <PageContainer className="gap-4">
      <AppTopBar title={todayTopCopy.title} subtitle={todayTopCopy.subtitle} />
      {detail ? (
        <>
          <Card className="space-y-3 border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              {todayIntroCopy.badgeBusiness ? (
                <BriefcaseBusiness className="h-4 w-4 text-[var(--accent)]" />
              ) : (
                <ArrowRight className="h-4 w-4 text-[var(--accent)]" />
              )}
              {todayIntroCopy.title}
            </div>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">{todayIntroCopy.body}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href={todayIntroCopy.primaryHref as AppRoute}
                className="flex items-center justify-between rounded-2xl bg-[var(--accent)] px-4 py-4 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
              >
                <span className="flex items-center gap-2">
                  {todayIntroCopy.badgeBusiness ? <FileSpreadsheet className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  {todayIntroCopy.primary}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/lists/${detail.id}`}
                className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white px-4 py-4 text-sm font-semibold text-[var(--foreground)]"
              >
                <span>{todayIntroCopy.secondary}</span>
                <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
              </Link>
            </div>
          </Card>
          <PlanningFlowCard
            title={planningFlowCopy.title}
            subtitle={planningFlowCopy.subtitle}
            steps={planningFlowCopy.steps}
          />
          {audience === "business" ? (
            <Card className="space-y-4 border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] p-4 shadow-[var(--shadow-soft)]">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                Zakelijke stuurpunten
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="rounded-2xl bg-white/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">CSV eerst</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Werk nieuwe adressen eerst in je lijst bij.</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    Zo laat je de dagvolgorde altijd rekenen op de meest complete adressenlijst.
                  </p>
                  <Link href={`/lists/${detail.id}?focus=csv-import#csv-import`} className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)]">
                    Open import
                  </Link>
                </div>
                <div className="rounded-2xl bg-white/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Vaste afspraken</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Zet in stap 2 stops vast die al tijdsgebonden zijn.</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    SamenRoute laat die ankers staan en ordent alleen de open ruimte daar logisch omheen.
                  </p>
                </div>
                <div className="rounded-2xl bg-white/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Teamflow</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">
                    {businessTeamCount > 1 ? `${businessTeamCount} teamleden kijken mee in deze lijst.` : "Deze lijst staat nog vooral op jou alleen."}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    Deel de lijst met collega&apos;s zodra je samen bezichtigingen of afspraken wilt voorbereiden.
                  </p>
                  <Link href={`/lists/${detail.id}/members`} className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)]">
                    Beheer team
                  </Link>
                </div>
              </div>
            </Card>
          ) : null}
          {audience !== "business" && dayPlans.length > 1 ? (
            <DayPlanSuggestionsCard
              listId={detail.id}
              plans={dayPlans}
              selectedDay={selectedDayPlan?.dayNumber}
              confirmedDay={confirmedDayPlan?.dayNumber ?? undefined}
              copy={{
                badge: dayPlanHeader.badge,
                title: dayPlanHeader.title,
                subtitle: dayPlanHeader.subtitle,
                stops: dict.today.stops,
                chooseDay: dict.today.dayPlansChooseDay,
                selected: dict.today.dayPlansSelected,
                calmType: dict.today.dayPlansCalmType,
                balancedType: dict.today.dayPlansBalancedType,
                highlightsType: dict.today.dayPlansHighlightsType,
                cultureTheme: dict.today.dayPlansCultureTheme,
                foodWalkTheme: dict.today.dayPlansFoodWalkTheme,
                outdoorTheme: dict.today.dayPlansOutdoorTheme,
                mixTheme: dict.today.dayPlansMixTheme,
                morningMoment: dict.today.dayPlansMorningMoment,
                lunchMoment: dict.today.dayPlansLunchMoment,
                afternoonMoment: dict.today.dayPlansAfternoonMoment,
                eveningMoment: dict.today.dayPlansEveningMoment,
                shareDay: dict.today.dayPlansShareDay,
                copiedDay: dict.today.dayPlansCopiedDay,
                mustSeeSignal: dict.today.dayPlansMustSeeSignal,
                todaySignal: dict.today.dayPlansTodaySignal,
                laterSignal: dict.today.dayPlansLaterSignal,
                skipSignal: dict.today.dayPlansSkipSignal,
                confirmDay: dict.today.dayPlansConfirmDay,
                confirmed: dict.today.dayPlansConfirmed,
                confirmedByGroup: dict.today.dayPlansConfirmedByGroup
              }}
            />
          ) : null}
          {audience !== "business" && (selectedDayPlan || hasSuggestedDayPlan) ? (
            <SmartDayExplanationCard
              badge={dict.today.smartExplanationBadge}
              title={
                selectedDayPlan
                  ? dict.today.smartExplanationSelectedTitle.replace("{day}", selectedDayPlan.title)
                  : dict.today.smartExplanationDefaultTitle
              }
              body={
                selectedDayPlan
                  ? dict.today.smartExplanationSelectedBody
                  : dict.today.smartExplanationDefaultBody
              }
              reasons={smartReasonItems}
              learningTitle={dict.today.learningTitle}
              learningBody={dict.today.learningBody}
            />
          ) : null}
          {audience !== "business" && behavior ? (
            <BehaviorInsightsCard
              title={dict.today.behaviorTitle}
              subtitle={dict.today.behaviorSubtitle}
              categories={behavior.topCategories}
              topCategoriesLabel={dict.today.behaviorTopCategories}
              favoritesLabel={dict.today.behaviorFavorites}
              favoritesCount={behavior.favoriteCount}
              visitsLabel={dict.today.behaviorVisits}
              visitsCount={behavior.visitedCount}
            />
          ) : null}
          <PlannerForm
            action={generateRouteAction}
            lists={mutableLists.map((list) => ({ id: list.id, name: list.name }))}
            selectedListId={detail.id}
            initialError={params?.error === "no-stops" ? dict.today.selectAtLeastOneStop : undefined}
            submitLabel={
              audience === "business"
                ? locale === "en"
                  ? "Create workday proposal"
                  : locale === "tr"
                    ? "Is gunu onerisi olustur"
                    : "Maak werkdagvoorstel"
                : dict.today.generateRoute
            }
            stops={plannerStops}
            initialMaxStops={selectedDayPlan ? selectedDayPlan.stopIds.length : hasSuggestedDayPlan ? recommendedStopIds.size : undefined}
            initialTransportMode={behavior?.recommendedTransportMode}
            suggestionSummary={
              selectedDayPlan
                ? dict.today.dayPlansActiveSummary
                    .replace("{day}", selectedDayPlan.title)
                    .replace("{count}", String(selectedDayPlan.stopIds.length))
                    .replace(
                      "{type}",
                      selectedDayPlan.dayType === "CALM"
                        ? dict.today.dayPlansCalmType
                        : selectedDayPlan.dayType === "HIGHLIGHTS"
                          ? dict.today.dayPlansHighlightsType
                          : dict.today.dayPlansBalancedType
                    )
                    .replace(
                      "{theme}",
                      selectedDayPlan.dayTheme === "CULTURE"
                        ? dict.today.dayPlansCultureTheme
                        : selectedDayPlan.dayTheme === "FOOD_WALK"
                          ? dict.today.dayPlansFoodWalkTheme
                          : selectedDayPlan.dayTheme === "OUTDOOR"
                            ? dict.today.dayPlansOutdoorTheme
                            : dict.today.dayPlansMixTheme
                    )
                    .replace("{mustSee}", String(selectedDayPlan.mustSeeVotes))
                    .replace("{todayVotes}", String(selectedDayPlan.todayVotes))
              : hasSuggestedDayPlan
                ? dict.today.smartProposalSummary
                    .replace("{count}", String(recommendedStopIds.size))
                    .replace("{pace}", String(behavior?.recommendedDayStopCount ?? recommendedStopIds.size))
                : undefined
            }
            transportSuggestionSummary={
              behavior
                ? dict.today.transportSuggestionSummary.replace(
                    "{mode}",
                    behavior.recommendedTransportMode === "BICYCLING"
                      ? dict.today.bicycling
                      : behavior.recommendedTransportMode === "DRIVING"
                        ? dict.today.driving
                        : behavior.recommendedTransportMode === "TRANSIT"
                          ? dict.today.transit
                          : dict.today.walking
                  )
                : undefined
            }
            copy={
              audience === "business"
                ? {
                    ...dict.today,
                    step1:
                      locale === "en"
                        ? "Choose work list"
                        : locale === "tr"
                          ? "Is listesi sec"
                          : "Kies werklijst",
                    step2:
                      locale === "en"
                        ? "Choose addresses for this workday"
                        : locale === "tr"
                          ? "Bu is gunu icin adresleri sec"
                          : "Kies adressen voor deze werkdag",
                    step3:
                      locale === "en"
                        ? "Work out the route proposal"
                        : locale === "tr"
                          ? "Rota onerisi hazirla"
                          : "Werk routevoorstel uit",
                    step2Help:
                      locale === "en"
                        ? "Only checked addresses go into this workday proposal."
                        : locale === "tr"
                          ? "Sadece isaretli adresler bu is gunu onerisine girer."
                          : "Alleen aangevinkte adressen gaan mee in dit werkdagvoorstel.",
                    chooseList:
                      locale === "en"
                        ? "Choose work list"
                        : locale === "tr"
                          ? "Is listesi sec"
                          : "Kies werklijst",
                    routeTitle:
                      locale === "en"
                        ? "Workday label"
                        : locale === "tr"
                          ? "Is gunu etiketi"
                          : "Werkdaglabel",
                    routeTitleDefault:
                      locale === "en"
                        ? "Viewing day"
                        : locale === "tr"
                          ? "Gosterim gunu"
                          : "Bezichtigingsdag",
                    routeOrderingStrategy:
                      locale === "en"
                        ? "Order strategy"
                        : locale === "tr"
                          ? "Siralama stratejisi"
                          : "Volgordestrategie",
                    routeOrderingStrategyHelp:
                      locale === "en"
                        ? "Choose whether SamenRoute mainly optimizes for speed, priority, or your existing order."
                        : locale === "tr"
                          ? "SamenRoute hiz, oncelik ya da mevcut siraya gore agirlik versin."
                          : "Kies of SamenRoute vooral op snelheid, prioriteit of je bestaande volgorde moet sturen.",
                    fastestRoute:
                      locale === "en"
                        ? "Most practical"
                        : locale === "tr"
                          ? "En pratik"
                          : "Meest praktisch",
                    priorityFirst:
                      locale === "en"
                        ? "Priority first"
                        : locale === "tr"
                          ? "Oncelik once"
                          : "Prioriteit eerst",
                    manualOrder:
                      locale === "en"
                        ? "Keep my order"
                        : locale === "tr"
                          ? "Sirami koru"
                          : "Volg mijn volgorde",
                    extrasTitle:
                      locale === "en"
                        ? "Fine-tuning"
                        : locale === "tr"
                          ? "Ince ayar"
                          : "Fijnafstelling",
                    extrasHelp:
                      locale === "en"
                        ? "Use this to keep the proposal realistic for your day."
                        : locale === "tr"
                          ? "Oneriyi is gunune daha gercekci uydurmak icin kullan."
                          : "Gebruik dit om het voorstel realistischer te maken voor je werkdag.",
                    maxStops:
                      locale === "en"
                        ? "Max addresses"
                        : locale === "tr"
                          ? "Maksimum adres"
                          : "Max adressen",
                    maxStopsHelp:
                      locale === "en"
                        ? "Limit how many selected addresses go into this workday proposal."
                        : locale === "tr"
                          ? "Bu is gunu onerisine kac secili adres girecegini sinirla."
                          : "Beperk hoeveel geselecteerde adressen meegaan in dit werkdagvoorstel.",
                    startPoint:
                      locale === "en"
                        ? "Departure point"
                        : locale === "tr"
                          ? "Cikis noktasi"
                          : "Vertrekpunt",
                    startPointPlaceholder:
                      locale === "en"
                        ? "Office, home, or first appointment"
                        : locale === "tr"
                          ? "Ofis, ev ya da ilk randevu"
                          : "Kantoor, thuis of eerste afspraak",
                    startPointHelp:
                      locale === "en"
                        ? "Optional. Useful when the workday clearly starts from one fixed place."
                        : locale === "tr"
                          ? "Istege bagli. Is gunu sabit bir yerden basliyorsa kullanisli."
                          : "Optioneel. Handig als de werkdag duidelijk vanaf een vaste plek begint.",
                    selectedStopsSummary:
                      locale === "en"
                        ? "addresses selected for this workday"
                        : locale === "tr"
                          ? "adres bu is gunu icin secildi"
                          : "adressen geselecteerd voor deze werkdag",
                    recommendedStopsHint:
                      locale === "en"
                        ? "SamenRoute can already sort likely fits higher based on your list signals, but you stay in control."
                        : locale === "tr"
                          ? "SamenRoute sinyallere gore uygun adaylari yukariya alabilir ama kontrol sende kalir."
                          : "SamenRoute kan waarschijnlijke kandidaten alvast hoger zetten op basis van je lijstsignalen, maar jij houdt de regie.",
                    recommendedBadge:
                      locale === "en"
                        ? "Likely fit"
                        : locale === "tr"
                          ? "Uygun aday"
                          : "Logische kandidaat",
                    fixedPlanningTitle:
                      locale === "en"
                        ? "Fixed appointments"
                        : locale === "tr"
                          ? "Sabit randevular"
                          : "Vaste afspraken",
                    fixedPlanningHelp:
                      locale === "en"
                        ? "Mark stops that already have a fixed time. SamenRoute keeps those anchors in place."
                        : locale === "tr"
                          ? "Saati belli duraklari isaretle. SamenRoute bu capalari yerinde tutar."
                          : "Markeer stops die al een vast tijdslot hebben. SamenRoute houdt die ankers op hun plek.",
                    fixedPlanningEmpty:
                      locale === "en"
                        ? "No fixed appointments selected yet. Then SamenRoute determines the full order."
                        : locale === "tr"
                          ? "Henuz sabit randevu secilmedi. O zaman tam sirayi SamenRoute belirler."
                          : "Nog geen vaste afspraken geselecteerd. Dan bepaalt SamenRoute de volledige volgorde.",
                    fixedPlanningActive:
                      locale === "en"
                        ? "{count} fixed appointment stays in place; the open addresses are arranged around it."
                        : locale === "tr"
                          ? "{count} sabit randevu yerinde kalir; acik adresler onun etrafinda siralanir."
                          : "{count} vaste afspraak blijft op zijn plek; de open adressen worden daar logisch omheen gezet.",
                    fixedPlanningActivePlural:
                      locale === "en"
                        ? "{count} fixed appointments stay in place; the open addresses are arranged around them."
                        : locale === "tr"
                          ? "{count} sabit randevu yerinde kalir; acik adresler bunlarin etrafinda siralanir."
                          : "{count} vaste afspraken blijven op hun plek; de open adressen worden daar logisch omheen gezet.",
                    fixedStopBadge:
                      locale === "en"
                        ? "Fixed slot"
                        : locale === "tr"
                          ? "Sabit slot"
                          : "Vast slot",
                    makeFixedStop:
                      locale === "en"
                        ? "Pin appointment"
                        : locale === "tr"
                          ? "Randevuyu sabitle"
                          : "Zet afspraak vast",
                    removeFixedStop:
                      locale === "en"
                        ? "Release appointment"
                        : locale === "tr"
                          ? "Randevuyu loslat"
                          : "Maak afspraak vrij",
                    smartProposalLabel:
                      locale === "en"
                        ? "Practical draft"
                        : locale === "tr"
                          ? "Pratik taslak"
                          : "Praktisch voorstel",
                    routeStrategySummaryFastest:
                      locale === "en"
                        ? "Best when you mainly want the most practical line through the day."
                        : locale === "tr"
                          ? "Gun icin en pratik hatta agirlik vermek istediginde en iyisi."
                          : "Beste keuze als je vooral een zo praktisch mogelijke lijn door de dag wilt.",
                    routeStrategySummaryPriority:
                      locale === "en"
                        ? "Best when important addresses should come earlier, even if that costs a little travel time."
                        : locale === "tr"
                          ? "Onemli adresler biraz ekstra yol pahasina once gelmeli ise en iyisi."
                          : "Beste keuze als belangrijke adressen eerder moeten komen, ook als dat iets extra reistijd kost.",
                    routeStrategySummaryManual:
                      locale === "en"
                        ? "Best when your office or team already decided the sequence."
                        : locale === "tr"
                          ? "Ofis ya da ekip sirayi zaten belirlediyse en iyisi."
                          : "Beste keuze als kantoor of team de volgorde al heeft bepaald.",
                    noStopsTitle:
                      locale === "en"
                        ? "This work list has no open addresses"
                        : locale === "tr"
                          ? "Bu is listesinde acik adres yok"
                          : "Deze werklijst heeft nog geen open adressen",
                    noStopsBody:
                      locale === "en"
                        ? "Open the list first, import addresses, or add one manually before creating a workday proposal."
                        : locale === "tr"
                          ? "Once listeyi ac, adres ice aktar ya da elle ekle; sonra is gunu onerisi olustur."
                          : "Open eerst de lijst, importeer adressen of voeg er handmatig een toe voordat je een werkdagvoorstel maakt."
                  }
                : dict.today
            }
          />
          {detail.routePlans[0] ? (
            <section className="space-y-3">
              <SectionHeader title={dict.today.currentProposal} subtitle={dict.today.currentProposalSubtitle} />
              <RoutePreviewCard
                title={detail.routePlans[0].title ?? dict.today.savedRoute}
                mapsUrl={detail.routePlans[0].googleMapsUrl}
                routeHref={`/route/${detail.routePlans[0].id}`}
                stops={detail.routePlans[0].stops.map((stop) => stop.listPlace.place.name)}
                copy={{
                  badge:
                    audience === "business"
                      ? locale === "en"
                        ? "Workday proposal"
                        : locale === "tr"
                          ? "Is gunu onerisi"
                          : "Werkdagvoorstel"
                      : dict.today.routePreview,
                  stops: dict.today.stops,
                  openMaps:
                    audience === "business"
                      ? locale === "en"
                        ? "Open in Google Maps"
                        : locale === "tr"
                          ? "Google Maps'te ac"
                          : "Open in Google Maps"
                      : dict.today.openGoogleMaps,
                  openProposal:
                    audience === "business"
                      ? locale === "en"
                        ? "Open route session"
                        : locale === "tr"
                          ? "Rota oturumunu ac"
                          : "Open routesessie"
                      : dict.today.openProposal,
                  helper:
                    audience === "business"
                      ? locale === "en"
                        ? "Check the proposal first, then continue into navigation for the actual workday."
                        : locale === "tr"
                          ? "Once oneriyi kontrol et, sonra gercek is gunu icin navigasyona gec."
                          : "Controleer eerst het voorstel en ga daarna pas naar navigatie voor de echte werkdag."
                      : dict.today.routePreviewHelper
                }}
              />
            </section>
          ) : null}
        </>
      ) : (
        <>
          <EmptyState
            title={lists.length > 0 ? dict.today.noEditableList : dict.today.nothingToPlan}
            description={lists.length > 0 ? dict.today.noEditableListBody : dict.today.nothingToPlanBody}
          />
          {audience === "business" ? (
            <Card className="space-y-4 border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] p-4 shadow-[var(--shadow-soft)]">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                Eerst dit
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">1</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Maak of open een werklijst</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">Daar verzamel je eerst alle adressen van die dag.</p>
                </div>
                <div className="rounded-2xl bg-white/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">2</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Importeer of vul uitzonderingen aan</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">Gebruik CSV voor bulk en handmatig alleen voor losse aanvullingen.</p>
                </div>
                <div className="rounded-2xl bg-white/90 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">3</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">Laat pas daarna de dagvolgorde maken</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">Dan kan SamenRoute echt logisch sorteren rond vaste afspraken.</p>
                </div>
              </div>
              <Link
                href="/lists"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[var(--shadow)]"
              >
                Open werklijsten
              </Link>
            </Card>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}
