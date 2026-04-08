"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route as AppRoute } from "next";
import { usePathname } from "next/navigation";
import { ClipboardList, History, House, Route, UserRound } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function BottomNav({
  labels
}: {
  labels: {
    home: string;
    lists: string;
    today: string;
    history: string;
    profile: string;
  };
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const items = [
    { href: "/home", label: labels.home, icon: House },
    { href: "/lists", label: labels.lists, icon: ClipboardList },
    { href: "/today", label: labels.today, icon: Route },
    { href: "/history", label: labels.history, icon: History },
    { href: "/profile", label: labels.profile, icon: UserRound }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t border-[var(--border)] bg-white/92 px-2 pb-2 pt-2 shadow-[0_-8px_24px_rgba(18,18,16,0.06)] backdrop-blur">
      <ul className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const active = mounted && pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href as AppRoute}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center rounded-[20px] px-1 text-[11px] font-medium transition active:scale-[0.98]",
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-[var(--shadow-soft)]"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                <Icon className={cn("mb-1 h-4 w-4", active && "scale-105")} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
