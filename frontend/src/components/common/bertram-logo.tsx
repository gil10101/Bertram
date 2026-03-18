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
      <circle cx="50" cy="50" r="30" fill="#000000" />
      <path
        d="M50 35 L65 43 L65 57 L50 65 L35 57 L35 43 Z"
        fill="white"
      />
      <path
        d="M35 43 L50 52 L65 43"
        stroke="#000000"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
