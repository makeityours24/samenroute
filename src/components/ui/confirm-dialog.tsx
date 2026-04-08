"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "danger",
  onCancel,
  onConfirm,
  children
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onCancel: () => void;
  onConfirm: () => void;
  children?: ReactNode;
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
        </div>
        {children}
        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
            {cancelLabel}
          </Button>
          <Button type="button" variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} fullWidth>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
