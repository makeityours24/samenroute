import { AppTopBar } from "@/components/navigation/app-topbar";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";

export default function PrivacyPage() {
  return (
    <PageContainer className="gap-4">
      <AppTopBar title="Privacyverklaring" subtitle="Hoe SamenRoute met persoonsgegevens omgaat" backHref="/" backLabel="Terug" />

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">1. Wie wij zijn</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          SamenRoute is een app om plekken te bewaren, routes te plannen en samen voortgang bij te houden. De dienst wordt gebouwd
          en beheerd door Make it Yours via miy24.nl.
        </p>
        <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
          <p className="font-semibold text-[var(--foreground)]">Contactgegevens</p>
          <p>Make it Yours</p>
          <p>Snelliusweg 40-25</p>
          <p>6827 DH Arnhem</p>
          <p>Nederland</p>
          <p>
            E-mail: <a className="font-semibold text-[var(--accent)]" href="mailto:info@miy24.nl">info@miy24.nl</a>
          </p>
          <p>Telefoon: 026 202 0275</p>
          <p>KvK: 09176146</p>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">2. Welke gegevens wij verwerken</h2>
        <ul className="space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>Je e-mailadres voor inloggen en accountbeheer.</li>
          <li>Je naam of profielfoto als die via een provider beschikbaar komen.</li>
          <li>Lijsten, plekken, notities, favorieten, routekeuzes en bezochte stops die je in de app opslaat.</li>
          <li>Technische sessiegegevens die nodig zijn om je ingelogd te houden.</li>
        </ul>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">3. Waarom wij deze gegevens gebruiken</h2>
        <ul className="space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>Om je veilig te laten inloggen.</li>
          <li>Om jouw lijsten, plekken en routes op te slaan en te tonen.</li>
          <li>Om gedeelde lijsten en samenwerking mogelijk te maken.</li>
          <li>Om de app technisch te beheren en storingen op te lossen.</li>
        </ul>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">4. Grondslagen</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          Wij verwerken je gegevens omdat dit nodig is voor het uitvoeren van de dienst die je gebruikt en, waar nodig, voor ons
          gerechtvaardigd belang om de app veilig en stabiel te laten werken.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">5. Met wie wij gegevens delen</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          We delen gegevens alleen met partijen die nodig zijn om SamenRoute te laten werken, zoals hosting, database, e-mail en
          loginproviders. Op dit moment zijn dat in elk geval Vercel, Neon en Strato. Als je inlogt via een externe provider,
          verwerkt die partij ook jouw accountgegevens volgens zijn eigen voorwaarden.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">6. Bewaartermijnen</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          We bewaren account- en appgegevens zolang je account actief is of zolang dat nodig is voor de dienst. Als je om
          verwijdering vraagt, verwijderen of anonimiseren we gegevens waar dat redelijkerwijs kan, behalve als we ze nog wettelijk
          moeten bewaren.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">7. Jouw rechten</h2>
        <ul className="space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          <li>Je kunt vragen om inzage in je persoonsgegevens.</li>
          <li>Je kunt vragen om correctie of verwijdering.</li>
          <li>Je kunt bezwaar maken tegen bepaalde verwerkingen.</li>
          <li>Je kunt een verzoek sturen naar <a className="font-semibold text-[var(--accent)]" href="mailto:info@miy24.nl">info@miy24.nl</a>.</li>
        </ul>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">8. Beveiliging</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          We nemen redelijke technische en organisatorische maatregelen om je gegevens te beschermen. Geen enkel systeem is volledig
          risicoloos, maar we proberen opslag en toegang zo beperkt mogelijk te houden.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">9. Wijzigingen</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          Deze privacyverklaring kan worden aangepast als de app of wetgeving verandert. Op deze pagina staat steeds de meest recente
          versie.
        </p>
      </Card>

      <div className="pb-4 text-center text-sm text-[var(--muted-foreground)]">
        <a href="/voorwaarden" className="font-semibold text-[var(--accent)]">
          Bekijk ook de gebruiksvoorwaarden
        </a>
      </div>
    </PageContainer>
  );
}
