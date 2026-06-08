import { AppSidebar } from "@/components/sidebar/AppSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F7F6F2]">
      <AppSidebar />
      <main className="flex-1 ml-[240px] min-h-screen transition-all duration-300 lg:ml-[240px] md:ml-0">
        {children}
      </main>
    </div>
  );
}
