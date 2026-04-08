"use client";

import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close dialog" />
      <div className="relative z-10 w-full max-w-sm rounded-[28px] bg-white p-5 shadow-2xl">{children}</div>
    </div>
  );
}
