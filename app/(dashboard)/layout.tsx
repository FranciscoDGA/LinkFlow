import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import MobileNav from "@/components/ui/MobileNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteção redundante ao middleware (defesa em profundidade).
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Header email={user.email} />
        <main className="flex-1 p-6 pb-24 md:pb-6">{children}</main>
        <MobileNav />
      </div>
    </div>
  );
}
