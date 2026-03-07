"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { UserProfile } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { createApiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

const PROVIDERS = [
  {
    key: "gmail",
    name: "Gmail",
    description: "Google Workspace & Gmail accounts",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points="22,6 12,13 2,6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "outlook",
    name: "Outlook",
    description: "Microsoft 365, Outlook.com & Hotmail",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <rect
          x="2"
          y="3"
          width="20"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M2 8h20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 3v5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16 3v5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="12" cy="15" r="3" stroke="currentColor" strokeWidth="2" />
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
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{name}</p>
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

export default function SettingsPage() {
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight md:mb-8 md:text-3xl">
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
    </div>
  );
}
