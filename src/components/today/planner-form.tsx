"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { PlannerStepCard } from "@/components/today/planner-step-card";
import { PlannerStopList } from "@/components/today/planner-stop-list";
import { Button } from "@/components/ui/button";

type ListOption = { id: string; name: string };
type StopOption = { id: string; name: string; detail: string; defaultChecked: boolean; recommended?: boolean };

export function PlannerForm({
  action,
  lists,
  selectedListId,
  initialError,
  stops,
  initialMaxStops,
  initialTransportMode,
  suggestionSummary,
  transportSuggestionSummary,
  submitLabel,
  copy
}: {
  action: (formData: FormData) => void | Promise<void>;
  lists: ListOption[];
  selectedListId: string;
  initialError?: string;
  stops: StopOption[];
  initialMaxStops?: number;
  initialTransportMode?: "WALKING" | "BICYCLING" | "DRIVING" | "TRANSIT";
  suggestionSummary?: string;
  transportSuggestionSummary?: string;
  submitLabel: string;
  copy?: {
    step1: string;
    step2: string;
    step3: string;
    step2Help: string;
    chooseList: string;
    routeTitle: string;
    routeTitleDefault: string;
    transportMode: string;
    transportModeHelp: string;
    transportPreferenceLabel: string;
    routeOrderingStrategy: string;
    routeOrderingStrategyHelp: string;
    fastestRoute: string;
    priorityFirst: string;
    manualOrder: string;
    walking: string;
    bicycling: string;
    driving: string;
    transit: string;
    extrasTitle: string;
    extrasHelp: string;
    maxStops: string;
    maxStopsHelp: string;
    startPoint: string;
    startPointPlaceholder: string;
    startPointHelp: string;
    selectedStopsSummary: string;
    recommendedStopsHint: string;
    recommendedBadge: string;
    smartProposalLabel: string;
    routeStrategySummaryFastest: string;
    routeStrategySummaryPriority: string;
    routeStrategySummaryManual: string;
    transportSummaryWalking: string;
    transportSummaryBicycling: string;
    transportSummaryDriving: string;
    transportSummaryTransit: string;
    selectAtLeastOneStop: string;
    noStopsTitle: string;
    noStopsBody: string;
  };
}) {
  const router = useRouter();
  const [selectionError, setSelectionError] = useState<string | null>(stops.length > 0 ? (initialError ?? null) : null);
  const [routeOrderingStrategy, setRouteOrderingStrategy] = useState("FASTEST");
  const [transportMode, setTransportMode] = useState(initialTransportMode ?? "WALKING");
  const [selectedStopIds, setSelectedStopIds] = useState(() => stops.filter((stop) => stop.defaultChecked).map((stop) => stop.id));
  const labels = copy ?? {
    step1: "Choose a list",
    step2: "Choose today’s stops",
    step3: "Route settings",
    step2Help: "Only the checked stops go into today’s route.",
    chooseList: "Choose list",
    routeTitle: "Route title",
    routeTitleDefault: "Today",
    transportMode: "Transport mode",
    transportModeHelp: "Pick how you want Google Maps to guide you once the route is ready.",
    transportPreferenceLabel: "Suggested from your earlier routes",
    routeOrderingStrategy: "Route strategy",
    routeOrderingStrategyHelp: "Choose whether speed, priority, or your own list order comes first.",
    fastestRoute: "Fastest route",
    priorityFirst: "Priority first",
    manualOrder: "Manual order",
    walking: "Walking",
    bicycling: "Bicycling",
    driving: "Driving",
    transit: "Transit",
    extrasTitle: "Extra settings",
    extrasHelp: "Keep this part light. These only fine-tune the proposal.",
    maxStops: "Max stops",
    maxStopsHelp: "Limit how many selected stops go into this route.",
    startPoint: "Start point",
    startPointPlaceholder: "Start point",
    startPointHelp: "Optional. Add where you start from for a more practical order.",
    selectedStopsSummary: "stops selected for this route",
    recommendedStopsHint: "SamenRoute zet sterke kandidaten alvast hoger op basis van wat je vaker bewaart, bezoekt of belangrijk maakt.",
    recommendedBadge: "Recommended",
    smartProposalLabel: "Best proposal for today",
    routeStrategySummaryFastest: "Best when you just want a practical order as quickly as possible.",
    routeStrategySummaryPriority: "Best when important places should come first, even if that is not the shortest path.",
    routeStrategySummaryManual: "Best when you already know the order and want the app to follow your list.",
    transportSummaryWalking: "Good for compact city routes on foot.",
    transportSummaryBicycling: "Useful when your stops are spread out but still nearby.",
    transportSummaryDriving: "Best for longer distances or stops outside the center.",
    transportSummaryTransit: "Use this when you want to travel mainly by public transport.",
    selectAtLeastOneStop: "Select at least one stop to generate a route.",
    noStopsTitle: "This list has no open stops",
    noStopsBody: "Choose another list or add a place before generating a route."
  };

  useEffect(() => {
    setSelectedStopIds(stops.filter((stop) => stop.defaultChecked).map((stop) => stop.id));
    setSelectionError(stops.length > 0 ? (initialError ?? null) : null);
  }, [initialError, stops]);

  useEffect(() => {
    setTransportMode(initialTransportMode ?? "WALKING");
  }, [initialTransportMode]);

  const strategySummary = useMemo(() => {
    if (routeOrderingStrategy === "PRIORITY_FIRST") {
      return labels.routeStrategySummaryPriority;
    }

    if (routeOrderingStrategy === "MANUAL") {
      return labels.routeStrategySummaryManual;
    }

    return labels.routeStrategySummaryFastest;
  }, [labels.routeStrategySummaryFastest, labels.routeStrategySummaryManual, labels.routeStrategySummaryPriority, routeOrderingStrategy]);

  const transportSummary = useMemo(() => {
    if (transportMode === "BICYCLING") {
      return labels.transportSummaryBicycling;
    }

    if (transportMode === "DRIVING") {
      return labels.transportSummaryDriving;
    }

    if (transportMode === "TRANSIT") {
      return labels.transportSummaryTransit;
    }

    return labels.transportSummaryWalking;
  }, [labels.transportSummaryBicycling, labels.transportSummaryDriving, labels.transportSummaryTransit, labels.transportSummaryWalking, transportMode]);

  return (
    <form
      action={action}
      className="space-y-4"
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        const formData = new FormData(event.currentTarget);
        const selectedStops = formData.getAll("listPlaceIds").filter(Boolean);

        if (selectedStops.length === 0) {
          event.preventDefault();
          setSelectionError(labels.selectAtLeastOneStop);
          return;
        }

        setSelectionError(null);
      }}
    >
      <PlannerStepCard step="1" title={labels.step1}>
        <Select
          name="listId"
          defaultValue={selectedListId}
          aria-label={labels.chooseList}
          onChange={(event) => {
            setSelectionError(null);
            router.replace(`/today?listId=${encodeURIComponent(event.currentTarget.value)}`);
          }}
        >
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </Select>
      </PlannerStepCard>
      <PlannerStepCard step="2" title={labels.step2}>
        {stops.length > 0 ? (
          <>
            <div className="space-y-1 rounded-2xl bg-[var(--surface-subtle)] px-4 py-3">
              {suggestionSummary ? (
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{labels.smartProposalLabel}</p>
              ) : null}
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {selectedStopIds.length} {labels.selectedStopsSummary}
              </p>
              {suggestionSummary ? <p className="text-xs leading-5 text-[var(--foreground)]">{suggestionSummary}</p> : null}
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">{labels.step2Help}</p>
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">{labels.recommendedStopsHint}</p>
            </div>
            <PlannerStopList
              items={stops}
              selectedIds={selectedStopIds}
              recommendedLabel={labels.recommendedBadge}
              onToggle={(id, checked) => {
                setSelectionError(null);
                setSelectedStopIds((current) => {
                  if (checked) {
                    return current.includes(id) ? current : [...current, id];
                  }

                  return current.filter((currentId) => currentId !== id);
                });
              }}
            />
            {selectionError ? <p className="pt-2 text-sm font-medium text-[var(--danger)]">{selectionError}</p> : null}
          </>
        ) : (
          <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-4 text-sm">
            <p className="font-semibold text-[var(--foreground)]">{labels.noStopsTitle}</p>
            <p className="mt-1 text-[var(--muted-foreground)]">{labels.noStopsBody}</p>
          </div>
        )}
      </PlannerStepCard>
      <PlannerStepCard step="3" title={labels.step3}>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--foreground)]">{labels.routeTitle}</p>
            <Input name="title" defaultValue={labels.routeTitleDefault} aria-label={labels.routeTitle} />
          </div>
          <div className="rounded-2xl bg-[var(--surface-subtle)] p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--foreground)]">{labels.routeOrderingStrategy}</p>
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">{labels.routeOrderingStrategyHelp}</p>
            </div>
            <input type="hidden" name="routeOrderingStrategy" value={routeOrderingStrategy} />
            <SegmentedControl
              value={routeOrderingStrategy}
              onChange={setRouteOrderingStrategy}
              items={[
                { value: "FASTEST", label: labels.fastestRoute },
                { value: "PRIORITY_FIRST", label: labels.priorityFirst },
                { value: "MANUAL", label: labels.manualOrder }
              ]}
            />
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{strategySummary}</p>
          </div>
          <div className="rounded-2xl bg-[var(--surface-subtle)] p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--foreground)]">{labels.transportMode}</p>
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">{labels.transportModeHelp}</p>
              {transportSuggestionSummary ? (
                <p className="text-xs leading-5 text-[var(--foreground)]">
                  <span className="font-semibold">{labels.transportPreferenceLabel}:</span> {transportSuggestionSummary}
                </p>
              ) : null}
            </div>
            <input type="hidden" name="transportMode" value={transportMode} />
            <SegmentedControl
              value={transportMode}
              onChange={(value) => setTransportMode(value as "WALKING" | "BICYCLING" | "DRIVING" | "TRANSIT")}
              items={[
                { value: "WALKING", label: labels.walking },
                { value: "BICYCLING", label: labels.bicycling },
                { value: "DRIVING", label: labels.driving },
                { value: "TRANSIT", label: labels.transit }
              ]}
            />
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">{transportSummary}</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] p-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--foreground)]">{labels.extrasTitle}</p>
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">{labels.extrasHelp}</p>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--foreground)]">{labels.maxStops}</p>
                <Input
                  name="maxStops"
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={Math.min(stops.length, initialMaxStops ?? 4)}
                  aria-label={labels.maxStops}
                />
                <p className="text-xs leading-5 text-[var(--muted-foreground)]">{labels.maxStopsHelp}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--foreground)]">{labels.startPoint}</p>
                <Input name="startPlaceLabel" placeholder={labels.startPointPlaceholder} aria-label={labels.startPoint} />
                <p className="text-xs leading-5 text-[var(--muted-foreground)]">{labels.startPointHelp}</p>
              </div>
            </div>
          </div>
        </div>
      </PlannerStepCard>
      <StickyActionBar>
        <Button type="submit" fullWidth disabled={stops.length === 0}>
          {submitLabel}
        </Button>
      </StickyActionBar>
    </form>
  );
}
