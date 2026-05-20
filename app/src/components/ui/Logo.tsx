export function Logo({ size = 26 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className="logo-mark flex-shrink-0 flex items-center justify-center"
        style={{ width: size, height: size, borderRadius: size * 0.27 }}
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 16 16" fill="none">
          <path d="M3 5l5 5 5-5M5 11l3-3 3 3" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span style={{ fontFamily: '"Bricolage Grotesque", ui-sans-serif', fontWeight: 600, fontSize: size * 0.65, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
        Valence
      </span>
    </div>
  );
}
