import Link from "next/link";
import Image from "next/image";
import type { Route as AppRoute } from "next";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarRange,
  CarFront,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Home,
  Inbox,
  MapPinned,
  Route as RouteIcon,
  Sparkles
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { PageContainer } from "@/components/ui/page-container";
import { getDictionary } from "@/lib/i18n/server";

const routeStops = [
  { time: "09:00", title: "Sonsbeekkwartier", detail: "Arnhem • gezinshuis" },
  { time: "10:15", title: "Spijkerbuurt", detail: "Arnhem • starterswoning" },
  { time: "11:20", title: "Klarendal", detail: "Arnhem • appartement" },
  { time: "13:00", title: "Burgemeesterswijk", detail: "Arnhem • herenhuis" }
];

const pains = [
  "Adressen zitten verspreid in WhatsApp, mail en agenda.",
  "Bezichtigingen worden handmatig in een volgorde gezet.",
  "De dag voelt drukker dan nodig door onlogisch rijden."
];

const outcomes = [
  "Minder reistijd tussen afspraken",
  "Meer rust tijdens bezichtigingsdagen",
  "Sneller een nette dagplanning voor jezelf of je team"
];

const personas = [
  {
    title: "Zelfstandige makelaar",
    body: "Voor dagen waarop je meerdere bezichtigingen logisch achter elkaar wilt laten lopen, zonder losse briefjes en handmatig schuiven."
  },
  {
    title: "Klein kantoor",
    body: "Voor teams die sneller een duidelijke bezichtigingsdag willen opzetten en afspraken logisch willen delen."
  },
  {
    title: "Buitendienst + binnendienst",
    body: "Voor kantoren waar de planning op kantoor begint, maar onderweg overzicht en rust het verschil maken."
  }
];

const csvColumns = ["naam", "straat", "postcode", "stad", "notitie", "categorie"];

const photoCards = [
  {
    title: "Van losse adressen naar overzicht",
    body: "Een bezichtigingsdag begint vaak versnipperd. Met een visueel dagoverzicht voelt de planning meteen rustiger.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    alt: "Moderne woningen in een rustige straat"
  },
  {
    title: "Een professionelere dag voor klant en makelaar",
    body: "Minder haasten, minder schakelen, meer ruimte om echt aanwezig te zijn tijdens afspraken.",
    image:
      "https://images.unsplash.com/photo-1554469384-e58fac16e23a?auto=format&fit=crop&w=1200&q=80",
    alt: "Makelaar in gesprek met klant bij woningbezichtiging"
  }
];

export default async function MakelaarsPage() {
  const { locale, dict } = await getDictionary();

  return (
    <PageContainer className="max-w-5xl gap-5 px-4 py-6 sm:gap-6 sm:px-5 sm:py-8">
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-white px-3 py-2 text-xs font-semibold text-[var(--accent)] shadow-[var(--shadow)]"
          >
            SamenRoute
          </Link>
          <LanguageSwitcher
            locale={locale}
            currentPath="/makelaars"
            label={dict.language.label}
            options={[
              { value: "nl", label: "NL", ariaLabel: dict.language.nl },
              { value: "en", label: "EN", ariaLabel: dict.language.en },
              { value: "tr", label: "TR", ariaLabel: dict.language.tr }
            ]}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
          <Card className="space-y-5 bg-white/92 p-5 sm:p-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)]">
              <BriefcaseBusiness className="h-4 w-4" />
              Concept voor makelaars
            </div>

            <div className="space-y-3">
              <h1 className="max-w-xl text-3xl font-semibold leading-tight text-[var(--foreground)] sm:text-4xl">
                Plan bezichtigingsdagen zonder zigzag.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-[var(--muted-foreground)]">
                SamenRoute helpt makelaars om adressen te verzamelen, afspraken in logische volgorde te zetten en de dag rustiger
                te laten verlopen. Minder schuiven, minder heen-en-weer rijden, meer overzicht.
              </p>
              <p className="max-w-xl text-sm leading-7 text-[var(--foreground)]">
                Geen nieuw CRM. Geen zwaar systeem. Gewoon een duidelijke planningslaag boven op je bestaande werkwijze.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] bg-[var(--surface-subtle)] p-4">
                <Clock3 className="mb-2 h-5 w-5 text-[var(--accent)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Minder reistijd</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">Logische volgorde voor je bezichtigingen.</p>
              </div>
              <div className="rounded-[24px] bg-[var(--surface-subtle)] p-4">
                <CalendarRange className="mb-2 h-5 w-5 text-[var(--accent)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Rustige dag</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">Minder schakelen tussen losse tools en notities.</p>
              </div>
              <div className="rounded-[24px] bg-[var(--surface-subtle)] p-4">
                <Home className="mb-2 h-5 w-5 text-[var(--accent)]" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Professioneel</p>
                <p className="mt-2 text-sm text-[var(--foreground)]">Een net dagoverzicht voor jezelf of collega’s.</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={"/makelaars/demo" as AppRoute}
                className="flex min-h-14 items-center justify-center rounded-[24px] bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[var(--shadow)]"
              >
                Bekijk de demo-flow
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <a
                href="mailto:info@miy24.nl?subject=SamenRoute%20voor%20makelaars"
                className="flex min-h-14 items-center justify-center rounded-[24px] border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
              >
                Plan een gesprek
              </a>
            </div>
          </Card>

          <Card className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(37,107,86,0.10),rgba(255,255,255,0.92))] p-5">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-2 text-xs font-semibold text-[var(--accent)] shadow-[var(--shadow-soft)] sm:absolute sm:right-4 sm:top-4 sm:mb-0">
              <Sparkles className="h-4 w-4" />
              Vandaag logisch geordend
            </div>

            <div className="space-y-4 sm:pt-12">
              <div className="rounded-[28px] bg-white p-4 shadow-[var(--shadow)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Dagindeling</p>
                    <h2 className="mt-2 text-xl font-semibold sm:text-2xl">Arnhem bezichtigingsdag</h2>
                  </div>
                  <div className="rounded-full bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)]">
                    4 stops
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {routeStops.map((stop, index) => (
                    <div key={stop.title} className="flex items-center gap-3 rounded-[22px] bg-[var(--surface-subtle)] px-3 py-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                          <p className="truncate text-sm font-semibold text-[var(--foreground)]">{stop.title}</p>
                          <span className="text-xs font-semibold text-[var(--muted-foreground)]">{stop.time}</span>
                        </div>
                        <p className="truncate text-xs text-[var(--muted-foreground)]">{stop.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[22px] bg-[var(--accent)] px-4 py-4 text-white shadow-[var(--shadow-soft)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Bespaard</p>
                    <p className="mt-2 text-2xl font-semibold">35 min</p>
                  </div>
                  <div className="rounded-[22px] border border-[var(--border)] bg-white px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Reismodus</p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                      <CarFront className="h-4 w-4 text-[var(--accent)]" />
                      Auto + Google Maps
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-white/75 p-4 text-sm leading-6 text-[var(--muted-foreground)]">
                Hier zou later ook ruimte kunnen komen voor een teamversie:
                collega toewijzen, volgorde delen en een dagplanning exporteren.
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <MapPinned className="h-4 w-4 text-[var(--accent)]" />
            Waar de pijn nu zit
          </div>
          <div className="space-y-3">
            {pains.map((item) => (
              <div key={item} className="rounded-[22px] bg-[var(--surface-subtle)] px-4 py-4 text-sm text-[var(--foreground)]">
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <RouteIcon className="h-4 w-4 text-[var(--accent)]" />
            Wat SamenRoute oplost
          </div>
          <div className="space-y-3">
            {outcomes.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-[22px] bg-[var(--surface-subtle)] px-4 py-4 text-sm text-[var(--foreground)]">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {photoCards.map((item) => (
          <Card key={item.title} className="overflow-hidden p-0">
            <div className="relative h-56 w-full sm:h-64">
              <Image src={item.image} alt={item.alt} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(23,22,18,0.68)] via-[rgba(23,22,18,0.08)] to-transparent" />
            </div>
            <div className="space-y-2 p-5">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">{item.body}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-4 p-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)]">
            <FileSpreadsheet className="h-4 w-4" />
            Zakelijke importflow
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold">Heb je al een adressenlijst? Dan is CSV-import nu de snelste start.</h2>
            <p className="text-sm leading-7 text-[var(--muted-foreground)]">
              Voor zakelijke teams zit de waarde niet alleen in de route, maar ook in hoe snel je daar komt. Daarom kun je in
              SamenRoute nu al een CSV uploaden, eerst een preview controleren en daarna pas de plekken echt importeren.
            </p>
          </div>
          <div className="space-y-3">
            <div className="rounded-[22px] bg-[var(--surface-subtle)] px-4 py-4">
              <p className="text-sm font-semibold">Wat nu al werkt</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                CSV is de eerste zakelijke stap: betrouwbaar, snel te testen en sterk genoeg voor adressen uit Excel, CRM of
                planningslijsten.
              </p>
            </div>
            <div className="rounded-[22px] bg-[var(--surface-subtle)] px-4 py-4">
              <p className="text-sm font-semibold">Standaard kolommen</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {csvColumns.map((column) => (
                  <span
                    key={column}
                    className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[var(--foreground)]"
                  >
                    {column}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 bg-[linear-gradient(180deg,#ffffff_0%,#f6f4ef_100%)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Nu te testen</p>
              <h3 className="mt-2 text-xl font-semibold">Importeer adressen uit CSV met preview</h3>
            </div>
            <div className="rounded-full bg-[var(--accent-soft)] px-3 py-2 text-xs font-semibold text-[var(--accent)]">Live flow</div>
          </div>

          <div className="rounded-[28px] border-2 border-dashed border-[var(--border)] bg-white px-5 py-8 text-center shadow-[var(--shadow-soft)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-soft)]">
              <Inbox className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <p className="mt-4 text-base font-semibold">Upload je CSV in een lijst en controleer eerst de preview</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Bijvoorbeeld een export uit Excel, een CRM of een bezichtigingsplanning. Pas na je controle wordt de lijst echt gevuld.
            </p>
            <div className="mt-4 inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)]">
              .csv • adressenlijst • tot 200 regels
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-4 shadow-[var(--shadow-soft)]">
            <div className="grid grid-cols-[1.1fr_1.3fr] gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
              <span>Kolom uit bestand</span>
              <span>In SamenRoute</span>
            </div>
            <div className="mt-3 space-y-2">
              {[
                ["Adres", "Straat + huisnummer"],
                ["Plaats", "Stad"],
                ["Object", "Naam"],
                ["Opmerking", "Notitie"]
              ].map(([left, right]) => (
                <div key={left} className="grid grid-cols-[1.1fr_1.3fr] gap-3 rounded-[18px] bg-[var(--surface-subtle)] px-3 py-3 text-sm">
                  <span className="font-semibold text-[var(--foreground)]">{left}</span>
                  <span className="text-[var(--muted-foreground)]">{right}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-white p-4 shadow-[var(--shadow-soft)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">1</p>
              <p className="mt-2 text-sm font-semibold">Import</p>
            </div>
            <div className="rounded-[22px] bg-white p-4 shadow-[var(--shadow-soft)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">2</p>
              <p className="mt-2 text-sm font-semibold">Preview</p>
            </div>
            <div className="rounded-[22px] bg-white p-4 shadow-[var(--shadow-soft)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">3</p>
              <p className="mt-2 text-sm font-semibold">Dagindeling</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <a
              href="/examples/makelaars-import-voorbeeld.csv"
              className="flex min-h-12 items-center justify-center rounded-[22px] border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
            >
              Download voorbeeld-CSV
            </a>
            <Link
              href={"/makelaars/demo" as AppRoute}
              className="flex min-h-12 items-center justify-center rounded-[22px] bg-[var(--accent)] px-4 text-sm font-semibold text-white shadow-[var(--shadow-soft)]"
            >
              Bekijk demo-flow
            </Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Stap 1</p>
          <h3 className="text-lg font-semibold">Verzamel adressen</h3>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Voeg woningen toe vanuit je eigen planning, mail of bezichtigingslijst.
          </p>
        </Card>
        <Card className="space-y-3 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Stap 2</p>
          <h3 className="text-lg font-semibold">Werk de dagvolgorde uit</h3>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            SamenRoute zet de dag eerst in een praktische volgorde op basis van ligging en ritme.
          </p>
        </Card>
        <Card className="space-y-3 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Stap 3</p>
          <h3 className="text-lg font-semibold">Open navigatie en werk af</h3>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">
            Ga per woning door naar Google Maps en vink bezochte stops direct af.
          </p>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Voor wie</p>
          <h2 className="text-2xl font-semibold text-[var(--foreground)]">Gemaakt voor makelaars die hun dag strakker willen laten lopen</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {personas.map((item) => (
            <Card key={item.title} className="space-y-3 p-5">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm leading-6 text-[var(--muted-foreground)]">{item.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="space-y-4 bg-[var(--foreground)] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Positionering</p>
          <h2 className="max-w-2xl text-2xl font-semibold leading-tight">SamenRoute is niet je navigatie-app. Het is de planningslaag daarvoor.</h2>
          <p className="max-w-2xl text-sm leading-7 text-white/78">
            Google Maps blijft sterk in navigeren. SamenRoute wordt juist interessant vóórdat de rit begint: adressen verzamelen,
            een logische volgorde bepalen, de dag structureren en voortgang vasthouden.
          </p>
        </Card>

        <Card className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">Volgende stap</p>
          <h2 className="text-2xl font-semibold">Interesse om dit voor je kantoor te verkennen?</h2>
          <p className="text-sm leading-7 text-[var(--muted-foreground)]">
            Dan kunnen we een eenvoudige makelaarsversie verder uitwerken met teams, gedeelde dagplanning en een strakke demo-flow.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={"/makelaars/demo" as AppRoute}
              className="flex min-h-14 items-center justify-center rounded-[24px] bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[var(--shadow)]"
            >
              Bekijk demo-flow
            </Link>
            <a
              href="mailto:info@miy24.nl?subject=SamenRoute%20makelaars%20demo"
              className="flex min-h-12 items-center justify-center rounded-[24px] border border-[var(--border)] bg-white px-5 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
            >
              Mail direct met de bouwer
            </a>
          </div>
        </Card>
      </section>
    </PageContainer>
  );
}
