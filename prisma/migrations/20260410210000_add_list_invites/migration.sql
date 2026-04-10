CREATE TABLE "list_invites" (
  "id" TEXT PRIMARY KEY,
  "list_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "ListMemberRole" NOT NULL,
  "invited_by_user_id" TEXT NOT NULL,
  "accepted_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "list_invites_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "lists"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "list_invites_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "list_invites_list_id_email_key" ON "list_invites"("list_id", "email");
CREATE INDEX "list_invites_email_accepted_at_idx" ON "list_invites"("email", "accepted_at");
