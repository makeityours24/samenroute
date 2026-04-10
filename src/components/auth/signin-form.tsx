"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignInForm({
  enableDemoLogin,
  copy
}: {
  enableDemoLogin: boolean;
  copy: {
    emailPlaceholder: string;
    emailButton: string;
    sending: string;
    demoTitle: string;
    demoBody: string;
    demoAnna: string;
    demoBas: string;
    magicLinkSent: string;
    magicLinkCheckInbox: string;
    magicLinkRetryHint: string;
    editEmail: string;
    magicLinkError: string;
    demoOpenError: string;
  };
}) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function requestMagicLink(nextEmail: string) {
    if (pending) {
      return;
    }

    setPending(true);
    setMessage(null);
    setStatus("idle");
    const result = await signIn("email", {
      email: nextEmail,
      redirect: false,
      callbackUrl: "/home"
    });

    if (result?.error) {
      setMessage(copy.magicLinkError);
      setStatus("error");
      setPending(false);
      return;
    }

    setPending(false);
    setMessage(copy.magicLinkSent);
    setSentEmail(nextEmail);
    setStatus("success");
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
          disabled={status === "success"}
          onChange={(event) => {
            setEmail(event.target.value);

            if (status !== "idle") {
              setStatus("idle");
              setMessage(null);
            }
          }}
        />
        {status === "success" ? (
          <div className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] p-3">
            <p className="text-sm font-semibold text-[var(--foreground)]">{copy.magicLinkCheckInbox}</p>
            <p className="text-sm text-[var(--muted-foreground)]">{sentEmail ?? email}</p>
            <p className="text-xs leading-5 text-[var(--muted-foreground)]">{copy.magicLinkRetryHint}</p>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setStatus("idle");
                setMessage(null);
                setSentEmail(null);
              }}
            >
              {copy.editEmail}
            </Button>
          </div>
        ) : (
          <Button type="submit" fullWidth disabled={pending}>
            {pending ? copy.sending : copy.emailButton}
          </Button>
        )}
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
      {message && status !== "success" ? <p className="text-sm text-[var(--muted-foreground)]">{message}</p> : null}
    </div>
  );
}
