// Shared landing primitives: brand mark, brand icons, and the Lucide-style
// icon set. No hooks — safe to import into any client section component.

type IconProps = { size?: number; color?: string };

/* ── Brand mark ─────────────────────────────────────── */
export function BertramMark({ size = 22 }: { size?: number }) {
  // 3 bars, middle is paprika; subtle stagger left/right.
  return (
    <svg width={size} height={(size * 260) / 320} viewBox="0 0 320 260" fill="none" aria-label="Bertram">
      <rect x="52" y="36" width="208" height="56" rx="16" fill="var(--ink)" />
      <rect x="84" y="108" width="208" height="56" rx="16" fill="var(--paprika)" />
      <rect x="52" y="180" width="208" height="56" rx="16" fill="var(--ink)" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   BRAND ICONS — Simple Icons paths from codebase
   ════════════════════════════════════════════════════════════════ */

export function LinearIcon({ size = 12, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z" />
    </svg>
  );
}
export function FigmaIcon({ size = 12, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z" />
    </svg>
  );
}
export function StripeIcon({ size = 12, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z" />
    </svg>
  );
}
export function NotionIcon({ size = 12, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
    </svg>
  );
}
export function GitHubIcon({ size = 12, color = "currentColor" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

export const BRAND_ICONS: Record<
  string,
  { icon: (props: IconProps) => React.ReactElement; bg: string; fg: string }
> = {
  Linear: { icon: LinearIcon, bg: "rgba(94, 106, 210, 0.18)", fg: "#5E6AD2" },
  Figma: { icon: FigmaIcon, bg: "rgba(162, 89, 255, 0.16)", fg: "#A259FF" },
  Stripe: { icon: StripeIcon, bg: "rgba(99, 91, 255, 0.16)", fg: "#635BFF" },
  Notion: { icon: NotionIcon, bg: "var(--chip-bg)", fg: "var(--inbox-fg)" },
  GitHub: { icon: GitHubIcon, bg: "var(--chip-bg)", fg: "var(--inbox-fg)" },
};

/* ════════════════════════════════════════════════════════════════
   UI icon set (Lucide-style minimal)
   ════════════════════════════════════════════════════════════════ */

export function Icon({ name, size = 14, color = "currentColor" }: { name: string; size?: number; color?: string }) {
  const s = size,
    sw = 1.6;
  const p: React.SVGProps<SVGSVGElement> = {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  switch (name) {
    case "mail":
      return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
    case "inbox":
      return <svg {...p}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" /></svg>;
    case "star":
      return <svg {...p}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
    case "draft":
      return <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><path d="M8 13h8M8 17h5" /></svg>;
    case "send":
      return <svg {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>;
    case "cal":
      return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case "archive":
      return <svg {...p}><rect x="2" y="3" width="20" height="5" rx="1" /><path d="M4 8v11a2 2 0 002 2h12a2 2 0 002-2V8M10 12h4" /></svg>;
    case "spam":
      return <svg {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><path d="M12 9v4M12 17h.01" /></svg>;
    case "trash":
      return <svg {...p}><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>;
    case "gear":
      return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>;
    case "help":
      return <svg {...p}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" /></svg>;
    case "check":
      return <svg {...p}><path d="M20 6L9 17l-5-5" /></svg>;
    case "search":
      return <svg {...p}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>;
    case "back":
      return <svg {...p}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
    case "forward":
      return <svg {...p}><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
    case "more":
      return <svg {...p}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>;
    case "chev-down":
      return <svg {...p}><path d="M6 9l6 6 6-6" /></svg>;
    case "chev-left":
      return <svg {...p}><path d="M15 18l-6-6 6-6" /></svg>;
    case "chev-right":
      return <svg {...p}><path d="M9 18l6-6-6-6" /></svg>;
    case "bell":
      return <svg {...p} fill={color} stroke="none"><path d="M22 17H2a3 3 0 003-3V9a7 7 0 0114 0v5a3 3 0 003 3zm-8.27 4a2 2 0 01-3.46 0" /></svg>;
    case "bolt":
      return <svg {...p} fill={color} stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
    case "people":
      return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
    case "sparkle":
      // 4-point sparkle star — used as the AI marker throughout
      return (
        <svg width={s} height={s} viewBox="0 0 48 49" fill={color} stroke="none">
          <path d="M48 24.4417C48 25.142 47.7846 25.8267 47.3848 26.4016C46.985 26.9759 46.4178 27.4149 45.7617 27.6584L32.1475 32.6038L27.2168 46.2034C26.9733 46.8594 26.5343 47.4266 25.96 47.8264C25.385 48.2263 24.7003 48.4416 24 48.4416C23.2997 48.4416 22.615 48.2263 22.04 47.8264C21.4657 47.4266 21.0267 46.8594 20.7832 46.2034L15.8379 32.6038L2.23828 27.6584C1.58222 27.4149 1.01504 26.9759 0.615233 26.4016C0.215373 25.8267 0 25.142 0 24.4416C0 23.7413 0.215373 23.0566 0.615233 22.4817C1.01504 21.9074 1.58222 21.4684 2.23828 21.2249L15.8525 16.2795L20.7832 2.67993C21.0267 2.02387 21.4657 1.45669 22.04 1.05688C22.615 0.657024 23.2997 0.441649 24 0.441649C24.7003 0.441649 25.385 0.657024 25.96 1.05688C26.5343 1.45669 26.9733 2.02387 27.2168 2.67993L32.1621 16.2942L45.7617 21.2249C46.4178 21.4684 46.985 21.9074 47.3848 22.4817C47.7846 23.0566 48 23.7413 48 24.4417Z" />
        </svg>
      );
    case "file":
      return <svg {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /></svg>;
    case "image":
      return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></svg>;
    default:
      return null;
  }
}
