import {
  Inbox,
  Star,
  FileText,
  Send,
  Calendar,
  Archive,
  AlertCircle,
  Trash2,
  Settings,
  HelpCircle,
  Mail,
  Search,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  MoreHorizontal,
  Zap,
  Bell,
  Users,
  Tag,
  Sparkles,
  Reply,
  Forward,
  FileText as FileTextIcon,
  Image as ImageIcon,
  File as FileIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Brand icons (from Simple Icons)                                    */
/* ------------------------------------------------------------------ */

interface IconProps { className?: string; style?: React.CSSProperties }

function LinearIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z" />
    </svg>
  );
}

function FigmaIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z" />
    </svg>
  );
}

function StripeIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
    </svg>
  );
}

function NotionIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
    </svg>
  );
}

function GitHubIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/* Brand icon lookup: sender name → icon component + brand color */
const brandIcons: Record<string, { icon: React.FC<IconProps>; bg: string; fg: string }> = {
  Linear: { icon: LinearIcon, bg: "#1a1330", fg: "#5E6AD2" },
  Figma: { icon: FigmaIcon, bg: "#1a2017", fg: "#A259FF" },
  Stripe: { icon: StripeIcon, bg: "#17192a", fg: "#635BFF" },
  Notion: { icon: NotionIcon, bg: "#1e1d1b", fg: "#FFFFFFD0" },
  GitHub: { icon: GitHubIcon, bg: "#161b22", fg: "#FFFFFFD0" },
};

/* ------------------------------------------------------------------ */
/*  Shared color constants (dark-mode HSL values from globals.css)     */
/* ------------------------------------------------------------------ */

const C = {
  sidebar: "hsl(40,7%,8%)",
  bg: "hsl(40,5.4%,11.2%)",
  card: "hsl(36,15.4%,15.3%)",
  fg: "hsl(45,37.5%,93.7%)",
  muted: "hsl(38,15.7%,76.3%)",
  faint: "hsl(38,12%,55%)",
  accent: "hsl(34,5.8%,23.7%)",
  border: "hsl(34,5.8%,23.7%)",
  primary: "#eb5e28",
} as const;

/* ------------------------------------------------------------------ */
/*  Sidebar data                                                       */
/* ------------------------------------------------------------------ */

const coreNav = [
  { icon: Inbox, label: "Inbox", active: true, count: 24 },
  { icon: Star, label: "Favorites", active: false, count: 3 },
  { icon: FileText, label: "Drafts", active: false, count: 2 },
  { icon: Send, label: "Sent", active: false },
  { icon: Calendar, label: "Meetings", active: false },
];

const managementNav = [
  { icon: Archive, label: "Archive" },
  { icon: AlertCircle, label: "Spam" },
  { icon: Trash2, label: "Bin" },
];

const bottomNav = [
  { icon: Settings, label: "Settings" },
  { icon: HelpCircle, label: "Support" },
];

/* ------------------------------------------------------------------ */
/*  Email list data                                                    */
/* ------------------------------------------------------------------ */

const pinnedEmails = [
  {
    initial: "S",
    color: "bg-[#eb5e28]/20 text-[#eb5e28]",
    sender: "Sarah Chen",
    subject: "Q3 Planning — Action items from today's call",
    time: "2m",
    unread: true,
    selected: true,
    priority: "high" as const,
    label: null,
    threadCount: 4,
  },
  {
    initial: "A",
    color: "bg-amber-500/20 text-amber-400",
    sender: "Alex Rivera",
    subject: "Contract review — needs signature by Friday",
    time: "45m",
    unread: true,
    selected: false,
    priority: "high" as const,
    label: "important" as const,
    threadCount: 2,
  },
];

const primaryEmails = [
  {
    initial: "L",
    color: "bg-purple-500/20 text-purple-400",
    sender: "Linear",
    subject: "3 issues assigned to you",
    time: "15m",
    unread: true,
    selected: false,
    priority: null,
    label: "updates" as const,
    threadCount: null,
  },
  {
    initial: "D",
    color: "bg-emerald-500/20 text-emerald-400",
    sender: "David Park",
    subject: "Re: Can we move Thursday's standup?",
    time: "1h",
    unread: false,
    selected: false,
    priority: null,
    label: null,
    threadCount: 5,
  },
  {
    initial: "F",
    color: "bg-sky-500/20 text-sky-400",
    sender: "Figma",
    subject: "You were mentioned in Brand System v2",
    time: "2h",
    unread: false,
    selected: false,
    priority: null,
    label: "social" as const,
    threadCount: null,
  },
  {
    initial: "M",
    color: "bg-rose-500/20 text-rose-400",
    sender: "Maria Lopez",
    subject: "Updated wireframes for onboarding flow",
    time: "2h",
    unread: false,
    selected: false,
    priority: "medium" as const,
    label: null,
    threadCount: 3,
  },
  {
    initial: "S",
    color: "bg-indigo-500/20 text-indigo-400",
    sender: "Stripe",
    subject: "Payment received — $2,400.00",
    time: "3h",
    unread: false,
    selected: false,
    priority: null,
    label: null,
    threadCount: null,
  },
  {
    initial: "J",
    color: "bg-teal-500/20 text-teal-400",
    sender: "James Wu",
    subject: "Re: API rate limiting — prod incident follow-up",
    time: "3h",
    unread: false,
    selected: false,
    priority: "high" as const,
    label: null,
    threadCount: 8,
  },
  {
    initial: "N",
    color: "bg-pink-500/20 text-pink-400",
    sender: "Notion",
    subject: "Weekly digest: 12 pages updated in Engineering",
    time: "4h",
    unread: false,
    selected: false,
    priority: null,
    label: "updates" as const,
    threadCount: null,
  },
  {
    initial: "R",
    color: "bg-cyan-500/20 text-cyan-400",
    sender: "Rachel Kim",
    subject: "Lunch tomorrow? That new place on Market St",
    time: "5h",
    unread: false,
    selected: false,
    priority: null,
    label: "social" as const,
    threadCount: 3,
  },
  {
    initial: "G",
    color: "bg-orange-500/20 text-orange-400",
    sender: "GitHub",
    subject: "[bertram-app] PR #247 merged: Fix OAuth refresh",
    time: "5h",
    unread: false,
    selected: false,
    priority: null,
    label: null,
    threadCount: null,
  },
  {
    initial: "T",
    color: "bg-violet-500/20 text-violet-400",
    sender: "Tom Bradley",
    subject: "Re: Budget approval for Q3 marketing spend",
    time: "6h",
    unread: false,
    selected: false,
    priority: "medium" as const,
    label: "important" as const,
    threadCount: 6,
  },
];

const allEmails = [...pinnedEmails, ...primaryEmails];

/* ------------------------------------------------------------------ */
/*  Thread detail data (4 messages, 3 participants)                    */
/* ------------------------------------------------------------------ */

const threadMessages = [
  {
    id: "1",
    sender: "Sarah Chen",
    initial: "S",
    color: "bg-[#eb5e28]/20 text-[#eb5e28]",
    time: "Today, 10:02 AM",
    expanded: false,
    body: "Can we align on Q3 priorities before Thursday?",
  },
  {
    id: "2",
    sender: "David Park",
    initial: "D",
    color: "bg-emerald-500/20 text-emerald-400",
    time: "Today, 10:18 AM",
    expanded: false,
    body: "Engineering can commit to Aug 15. Confirming with infra.",
  },
  {
    id: "3",
    sender: "Alex Johnson",
    initial: "A",
    color: "bg-amber-500/20 text-amber-400",
    time: "Today, 10:31 AM",
    expanded: false,
    body: "$4.2M works. Updated projections — enterprise pilot TBD.",
  },
  {
    id: "4",
    sender: "Sarah Chen",
    initial: "S",
    color: "bg-[#eb5e28]/20 text-[#eb5e28]",
    time: "Today, 11:47 AM",
    expanded: true,
    body: "",
  },
];

/* ------------------------------------------------------------------ */
/*  Lookup tables                                                      */
/* ------------------------------------------------------------------ */

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-400",
  low: "bg-green-500",
};

const labelCfg: Record<string, { icon: typeof Zap; cls: string }> = {
  important: { icon: Zap, cls: "text-[#F59E0D] fill-[#F59E0D]" },
  updates: { icon: Bell, cls: "text-[#8B5CF6] fill-[#8B5CF6]" },
  social: { icon: Users, cls: "text-[#2563EB]" },
  promotions: { icon: Tag, cls: "text-[#F43F5E] fill-[#F43F5E]" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function InboxMockup() {
  return (
    <div className="flex h-full w-full overflow-hidden" style={{ background: C.sidebar }}>
      {/* -------- Sidebar -------- */}
      <div className="hidden w-[160px] flex-shrink-0 flex-col md:flex" style={{ background: C.sidebar }}>
        {/* Account */}
        <div className="flex items-center gap-2 px-3 py-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eb5e28]/20 text-[10px] font-bold text-[#eb5e28]">
            A
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[10px] font-bold" style={{ color: C.fg }}>Alex Johnson</div>
            <div className="truncate text-[8px]" style={{ color: C.faint }}>alex@company.com</div>
          </div>
        </div>

        {/* New email button */}
        <div className="px-2 pb-2">
          <div className="flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-[10px] font-medium" style={{ background: C.fg, color: C.sidebar }}>
            <Mail className="h-3 w-3" />
            New email
          </div>
        </div>

        {/* Core nav */}
        <div className="flex-1 overflow-hidden px-1.5">
          <p className="px-2 pb-0.5 pt-2 text-[7px] font-medium uppercase tracking-wider" style={{ color: C.faint }}>Core</p>
          {coreNav.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 rounded-md px-2 py-1 text-[10px] ${item.active ? "font-medium" : ""}`}
              style={{ background: item.active ? C.accent : undefined, color: item.active ? C.fg : C.muted }}
            >
              <item.icon className="h-3 w-3" />
              <span>{item.label}</span>
              {item.count != null && (
                <span className="ml-auto text-[8px]" style={{ color: C.faint }}>{item.count}</span>
              )}
            </div>
          ))}

          <p className="px-2 pb-0.5 pt-2.5 text-[7px] font-medium uppercase tracking-wider" style={{ color: C.faint }}>Management</p>
          {managementNav.map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-md px-2 py-1 text-[10px]" style={{ color: C.muted }}>
              <item.icon className="h-3 w-3" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="px-1.5 py-1.5">
          {bottomNav.map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-md px-2 py-1 text-[10px]" style={{ color: C.muted }}>
              <item.icon className="h-3 w-3" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* -------- Main area (list + detail) -------- */}
      <div className="flex min-w-0 flex-1 gap-[2px] py-1 pr-1">

        {/* ===== Mail list pane ===== */}
        <div className="flex w-full flex-shrink-0 flex-col overflow-hidden rounded-lg sm:w-[220px]" style={{ background: C.bg }}>
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2">
            <span className="text-sm font-bold" style={{ color: C.fg }}>Inbox</span>
            <div className="ml-auto flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px]" style={{ color: C.muted }}>
              <Check className="h-3 w-3" />
              Select
            </div>
          </div>

          {/* Search */}
          <div className="px-2 pb-1.5">
            <div className="flex items-center rounded-md px-2 py-1" style={{ border: `1px solid ${C.border}`, background: C.card }}>
              <Search className="mr-1.5 h-3 w-3" style={{ color: C.faint }} />
              <span className="flex-1 text-[10px]" style={{ color: C.faint }}>Search</span>
              <span className="rounded px-1 py-0.5 text-[8px]" style={{ background: C.accent, color: C.faint }}>⌘K</span>
            </div>
          </div>

          {/* Pinned section */}
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[8px] font-medium uppercase tracking-wider" style={{ color: C.faint }}>Pinned</span>
            <span className="text-[8px]" style={{ color: C.faint }}>[{pinnedEmails.length}]</span>
          </div>
          <div>
            {pinnedEmails.map((email, i) => (
              <EmailRow key={`p-${i}`} email={email} isLast={i === pinnedEmails.length - 1} />
            ))}
          </div>

          {/* Primary section */}
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[8px] font-medium uppercase tracking-wider" style={{ color: C.faint }}>Primary</span>
            <span className="text-[8px]" style={{ color: C.faint }}>[{primaryEmails.length}]</span>
          </div>
          <div className="flex-1 overflow-hidden">
            {primaryEmails.map((email, i) => (
              <EmailRow key={`e-${i}`} email={email} isLast={i === primaryEmails.length - 1} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-3 py-1" style={{ borderTop: `1px solid ${C.border}` }}>
            <span className="text-[8px]" style={{ color: C.faint }}>1–{allEmails.length}</span>
            <div className="flex items-center gap-0.5">
              <div className="rounded p-0.5 opacity-40" style={{ color: C.muted }}><ChevronLeft className="h-3 w-3" /></div>
              <div className="rounded p-0.5" style={{ color: C.muted }}><ChevronRight className="h-3 w-3" /></div>
            </div>
          </div>
        </div>

        {/* ===== Detail pane (thread view) ===== */}
        <div className="hidden min-w-0 flex-1 flex-col overflow-hidden rounded-lg lg:flex" style={{ background: C.bg }}>
          {/* Thread header bar */}
          <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2" style={{ color: C.muted }}>
              <ArrowLeft className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-2" style={{ color: C.muted }}>
              <Star className="h-3.5 w-3.5" />
              <Archive className="h-3.5 w-3.5" />
              <Trash2 className="h-3.5 w-3.5" />
              <MoreHorizontal className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Thread content */}
          <div className="flex-1 overflow-hidden px-4 pt-3">
            {/* Subject + meta */}
            <div className="mb-1 text-[13px] font-medium" style={{ color: C.fg }}>
              Q3 Planning — Action items from today&apos;s call
            </div>
            <div className="mb-3 flex items-center gap-2">
              {/* Participant avatars */}
              <div className="flex -space-x-1.5">
                {[
                  { i: "S", bg: "#3d2117", text: C.primary },
                  { i: "D", bg: "#17302a", text: "#34d399" },
                  { i: "A", bg: "#302717", text: "#fbbf24" },
                ].map((p) => (
                  <div
                    key={p.i}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold ring-1 ring-[hsl(40,5.4%,11.2%)]"
                    style={{ background: p.bg, color: p.text }}
                  >
                    {p.i}
                  </div>
                ))}
              </div>
              <span className="text-[9px]" style={{ color: C.faint }}>
                Sarah Chen, David Park, Alex Johnson
              </span>
              <span className="text-[9px]" style={{ color: C.faint }}>·</span>
              <span className="text-[9px]" style={{ color: C.faint }}>
                4 messages
              </span>
            </div>

            {/* AI Summary */}
            <div className="mb-3 rounded-lg px-3 py-2" style={{ border: `1px solid ${C.border}`, background: C.card }}>
              <div className="mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-[#eb5e28]" />
                <span className="text-[10px] font-medium" style={{ color: C.fg }}>AI Summary</span>
                <ChevronDown className="ml-auto h-3 w-3" style={{ color: C.faint }} />
              </div>
              <div className="space-y-0.5 text-[9px] leading-relaxed" style={{ color: C.muted }}>
                <p><span className="font-medium" style={{ color: C.fg }}>Revenue:</span> Q3 target $4.2M (+18%). Enterprise pilot TBD.</p>
                <p><span className="font-medium" style={{ color: C.fg }}>Product:</span> Launch confirmed Aug 15. Infra greenlit.</p>
                <p><span className="font-medium" style={{ color: C.fg }}>Hiring:</span> 3 senior roles open. JDs due EOW.</p>
              </div>
            </div>

            {/* Thread messages */}
            <div className="space-y-0">
              {threadMessages.map((msg, idx) => (
                <div key={msg.id}>
                  {/* Collapsed message */}
                  {!msg.expanded && (
                    <div className="flex items-center gap-2 rounded-md px-2 py-1.5" style={{ borderBottom: idx < threadMessages.length - 1 ? `1px solid ${C.border}` : undefined }}>
                      <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${msg.color}`}>
                        {msg.initial}
                      </div>
                      <span className="text-[9px] font-medium" style={{ color: C.fg }}>{msg.sender}</span>
                      <span className="min-w-0 flex-1 truncate text-[9px]" style={{ color: C.faint }}>{msg.body}</span>
                      <span className="flex-shrink-0 text-[8px]" style={{ color: C.faint }}>{msg.time.split(", ")[1]}</span>
                    </div>
                  )}

                  {/* Expanded message (last one) */}
                  {msg.expanded && (
                    <div className="mt-1 rounded-lg px-3 py-2" style={{ border: `1px solid ${C.border}` }}>
                      <div className="mb-2 flex items-center gap-2">
                        <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${msg.color}`}>
                          {msg.initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold" style={{ color: C.fg }}>{msg.sender}</span>
                            <span className="text-[8px]" style={{ color: C.faint }}>{msg.time}</span>
                          </div>
                          <div className="text-[8px]" style={{ color: C.faint }}>
                            to David Park, Alex Johnson
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 text-[10px] leading-relaxed" style={{ color: C.muted }}>
                        <p>Great alignment. Quick recap:</p>
                        <p>
                          1. <span style={{ color: C.fg }}>Revenue</span> — $4.2M confirmed + enterprise pilot as upside
                          <br />
                          2. <span style={{ color: C.fg }}>Product</span> — Aug 15 launch go. Infra sign-off by EOD
                          <br />
                          3. <span style={{ color: C.fg }}>Hiring</span> — JDs posted by Monday
                        </p>
                        <p>Board deck draft attached. 30-min sync Thursday AM to finalize.</p>
                      </div>

                      {/* Attachments */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5" style={{ border: `1px solid ${C.border}`, background: C.card }}>
                          <FileTextIcon className="h-2.5 w-2.5 text-red-400" />
                          <span className="text-[8px]" style={{ color: C.fg }}>Q3-Board-Deck.pdf</span>
                          <span className="text-[7px]" style={{ color: C.faint }}>2.4 MB</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5" style={{ border: `1px solid ${C.border}`, background: C.card }}>
                          <FileIcon className="h-2.5 w-2.5 text-blue-400" />
                          <span className="text-[8px]" style={{ color: C.fg }}>Revenue-Model.xlsx</span>
                          <span className="text-[7px]" style={{ color: C.faint }}>840 KB</span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-full px-2 py-0.5" style={{ border: `1px solid ${C.border}`, background: C.card }}>
                          <ImageIcon className="h-2.5 w-2.5 text-green-400" />
                          <span className="text-[8px]" style={{ color: C.fg }}>Org-Chart-Q3.png</span>
                          <span className="text-[7px]" style={{ color: C.faint }}>320 KB</span>
                        </div>
                      </div>

                      {/* Reply actions */}
                      <div className="mt-2 flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                        <div className="flex items-center gap-1 rounded-md px-2 py-1 text-[9px]" style={{ border: `1px solid ${C.border}`, color: C.muted }}>
                          <Reply className="h-3 w-3" /> Reply
                        </div>
                        <div className="flex items-center gap-1 rounded-md px-2 py-1 text-[9px]" style={{ border: `1px solid ${C.border}`, color: C.muted }}>
                          <Forward className="h-3 w-3" /> Forward
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

interface MockEmail {
  initial: string;
  color: string;
  sender: string;
  subject: string;
  time: string;
  unread: boolean;
  selected: boolean;
  priority: "high" | "medium" | "low" | null;
  label: string | null;
  threadCount: number | null;
}

function EmailRow({ email, isLast }: { email: MockEmail; isLast: boolean }) {
  return (
    <div
      className={`flex items-start gap-2 px-3 py-1.5 ${
        email.selected ? "border-l-2 border-l-[#eb5e28]" : "border-l-2 border-l-transparent"
      }`}
      style={{
        background: email.selected ? C.accent : undefined,
        borderBottom: !isLast ? `1px solid ${C.border}50` : undefined,
      }}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <BrandOrInitialAvatar sender={email.sender} initial={email.initial} color={email.color} />
        {email.unread && (
          <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#eb5e28]" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span
            className={`truncate text-[10px] ${email.unread ? "font-bold" : "font-medium"}`}
            style={{ color: email.unread ? C.fg : `${C.fg}b3` }}
          >
            {email.sender}
          </span>
          {email.threadCount != null && email.threadCount > 1 && (
            <span className="flex-shrink-0 text-[8px]" style={{ color: C.faint }}>
              [{email.threadCount}]
            </span>
          )}
        </div>
        <span className="block truncate text-[9px]" style={{ color: `${C.muted}b3` }}>
          {email.subject}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
        <span className="text-[8px]" style={{ color: C.faint }}>{email.time}</span>
        <div className="flex items-center gap-0.5">
          {email.priority && (
            <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[email.priority]}`} />
          )}
          {email.label && labelCfg[email.label] && <LabelIcon type={email.label} />}
        </div>
      </div>
    </div>
  );
}

function LabelIcon({ type }: { type: string }) {
  const cfg = labelCfg[type];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return <Icon className={`h-2.5 w-2.5 ${cfg.cls}`} />;
}

function BrandOrInitialAvatar({ sender, initial, color }: { sender: string; initial: string; color: string }) {
  const brand = brandIcons[sender];
  if (brand) {
    const BrandIcon = brand.icon;
    return (
      <div
        className="flex h-6 w-6 items-center justify-center rounded-full"
        style={{ background: brand.bg }}
      >
        <BrandIcon className="h-3 w-3" style={{ color: brand.fg }} />
      </div>
    );
  }
  return (
    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-medium ${color}`}>
      {initial}
    </div>
  );
}
