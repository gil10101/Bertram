"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { UserProfile } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { createApiClient } from "@/lib/api-client";

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
    <section className="mb-8 rounded-lg border p-4 md:p-6">
      <h2 className="mb-4 text-lg font-medium">Connected Accounts</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Connect your email providers so Bertram can read and manage your inbox.
      </p>

      <div className="space-y-3">
        {PROVIDERS.map(({ key, name, description, icon }) => {
          const connected = providers.includes(key);
          const busy = actionLoading === key;

          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-md border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {icon}
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {loading
                      ? "Checking..."
                      : connected
                        ? "Connected"
                        : description}
                  </p>
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

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-xl font-semibold md:mb-6 md:text-2xl">Settings</h1>

      <ConnectedAccounts />

      <section className="rounded-lg border p-4 md:p-6">
        <h2 className="mb-4 text-lg font-medium">Profile</h2>
        <UserProfile routing="path" path="/settings" />
      </section>
    </div>
  );
}
