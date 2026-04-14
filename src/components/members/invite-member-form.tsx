"use client";

import { useActionState } from "react";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import type { ShareListFormState } from "@/app/(app)/actions";

export function InviteMemberForm({
  action,
  listId,
  submitLabel,
  stickySubmit,
  copy
}: {
  action: (state: ShareListFormState, formData: FormData) => Promise<ShareListFormState>;
  listId: string;
  submitLabel: string;
  stickySubmit?: boolean;
  copy?: {
    emailPlaceholder: string;
    emailLabel: string;
    roleLabel: string;
    viewer: string;
    editor: string;
    successMessage: string;
  };
}) {
  const [state, formAction] = useActionState(action, { status: "idle" });
  const labels = copy ?? {
    emailPlaceholder: "friend@example.com",
    emailLabel: "Invite email",
    roleLabel: "Choose role",
    viewer: "Viewer",
    editor: "Editor",
    successMessage: "Invitation sent."
  };

  const submitButton = (
    <FormSubmitButton fullWidth pendingLabel="Bezig...">
      {submitLabel}
    </FormSubmitButton>
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="listId" value={listId} />
      <Input name="email" type="email" placeholder={labels.emailPlaceholder} aria-label={labels.emailLabel} required />
      <Select name="role" defaultValue="VIEWER" aria-label={labels.roleLabel}>
        <option value="VIEWER">{labels.viewer}</option>
        <option value="EDITOR">{labels.editor}</option>
      </Select>
      {state.status === "error" && state.message ? <p className="text-sm text-[var(--danger)]">{state.message}</p> : null}
      {state.status === "success" ? (
        <p className="text-sm text-[#2d6a4f]">{state.message ?? labels.successMessage}</p>
      ) : null}
      {stickySubmit ? <StickyActionBar>{submitButton}</StickyActionBar> : submitButton}
    </form>
  );
}
