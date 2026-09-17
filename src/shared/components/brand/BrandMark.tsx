export interface BrandMarkProps {
  size?: number;
  showBackground?: boolean;
  color?: string;
  strokeWidth?: number;
}

export function BrandMark({
  size = 32,
  showBackground = false,
}: BrandMarkProps) {
  const brainGradId = `brainGrad_${size}`;
  const glowRingId = `glowRing_${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={brainGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id={glowRingId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#0EA5E9" />
        </linearGradient>
      </defs>

      {showBackground && (
        <>
          <rect width="120" height="120" rx="30" fill="#0B101A" />
          <rect x="1" y="1" width="118" height="118" rx="29" stroke="#1E293B" strokeWidth="2" />
        </>
      )}

      {/* Glow Ring */}
      <path
        d="M60 26C41.2223 26 26 41.2223 26 60C26 78.7777 41.2223 94 60 94C78.7777 94 94 78.7777 94 60C94 41.2223 78.7777 26 60 26Z"
        fill="#151C2F"
        stroke={`url(#${glowRingId})`}
        strokeWidth="2.5"
        strokeDasharray="8 4"
      />

      {/* Stylized geometric brain / circuit node representing Budget + Brain */}
      <path
        d="M48 44C44 44 40 48 40 53C40 55.5 41 57.7 42.7 59.2C41 61 40 63.5 40 66C40 71 44 75 49 75C51 75 52.8 74.3 54.2 73.1C55.6 74.9 57.7 76 60 76C62.3 76 64.4 74.9 65.8 73.1C67.2 74.3 69 75 71 75C76 75 80 71 80 66C80 63.5 79 61 77.3 59.2C79 57.7 80 55.5 80 53C80 48 76 44 72 44C69.8 44 67.8 45 66.5 46.6C65 45 62.6 44 60 44C57.4 44 55 45 53.5 46.6C52.2 45 50.2 44 48 44Z"
        fill={`url(#${brainGradId})`}
        opacity={0.95}
      />

      {/* Central pulse node */}
      <circle cx="60" cy="60" r="5" fill="#FFFFFF" />
      <path
        d="M60 47V55M60 65V73M48 57L55 60L48 63M72 57L65 60L72 63"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
