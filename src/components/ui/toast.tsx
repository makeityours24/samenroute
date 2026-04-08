export function Toast({
  message,
  tone = "neutral"
}: {
  message: string;
  tone?: "neutral" | "success" | "error";
}) {
  return (
    <div
      role="status"
      className={[
        "rounded-2xl px-4 py-3 text-sm",
        tone === "neutral" && "bg-[var(--surface-muted)] text-[var(--foreground)]",
        tone === "success" && "bg-[#eaf4ed] text-[#2d6a4f]",
        tone === "error" && "bg-[#fdebea] text-[var(--danger)]"
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {message}
    </div>
  );
}
