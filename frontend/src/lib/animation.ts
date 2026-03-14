/**
 * Format a number with abbreviated suffix for count-up animations.
 * e.g. 2000000 → "2M+", 50000 → "50K"
 */
export function formatAbbreviated(
  value: number,
  target: number,
  suffix: string = "",
): string {
  if (target >= 1_000_000) {
    const m = value / 1_000_000;
    if (m >= target / 1_000_000) return `${Math.round(target / 1_000_000)}M+`;
    if (m >= 1) return `${m.toFixed(1)}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
    return `${Math.round(value)}`;
  }

  if (target >= 1_000) {
    const k = value / 1_000;
    if (k >= target / 1_000) return `${Math.round(target / 1_000)}K`;
    return `${Math.round(value)}`;
  }

  return `${value.toFixed(suffix ? 0 : 1)}${suffix}`;
}

/**
 * Number stats config for the Numbers section.
 */
export const numberStats = [
  {
    target: 2_000_000,
    display: "2M+",
    label: "Emails processed daily",
    format: (v: number) => {
      if (v >= 2_000_000) return "2M+";
      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
      if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
      return `${Math.round(v)}`;
    },
  },
  {
    target: 50_000,
    display: "50K",
    label: "Active users worldwide",
    format: (v: number) => {
      if (v >= 50_000) return "50K";
      if (v >= 1_000) return `${Math.round(v / 1_000)}K`;
      return `${Math.round(v)}`;
    },
  },
  {
    target: 3,
    display: "3hrs",
    label: "Average time saved per week",
    format: (v: number) => `${Math.round(v)}hrs`,
  },
  {
    target: 4.9,
    display: "4.9",
    label: "App store rating — 8K reviews",
    format: (v: number) => v.toFixed(1),
  },
] as const;
