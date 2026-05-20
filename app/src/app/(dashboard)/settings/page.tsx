'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { api, getErrorMessage } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { User, Lock, ShieldCheck } from 'lucide-react';

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ width: 3, height: 14, borderRadius: 99, background: 'linear-gradient(180deg, #FF4A2A, #FF8C6B)' }} />
      <Icon size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
      <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
        {label}
      </p>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { toast.error('Nome não pode estar vazio'); return; }
    setProfileLoading(true);
    try {
      await api.put('/auth/profile', { name: name.trim() });
      toast.success('Perfil atualizado!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPassword || !newPassword) { toast.error('Preencha todos os campos'); return; }
    if (newPassword.length < 6) { toast.error('Nova senha deve ter pelo menos 6 caracteres'); return; }
    setPasswordLoading(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Senha alterada!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Page header */}
      <div style={{ paddingTop: 8, marginBottom: 8 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase' as const, letterSpacing: '0.3em', marginBottom: 10,
        }}>
          Conta
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
          Configurações
        </h1>
      </div>

      {/* Avatar card */}
      <div style={{
        background: '#050505', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 20, padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 16,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 120, height: 120,
          background: 'linear-gradient(135deg, #FF4A2A, #FF8C6B)',
          opacity: 0.05, filter: 'blur(32px)',
          pointerEvents: 'none',
        }} />
        <div style={{
          width: 52, height: 52, borderRadius: 15, flexShrink: 0,
          background: 'linear-gradient(135deg, #FF4A2A, #FF8C6B)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, color: '#fff',
          boxShadow: '0 4px 16px rgba(255,74,42,0.25)',
        }}>
          {getInitials(user?.name ?? 'U')}
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: '-0.01em' }}>{user?.name}</p>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{user?.email}</p>
        </div>
      </div>

      {/* Profile section */}
      <div style={{
        background: '#050505', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 20, padding: '22px 24px',
      }}>
        <SectionHeader icon={User} label="Perfil" />
        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="field-label">Nome</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input
              className="input"
              value={user?.email ?? ''}
              disabled
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>

      {/* Security section */}
      <div style={{
        background: '#050505', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 20, padding: '22px 24px',
      }}>
        <SectionHeader icon={ShieldCheck} label="Segurança" />
        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="field-label">Senha atual</label>
            <input
              className="input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="field-label">Nova senha</label>
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="submit" className="btn-primary" disabled={passwordLoading}>
              {passwordLoading ? 'Alterando…' : 'Alterar senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
