import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale } from "@/lib/i18n/dictionaries";
import { isLocale, localeCookieName } from "@/lib/i18n/server";

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale");
  const redirectTo = request.nextUrl.searchParams.get("redirectTo") || "/";
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  response.cookies.set(localeCookieName, isLocale(locale) ? locale : defaultLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax"
  });

  return response;
}
