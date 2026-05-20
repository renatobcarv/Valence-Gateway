'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { projectQueries } from '@/lib/queries';
import { getErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, FolderOpen, ExternalLink, Copy, Trash2, X, ArrowUpRight } from 'lucide-react';

function CreateModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ name?: string }>({});

  const mutation = useMutation({
    mutationFn: () => projectQueries.create({ name: name.trim(), description: description.trim() || undefined }),
    onSuccess: () => {
      toast.success('Projeto criado!');
      qc.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'Nome obrigatório';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    mutation.mutate();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>Novo projeto</p>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em' }}>Criar projeto</h2>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '7px', border: 'none' }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">Nome do projeto</label>
            <input
              className={`input${errors.name ? ' error' : ''}`}
              placeholder="Ex: Meu curso online"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {errors.name && <p style={{ fontSize: 11.5, color: '#EF4444', marginTop: 5 }}>{errors.name}</p>}
          </div>
          <div>
            <label className="field-label">Descrição (opcional)</label>
            <textarea
              className="input"
              placeholder="Descreva o projeto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Criando…' : 'Criar projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectQueries.list({ limit: 50 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectQueries.remove(id),
    onSuccess: () => {
      toast.success('Projeto removido');
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  function copyLink(link: string) {
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!');
  }

  function handleDelete(id: string, name: string) {
    if (!window.confirm(`Remover projeto "${name}"? Esta ação não pode ser desfeita.`)) return;
    deleteMutation.mutate(id);
  }

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, paddingTop: 8 }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
            textTransform: 'uppercase' as const, letterSpacing: '0.3em', marginBottom: 10,
          }}>
            Workspace
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
            Projetos
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
            {data?.total ?? 0} projeto{data?.total !== 1 ? 's' : ''} criado{data?.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} />
          Novo projeto
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 88, borderRadius: 20 }} />
          ))}
        </div>
      ) : data?.projects.length === 0 ? (
        <div style={{
          background: '#050505', border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 28, padding: '64px 32px', textAlign: 'center' as const,
          display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: 'rgba(255,74,42,0.08)',
            border: '1px solid rgba(255,74,42,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 4,
          }}>
            <FolderOpen size={24} style={{ color: '#FF4A2A' }} />
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>Nenhum projeto ainda</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', maxWidth: 320 }}>
            Crie seu primeiro projeto e comece a dividir pagamentos com seus colaboradores
          </p>
          <button className="btn-primary" style={{ marginTop: 8 }} onClick={() => setShowCreate(true)}>
            <Plus size={14} />
            Criar projeto
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data?.projects.map((p) => (
            <div
              key={p.id}
              style={{
                background: '#050505', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 20, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16,
                cursor: 'pointer', transition: 'border-color 160ms ease, background 160ms ease',
              }}
              onClick={() => router.push(`/projects/${p.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.background = '#080808';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.background = '#050505';
              }}
            >
              {/* Icon */}
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'rgba(255,74,42,0.08)', border: '1px solid rgba(255,74,42,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FolderOpen size={18} style={{ color: '#FF4A2A' }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 14.5, fontWeight: 500, color: 'rgba(255,255,255,0.85)',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {p.name}
                </p>
                <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                  {formatDate(p.createdAt)} · {p.collaboratorCount ?? 0} colaborador{p.collaboratorCount !== 1 ? 'es' : ''}
                </p>
              </div>

              {/* Revenue */}
              <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                <p style={{
                  fontSize: 16, fontWeight: 600, color: '#fff',
                  fontFamily: 'var(--font-geist-mono, monospace)', letterSpacing: '-0.02em',
                }}>
                  {formatCurrency(p.totalRevenue ?? 0)}
                </p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>
                  {p.totalPayments ?? 0} pagamento{p.totalPayments !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn-ghost"
                  style={{ padding: '7px', border: 'none' }}
                  onClick={() => copyLink(p.paymentLink)}
                  title="Copiar link"
                >
                  <Copy size={13} />
                </button>
                <a
                  href={p.paymentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost"
                  style={{ padding: '7px', border: 'none', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Abrir link"
                >
                  <ArrowUpRight size={13} />
                </a>
                <button
                  className="btn-ghost"
                  style={{ padding: '7px', border: 'none', color: 'rgba(239,68,68,0.7)' }}
                  onClick={() => handleDelete(p.id, p.name)}
                  title="Remover"
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(239,68,68,0.7)')}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
