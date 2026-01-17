import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { QueryProvider } from "@/components/providers/query-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <QueryProvider>
      <div className="min-h-screen bg-background">
        <Header userName={profile?.full_name} />
        <main className="pb-20 md:pb-4">{children}</main>
        <BottomNav />
      </div>
    </QueryProvider>
  );
}
