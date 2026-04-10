import Link from "next/link";
import { notFound } from "next/navigation";
import { CurrentStopCard } from "@/components/route-session/current-stop-card";
import { NextStopCard } from "@/components/route-session/next-stop-card";
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

  return (
    <PageContainer className="justify-between gap-4 pt-2">
      <section className="space-y-4">
        <Card className="space-y-4 border-transparent bg-[linear-gradient(180deg,#ffffff_0%,#f7f5ef_100%)] p-4 shadow-[var(--shadow)]">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{dict.route.sessionLabel}</p>
            <h1 className="text-2xl font-semibold">{dict.route.proposalTitle}</h1>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">{dict.route.proposalBody}</p>
          </div>
          <div className="rounded-2xl bg-white/80 p-3 text-center">
            <p className="text-xs text-[var(--muted-foreground)]">{dict.route.proposalSummaryLabel}</p>
            <p className="mt-1 text-lg font-semibold">
              {routePlan.stops.length} {dict.route.proposalSummaryStops}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Link
              href={`/today?listId=${routePlan.listId}`}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
            >
              {dict.route.adjustRoute}
            </Link>
            {routePlan.googleMapsUrl ? (
              <a
                href={routePlan.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] shadow-[var(--shadow)]"
              >
                {dict.route.followRoute}
              </a>
            ) : null}
          </div>
        </Card>
        <p className="text-center text-sm leading-6 text-[var(--muted-foreground)]">{dict.route.sessionHint}</p>
        <RouteProgressBar current={completedCount + 1} total={routePlan.stops.length} label={dict.route.progress} />
        <CurrentStopCard
          name={currentStop.listPlace.place.name}
          location={[currentStop.listPlace.place.addressLine, currentStop.listPlace.place.city].filter(Boolean).join(", ") || dict.route.noAddress}
          label={dict.route.currentStop}
          helper={dict.route.currentStopHint}
        />
        <NextStopCard name={nextStop?.listPlace.place.name ?? dict.route.lastStop} label={dict.route.nextStop} helper={dict.route.nextStopHint} />
        {routePlan.googleMapsUrl ? (
          <Card className="space-y-3 p-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">{dict.route.stepOneLabel}</p>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">{dict.route.stepOneHint}</p>
            </div>
            <a
              href={routePlan.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
            >
              {dict.route.openGoogleMaps}
            </a>
          </Card>
        ) : null}
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
