import { headers } from "next/headers";

export type AppAudience = "consumer" | "business";

function normalizeHost(value: string | null | undefined) {
  return (value ?? "").split(":")[0].toLowerCase();
}

export async function getAppAudience(): Promise<AppAudience> {
  const store = await headers();
  const forwardedHost = normalizeHost(store.get("x-forwarded-host"));
  const host = forwardedHost || normalizeHost(store.get("host"));

  if (host === "makelaars.samenroute.nl") {
    return "business";
  }

  return "consumer";
}
