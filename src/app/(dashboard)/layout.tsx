import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";
import { QueryProvider } from "@/components/providers/query-provider";
import { CryptoProvider } from "@/components/providers/crypto-provider";

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
      <CryptoProvider>
      <div className="min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <Sidebar userName={profile?.full_name} />

        {/* Mobile Header */}
        <div className="md:hidden">
          <Header userName={profile?.full_name} />
        </div>

        {/* Main Content */}
        <main className="pb-20 md:pb-8 md:pl-64">
          <div className="md:px-6 md:py-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
      </CryptoProvider>
    </QueryProvider>
  );
}
