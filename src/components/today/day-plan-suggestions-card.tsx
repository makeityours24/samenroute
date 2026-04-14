"use client";

import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DayPlanShareButton } from "@/components/today/day-plan-share-button";

type DayPlan = {
  dayNumber: number;
  title: string;
  dayType: "CALM" | "BALANCED" | "HIGHLIGHTS";
  dayTheme: "CULTURE" | "FOOD_WALK" | "OUTDOOR" | "MIX";
  dayMoment: "MORNING" | "LUNCH" | "AFTERNOON" | "EVENING";
  stopIds: string[];
  stopNames: string[];
};

export function DayPlanSuggestionsCard({
  listId,
  plans,
  selectedDay,
  copy
}: {
  listId: string;
  plans: DayPlan[];
  selectedDay?: number;
  copy?: {
    badge: string;
    title: string;
    subtitle: string;
    stops: string;
    chooseDay: string;
    selected: string;
    calmType: string;
    balancedType: string;
    highlightsType: string;
    cultureTheme: string;
    foodWalkTheme: string;
    outdoorTheme: string;
    mixTheme: string;
    morningMoment: string;
    lunchMoment: string;
    afternoonMoment: string;
    eveningMoment: string;
    shareDay: string;
    copiedDay: string;
  };
}) {
  const labels = copy ?? {
    badge: "Multi-day",
    title: "Split into days",
    subtitle: "Let SamenRoute suggest a calm spread over multiple days.",
    stops: "stops",
    chooseDay: "Use this day",
    selected: "Selected",
    calmType: "Calm day",
    balancedType: "Balanced day",
    highlightsType: "Highlights",
    cultureTheme: "Culture",
    foodWalkTheme: "Food & walk",
    outdoorTheme: "Outdoor",
    mixTheme: "Mixed",
    morningMoment: "Morning",
    lunchMoment: "Lunch",
    afternoonMoment: "Afternoon",
    eveningMoment: "Evening",
    shareDay: "Share this day",
    copiedDay: "Link copied"
  };

  if (plans.length < 2) {
    return null;
  }

  return (
    <Card className="space-y-3">
      <div className="space-y-1">
        <Badge tone="accent">{labels.badge}</Badge>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{labels.title}</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">{labels.subtitle}</p>
      </div>
      <div className="space-y-3">
        {plans.map((plan) => {
          const isSelected = selectedDay === plan.dayNumber;
          const dayTypeLabel =
            plan.dayType === "CALM" ? labels.calmType : plan.dayType === "HIGHLIGHTS" ? labels.highlightsType : labels.balancedType;
          const dayThemeLabel =
            plan.dayTheme === "CULTURE"
              ? labels.cultureTheme
              : plan.dayTheme === "FOOD_WALK"
                ? labels.foodWalkTheme
                : plan.dayTheme === "OUTDOOR"
                  ? labels.outdoorTheme
                  : labels.mixTheme;
          const dayMomentLabel =
            plan.dayMoment === "MORNING"
              ? labels.morningMoment
              : plan.dayMoment === "LUNCH"
                ? labels.lunchMoment
                : plan.dayMoment === "EVENING"
                  ? labels.eveningMoment
                  : labels.afternoonMoment;

          return (
            <div key={plan.dayNumber} className="rounded-2xl bg-[var(--surface-subtle)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{plan.title}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    <span>{plan.stopIds.length} {labels.stops}</span>
                    <Badge tone="accent">{dayTypeLabel}</Badge>
                    <Badge>{dayThemeLabel}</Badge>
                    <Badge>{dayMomentLabel}</Badge>
                  </div>
                </div>
                <Badge>{isSelected ? labels.selected : `${plan.stopIds.length} ${labels.stops}`}</Badge>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-[var(--foreground)]">
                {plan.stopNames.map((stop, index) => (
                  <li key={`${plan.dayNumber}-${stop}-${index}`} className="rounded-2xl bg-white px-3 py-2 shadow-[var(--shadow-soft)]">
                    {index + 1}. {stop}
                  </li>
                ))}
              </ol>
              <Link
                href={`/today?listId=${encodeURIComponent(listId)}&day=${plan.dayNumber}` as Route}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
              >
                {labels.chooseDay}
              </Link>
              <div className="mt-2">
                <DayPlanShareButton
                  listId={listId}
                  dayNumber={plan.dayNumber}
                  title={plan.title}
                  label={labels.shareDay}
                  copiedLabel={labels.copiedDay}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
