import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { Textarea } from "@/components/ui/textarea";

export function CreateListForm({
  action,
  footer
}: {
  action: (formData: FormData) => void | Promise<void>;
  footer: ReactNode;
}) {
  return (
    <form action={action} className="space-y-3">
      <Input name="name" placeholder="Weekend in Rotterdam" aria-label="List name" required />
      <Textarea name="description" placeholder="Places to eat, walk, or grab coffee" aria-label="List description" />
      <Input name="coverColor" placeholder="#1F7A5C" aria-label="Cover color" />
      <StickyActionBar>{footer}</StickyActionBar>
    </form>
  );
}
