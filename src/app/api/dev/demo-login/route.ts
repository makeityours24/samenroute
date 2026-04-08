import { NextResponse } from "next/server";
import { createDemoSession, getSessionCookieConfig } from "@/lib/auth/auth";

function getDemoEmail(input: string | null | undefined) {
  const value = input?.trim().toLowerCase();
  if (!value) return null;
  if (value === "anna") return "anna@samenroute.demo";
  if (value === "bas") return "bas@samenroute.demo";
  return value;
}

async function createDemoLoginResponse(email: string | null | undefined) {
  const normalizedEmail = getDemoEmail(email);

  if (!normalizedEmail) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const session = await createDemoSession(normalizedEmail);

  if (!session) {
    return NextResponse.json({ error: "Unknown demo user." }, { status: 404 });
  }

  const cookieConfig = getSessionCookieConfig();
  const response = NextResponse.json({ ok: true, redirectTo: "/home" });

  response.cookies.set(cookieConfig.name, session.sessionToken, {
    ...cookieConfig.options,
    expires: session.expires
  });

  return response;
}

async function createDemoRedirectResponse(request: Request, email: string | null | undefined, redirectTo: string) {
  const normalizedEmail = getDemoEmail(email);

  if (!normalizedEmail) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const session = await createDemoSession(normalizedEmail);

  if (!session) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  const cookieConfig = getSessionCookieConfig();
  const response = NextResponse.redirect(new URL(redirectTo || "/home", request.url));

  response.cookies.set(cookieConfig.name, session.sessionToken, {
    ...cookieConfig.options,
    expires: session.expires
  });

  return response;
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as { email?: string } | null;
  return createDemoLoginResponse(body?.email ?? null);
}

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  const url = new URL(request.url);
  const email = getDemoEmail(url.searchParams.get("email") ?? url.searchParams.get("user"));
  const redirectTo = url.searchParams.get("redirectTo") || "/home";

  return createDemoRedirectResponse(request, email, redirectTo);
}
