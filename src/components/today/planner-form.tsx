"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { PlannerStepCard } from "@/components/today/planner-step-card";
import { PlannerStopList } from "@/components/today/planner-stop-list";
import { Button } from "@/components/ui/button";

type ListOption = { id: string; name: string };
type StopOption = { id: string; name: string; detail: string; defaultChecked: boolean };

export function PlannerForm({
  action,
  lists,
  selectedListId,
  initialError,
  stops,
  submitLabel,
  copy
}: {
  action: (formData: FormData) => void | Promise<void>;
  lists: ListOption[];
  selectedListId: string;
  initialError?: string;
  stops: StopOption[];
  submitLabel: string;
  copy?: {
    step1: string;
    step2: string;
    step3: string;
    chooseList: string;
    routeTitle: string;
    routeTitleDefault: string;
    transportMode: string;
    transportModeHelp: string;
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
    selectAtLeastOneStop: string;
    noStopsTitle: string;
    noStopsBody: string;
  };
}) {
  const router = useRouter();
  const [selectionError, setSelectionError] = useState<string | null>(stops.length > 0 ? (initialError ?? null) : null);
  const [routeOrderingStrategy, setRouteOrderingStrategy] = useState("FASTEST");
  const [transportMode, setTransportMode] = useState("WALKING");
  const labels = copy ?? {
    step1: "Choose a list",
    step2: "Choose today’s stops",
    step3: "Route settings",
    chooseList: "Choose list",
    routeTitle: "Route title",
    routeTitleDefault: "Today",
    transportMode: "Transport mode",
    transportModeHelp: "Pick how you want Google Maps to guide you once the route is ready.",
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
    selectAtLeastOneStop: "Select at least one stop to generate a route.",
    noStopsTitle: "This list has no open stops",
    noStopsBody: "Choose another list or add a place before generating a route."
  };

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
            <PlannerStopList items={stops} />
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
          </div>
          <div className="rounded-2xl bg-[var(--surface-subtle)] p-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--foreground)]">{labels.transportMode}</p>
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">{labels.transportModeHelp}</p>
            </div>
            <input type="hidden" name="transportMode" value={transportMode} />
            <SegmentedControl
              value={transportMode}
              onChange={setTransportMode}
              items={[
                { value: "WALKING", label: labels.walking },
                { value: "BICYCLING", label: labels.bicycling },
                { value: "DRIVING", label: labels.driving },
                { value: "TRANSIT", label: labels.transit }
              ]}
            />
          </div>
          <div className="rounded-2xl border border-[var(--border)] p-3">
            <div className="space-y-1">
              <p className="text-sm font-medium text-[var(--foreground)]">{labels.extrasTitle}</p>
              <p className="text-xs leading-5 text-[var(--muted-foreground)]">{labels.extrasHelp}</p>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--foreground)]">{labels.maxStops}</p>
                <Input name="maxStops" type="number" min={1} max={10} defaultValue={Math.min(stops.length, 4)} aria-label={labels.maxStops} />
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
