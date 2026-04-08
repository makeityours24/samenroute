import { Badge } from "@/components/ui/badge";
import { ListRow } from "@/components/ui/list-row";

export function MemberRow({
  email,
  role,
  labels
}: {
  email: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  labels?: { owner: string; editor: string; viewer: string };
}) {
  const tone = role === "OWNER" ? "accent" : role === "EDITOR" ? "success" : "neutral";
  const copy = labels ?? { owner: "Owner", editor: "Editor", viewer: "Viewer" };
  const roleLabel = role === "OWNER" ? copy.owner : role === "EDITOR" ? copy.editor : copy.viewer;

  return <ListRow title={email} trailing={<Badge tone={tone}>{roleLabel}</Badge>} />;
}
