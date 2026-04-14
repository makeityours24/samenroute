"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DayPlanShareButton({
  listId,
  dayNumber,
  title,
  label,
  copiedLabel
}: {
  listId: string;
  dayNumber: number;
  title: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/today?listId=${encodeURIComponent(listId)}&day=${dayNumber}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch {
        // Fall back to copying when native share is cancelled or unavailable.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Kopieer deze link", url);
    }
  }

  return (
    <Button type="button" variant="secondary" fullWidth onClick={handleShare}>
      <Share2 className="h-4 w-4" />
      {copied ? copiedLabel : label}
    </Button>
  );
}
