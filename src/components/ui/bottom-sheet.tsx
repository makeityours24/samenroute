"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

export function BottomSheet({
  open,
  onClose,
  title,
  children
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/30" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close sheet" />
      <div className="safe-bottom relative z-10 w-full rounded-t-[28px] bg-white px-4 pb-5 pt-3 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-[var(--border)]" />
          <IconButton className="absolute right-4 top-3" aria-label="Close sheet" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>
        <h2 className="mb-4 pr-16 text-[28px] font-semibold leading-tight">{title}</h2>
        {children}
      </div>
    </div>
  );
}
