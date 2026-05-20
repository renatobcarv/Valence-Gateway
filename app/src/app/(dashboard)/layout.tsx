'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(240);

  useEffect(() => {
    setSidebarWidth(isSidebarCollapsed ? 72 : 240);
  }, [isSidebarCollapsed]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#000',
      }}>
        <div style={{ position: 'relative', width: 48, height: 48 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(255,74,42,0.3)', filter: 'blur(12px)',
            animation: 'ambientPulse 1.5s ease-in-out infinite',
          }} />
          <div style={{
            position: 'relative', zIndex: 1, width: 48, height: 48,
            borderRadius: '50%', border: '2px solid rgba(255,74,42,0.3)',
            borderTopColor: '#FF4A2A', animation: 'spin 0.7s linear infinite',
          }} />
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{
      display: 'flex', height: '100dvh', overflow: 'hidden',
      background: '#000000', color: '#fff',
    }}>
      {/* Desktop Sidebar */}
      <div
        className="hidden lg:block h-full relative z-40 flex-shrink-0"
        style={{
          width: sidebarWidth,
          transition: 'width 280ms cubic-bezier(0.22,0.61,0.36,1)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <>
          <div
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(8px)', zIndex: 40,
            }}
            className="lg:hidden"
          />
          <div
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
              zIndex: 50, background: '#050505',
              boxShadow: '4px 0 40px rgba(0,0,0,0.6)',
              animation: 'slideInLeft 240ms cubic-bezier(0.22,0.61,0.36,1)',
            }}
            className="lg:hidden"
          >
            <Sidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* Ambient background */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div
            className="ambient-orb"
            style={{
              position: 'absolute', top: '-10%', left: '-5%',
              width: '55%', height: '55%',
              background: 'rgba(255,74,42,0.07)', filter: 'blur(120px)',
              borderRadius: '50%',
            }}
          />
          <div
            className="ambient-orb-slower"
            style={{
              position: 'absolute', top: '20%', right: '-10%',
              width: '60%', height: '60%',
              background: 'rgba(67,56,202,0.04)', filter: 'blur(140px)',
              borderRadius: '50%',
            }}
          />
        </div>

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main
            className="custom-scrollbar"
            style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: 24 }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
