interface BertramLogoProps {
  size?: number;
  className?: string;
}

export function BertramLogo({ size = 32, className }: BertramLogoProps) {
  return (
    <svg
      viewBox="23 18 54 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
    >
      <path
        d="M50 20 L75 35 L75 65 L50 80 L25 65 L25 35 Z"
        fill="#F26522"
      />
      <path
        d="M50 35 L65 43 L65 57 L50 65 L35 57 L35 43 Z"
        fill="white"
      />
      <path
        d="M35 43 L50 52 L65 43"
        stroke="#F26522"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
