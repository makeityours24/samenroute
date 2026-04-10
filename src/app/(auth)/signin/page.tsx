import { redirect } from "next/navigation";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/ui/page-container";
import { SignInForm } from "@/components/auth/signin-form";
import { getCurrentUser } from "@/lib/auth/auth";
import { env } from "@/lib/env/env";
import { getDictionary } from "@/lib/i18n/server";

export default async function SignInPage({
  searchParams
}: {
  searchParams?: Promise<{ demo?: string; email?: string; callbackUrl?: string }>;
}) {
  const user = await getCurrentUser();
  const { locale, dict } = await getDictionary();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const callbackUrl =
    resolvedSearchParams?.callbackUrl && resolvedSearchParams.callbackUrl.startsWith("/")
      ? resolvedSearchParams.callbackUrl
      : "/home";
  const email = resolvedSearchParams?.email ?? "";

  if (user) {
    redirect(callbackUrl as never);
  }

  return (
    <PageContainer className="justify-center px-5 py-8">
      <Card className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">SamenRoute</p>
            <LanguageSwitcher
              locale={locale}
              currentPath="/signin"
              label={dict.language.label}
              options={[
                { value: "nl", label: "NL", ariaLabel: dict.language.nl },
                { value: "en", label: "EN", ariaLabel: dict.language.en },
                { value: "tr", label: "TR", ariaLabel: dict.language.tr }
              ]}
            />
          </div>
          <h1 className="text-2xl font-semibold">{dict.auth.title}</h1>
          <p className="text-sm text-[var(--muted-foreground)]">{dict.auth.body}</p>
        </div>
        <SignInForm
          enableDemoLogin={process.env.NODE_ENV !== "production"}
          defaultEmail={email}
          callbackUrl={callbackUrl}
          copy={dict.auth}
        />
        {process.env.NODE_ENV !== "production" && env.AUTH_URL.includes("localhost") ? (
          <div className="flex flex-col gap-2 text-sm">
            <a href="/api/dev/open-latest-magic-link" className="text-[var(--accent)]">
              {dict.auth.latestMagicLink}
            </a>
            <a href="/api/dev/latest-magic-link" className="text-[var(--accent)]">
              {dict.auth.inboxJson}
            </a>
          </div>
        ) : null}
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--muted-foreground)]">
          <a href="/privacy" className="font-semibold text-[var(--accent)]">
            Privacy
          </a>
          <a href="/voorwaarden" className="font-semibold text-[var(--accent)]">
            Voorwaarden
          </a>
        </div>
      </Card>
    </PageContainer>
  );
}
