const defaultProps = { width: 20, height: 20, strokeWidth: 1.8, stroke: 'currentColor', fill: 'none', style: { display: 'block', flexShrink: 0 } }

export function HomeIcon(props) {
  const p = { ...defaultProps, ...props }
  return (
    <svg width={p.width} height={p.height} viewBox="0 0 24 24" fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

export function SearchIcon(props) {
  const p = { ...defaultProps, ...props }
  return (
    <svg width={p.width} height={p.height} viewBox="0 0 24 24" fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

export function BookOpenIcon(props) {
  const p = { ...defaultProps, ...props }
  return (
    <svg width={p.width} height={p.height} viewBox="0 0 24 24" fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

export function LibraryIcon(props) {
  const p = { ...defaultProps, ...props }
  return (
    <svg width={p.width} height={p.height} viewBox="0 0 24 24" fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h8" />
    </svg>
  )
}

export function BarChartIcon(props) {
  const p = { ...defaultProps, ...props }
  return (
    <svg width={p.width} height={p.height} viewBox="0 0 24 24" fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  )
}

export function UserIcon(props) {
  const p = { ...defaultProps, ...props }
  return (
    <svg width={p.width} height={p.height} viewBox="0 0 24 24" fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  )
}

export function BookmarkIcon(props) {
  const p = { ...defaultProps, ...props }
  return (
    <svg width={p.width} height={p.height} viewBox="0 0 24 24" fill={p.fill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={p.style}>
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  )
}
