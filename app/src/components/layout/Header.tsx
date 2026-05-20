'use client';

import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';

const BREADCRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projetos',
  '/transfers': 'Transferências',
  '/settings': 'Configurações',
};

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  const label = Object.entries(BREADCRUMBS).find(([key]) => pathname === key || pathname.startsWith(key + '/'))?.[1] ?? '';

  return (
    <header
      style={{
        height: 56,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 12,
        flexShrink: 0,
      }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden"
        style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'rgba(255,255,255,0.5)',
          flexShrink: 0,
        }}
      >
        <Menu size={15} />
      </button>

      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 13, fontWeight: 500,
          color: 'rgba(255,255,255,0.7)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}>
          {label}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'rgba(255,255,255,0.4)',
            position: 'relative',
          }}
        >
          <Bell size={14} />
        </button>
      </div>
    </header>
  );
}
