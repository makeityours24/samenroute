import { EmptyState } from "@/components/ui/empty-state";

export function EmptyHistoryState({
  title = "No history yet",
  description = "Visited and skipped places will appear here."
}: {
  title?: string;
  description?: string;
}) {
  return <EmptyState title={title} description={description} />;
}
