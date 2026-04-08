import { cookies } from "next/headers";
import { defaultLocale, dictionaries, locales, type Locale } from "@/lib/i18n/dictionaries";

export const localeCookieName = "samenroute-locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && locales.includes(value as Locale));
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const cookieValue = store.get(localeCookieName)?.value;
  return isLocale(cookieValue) ? cookieValue : defaultLocale;
}

export async function getDictionary() {
  const locale = await getLocale();
  return { locale, dict: dictionaries[locale] };
}
