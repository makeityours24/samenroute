import Link from "next/link";
import type { Route } from "next";
import { Mail, MapPin, Building2, CalendarRange } from "lucide-react";
import { AppTopBar } from "@/components/navigation/app-topbar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { DemoRequestRepository } from "@/server/repositories/demo-request.repository";
import type { DemoRequest } from "@prisma/client";

const demoRequestRepository = new DemoRequestRepository();

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

export default async function DemoRequestsPage() {
  const requests = await demoRequestRepository.listRecent();

  return (
    <PageContainer>
      <AppTopBar
        title="Demo-aanvragen"
        subtitle="Nieuwe aanvragen via makelaars.samenroute.nl"
        backHref={"/profile" as Route}
        backLabel="Terug naar profiel"
      />

      {requests.length === 0 ? (
        <EmptyState
          title="Nog geen aanvragen"
          description="Nieuwe demo-aanvragen verschijnen hier zodra iemand het formulier op de makelaarspagina invult."
        />
      ) : (
        <section className="space-y-3">
          {requests.map((request: DemoRequest & { createdByUser?: { id: string; email: string; name: string | null } | null }) => (
            <Card key={request.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-lg font-semibold text-[var(--foreground)]">{request.officeName}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {request.name} · {formatDate(request.createdAt)}
                  </p>
                </div>
                <Link
                  href={`mailto:${request.email}`}
                  className="rounded-full bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold"
                >
                  Reageer
                </Link>
              </div>

              <div className="space-y-2 text-sm text-[var(--foreground)]">
                <div className="flex items-start gap-2">
                  <Mail className="mt-0.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <span className="break-all">{request.email}</span>
                </div>

                {request.city ? (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-[var(--muted-foreground)]" />
                    <span>{request.city}</span>
                  </div>
                ) : null}

                <div className="flex items-start gap-2">
                  <Building2 className="mt-0.5 h-4 w-4 text-[var(--muted-foreground)]" />
                  <span>{request.officeName}</span>
                </div>

                {request.weeklyViewings ? (
                  <div className="flex items-start gap-2">
                    <CalendarRange className="mt-0.5 h-4 w-4 text-[var(--muted-foreground)]" />
                    <span>{request.weeklyViewings} bezichtigingen per week</span>
                  </div>
                ) : null}
              </div>

              {request.notes ? (
                <div className="rounded-[22px] bg-[var(--surface-subtle)] px-4 py-3 text-sm leading-6 text-[var(--foreground)]">
                  {request.notes}
                </div>
              ) : null}
            </Card>
          ))}
        </section>
      )}
    </PageContainer>
  );
}
