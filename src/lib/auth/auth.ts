import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Email from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/env/env";

const devEmailDir = path.join(process.cwd(), ".tmp", "emails");

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

async function storeMagicLink(email: string, url: string) {
  await fs.mkdir(devEmailDir, { recursive: true });
  const filename = path.join(devEmailDir, `${Date.now()}-${email.replace(/[^a-z0-9]/gi, "_")}.json`);
  await fs.writeFile(filename, JSON.stringify({ email, url, createdAt: new Date().toISOString() }, null, 2), "utf8");
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
        if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD) {
          await storeMagicLink(params.identifier, params.url);
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

        await transport.sendMail({
          to: params.identifier,
          from: env.EMAIL_FROM,
          subject: "Sign in to SamenRoute",
          text: `Open this magic link to sign in: ${params.url}`,
          html: `<p>Open this magic link to sign in:</p><p><a href="${params.url}">${params.url}</a></p>`
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

      return session;
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
