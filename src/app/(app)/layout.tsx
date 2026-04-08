import { redirect } from "next/navigation";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { getCurrentUser } from "@/lib/auth/auth";
import { getDictionary } from "@/lib/i18n/server";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const { dict } = await getDictionary();

  if (!user) {
    redirect("/signin");
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-transparent pb-24">
      {children}
      <BottomNav labels={dict.nav} />
    </div>
  );
}
