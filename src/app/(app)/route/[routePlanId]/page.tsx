import { notFound } from "next/navigation";
import { CurrentStopCard } from "@/components/route-session/current-stop-card";
import { DayProgressCard } from "@/components/route-session/day-progress-card";
import { NextStopCard } from "@/components/route-session/next-stop-card";
import { RouteAdjustmentCard } from "@/components/route-session/route-adjustment-card";
import { RouteProgressBar } from "@/components/route-session/route-progress";
import { RouteSessionActions } from "@/components/route-session/route-session-actions";
import { RouteSuggestionsCard } from "@/components/route-session/route-suggestions-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { getCurrentUser } from "@/lib/auth/auth";
import { getDictionary } from "@/lib/i18n/server";
import { RoutePlanRepository } from "@/server/repositories/route-plan.repository";
import { getRouteSuggestionsService } from "@/server/services/routes/get-route-suggestions.service";
import { addRouteSuggestionAction, completeRoutePlanAction, completeRouteStopAction, markSkippedAction } from "@/app/(app)/actions";

const routePlanRepository = new RoutePlanRepository();

export default async function RouteSessionPage({ params }: { params: Promise<{ routePlanId: string }> }) {
  const { routePlanId } = await params;
  const { dict } = await getDictionary();
  const user = await getCurrentUser();
  const routePlan = user ? await routePlanRepository.findById(routePlanId, user.id) : null;

  if (!routePlan) {
    notFound();
  }

  const suggestionResult = user ? await getRouteSuggestionsService(user, routePlanId) : { suggestions: [] };

  const currentStop = routePlan.stops.find((stop) => !stop.isCompleted);
  const completedCount = routePlan.stops.filter((stop) => stop.isCompleted).length;

  if (!currentStop) {
    return (
      <PageContainer className="justify-center">
        <Card className="space-y-3 text-center">
          <h1 className="text-2xl font-semibold">{dict.route.completedTitle}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{dict.route.completedBody}</p>
        </Card>
        <form action={completeRoutePlanAction}>
          <input type="hidden" name="routePlanId" value={routePlan.id} />
          <Button fullWidth type="submit">
            {dict.route.completeRoute}
          </Button>
        </form>
      </PageContainer>
    );
  }

  const nextStop = routePlan.stops.find((stop) => stop.stopOrder === currentStop.stopOrder + 1);
  const remainingCount = routePlan.stops.length - completedCount - 1;
  const explanationItems = [
    routePlan.startPlaceLabel
      ? dict.route.explanationStartPoint.replace("{startPoint}", routePlan.startPlaceLabel)
      : dict.route.explanationNoStartPoint,
    nextStop && currentStop.listPlace.place.city && nextStop.listPlace.place.city && currentStop.listPlace.place.city === nextStop.listPlace.place.city
      ? dict.route.explanationClustered.replace("{area}", currentStop.listPlace.place.city)
      : dict.route.explanationPracticalOrder
  ];

  return (
    <PageContainer className="justify-between gap-4 pt-2">
      <section className="space-y-4">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{dict.route.sessionLabel}</p>
        <p className="text-center text-sm leading-6 text-[var(--muted-foreground)]">{dict.route.sessionHint}</p>
        <Card className="space-y-3 bg-[var(--surface-subtle)] p-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{dict.route.explanationLabel}</p>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">{dict.route.explanationIntro}</p>
          </div>
          <ul className="space-y-2 text-sm text-[var(--foreground)]">
            {explanationItems.map((item) => (
              <li key={item} className="rounded-2xl bg-white px-4 py-3 shadow-[var(--shadow-soft)]">
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <RouteProgressBar current={completedCount + 1} total={routePlan.stops.length} label={dict.route.progress} />
        <DayProgressCard
          title={dict.route.dayStatusTitle}
          progressLabel={dict.route.progress}
          currentStopLabel={dict.route.currentStop}
          nextStopLabel={dict.route.nextStop}
          remainingLabel={dict.route.remainingStops}
          completedCount={completedCount}
          totalCount={routePlan.stops.length}
          currentStop={currentStop.listPlace.place.name}
          nextStop={nextStop?.listPlace.place.name ?? dict.route.lastStop}
          remainingCount={Math.max(remainingCount, 0)}
        />
        <CurrentStopCard
          name={currentStop.listPlace.place.name}
          location={[currentStop.listPlace.place.addressLine, currentStop.listPlace.place.city].filter(Boolean).join(", ") || dict.route.noAddress}
          label={dict.route.currentStop}
          helper={dict.route.currentStopHint}
        />
        <NextStopCard name={nextStop?.listPlace.place.name ?? dict.route.lastStop} label={dict.route.nextStop} helper={dict.route.nextStopHint} />
        {routePlan.googleMapsUrl ? (
          <Card className="space-y-3 border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] p-4 shadow-[var(--shadow-soft)]">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{dict.route.stepOneLabel}</p>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">{dict.route.stepOneHint}</p>
            </div>
            <a
              href={routePlan.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-5 text-base font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow)]"
            >
              {dict.route.openGoogleMaps}
            </a>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">{dict.route.returnHint}</p>
          </Card>
        ) : null}
        <RouteAdjustmentCard
          badge={dict.route.adjustmentBadge}
          title={dict.route.adjustmentTitle}
          body={dict.route.adjustmentBody}
          options={[
            dict.route.adjustmentOptionToday,
            dict.route.adjustmentOptionList,
            dict.route.adjustmentOptionSession
          ]}
          primaryLabel={dict.route.adjustmentPrimaryCta}
          primaryHref={`/today?listId=${routePlan.listId}`}
          secondaryLabel={dict.route.adjustmentSecondaryCta}
          secondaryHref={`/lists/${routePlan.listId}`}
        />
        <RouteSuggestionsCard
          routePlanId={routePlan.id}
          suggestions={suggestionResult.suggestions}
          action={addRouteSuggestionAction}
          copy={{
            badge: dict.route.suggestionsBadge,
            title: dict.route.suggestionsTitle,
            subtitle: dict.route.suggestionsSubtitle,
            add: dict.route.addSuggestion
          }}
        />
      </section>
      <RouteSessionActions>
        <div className="space-y-1 px-1 pb-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{dict.route.stepTwoLabel}</p>
          <p className="text-xs leading-5 text-[var(--muted-foreground)]">{dict.route.actionsHint}</p>
        </div>
        <form action={completeRouteStopAction}>
          <input type="hidden" name="routePlanId" value={routePlan.id} />
          <input type="hidden" name="routePlanStopId" value={currentStop.id} />
          <input type="hidden" name="listPlaceId" value={currentStop.listPlaceId} />
          <Button fullWidth size="lg" type="submit">
            {dict.route.markVisited}
          </Button>
        </form>
        <div className="space-y-2 border-t border-[var(--border)] pt-2">
          <p className="px-1 text-center text-xs leading-5 text-[var(--muted-foreground)]">{dict.route.secondaryActionsHint}</p>
          <form action={markSkippedAction}>
            <input type="hidden" name="listPlaceId" value={currentStop.listPlaceId} />
            <input type="hidden" name="returnPath" value={`/route/${routePlan.id}`} />
            <Button fullWidth size="lg" variant="secondary" type="submit">
              {dict.route.skipStop}
            </Button>
          </form>
          <form action={completeRoutePlanAction}>
            <input type="hidden" name="routePlanId" value={routePlan.id} />
            <Button fullWidth variant="ghost" type="submit">
              {dict.route.finishRoute}
            </Button>
          </form>
        </div>
      </RouteSessionActions>
    </PageContainer>
  );
}
