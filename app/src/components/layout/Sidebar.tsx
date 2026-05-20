'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/lib/auth';
import { getInitials } from '@/lib/utils';
import {
  LayoutDashboard, FolderOpen, ArrowLeftRight,
  LogOut, Settings, ChevronLeft, ChevronRight, X,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projetos', icon: FolderOpen },
  { href: '/transfers', label: 'Transferências', icon: ArrowLeftRight },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onClose?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className="flex flex-col h-full relative"
      style={{
        background: '#050505',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        width: '100%',
        padding: isCollapsed ? '18px 10px' : '18px 12px',
        transition: 'padding 200ms ease',
      }}
    >
      {/* Ambient orb */}
      <div
        className="absolute bottom-0 left-0 w-full h-1/3 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,74,42,0.06) 0%, transparent 70%)' }}
      />

      {/* Logo + close/collapse */}
      <div className="flex items-center justify-between px-2 mb-8">
        {!isCollapsed && <Logo size={24} />}
        {isCollapsed && (
          <div className="w-7 h-7 rounded-lg bg-lava-gradient flex items-center justify-center mx-auto" style={{ minWidth: 28 }} />
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{ width: 28, height: 28, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)' }}
          >
            <X size={14} />
          </button>
        )}
        {onToggleCollapse && !onClose && (
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center rounded-lg transition-colors"
            style={{ width: 28, height: 28, color: 'rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          </button>
        )}
      </div>

      {/* Section label */}
      {!isCollapsed && (
        <p style={{
          fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase', letterSpacing: '0.2em',
          padding: '0 10px 10px',
        }}>
          Workspace
        </p>
      )}

      {/* Nav */}
      <div className="flex flex-col gap-1 flex-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={isCollapsed ? label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isCollapsed ? 0 : 10,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                padding: isCollapsed ? '10px' : '9px 12px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                color: active ? '#ffffff' : 'rgba(255,255,255,0.35)',
                textDecoration: 'none',
                background: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                border: active ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                transition: 'all 160ms ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
                }
              }}
            >
              {active && (
                <span
                  style={{
                    position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                    width: 3, height: 16, borderRadius: '0 2px 2px 0',
                    background: 'linear-gradient(180deg, #FF4A2A, #FF8C6B)',
                  }}
                />
              )}
              <Icon
                size={15}
                style={{ color: active ? '#FF4A2A' : 'inherit', flexShrink: 0 }}
              />
              {!isCollapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!isCollapsed ? (
          <>
            <Link
              href="/settings"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 10, fontSize: 13,
                color: 'rgba(255,255,255,0.3)', textDecoration: 'none',
                transition: 'all 160ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Settings size={14} />
              <span>Configurações</span>
            </Link>
            <button
              onClick={logout}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 10, fontSize: 13,
                color: 'rgba(255,255,255,0.3)', background: 'transparent',
                border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                transition: 'all 160ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FF4A2A'; e.currentTarget.style.background = 'rgba(255,74,42,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={14} />
              <span>Sair</span>
            </button>

            {/* User avatar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px 4px', marginTop: 4,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #FF4A2A, #FF8C6B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>
                {getInitials(user?.name ?? 'U')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            <button
              onClick={logout}
              title="Sair"
              style={{
                width: 36, height: 36, borderRadius: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.3)', background: 'transparent',
                border: 'none', cursor: 'pointer', transition: 'all 160ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FF4A2A'; e.currentTarget.style.background = 'rgba(255,74,42,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={14} />
            </button>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #FF4A2A, #FF8C6B)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#fff',
            }}>
              {getInitials(user?.name ?? 'U')}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
