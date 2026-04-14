"use client";

import Link from "next/link";
import type { Route } from "next";
import { useActionState } from "react";
import { ArrowRight, CheckCircle2, Download, Mail } from "lucide-react";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
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

  if (state.status === "success") {
    return (
      <div className="space-y-4 rounded-[24px] border border-[color:color-mix(in_srgb,var(--accent)_18%,white)] bg-[linear-gradient(180deg,rgba(226,240,234,0.92)_0%,rgba(255,255,255,0.98)_100%)] p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)]">
            <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-[var(--foreground)]">Aanvraag ontvangen</p>
            <p className="text-sm leading-6 text-[var(--muted-foreground)]">
              {state.message ?? "Je aanvraag is verstuurd. We nemen contact met je op via e-mail."}
            </p>
          </div>
        </div>

        <div className="rounded-[20px] bg-white px-4 py-4 shadow-[var(--shadow-soft)]">
          <p className="text-sm font-semibold text-[var(--foreground)]">Wat er nu gebeurt</p>
          <ol className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
            <li>1. Je aanvraag komt binnen bij SamenRoute.</li>
            <li>2. We reageren op het e-mailadres dat je hebt ingevuld.</li>
            <li>3. In de tussentijd kun je de demo of het voorbeeld-CSV alvast bekijken.</li>
          </ol>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href={"/signin" as Route}
            className="flex min-h-12 items-center justify-center rounded-[22px] bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-soft)]"
          >
            Open demo-omgeving
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <a
            href="/examples/makelaars-import-voorbeeld.csv"
            className="flex min-h-12 items-center justify-center rounded-[22px] border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
          >
            <Download className="mr-2 h-4 w-4 text-[var(--accent)]" />
            Download voorbeeld-CSV
          </a>
        </div>

        <a
          href="mailto:info@samenroute.nl?subject=SamenRoute%20demo-aanvraag"
          className="flex min-h-12 items-center justify-center rounded-[22px] border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
        >
          <Mail className="mr-2 h-4 w-4 text-[var(--accent)]" />
          Mail direct met SamenRoute
        </a>
      </div>
    );
  }

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
      <FormSubmitButton fullWidth pendingLabel="Versturen...">
        Verstuur demo-aanvraag
      </FormSubmitButton>
    </form>
  );
}
