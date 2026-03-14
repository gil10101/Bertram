"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@clerk/nextjs";

interface NewEmailPreview {
  id: string;
  subject: string;
  sender: { name: string; email: string };
  snippet: string;
  provider?: string;
}

interface EmailSyncState {
  /** Number of new emails since user last dismissed */
  newEmailCount: number;
  /** Most recent batch of new email previews */
  newEmails: NewEmailPreview[];
  /** Total unread count from server */
  unreadCount: number;
  /** Whether we're connected to the SSE stream */
  isConnected: boolean;
  /** Dismiss the new-email notification and trigger refetch */
  dismiss: () => void;
  /** Register a callback to be called when new emails arrive */
  onNewEmails: (cb: () => void) => () => void;
}

const EmailSyncContext = createContext<EmailSyncState>({
  newEmailCount: 0,
  newEmails: [],
  unreadCount: 0,
  isConnected: false,
  dismiss: () => {},
  onNewEmails: () => () => {},
});

export function useEmailSync() {
  return useContext(EmailSyncContext);
}

export function EmailSyncProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const [newEmailCount, setNewEmailCount] = useState(0);
  const [newEmails, setNewEmails] = useState<NewEmailPreview[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Listeners that get called when new emails arrive (e.g. to trigger refetch)
  const listenersRef = useRef<Set<() => void>>(new Set());

  const onNewEmails = useCallback((cb: () => void) => {
    listenersRef.current.add(cb);
    return () => {
      listenersRef.current.delete(cb);
    };
  }, []);

  const dismiss = useCallback(() => {
    setNewEmailCount(0);
    setNewEmails([]);
    // Trigger refetch in any listening hooks
    listenersRef.current.forEach((cb) => cb());
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;

    let eventSource: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout>;
    let cancelled = false;

    function connect() {
      if (cancelled) return;

      eventSource = new EventSource("/api/sync/stream");

      eventSource.addEventListener("connected", (e) => {
        setIsConnected(true);
        // Reset new-email notifications on reconnect so stale counts don't persist
        setNewEmailCount(0);
        setNewEmails([]);
        try {
          const data = JSON.parse(e.data);
          setUnreadCount(data.unread_count ?? 0);
        } catch {}
      });

      eventSource.addEventListener("new_emails", (e) => {
        try {
          const data = JSON.parse(e.data);
          setNewEmailCount((prev) => prev + (data.count ?? 0));
          setNewEmails((prev) => [...prev, ...(data.emails ?? [])]);
          setUnreadCount(data.unread_count ?? 0);
          // Notify listeners (auto-refetch)
          listenersRef.current.forEach((cb) => cb());
        } catch {}
      });

      eventSource.addEventListener("heartbeat", (e) => {
        try {
          const data = JSON.parse(e.data);
          setUnreadCount(data.unread_count ?? 0);
        } catch {}
      });

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource?.close();
        eventSource = null;
        // Reconnect after 5s
        if (!cancelled) {
          retryTimeout = setTimeout(connect, 5000);
        }
      };
    }

    connect();

    // Reconnect every 10 minutes to refresh the auth token
    const tokenRefreshInterval = setInterval(() => {
      eventSource?.close();
      eventSource = null;
      connect();
    }, 10 * 60 * 1000);

    return () => {
      cancelled = true;
      clearTimeout(retryTimeout);
      clearInterval(tokenRefreshInterval);
      eventSource?.close();
      setIsConnected(false);
    };
  }, [isSignedIn]);

  return (
    <EmailSyncContext.Provider
      value={{
        newEmailCount,
        newEmails,
        unreadCount,
        isConnected,
        dismiss,
        onNewEmails,
      }}
    >
      {children}
    </EmailSyncContext.Provider>
  );
}
