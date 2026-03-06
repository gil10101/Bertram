export const APP_NAME = "Bertrum";

export const ROUTES = {
  home: "/",
  inbox: "/inbox",
  compose: "/compose",
  email: (id: string) => `/email/${id}`,
  thread: (id: string) => `/thread/${id}`,
  meetings: "/meetings",
  settings: "/settings",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export const LABEL_COLORS: Record<string, string> = {
  important: "#EF4444",
  work: "#3B82F6",
  personal: "#10B981",
  finance: "#F59E0B",
  travel: "#8B5CF6",
  newsletter: "#6B7280",
};

export const PRIORITY_COLORS = {
  high: "text-red-600 bg-red-50 border-red-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  low: "text-gray-500 bg-gray-50 border-gray-200",
} as const;
