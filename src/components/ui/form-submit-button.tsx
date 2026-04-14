"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function FormSubmitButton({
  children,
  pendingLabel,
  ...props
}: {
  children: ReactNode;
  pendingLabel?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  type?: "submit";
}) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" pending={pending} aria-busy={pending} {...props}>
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  );
}
