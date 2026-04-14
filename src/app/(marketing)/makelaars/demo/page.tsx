import Link from "next/link";
import type { Route as AppRoute } from "next";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Mail,
  Route as RouteIcon,
  Users
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { PageContainer } from "@/components/ui/page-container";
import { getDictionary } from "@/lib/i18n/server";

const nextSteps = [
  {
    step: "1",
    title: "Verzamel adressen",
    body: "Start vanuit je eigen planning, mailbox of een bestaande bezichtigingslijst."
  },
  {
    step: "2",
    title: "Importeer of voeg handmatig toe",
    body: "Upload een CSV of zet losse woningen er handmatig in als je dag nog klein begint."
  },
  {
    step: "3",
    title: "Laat de volgorde voorstellen",
    body: "SamenRoute zet de dag eerst logisch neer voordat je navigatie opent."
  },
  {
    step: "4",
    title: "Open Google Maps",
    body: "Gebruik je vertrouwde navigatie-app, maar dan vanuit een al gestructureerde dag."
  },
  {
    step: "5",
    title: "Werk stops rustig af",
    body: "Vink bezochte woningen af en houd overzicht zonder heen-en-weer schakelen."
  }
];

const audience = [
  {
    icon: Building2,
    title: "Zelfstandige makelaar",
    body: "Voor dagen met meerdere bezichtigingen die je zonder zigzag wilt laten verlopen."
  },
  {
    icon: Users,
    title: "Klein kantoor",
    body: "Voor teams die sneller tot een heldere planning willen komen zonder zwaar systeem."
  },
  {
    icon: CalendarClock,
    title: "Binnendienst + buitendienst",
    body: "Voor kantoren waar planning op kantoor begint, maar rust onderweg het verschil maakt."
  }
];

export default async function MakelaarsDemoPage() {
  const { locale, dict } = await getDictionary();

  return (
    <PageContainer className="max-w-5xl gap-6 px-5 py-8">
      <section className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={"/makelaars" as AppRoute}
            className="inline-flex items-center rounded-full bg-white px-3 py-2 text-xs font-semibold text-[var(--accent)] shadow-[var(--shadow)]"
          >
            Terug naar makelaars
          </Link>
          <LanguageSwitcher
            locale={locale}
            currentPath="/makelaars/demo"
            label={dict.language.label}
            options={[
              { value: "nl", label: "NL", ariaLabel: dict.language.nl },
              { value: "en", label: "EN", ariaLabel: dict.language.en },
              { value: "tr", label: "TR", ariaLabel: dict.language.tr }
            ]}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="space-y-5 bg-white/94 p-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)]">
              <RouteIcon className="h-4 w-4" />
              Volgende stap voor makelaars
            </div>

            <div className="space-y-3">
              <h1 className="max-w-xl text-4xl font-semibold leading-tight text-[var(--foreground)]">
                Zo zou SamenRoute in jouw werkdag landen.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
                Je bent niet op zoek naar nog een groot CRM. Je wilt sneller van losse adressen naar een rustige bezichtigingsdag.
                Deze pagina is de brug tussen interesse en echt testen.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href={"/signin" as AppRoute}
                className="flex min-h-28 flex-col items-start justify-between rounded-[24px] bg-[var(--accent)] p-4 text-white shadow-[var(--shadow)]"
              >
                <span className="text-sm font-semibold">Zelf testen</span>
                <span className="text-xs leading-5 text-white/80">Open de demo-omgeving en ervaar de flow zelf.</span>
              </Link>
              <a
                href="/examples/makelaars-import-voorbeeld.csv"
                className="flex min-h-28 flex-col items-start justify-between rounded-[24px] border border-[var(--border)] bg-white p-4 text-[var(--foreground)] shadow-[var(--shadow-soft)]"
              >
                <Download className="h-5 w-5 text-[var(--accent)]" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Voorbeeld-CSV</p>
                  <p className="text-xs leading-5 text-[var(--muted-foreground)]">Download een voorbeeldbestand voor snelle importtests.</p>
                </div>
              </a>
              <a
                href="mailto:info@miy24.nl?subject=SamenRoute%20demo%20voor%20makelaars"
                className="flex min-h-28 flex-col items-start justify-between rounded-[24px] border border-[var(--border)] bg-white p-4 text-[var(--foreground)] shadow-[var(--shadow-soft)]"
              >
                <Mail className="h-5 w-5 text-[var(--accent)]" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Demo aanvragen</p>
                  <p className="text-xs leading-5 text-[var(--muted-foreground)]">Mail direct voor een kantoorgerichte verkenning.</p>
                </div>
              </a>
            </div>
          </Card>

          <Card className="space-y-4 bg-[linear-gradient(180deg,rgba(37,107,86,0.08),rgba(255,255,255,0.94))] p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Praktijkflow</p>
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">Van adressenlijst naar bezichtigingsdag</h2>
            </div>
            <div className="space-y-3">
              {nextSteps.map((item) => (
                <div key={item.step} className="flex gap-3 rounded-[24px] bg-white px-4 py-4 shadow-[var(--shadow-soft)]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                    {item.step}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                    <p className="text-sm leading-6 text-[var(--muted-foreground)]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-4 p-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)]">
            <FileSpreadsheet className="h-4 w-4" />
            Wat je nu al kunt testen
          </div>
          <div className="space-y-3 text-sm leading-7 text-[var(--muted-foreground)]">
            <p>
              Je kunt nu al een CSV-bestand uploaden in een lijst, eerst de preview controleren en daarna pas de import bevestigen.
              Dat maakt de zakelijke instap veel praktischer dan alles met de hand invoeren.
            </p>
            <p>
              Daarna kun je in de Vandaag-flow een routevoorstel maken, de dag structureren en vervolgens doorzetten naar Google Maps.
            </p>
          </div>
          <div className="rounded-[24px] bg-[var(--surface-subtle)] p-4">
            <p className="text-sm font-semibold text-[var(--foreground)]">Snelle testvolgorde</p>
            <ol className="mt-3 space-y-2 text-sm text-[var(--foreground)]">
              <li>1. Download het voorbeeld-CSV</li>
              <li>2. Open de demo-omgeving</li>
              <li>3. Maak of open een lijst</li>
              <li>4. Importeer het CSV-bestand</li>
              <li>5. Laat een routevoorstel maken voor vandaag</li>
            </ol>
          </div>
        </Card>

        <Card className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Voor wie</p>
          <div className="space-y-3">
            {audience.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-[24px] bg-[var(--surface-subtle)] p-4">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[var(--accent)]" />
                    <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.body}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4 bg-[var(--foreground)] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Waarom deze stap</p>
          <h2 className="max-w-2xl text-2xl font-semibold leading-tight">
            Eerst laten zien hoe het werkt, daarna pas praten over een kantoorversie.
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-white/78">
            Dit voelt vaak beter dan meteen een salesgesprek. Je ziet eerst of de flow logisch is voor jouw werkdag: adressen erin,
            dagvoorstel maken, navigatie openen en voortgang vasthouden.
          </p>
        </Card>

        <Card className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Klaar om te testen?</p>
          <h2 className="text-2xl font-semibold">Kies je volgende stap</h2>
          <div className="space-y-3">
            <Link
              href={"/signin" as AppRoute}
              className="flex min-h-14 items-center justify-center rounded-[24px] bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[var(--shadow)]"
            >
              Open demo-omgeving
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <a
              href="/examples/makelaars-import-voorbeeld.csv"
              className="flex min-h-12 items-center justify-center rounded-[24px] border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
            >
              Download voorbeeld-CSV
            </a>
            <a
              href="mailto:info@miy24.nl?subject=SamenRoute%20verkenning%20makelaars"
              className="flex min-h-12 items-center justify-center rounded-[24px] border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
            >
              Plan een verkenning
            </a>
          </div>
          <div className="rounded-[24px] bg-[var(--surface-subtle)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
            Liever eerst zelf voelen hoe het werkt? Begin dan met de demo-omgeving en importeer daarna een voorbeeldlijst.
          </div>
        </Card>
      </section>
    </PageContainer>
  );
}
