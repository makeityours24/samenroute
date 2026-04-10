import { AppTopBar } from "@/components/navigation/app-topbar";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";

export default function TermsPage() {
  return (
    <PageContainer className="gap-4">
      <AppTopBar title="Gebruiksvoorwaarden" subtitle="Heldere afspraken voor het gebruik van SamenRoute" backHref="/" backLabel="Terug" />

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">1. Gebruik van de app</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          SamenRoute helpt je om plekken te bewaren, routes te plannen en samen voortgang bij te houden. Je gebruikt de app op eigen
          verantwoordelijkheid.
        </p>
        <div className="rounded-2xl bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--muted-foreground)]">
          <p className="font-semibold text-[var(--foreground)]">Dienstverlener</p>
          <p>Make it Yours</p>
          <p>Snelliusweg 40-25</p>
          <p>6827 DH Arnhem</p>
          <p>
            E-mail: <a className="font-semibold text-[var(--accent)]" href="mailto:info@miy24.nl">info@miy24.nl</a>
          </p>
          <p>Telefoon: 026 202 0275</p>
          <p>KvK: 09176146</p>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">2. Account en toegang</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          Je bent zelf verantwoordelijk voor het correcte gebruik van je account en voor de juistheid van het e-mailadres dat je
          gebruikt. Deel geen toegang met anderen als dat niet de bedoeling is.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">3. Inhoud van gebruikers</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          Lijsten, notities, routes en plekgegevens die jij toevoegt blijven jouw verantwoordelijkheid. Plaats geen informatie die
          onrechtmatig, misleidend of schadelijk is.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">4. Beschikbaarheid</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          We proberen SamenRoute zo goed mogelijk beschikbaar te houden, maar we kunnen geen ononderbroken werking garanderen.
          Functies kunnen worden gewijzigd, tijdelijk onderbroken of verwijderd.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">5. Navigatie en routevoorstellen</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          Routevoorstellen en koppelingen naar kaartdiensten zijn hulpmiddelen. Controleer onderweg altijd zelf verkeerssituatie,
          veiligheid en lokale regels.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">6. Beëindiging</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          We kunnen toegang beperken of beëindigen bij misbruik, technische noodzaak of wettelijke verplichtingen. Je kunt ook zelf
          verzoeken om je account te laten verwijderen via <a className="font-semibold text-[var(--accent)]" href="mailto:info@miy24.nl">info@miy24.nl</a>.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">7. Aansprakelijkheid</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          Voor zover wettelijk toegestaan is SamenRoute niet aansprakelijk voor indirecte schade, gemiste afspraken, routefouten of
          schade die ontstaat door onjuist gebruik van de app of externe diensten.
        </p>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">8. Contact</h2>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          Voor vragen over deze voorwaarden of de dienst kun je contact opnemen via <a className="font-semibold text-[var(--accent)]" href="mailto:info@miy24.nl">info@miy24.nl</a>.
        </p>
      </Card>

      <div className="pb-4 text-center text-sm text-[var(--muted-foreground)]">
        <a href="/privacy" className="font-semibold text-[var(--accent)]">
          Bekijk ook de privacyverklaring
        </a>
      </div>
    </PageContainer>
  );
}
