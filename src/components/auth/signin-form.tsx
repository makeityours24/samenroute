"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInForm({
  hasGoogle,
  hasGithub,
  enableDemoLogin,
  copy
}: {
  hasGoogle: boolean;
  hasGithub: boolean;
  enableDemoLogin: boolean;
  copy: {
    emailPlaceholder: string;
    emailButton: string;
    sending: string;
    google: string;
    github: string;
    demoTitle: string;
    demoBody: string;
    demoAnna: string;
    demoBas: string;
    magicLinkSent: string;
    magicLinkError: string;
    demoOpenError: string;
  };
}) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function requestMagicLink(nextEmail: string) {
    setPending(true);
    setMessage(null);
    const result = await signIn("email", {
      email: nextEmail,
      redirect: false,
      callbackUrl: "/home"
    });

    if (result?.error) {
      setMessage(copy.magicLinkError);
      setPending(false);
      return;
    }

    setPending(false);
    setMessage(copy.magicLinkSent);
  }

  return (
    <div className="space-y-4">
      <form
        className="space-y-3"
        onSubmit={async (event) => {
          event.preventDefault();
          await requestMagicLink(email);
        }}
      >
        <Input
          type="email"
          name="email"
          placeholder={copy.emailPlaceholder}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Button type="submit" fullWidth disabled={pending}>
          {pending ? copy.sending : copy.emailButton}
        </Button>
      </form>
      {enableDemoLogin ? (
        <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{copy.demoTitle}</p>
          <p className="text-sm text-[var(--muted-foreground)]">{copy.demoBody}</p>
          <div className="grid gap-2">
            <a
              href="/api/dev/demo-login?user=anna&redirectTo=/home"
              className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
            >
              {copy.demoAnna}
            </a>
            <a
              href="/api/dev/demo-login?user=bas&redirectTo=/home"
              className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-soft)]"
            >
              {copy.demoBas}
            </a>
          </div>
        </div>
      ) : null}
      {hasGoogle ? (
        <Button variant="primary" fullWidth onClick={() => signIn("google", { callbackUrl: "/home" })}>
          {copy.google}
        </Button>
      ) : null}
      {hasGithub ? (
        <Button variant="secondary" fullWidth onClick={() => signIn("github", { callbackUrl: "/home" })}>
          {copy.github}
        </Button>
      ) : null}
      {message ? <p className="text-sm text-[var(--muted-foreground)]">{message}</p> : null}
    </div>
  );
}
