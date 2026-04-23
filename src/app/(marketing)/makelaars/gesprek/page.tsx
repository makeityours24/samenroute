import Link from "next/link";
import type { Route as AppRoute } from "next";
import { ArrowRight, Building2, CalendarClock, CheckCircle2, Download, Mail, Route as RouteIcon, Users } from "lucide-react";
import { submitMakelaarsDemoRequestAction } from "@/app/(app)/actions";
import { MakelaarsDemoIntakeForm } from "@/components/marketing/makelaars-demo-intake-form";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { PageContainer } from "@/components/ui/page-container";
import { getDictionary } from "@/lib/i18n/server";

const officeSituations = [
  {
    icon: Building2,
    title: "Zelfstandig makelaar",
    body: "Je plant zelf, schakelt tussen adressen en wilt minder zigzag in je bezichtigingsdagen."
  },
  {
    icon: Users,
    title: "Klein kantoor",
    body: "Collega's delen adressen, maar de dagvolgorde en overdracht blijven nog te handmatig."
  },
  {
    icon: CalendarClock,
    title: "Binnen- en buitendienst",
    body: "Planning ontstaat op kantoor, maar onderweg wil je één rustige flow met duidelijk overzicht."
  }
];

const intakeBlocks = [
  {
    title: "Wat we eerst willen snappen",
    points: [
      "Hoe adressen nu binnenkomen: Excel, CRM, mail of WhatsApp",
      "Hoeveel bezichtigingen of adressen je per week plant",
      "Of de volgorde al vastligt of dat het systeem mag voorstellen",
      "Waar de meeste frictie zit: reistijd, overzicht of teamafstemming"
    ]
  },
  {
    title: "Wat je daarna van ons krijgt",
    points: [
      "Een passende demo-richting voor jouw kantoor",
      "Een advies of CSV-import de slimste eerste stap is",
      "Een voorstel voor solo-gebruik of teamflow",
      "Een vervolgstap zonder zwaar salesproces"
    ]
  }
];

const nextStepCards = [
  {
    step: "1",
    title: "Situatie ophalen",
    body: "We verzamelen eerst kort hoe jullie vandaag plannen en waar de dag onrustig wordt."
  },
  {
    step: "2",
    title: "Slimme insteek kiezen",
    body: "Daarna bepalen we of jullie beter starten met CSV-import, handmatige intake of teamplanning."
  },
  {
    step: "3",
    title: "Passende demo-flow",
    body: "Pas daarna wijzen we de juiste vervolgroute aan: zelf testen, voorbeeldbestand of demo-afspraak."
  }
];

export default async function MakelaarsGesprekPage() {
  const { locale, dict } = await getDictionary();

  return (
    <PageContainer className="max-w-6xl gap-5 px-4 py-6 sm:gap-6 sm:px-5 sm:py-8">
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={"/makelaars" as AppRoute}
            className="inline-flex items-center rounded-full bg-white px-3 py-2 text-xs font-semibold text-[var(--accent)] shadow-[var(--shadow)]"
          >
            Terug naar makelaars
          </Link>
          <LanguageSwitcher
            locale={locale}
            currentPath="/makelaars/gesprek"
            label={dict.language.label}
            options={[
              { value: "nl", label: "NL", ariaLabel: dict.language.nl },
              { value: "en", label: "EN", ariaLabel: dict.language.en },
              { value: "tr", label: "TR", ariaLabel: dict.language.tr }
            ]}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="space-y-5 bg-white/94 p-5 sm:p-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)]">
              <RouteIcon className="h-4 w-4" />
              Zakelijke intake
            </div>

            <div className="space-y-3">
              <h1 className="max-w-2xl text-3xl font-semibold leading-tight text-[var(--foreground)] sm:text-4xl">
                Laten we eerst kijken hoe SamenRoute in jullie werkdag past.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[var(--muted-foreground)]">
                Deze pagina is niet bedoeld als zwaar salesmoment. Het is de zakelijke intake vóór de demo: hoe plannen jullie nu,
                waar ontstaat verlies van rust en wanneer moet het systeem de volgorde bepalen in plaats van jullie zelf?
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {officeSituations.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="rounded-[24px] bg-[var(--surface-subtle)] p-4">
                    <Icon className="mb-2 h-5 w-5 text-[var(--accent)]" />
                    <p className="text-sm font-semibold text-[var(--foreground)]">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{item.body}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {intakeBlocks.map((block) => (
                <div key={block.title} className="rounded-[24px] border border-[var(--border)] bg-white p-4 shadow-[var(--shadow-soft)]">
                  <p className="text-sm font-semibold text-[var(--foreground)]">{block.title}</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {block.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[var(--accent)]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 bg-[linear-gradient(180deg,rgba(37,107,86,0.08),rgba(255,255,255,0.95))] p-5 sm:p-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Hoe dit gesprek werkt</p>
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">Van interesse naar juiste insteek</h2>
            </div>

            <div className="space-y-3">
              {nextStepCards.map((item) => (
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

            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href="/examples/makelaars-import-voorbeeld.csv"
                className="flex min-h-12 items-center justify-center rounded-[22px] border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
              >
                <Download className="mr-2 h-4 w-4 text-[var(--accent)]" />
                Voorbeeld-CSV
              </a>
              <Link
                href={"/signin" as AppRoute}
                className="flex min-h-12 items-center justify-center rounded-[22px] bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-soft)]"
              >
                Zelf testen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.02fr_0.98fr]">
        <Card className="space-y-4 p-5 sm:p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Zakelijke intake</p>
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">Vertel kort hoe jullie nu plannen</h2>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">
              Vul dit compact in. Dan kunnen we veel beter inschatten of jullie vooral winst halen uit CSV-import, uit slimme
              dagvolgorde, of uit een teamgerichte vervolgversie.
            </p>
          </div>

          <div className="rounded-[24px] bg-[var(--surface-subtle)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
            Goede intakevragen zijn bijvoorbeeld: komen adressen al uit Excel, ligt een deel van de afspraken al vast, en moet
            SamenRoute alleen de gaten vullen of juist de hele dag voorstellen?
          </div>

          <MakelaarsDemoIntakeForm action={submitMakelaarsDemoRequestAction} />
        </Card>

        <div className="space-y-4">
          <Card className="space-y-4 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Wat vaak de beste vervolgstap is</p>
            <div className="space-y-3">
              <div className="rounded-[22px] bg-[var(--surface-subtle)] p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">Excel of adressenlijst aanwezig</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Dan is CSV-import meestal de snelste route naar een eerste bruikbare dagplanning.
                </p>
              </div>
              <div className="rounded-[22px] bg-[var(--surface-subtle)] p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">Afspraken liggen deels al vast</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Dan moet het systeem niet alles overschrijven, maar juist de vrije ruimte ertussen logisch invullen.
                </p>
              </div>
              <div className="rounded-[22px] bg-[var(--surface-subtle)] p-4">
                <p className="text-sm font-semibold text-[var(--foreground)]">Meerdere collega's in het proces</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  Dan wordt teamoverdracht, gedeelde dagplanning en rolverdeling belangrijker dan alleen navigatie.
                </p>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 bg-[var(--foreground)] p-5 text-white sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Geen zwaar verkoopmoment</p>
            <h2 className="text-2xl font-semibold leading-tight">Eerst logisch maken wat jullie nodig hebben.</h2>
            <p className="text-sm leading-7 text-white/78">
              Pas daarna heeft een demo echt waarde. Anders laat je alleen schermen zien, maar niet waarom deze workflow juist in
              jullie kantoorproces rust zou moeten brengen.
            </p>
            <a
              href="mailto:info@samenroute.nl?subject=SamenRoute%20gesprek%20voor%20makelaars"
              className="flex min-h-12 items-center justify-center rounded-[22px] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
            >
              <Mail className="mr-2 h-4 w-4 text-[var(--accent)]" />
              Mail direct met SamenRoute
            </a>
          </Card>
        </div>
      </section>
    </PageContainer>
  );
}
