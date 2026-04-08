import { EmptyState } from "@/components/ui/empty-state";

export function EmptyPlacesState({
  title = "No places yet",
  description = "Add your first place to plan this list."
}: {
  title?: string;
  description?: string;
}) {
  return <EmptyState title={title} description={description} />;
}
