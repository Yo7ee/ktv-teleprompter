interface SpinnerProps {
  size?: number
  label?: string
}

export function Spinner({ size = 44, label = '載入中' }: SpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-label={label}
      role="status"
    >
      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(240,240,248,0.2)" strokeWidth="3" />
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke="oklch(0.72 0.22 260)"
        strokeWidth="3"
        strokeDasharray="30 95"
        strokeLinecap="round"
        className="spinner-arc"
      />
    </svg>
  )
}
