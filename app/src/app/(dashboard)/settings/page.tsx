'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { api, getErrorMessage } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { User, Lock } from 'lucide-react';

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
    <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Avatar section */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: 'var(--accent-soft)',
          color: 'var(--accent-300)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 700, flexShrink: 0,
        }}>
          {getInitials(user?.name ?? 'U')}
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{user?.name}</p>
          <p style={{ fontSize: 13, color: 'var(--ink-4)' }}>{user?.email}</p>
        </div>
      </div>

      {/* Profile */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <User size={15} style={{ color: 'var(--ink-4)' }} />
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Perfil</h2>
        </div>
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
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Lock size={15} style={{ color: 'var(--ink-4)' }} />
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Segurança</h2>
        </div>
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
