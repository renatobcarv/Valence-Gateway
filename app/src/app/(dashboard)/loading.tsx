'use client';

export default function Loading() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#000000',
    }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
        {/* Glow pulse */}
        <div style={{
          position: 'absolute', inset: 0,
          background: '#FF4A2A', filter: 'blur(48px)',
          borderRadius: '50%', opacity: 0,
          animation: 'loadingGlow 1.5s ease-in-out infinite',
        }} />

        {/* Logo mark */}
        <div
          style={{
            position: 'relative', zIndex: 1,
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #FF4A2A, #FF8C6B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(255,74,42,0.3)',
            animation: 'loadingPulse 1s ease-in-out infinite',
          }}
        >
          {/* V mark */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 8L16 24L26 8" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Label */}
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '0.5em',
          color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase',
          fontStyle: 'italic',
        }}>
          Valence OS
        </span>
      </div>

      <style>{`
        @keyframes loadingGlow {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 0.35; transform: scale(1.2); }
        }
        @keyframes loadingPulse {
          0%, 100% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
