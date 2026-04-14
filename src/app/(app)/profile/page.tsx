import { AppTopBar } from "@/components/navigation/app-topbar";
import { ProfileHeader } from "@/components/profile/profile-header";
import { SettingsList } from "@/components/profile/settings-list";
import { getCurrentUser } from "@/lib/auth/auth";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { PageContainer } from "@/components/ui/page-container";
import { getAppAudience } from "@/lib/audience/server";
import { getDictionary } from "@/lib/i18n/server";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const audience = await getAppAudience();
  const { locale, dict } = await getDictionary();

  return (
    <PageContainer>
      <AppTopBar title={dict.profile.topTitle} subtitle={dict.profile.topSubtitle} />
      <LanguageSwitcher
        locale={locale}
        currentPath="/profile"
        label={dict.language.label}
        options={[
          { value: "nl", label: "NL", ariaLabel: dict.language.nl },
          { value: "en", label: "EN", ariaLabel: dict.language.en },
          { value: "tr", label: "TR", ariaLabel: dict.language.tr }
        ]}
      />
      <ProfileHeader
        email={user?.email}
        signedInAsLabel={dict.profile.signedInAs}
        unknownUserLabel={dict.profile.unknownUser}
      />
      <SettingsList
        items={[
          {
            title: dict.profile.mapsKeyTitle,
            subtitle: dict.profile.mapsKeyBody
          },
          {
            title: "Privacyverklaring",
            subtitle: "Lees hoe SamenRoute met persoonsgegevens en appdata omgaat.",
            trailing: (
              <a href="/privacy" className="rounded-full bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold">
                Open
              </a>
            )
          },
          {
            title: "Gebruiksvoorwaarden",
            subtitle: "Bekijk de basisafspraken voor het gebruik van SamenRoute.",
            trailing: (
              <a href="/voorwaarden" className="rounded-full bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold">
                Open
              </a>
            )
          },
          ...(audience === "business"
            ? [
                {
                  title: "Demo-aanvragen",
                  subtitle: "Bekijk nieuwe aanvragen vanaf makelaars.samenroute.nl op een plek.",
                  trailing: (
                    <a
                      href="/profile/demo-aanvragen"
                      className="rounded-full bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold"
                    >
                      Open
                    </a>
                  )
                }
              ]
            : []),
          {
            title: dict.profile.signOut,
            trailing: (
              <a
                href="/api/auth/signout?callbackUrl=/"
                className="rounded-full bg-[var(--surface-muted)] px-3 py-2 text-xs font-semibold"
              >
                {dict.profile.signOut}
              </a>
            )
          }
        ]}
      />
    </PageContainer>
  );
}
