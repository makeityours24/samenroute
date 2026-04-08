import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPinned, Route, Star } from "lucide-react";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { getDictionary } from "@/lib/i18n/server";

export default async function MarketingPage() {
  const { locale, dict } = await getDictionary();

  return (
    <PageContainer className="justify-between px-5 py-8">
      <section className="space-y-5 pt-8">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-full bg-white px-3 py-2 text-xs font-semibold text-[var(--accent)] shadow-[var(--shadow)]">
            SamenRoute
          </div>
          <LanguageSwitcher
            locale={locale}
            currentPath="/"
            label={dict.language.label}
            options={[
              { value: "nl", label: "NL", ariaLabel: dict.language.nl },
              { value: "en", label: "EN", ariaLabel: dict.language.en },
              { value: "tr", label: "TR", ariaLabel: dict.language.tr }
            ]}
          />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold leading-tight text-[var(--foreground)]">{dict.marketing.headline}</h1>
          <p className="text-sm leading-6 text-[var(--muted-foreground)]">{dict.marketing.body}</p>
        </div>
        <Card className="space-y-3 bg-white/90">
          {dict.marketing.highlights.map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
              <span>{item}</span>
            </div>
          ))}
        </Card>
      </section>
      <section className="space-y-4 pb-8">
        <div className="grid grid-cols-3 gap-3">
          <Card className="space-y-2 p-3">
            <Star className="h-4 w-4 text-[var(--accent)]" />
            <p className="text-xs text-[var(--muted-foreground)]">{dict.marketing.save}</p>
          </Card>
          <Card className="space-y-2 p-3">
            <MapPinned className="h-4 w-4 text-[var(--accent)]" />
            <p className="text-xs text-[var(--muted-foreground)]">{dict.marketing.plan}</p>
          </Card>
          <Card className="space-y-2 p-3">
            <Route className="h-4 w-4 text-[var(--accent)]" />
            <p className="text-xs text-[var(--muted-foreground)]">{dict.marketing.drive}</p>
          </Card>
        </div>
        <Link
          href="/signin"
          className="flex min-h-14 items-center justify-center rounded-[24px] bg-[var(--accent)] text-sm font-semibold text-white shadow-[var(--shadow)]"
        >
          {dict.marketing.cta}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        {process.env.NODE_ENV !== "production" ? (
          <Link
            href="/api/dev/demo-login?user=anna&redirectTo=/home"
            className="flex min-h-12 items-center justify-center rounded-[24px] border border-[var(--border)] bg-white text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
          >
            {dict.marketing.demoCta}
          </Link>
        ) : null}
      </section>
    </PageContainer>
  );
}
