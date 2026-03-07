import { Sidebar } from "@/components/common/sidebar";
import { Topbar } from "@/components/common/topbar";
import { MobileSidebarProvider } from "@/components/common/mobile-sidebar-provider";
import { ComposeProvider } from "@/components/common/compose-provider";
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
          <ComposeProvider>
            <div className="dark flex h-screen bg-background text-foreground">
              <Sidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <div className="flex-1 overflow-hidden p-2 pt-0">
                  <main className="h-full overflow-hidden rounded-2xl bg-card/90">
                    {children}
                  </main>
                </div>
              </div>
            </div>
          </ComposeProvider>
        </MobileSidebarProvider>
      </SearchProvider>
    </EmailSyncProvider>
  );
}
