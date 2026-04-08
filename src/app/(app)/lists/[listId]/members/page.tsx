import { notFound } from "next/navigation";
import { shareListAction } from "@/app/(app)/actions";
import { InviteMemberForm } from "@/components/members/invite-member-form";
import { MemberRow } from "@/components/members/member-row";
import { AppTopBar } from "@/components/navigation/app-topbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/ui/page-container";
import { SectionHeader } from "@/components/ui/section-header";
import { StickyActionBar } from "@/components/ui/sticky-action-bar";
import { getCurrentUser } from "@/lib/auth/auth";
import { getDictionary } from "@/lib/i18n/server";
import { ListRepository } from "@/server/repositories/list.repository";

const listRepository = new ListRepository();

export default async function MembersPage({ params }: { params: Promise<{ listId: string }> }) {
  const { listId } = await params;
  const { dict } = await getDictionary();
  const user = await getCurrentUser();
  const list = user ? await listRepository.findDetail(listId, user.id) : null;

  if (!list) {
    notFound();
  }

  return (
    <PageContainer>
      <AppTopBar title={dict.members.topTitle} subtitle={list.name} backHref={`/lists/${list.id}`} backLabel={dict.common.back} />
      <section className="space-y-3">
        <SectionHeader title={dict.members.peopleTitle} subtitle={dict.members.peopleSubtitle} />
        {list.members.length > 0 ? (
          list.members.map((member) => (
            <MemberRow
              key={member.id}
              email={member.user.email}
              role={member.role}
              labels={{ owner: dict.members.owner, editor: dict.members.editor, viewer: dict.members.viewer }}
            />
          ))
        ) : (
          <EmptyState title={dict.members.empty} description={dict.members.emptyBody} />
        )}
      </section>
      <Card className="space-y-4">
        <SectionHeader title={dict.members.inviteTitle} subtitle={dict.members.inviteSubtitle} />
        <InviteMemberForm
          action={shareListAction}
          listId={list.id}
          copy={{
            emailPlaceholder: dict.members.emailPlaceholder,
            emailLabel: dict.members.emailLabel,
            roleLabel: dict.members.roleLabel,
            viewer: dict.members.viewer,
            editor: dict.members.editor
          }}
          footer={
            <StickyActionBar>
              <Button type="submit" fullWidth>
                {dict.members.sendInvite}
              </Button>
            </StickyActionBar>
          }
        />
      </Card>
    </PageContainer>
  );
}
