export function HeroRoute({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hr-linha" x1="0" y1="0" x2="400" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <radialGradient id="hr-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="200" cy="150" r="170" fill="url(#hr-glow)" />

      <path
        d="M30 230C80 230 95 150 150 150C205 150 215 60 270 60C310 60 325 95 370 95"
        stroke="url(#hr-linha)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="2 10"
      />

      <g>
        <circle cx="30" cy="230" r="7" className="fill-background" stroke="#7c3aed" strokeWidth="3" />
      </g>
      <g>
        <circle cx="150" cy="150" r="5.5" className="fill-background" stroke="#a78bfa" strokeWidth="3" />
      </g>
      <g>
        <circle cx="270" cy="60" r="5.5" className="fill-background" stroke="#a78bfa" strokeWidth="3" />
      </g>

      <g transform="translate(355, 78)">
        <rect x="0" y="0" width="34" height="34" rx="10" fill="#7c3aed" />
        <path
          d="M11 9v16M11 9h9.5c1.5 0 2 1.2.9 2.2l-2 1.9 2 1.9c1.1 1 .6 2.2-.9 2.2H11"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
