export function KarillyLogo({ className = "", variant = "default" }: { className?: string; variant?: "default" | "gradient" | "white" }) {
  const getFillColor = () => {
    switch (variant) {
      case "gradient":
        return "url(#karillyGradient)";
      case "white":
        return "#FFFFFF";
      default:
        return "#0F2A2E";
    }
  };

  const getAccentColor = () => {
    return variant === "white" ? "#FFFFFF" : "#FF4F5A";
  };

  return (
    <svg
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="karillyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F2A2E" />
          <stop offset="50%" stopColor="#1A4851" />
          <stop offset="100%" stopColor="#FF4F5A" />
        </linearGradient>
        <linearGradient id="karillyAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4F5A" />
          <stop offset="100%" stopColor="#FF6B74" />
        </linearGradient>
      </defs>

      {/* Geometric K Icon with angular design */}
      <g>
        {/* Main vertical bar of K */}
        <path
          d="M 10 12 L 10 38 L 14 38 L 14 12 Z"
          fill={getFillColor()}
        />

        {/* Upper diagonal - angular cut */}
        <path
          d="M 13 23 L 25 12 L 29 15 L 17 26 Z"
          fill={variant === "gradient" ? "url(#karillyAccent)" : getAccentColor()}
        />

        {/* Lower diagonal - angular cut */}
        <path
          d="M 13 27 L 26 38 L 30 35 L 17 24 Z"
          fill={variant === "gradient" ? "url(#karillyAccent)" : getAccentColor()}
        />

        {/* Decorative dot accent */}
        <circle
          cx="27"
          cy="25"
          r="2.5"
          fill={getAccentColor()}
        />
      </g>

      {/* KARILLY Text with modern font */}
      <g transform="translate(40, 0)">
        {/* K */}
        <path
          d="M 0 14 L 0 36 M 0 24 L 8 14 M 0 26 L 9 36"
          stroke={getFillColor()}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* A */}
        <path
          d="M 17 36 L 22 14 L 27 36 M 19 28 L 25 28"
          stroke={getFillColor()}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* R */}
        <path
          d="M 35 36 L 35 14 L 43 14 C 45.5 14 47 15.5 47 18 C 47 20.5 45.5 22 43 22 L 35 22 M 42 22 L 47 36"
          stroke={getFillColor()}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* I */}
        <path
          d="M 55 14 L 55 36"
          stroke={getFillColor()}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {/* L */}
        <path
          d="M 63 14 L 63 36 L 72 36"
          stroke={getFillColor()}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* L */}
        <path
          d="M 79 14 L 79 36 L 88 36"
          stroke={getFillColor()}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Y */}
        <path
          d="M 96 14 L 101 24 L 101 36 M 106 14 L 101 24"
          stroke={getFillColor()}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      {/* Small tagline dot */}
      <circle
        cx="180"
        cy="32"
        r="1.5"
        fill={getAccentColor()}
        opacity="0.6"
      />
    </svg>
  );
}

// Icon version - just the geometric K
export function KarillyIcon({ className = "", variant = "default" }: { className?: string; variant?: "default" | "gradient" | "white" }) {
  const getFillColor = () => {
    switch (variant) {
      case "gradient":
        return "url(#karillyIconGradient)";
      case "white":
        return "#FFFFFF";
      default:
        return "#0F2A2E";
    }
  };

  const getAccentColor = () => {
    return variant === "white" ? "#FFFFFF" : "#FF4F5A";
  };

  return (
    <svg
      viewBox="0 0 40 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="karillyIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F2A2E" />
          <stop offset="50%" stopColor="#1A4851" />
          <stop offset="100%" stopColor="#FF4F5A" />
        </linearGradient>
        <linearGradient id="karillyIconAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4F5A" />
          <stop offset="100%" stopColor="#FF6B74" />
        </linearGradient>
      </defs>

      {/* Main vertical bar of K */}
      <path
        d="M 10 12 L 10 38 L 14 38 L 14 12 Z"
        fill={getFillColor()}
      />

      {/* Upper diagonal - angular cut */}
      <path
        d="M 13 23 L 25 12 L 29 15 L 17 26 Z"
        fill={variant === "gradient" ? "url(#karillyIconAccent)" : getAccentColor()}
      />

      {/* Lower diagonal - angular cut */}
      <path
        d="M 13 27 L 26 38 L 30 35 L 17 24 Z"
        fill={variant === "gradient" ? "url(#karillyIconAccent)" : getAccentColor()}
      />

      {/* Decorative dot accent */}
      <circle
        cx="27"
        cy="25"
        r="2.5"
        fill={getAccentColor()}
      />
    </svg>
  );
}

// Animated logo variant for special moments
export function KarillyLogoAnimated({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="karillyAnimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F2A2E">
            <animate attributeName="stop-color" values="#0F2A2E;#1A4851;#0F2A2E" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor="#1A4851">
            <animate attributeName="stop-color" values="#1A4851;#FF4F5A;#1A4851" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#FF4F5A">
            <animate attributeName="stop-color" values="#FF4F5A;#0F2A2E;#FF4F5A" dur="3s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        <linearGradient id="karillyAnimAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FF4F5A" />
          <stop offset="100%" stopColor="#FF6B74" />
        </linearGradient>
      </defs>

      {/* Geometric K Icon */}
      <g>
        <path
          d="M 10 12 L 10 38 L 14 38 L 14 12 Z"
          fill="url(#karillyAnimGradient)"
        />

        <path
          d="M 13 23 L 25 12 L 29 15 L 17 26 Z"
          fill="url(#karillyAnimAccent)"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-2; 0,0"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>

        <path
          d="M 13 27 L 26 38 L 30 35 L 17 24 Z"
          fill="url(#karillyAnimAccent)"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,2; 0,0"
            dur="2s"
            repeatCount="indefinite"
          />
        </path>

        <circle
          cx="27"
          cy="25"
          r="2.5"
          fill="#FF4F5A"
        >
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* KARILLY Text */}
      <g transform="translate(40, 0)">
        <path
          d="M 0 14 L 0 36 M 0 24 L 8 14 M 0 26 L 9 36"
          stroke="url(#karillyAnimGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <path
          d="M 17 36 L 22 14 L 27 36 M 19 28 L 25 28"
          stroke="url(#karillyAnimGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <path
          d="M 35 36 L 35 14 L 43 14 C 45.5 14 47 15.5 47 18 C 47 20.5 45.5 22 43 22 L 35 22 M 42 22 L 47 36"
          stroke="url(#karillyAnimGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <path
          d="M 55 14 L 55 36"
          stroke="url(#karillyAnimGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        <path
          d="M 63 14 L 63 36 L 72 36"
          stroke="url(#karillyAnimGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <path
          d="M 79 14 L 79 36 L 88 36"
          stroke="url(#karillyAnimGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        <path
          d="M 96 14 L 101 24 L 101 36 M 106 14 L 101 24"
          stroke="url(#karillyAnimGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}