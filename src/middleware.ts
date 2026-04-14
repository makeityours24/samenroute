import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function getHostname(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.hostname;
  return host.split(":")[0].toLowerCase();
}

export function middleware(request: NextRequest) {
  const hostname = getHostname(request);
  const { pathname } = request.nextUrl;

  if (hostname === "makelaars.samenroute.nl" && (pathname === "/" || pathname.startsWith("/demo"))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/makelaars" : `/makelaars${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|examples).*)"]
};
