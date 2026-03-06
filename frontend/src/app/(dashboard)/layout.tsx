import { Sidebar } from "@/components/common/sidebar";
import { Topbar } from "@/components/common/topbar";
import { MobileSidebarProvider } from "@/components/common/mobile-sidebar-provider";
import { SearchProvider } from "@/components/common/search-provider";
import { EmailSyncProvider } from "@/components/common/email-sync-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmailSyncProvider>
      <SearchProvider>
        <MobileSidebarProvider>
          <div className="flex h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>
          </div>
        </MobileSidebarProvider>
      </SearchProvider>
    </EmailSyncProvider>
  );
}
