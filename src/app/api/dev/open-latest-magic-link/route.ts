import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { env } from "@/lib/env/env";

const devEmailDir = path.join(process.cwd(), ".tmp", "emails");

function rewriteMagicLink(url: string) {
  try {
    const parsed = new URL(url);
    const publicBase = new URL(env.APP_BASE_URL);

    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      parsed.protocol = publicBase.protocol;
      parsed.hostname = publicBase.hostname;
      parsed.port = publicBase.port;
    }

    const callbackUrl = parsed.searchParams.get("callbackUrl");

    if (callbackUrl) {
      const callback = new URL(callbackUrl);

      if (callback.hostname === "localhost" || callback.hostname === "127.0.0.1") {
        callback.protocol = publicBase.protocol;
        callback.hostname = publicBase.hostname;
        callback.port = publicBase.port;
        parsed.searchParams.set("callbackUrl", callback.toString());
      }
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available." }, { status: 404 });
  }

  try {
    const files = await fs.readdir(devEmailDir);
    const latest = files.sort().at(-1);

    if (!latest) {
      return NextResponse.json({ error: "No magic link available yet." }, { status: 404 });
    }

    const content = await fs.readFile(path.join(devEmailDir, latest), "utf8");
    const data = JSON.parse(content) as { url: string };

    return NextResponse.redirect(rewriteMagicLink(data.url));
  } catch {
    return NextResponse.json({ error: "No magic link available yet." }, { status: 404 });
  }
}
