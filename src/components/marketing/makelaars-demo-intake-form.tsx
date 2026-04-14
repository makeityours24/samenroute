"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DemoRequestFormState } from "@/app/(app)/actions";

export function MakelaarsDemoIntakeForm({
  action
}: {
  action: (state: DemoRequestFormState, formData: FormData) => Promise<DemoRequestFormState>;
}) {
  const [state, formAction] = useActionState(action, { status: "idle" });

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="name" placeholder="Je naam" aria-label="Je naam" required />
        <Input name="officeName" placeholder="Kantoornaam" aria-label="Kantoornaam" required />
      </div>
      <Input name="email" type="email" placeholder="jij@kantoor.nl" aria-label="E-mailadres" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="city" placeholder="Stad of regio" aria-label="Stad of regio" />
        <Select name="weeklyViewings" defaultValue="" aria-label="Bezichtigingen per week">
          <option value="">Bezichtigingen per week</option>
          <option value="1-5">1-5 per week</option>
          <option value="6-15">6-15 per week</option>
          <option value="16-30">16-30 per week</option>
          <option value="30+">30+ per week</option>
        </Select>
      </div>
      <Textarea
        name="notes"
        placeholder="Vertel kort hoe jullie nu bezichtigingen plannen of waar de grootste frictie zit."
        aria-label="Korte toelichting"
      />
      {state.status === "error" && state.message ? <p className="text-sm text-[var(--danger)]">{state.message}</p> : null}
      {state.status === "success" && state.message ? <p className="text-sm text-[#2d6a4f]">{state.message}</p> : null}
      <Button type="submit" fullWidth>
        Verstuur demo-aanvraag
      </Button>
    </form>
  );
}
