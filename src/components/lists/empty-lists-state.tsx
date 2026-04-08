import { EmptyState } from "@/components/ui/empty-state";

export function EmptyListsState({
  title = "No lists yet",
  description = "Create your first list to start saving places."
}: {
  title?: string;
  description?: string;
}) {
  return <EmptyState title={title} description={description} />;
}
