import type { InputHTMLAttributes } from "react";

export function Checkbox(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return <input type="checkbox" className="h-5 w-5 rounded border-[var(--border)] accent-[var(--accent)]" {...props} />;
}
