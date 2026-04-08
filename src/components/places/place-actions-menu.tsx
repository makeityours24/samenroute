"use client";

import { useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { IconButton } from "@/components/ui/icon-button";

export function PlaceActionsMenu({
  title,
  children,
  actionLabel
}: {
  title: string;
  children: ReactNode;
  actionLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton aria-label={actionLabel ?? `Open actions for ${title}`} onClick={() => setOpen(true)}>
        <MoreHorizontal className="h-4 w-4" />
      </IconButton>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={title}>
        <div className="space-y-2">{children}</div>
      </BottomSheet>
    </>
  );
}
