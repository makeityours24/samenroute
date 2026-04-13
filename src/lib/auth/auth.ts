import fs from "node:fs/promises";
import path from "node:path";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Email from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env/env";
import { acceptPendingListInvitesService } from "@/server/services/lists/accept-pending-list-invites.service";
import { AppError } from "@/server/services/errors";

const devEmailDir = path.join(process.cwd(), ".tmp", "emails");
const MAGIC_LINK_MAX_AGE_SECONDS = 60 * 60 * 24;

function getIsSecureAuth() {
  return new URL(env.AUTH_URL).protocol === "https:";
}

export function getSessionCookieConfig() {
  const secure = getIsSecureAuth();

  return {
    name: secure ? "__Secure-next-auth.session-token" : "next-auth.session-token",
    options: {
      httpOnly: true,
      sameSite: "lax" as const,
      path: "/",
      secure
    }
  };
}

function normalizeAppPath(input: string) {
  if (!input.startsWith("/")) {
    return "/home";
  }

  return input;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildMagicLinkEmail(input: {
  intro: string;
  reason: string;
  url: string;
  destinationHint?: string;
}) {
  const safeIntro = escapeHtml(input.intro);
  const safeReason = escapeHtml(input.reason);
  const safeUrl = escapeHtml(input.url);
  const destinationHint = input.destinationHint ?? "Daarna ga je direct verder in de app.";
  const safeDestinationHint = escapeHtml(destinationHint);

  return {
    text: `${input.intro}

Waarom je deze mail krijgt:
${input.reason}

Wat je moet doen:
1. Klik op de knop of open de link hieronder.
2. Je wordt automatisch ingelogd op SamenRoute.
3. ${destinationHint}

Heb je dit niet zelf gedaan?
Dan kun je deze mail negeren. Er gebeurt niets als je niet op de link klikt.

Inloglink:
${input.url}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:560px;margin:0 auto">
        <h2 style="margin-bottom:12px;color:#111827">Je link voor SamenRoute</h2>
        <p>${safeIntro}</p>
        <p><strong>Waarom je deze mail krijgt</strong><br />${safeReason}</p>
        <p><strong>Wat je moet doen</strong></p>
        <ol style="padding-left:20px">
          <li>Klik op de knop hieronder.</li>
          <li>Je wordt automatisch ingelogd op SamenRoute.</li>
          <li>${safeDestinationHint}</li>
        </ol>
        <p style="margin:20px 0">
          <a href="${safeUrl}" style="display:inline-block;background:#1f7a5c;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">
            Open SamenRoute
          </a>
        </p>
        <p style="font-size:14px;color:#4b5563">
          Werkt de knop niet? Open dan deze link:<br />
          <a href="${safeUrl}">${safeUrl}</a>
        </p>
        <p style="font-size:14px;color:#4b5563">
          <strong>Heb je dit niet zelf gedaan?</strong><br />
          Dan kun je deze mail negeren. Er gebeurt niets als je niet op de link klikt.
        </p>
      </div>
    `
  };
}

async function storeMagicLink(email: string, url: string) {
  await fs.mkdir(devEmailDir, { recursive: true });
  const filename = path.join(devEmailDir, `${Date.now()}-${email.replace(/[^a-z0-9]/gi, "_")}.json`);
  await fs.writeFile(filename, JSON.stringify({ email, url, createdAt: new Date().toISOString() }, null, 2), "utf8");
}

async function deliverMagicLinkEmail(params: {
  email: string;
  url: string;
  subject: string;
  text: string;
  html: string;
}) {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
    if (process.env.NODE_ENV === "production") {
      throw new AppError("E-mailverzending voor uitnodigingen is nog niet ingesteld in productie.");
    }

    await storeMagicLink(params.email, params.url);
    return;
  }

  const transport = await import("nodemailer").then((module) =>
    module.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD
      }
    })
  );

  try {
    await transport.sendMail({
      to: params.email,
      from: env.EMAIL_FROM,
      subject: params.subject,
      text: params.text,
      html: params.html
    });
  } catch (error) {
    console.error("Failed to send email magic link", error);
    throw new AppError("De uitnodigingsmail kon niet worden verstuurd.");
  }
}

export async function sendEmailMagicLink(input: {
  email: string;
  callbackPath: string;
  subject: string;
  intro: string;
  reason?: string;
  destinationHint?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + MAGIC_LINK_MAX_AGE_SECONDS * 1000);
  const callbackUrl = new URL(normalizeAppPath(input.callbackPath), env.APP_BASE_URL).toString();
  const url = new URL("/api/auth/callback/email", env.APP_BASE_URL);

  url.searchParams.set("callbackUrl", callbackUrl);
  url.searchParams.set("token", token);
  url.searchParams.set("email", email);

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: createHash("sha256").update(`${token}${env.AUTH_SECRET}`).digest("hex"),
      expires
    }
  });

  const emailContent = buildMagicLinkEmail({
    intro: input.intro,
    reason: input.reason ?? "Deze link is voor je aangemaakt binnen SamenRoute.",
    url: url.toString(),
    destinationHint: input.destinationHint
  });

  await deliverMagicLinkEmail({
    email,
    url: url.toString(),
    subject: input.subject,
    text: emailContent.text,
    html: emailContent.html
  });
}

function createProviders() {
  const providers: NonNullable<NextAuthOptions["providers"]> = [
    Email({
      from: env.EMAIL_FROM,
      server:
        env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD
          ? {
              host: env.SMTP_HOST,
              port: env.SMTP_PORT,
              auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASSWORD
          }
            }
          : undefined,
      async sendVerificationRequest(params: { identifier: string; url: string }) {
        const emailContent = buildMagicLinkEmail({
          intro: "Je probeerde in te loggen op SamenRoute.",
          reason: "Je hebt zojuist je e-mailadres ingevuld op samenroute.nl om veilig in te loggen.",
          url: params.url
        });

        await deliverMagicLinkEmail({
          email: params.identifier,
          url: params.url,
          subject: "Je inloglink voor SamenRoute",
          text: emailContent.text,
          html: emailContent.html
        });
      }
    })
  ];

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET
      })
    );
  }

  if (env.GITHUB_ID && env.GITHUB_SECRET) {
    providers.push(
      GitHub({
        clientId: env.GITHUB_ID,
        clientSecret: env.GITHUB_SECRET
      })
    );
  }

  return providers;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: createProviders(),
  secret: env.AUTH_SECRET,
  cookies: {
    sessionToken: getSessionCookieConfig()
  },
  session: {
    strategy: "database"
  },
  pages: {
    signIn: "/signin"
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.image = "image" in user ? (user.image ?? null) : null;
      }

      if (user.email && user.id) {
        try {
          await acceptPendingListInvitesService({
            userId: user.id,
            email: user.email
          });
        } catch (error) {
          console.error("Failed to sync pending list invites from session", error);
        }
      }

      return session;
    }
  },
  events: {
    async signIn({ user }) {
      if (!user.email || !user.id) {
        return;
      }

      try {
        await acceptPendingListInvitesService({
          userId: user.id,
          email: user.email
        });
      } catch (error) {
        console.error("Failed to accept pending list invites", error);
      }
    }
  }
};

export async function createDemoSession(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const knownDemoUsers: Record<string, { name: string }> = {
    "anna@samenroute.demo": { name: "Anna" },
    "bas@samenroute.demo": { name: "Bas" }
  };

  const demoUser = knownDemoUsers[normalizedEmail];

  if (!demoUser) {
    return null;
  }

  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {
      name: demoUser.name,
      emailVerified: new Date()
    },
    create: {
      email: normalizedEmail,
      name: demoUser.name,
      emailVerified: new Date()
    }
  });

  const sessionToken = randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires
    }
  });

  return { sessionToken, expires, user };
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !session.user.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name
  };
}
