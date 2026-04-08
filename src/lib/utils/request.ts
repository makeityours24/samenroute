import { headers } from "next/headers";
import { env } from "@/lib/env/env";
import { AuthorizationError } from "@/server/services/errors";
import { getCurrentUser } from "@/lib/auth/auth";
import { checkRateLimit } from "@/lib/rate-limit/memory-rate-limit";

export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthorizationError("Please sign in first.");
  }

  return user;
}

export async function guardSensitiveRequest(scope: string) {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for") ?? "local";
  const allowed = checkRateLimit(
    `${scope}:${forwarded}`,
    env.RATE_LIMIT_MAX_REQUESTS,
    env.RATE_LIMIT_WINDOW_MS
  );

  if (!allowed) {
    throw new AuthorizationError("Too many requests. Please slow down.");
  }
}
