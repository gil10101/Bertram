import { MobileSidebarProvider } from "@/components/common/mobile-sidebar-provider";
import { ComposeProvider } from "@/components/common/compose-provider";
import { SearchProvider } from "@/components/common/search-provider";
import { EmailSyncProvider } from "@/components/common/email-sync-provider";
import { DashboardShell } from "@/components/common/dashboard-shell";

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
            <DashboardShell>
              {children}
            </DashboardShell>
          </ComposeProvider>
        </MobileSidebarProvider>
      </SearchProvider>
    </EmailSyncProvider>
  );
}
