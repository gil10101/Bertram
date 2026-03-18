"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { UserProfile } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { createApiClient } from "@/lib/api-client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { MailSidebar } from "@/components/mail/mail-sidebar";

const PROVIDERS = [
  {
    key: "gmail",
    name: "Gmail",
    description: "Google Workspace & Gmail accounts",
    icon: (
      <Image src="/gmail-logo.svg" alt="Gmail" width={20} height={20} />
    ),
  },
  {
    key: "outlook",
    name: "Outlook",
    description: "Microsoft 365, Outlook.com & Hotmail",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V10.85l1.24.72h.01q.1.07.18.18.07.12.07.25zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z" fill="#0078D4"/>
      </svg>
    ),
  },
] as const;

function ConnectedAccounts() {
  const { getToken } = useAuth();
  const [providers, setProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const api = createApiClient(getToken);
      const data = await api.get<{ connected_providers: string[] }>("/auth/status");
      setProviders(data.connected_providers ?? []);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const connectProvider = async (provider: string) => {
    setActionLoading(provider);
    try {
      const api = createApiClient(getToken);
      const data = await api.get<{ url: string }>(`/auth/${provider}/connect`);
      if (data.url) window.location.href = data.url;
    } finally {
      setActionLoading(null);
    }
  };

  const disconnectProvider = async (provider: string) => {
    setActionLoading(provider);
    try {
      const api = createApiClient(getToken);
      await api.post(`/auth/disconnect/${provider}`);
      await fetchStatus();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <section>
      <h2 className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Connected Accounts
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Connect your email providers so Bertram can read and manage your inbox.
      </p>

      <div className="space-y-2">
        {PROVIDERS.map(({ key, name, description, icon }) => {
          const connected = providers.includes(key);
          const busy = actionLoading === key;

          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {loading ? (
                      "Checking..."
                    ) : connected ? (
                      <>
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Connected
                      </>
                    ) : (
                      description
                    )}
                  </div>
                </div>
              </div>
              {!loading &&
                (connected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => disconnectProvider(key)}
                  >
                    {busy ? "Disconnecting..." : "Disconnect"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => connectProvider(key)}
                  >
                    {busy ? "Connecting..." : "Connect"}
                  </Button>
                ))}
            </div>
          );
        })}
      </div>
    </section>
  );
}

const clerkDarkAppearance = {
  elements: {
    rootBox: "w-full",
    cardBox: "w-full shadow-none",
    card: "bg-card border border-border shadow-none rounded-lg w-full",
    navbar: "bg-card border-r-border",
    navbarButton: "text-muted-foreground hover:text-foreground hover:bg-accent",
    navbarButtonActive: "text-foreground bg-accent",
    headerTitle: "text-foreground",
    headerSubtitle: "text-muted-foreground",
    profileSectionTitle: "text-foreground border-b-border",
    profileSectionTitleText: "text-foreground",
    profileSectionContent: "text-foreground",
    profileSectionPrimaryButton: "text-paprika hover:text-paprika-500",
    formFieldLabel: "text-muted-foreground",
    formFieldInput:
      "bg-background border-border text-foreground focus:ring-ring",
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:bg-primary/90",
    formButtonReset: "text-muted-foreground hover:text-foreground",
    badge: "bg-accent text-accent-foreground",
    avatarBox: "border-border",
    pageScrollBox: "p-0",
    page: "gap-6",
    profilePage: "gap-6",
    accordionTriggerButton: "text-foreground hover:bg-accent",
    accordionContent: "text-muted-foreground",
    menuButton: "text-muted-foreground hover:text-foreground hover:bg-accent",
    menuList: "bg-card border-border",
    menuItem: "text-foreground hover:bg-accent",
  },
  variables: {
    colorPrimary: "#eb5e28",
    colorText: "#F5F2E9",
    colorTextSecondary: "#CCC5B9",
    colorBackground: "#2D2821",
    colorInputBackground: "#1E1D1B",
    colorInputText: "#F5F2E9",
    borderRadius: "0.5rem",
  },
};

function SettingsContent() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const settingsBody = (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground md:mb-8 md:text-3xl">
        Settings
      </h1>

      <div className="flex flex-col gap-8">
        <ConnectedAccounts />

        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Profile
          </h2>
          <div className="overflow-hidden rounded-lg border border-border bg-card [&_.cl-internal-b3fm6y]:shadow-none">
            <UserProfile
              routing="path"
              path="/settings"
              appearance={clerkDarkAppearance}
            />
          </div>
        </section>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <div className="dark flex h-screen w-full overflow-hidden bg-sidebar text-foreground">
        <MailSidebar />
        <div className="flex flex-1 min-w-0 gap-[2px] pr-1.5 py-1.5 pl-0">
          <div className="flex-1 min-w-0">
            <div className="h-full overflow-hidden rounded-xl bg-background">
              <div className="h-full overflow-y-auto p-4 md:p-6">
                {settingsBody}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="dark flex h-screen w-full overflow-hidden bg-sidebar text-foreground">
      <MailSidebar />
      <div className="flex flex-1 min-w-0 p-1 pl-0">
        <div className="flex-1 min-w-0">
          <div className="h-full overflow-hidden rounded-xl bg-background">
            <div className="h-full overflow-y-auto p-4">
              {settingsBody}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
