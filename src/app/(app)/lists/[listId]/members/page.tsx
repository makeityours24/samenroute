import { notFound } from "next/navigation";
import { submitShareListAction } from "@/app/(app)/actions";
import { InviteMemberForm } from "@/components/members/invite-member-form";
import { MemberRow } from "@/components/members/member-row";
import { AppTopBar } from "@/components/navigation/app-topbar";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { getCurrentUser } from "@/lib/auth/auth";
import { getDictionary } from "@/lib/i18n/server";
import { ListRepository } from "@/server/repositories/list.repository";
import { ListMemberRole } from "@/server/domain/enums";

const listRepository = new ListRepository();

export default async function MembersPage({ params }: { params: Promise<{ listId: string }> }) {
  const { listId } = await params;
  const { dict } = await getDictionary();
  const user = await getCurrentUser();
  const list = user ? await listRepository.findDetail(listId, user.id) : null;

  if (!list) {
    notFound();
  }

  const membershipRole = list.ownerUserId === user?.id ? ListMemberRole.OWNER : (list.members.find((member) => member.userId === user?.id)?.role ?? undefined);
  const canManageMembers = membershipRole === ListMemberRole.OWNER;
  const memberInsights = list.members.map((member) => {
    const addedCount = list.listPlaces.filter((item) => item.place.createdByUser?.id === member.userId).length;
    const visitedCount = list.listPlaces.filter((item) => item.visitedByUser?.id === member.userId).length;

    const notes = [];

    if (addedCount > 0) {
      notes.push(dict.members.addedSummary.replace("{count}", String(addedCount)));
    }

    if (visitedCount > 0) {
      notes.push(dict.members.visitedSummary.replace("{count}", String(visitedCount)));
    }

    if (addedCount > visitedCount && addedCount > 0) {
      notes.push(dict.members.oftenAdds);
    } else if (visitedCount > 0) {
      notes.push(dict.members.oftenVisits);
    }

    return {
      id: member.id,
      email: member.user.email,
      role: member.role,
      addedCount,
      visitedCount,
      subtitle: notes.join(" • ")
    };
  });
  const topAdder = [...memberInsights].sort((left, right) => right.addedCount - left.addedCount)[0];
  const topVisitor = [...memberInsights].sort((left, right) => right.visitedCount - left.visitedCount)[0];

  return (
    <PageContainer>
      <AppTopBar title={dict.members.topTitle} subtitle={list.name} backHref={`/lists/${list.id}`} backLabel={dict.common.back} />
      <Card className="space-y-2">
        <SectionHeader title={dict.members.insightsTitle} subtitle={dict.members.insightsSubtitle} />
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          {dict.members.topAdderLabel.replace("{email}", topAdder?.email ?? dict.members.noInsightYet)}
        </p>
        <p className="text-sm leading-6 text-[var(--muted-foreground)]">
          {dict.members.topVisitorLabel.replace("{email}", topVisitor?.email ?? dict.members.noInsightYet)}
        </p>
      </Card>
      <section className="space-y-3">
        <SectionHeader title={dict.members.peopleTitle} subtitle={dict.members.peopleSubtitle} />
        {memberInsights.length > 0 ? (
          memberInsights.map((member) => (
            <MemberRow
              key={member.id}
              email={member.email}
              subtitle={member.subtitle || undefined}
              role={member.role}
              labels={{ owner: dict.members.owner, editor: dict.members.editor, viewer: dict.members.viewer }}
            />
          ))
        ) : (
          <EmptyState title={dict.members.empty} description={dict.members.emptyBody} />
        )}
      </section>
      {canManageMembers ? (
        <Card className="space-y-4">
          <SectionHeader title={dict.members.inviteTitle} subtitle={dict.members.inviteSubtitle} />
          <InviteMemberForm
            action={submitShareListAction}
            listId={list.id}
            submitLabel={dict.members.sendInvite}
            stickySubmit
            copy={{
              emailPlaceholder: dict.members.emailPlaceholder,
              emailLabel: dict.members.emailLabel,
              roleLabel: dict.members.roleLabel,
              viewer: dict.members.viewer,
              editor: dict.members.editor,
              successMessage: "Uitnodiging verstuurd."
            }}
          />
        </Card>
      ) : null}
    </PageContainer>
  );
}
