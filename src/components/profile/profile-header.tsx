import { Card } from "@/components/ui/card";

export function ProfileHeader({
  email,
  signedInAsLabel,
  unknownUserLabel
}: {
  email?: string | null;
  signedInAsLabel: string;
  unknownUserLabel: string;
}) {
  return (
    <Card className="space-y-1">
      <p className="text-sm text-[var(--muted-foreground)]">{signedInAsLabel}</p>
      <p className="text-lg font-semibold">{email ?? unknownUserLabel}</p>
    </Card>
  );
}
