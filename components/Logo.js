export default function Logo({ className = 'w-24 h-24', ariaLabel = 'FoodTracker logo' }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      aria-label={ariaLabel}
      role="img"
      className={className}
    >
      <defs>
        <linearGradient id="logoBgGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ecfccb" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>

      <rect x="10" y="10" width="44" height="44" rx="16" fill="url(#logoBgGradient)" stroke="#ffffff" strokeWidth="3" />
      <path
        d="M22 38c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8Z"
        fill="url(#logoGradient)"
      />
      <path
        d="M30 40l3-5 5 3 4-6"
        stroke="#065f46"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M29.5 20.5c2.4-3.4 6.8-4.2 10.2-1.8 3.4 2.4 4.2 6.8 1.8 10.2-2.4 3.4-6.8 4.2-10.2 1.8-3.4-2.4-4.2-6.8-1.8-10.2Z"
        fill="#22c55e"
        opacity="0.95"
      />
      <path
        d="M37 25.2c0 1.8-1.4 3.2-3.2 3.2s-3.2-1.4-3.2-3.2 1.4-3.2 3.2-3.2 3.2 1.4 3.2 3.2Z"
        fill="#ecfccb"
      />
      <path
        d="M31 23.5c1.5-2.1 4.5-2.6 6.6-1.1 2.1 1.5 2.6 4.5 1.1 6.6-1.5 2.1-4.5 2.6-6.6 1.1-2.1-1.5-2.6-4.5-1.1-6.6Z"
        fill="#4ade80"
      />
    </svg>
  )
}
