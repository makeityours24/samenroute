import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function InviteMemberForm({
  action,
  listId,
  footer,
  copy
}: {
  action: (formData: FormData) => void | Promise<void>;
  listId: string;
  footer: ReactNode;
  copy?: {
    emailPlaceholder: string;
    emailLabel: string;
    roleLabel: string;
    viewer: string;
    editor: string;
  };
}) {
  const labels = copy ?? {
    emailPlaceholder: "friend@example.com",
    emailLabel: "Invite email",
    roleLabel: "Choose role",
    viewer: "Viewer",
    editor: "Editor"
  };

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="listId" value={listId} />
      <Input name="email" type="email" placeholder={labels.emailPlaceholder} aria-label={labels.emailLabel} required />
      <Select name="role" defaultValue="VIEWER" aria-label={labels.roleLabel}>
        <option value="VIEWER">{labels.viewer}</option>
        <option value="EDITOR">{labels.editor}</option>
      </Select>
      {footer}
    </form>
  );
}
