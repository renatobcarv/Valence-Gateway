'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { projectQueries } from '@/lib/queries';
import { getErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, FolderOpen, ExternalLink, Copy, Trash2, X } from 'lucide-react';

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>Novo projeto</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', border: 'none' }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="field-label">Nome do projeto</label>
            <input
              className={`input${errors.name ? ' error' : ''}`}
              placeholder="Ex: Meu curso online"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {errors.name && <p style={{ fontSize: 11.5, color: '#EF4444', marginTop: 4 }}>{errors.name}</p>}
          </div>
          <div>
            <label className="field-label">Descrição (opcional)</label>
            <textarea
              className="input"
              placeholder="Descreva o projeto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', lineHeight: 1.5 }}
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
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)' }}>Projetos</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>
            {data?.total ?? 0} projeto{data?.total !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} />
          Novo projeto
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: 100 }} />
          ))}
        </div>
      ) : data?.projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <FolderOpen size={36} style={{ color: 'var(--ink-4)', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 6 }}>Nenhum projeto ainda</p>
          <p style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 20 }}>Crie seu primeiro projeto e comece a dividir pagamentos</p>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} />
            Criar projeto
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {data?.projects.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', cursor: 'pointer', transition: 'border-color var(--t-fast)' }}
              onClick={() => router.push(`/projects/${p.id}`)}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--line-strong)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--line)')}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: 'var(--accent-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FolderOpen size={18} style={{ color: 'var(--accent)' }} />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </p>
                <p style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>
                  {formatDate(p.createdAt)} · {p.collaboratorCount ?? 0} colaborador{p.collaboratorCount !== 1 ? 'es' : ''}
                </p>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                  {formatCurrency(p.totalRevenue ?? 0)}
                </p>
                <p style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>
                  {p.totalPayments ?? 0} pagamento{p.totalPayments !== 1 ? 's' : ''}
                </p>
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn-ghost"
                  style={{ padding: '6px', border: 'none' }}
                  onClick={() => copyLink(p.paymentLink)}
                  title="Copiar link de pagamento"
                >
                  <Copy size={14} />
                </button>
                <a
                  href={p.paymentLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost"
                  style={{ padding: '6px', border: 'none', textDecoration: 'none' }}
                  title="Abrir link"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  className="btn-ghost"
                  style={{ padding: '6px', border: 'none', color: '#EF4444' }}
                  onClick={() => handleDelete(p.id, p.name)}
                  title="Remover"
                >
                  <Trash2 size={14} />
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
