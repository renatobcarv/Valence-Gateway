'use client';

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { toast } from 'sonner';
import { projectQueries, collabQueries } from '@/lib/queries';
import { getErrorMessage } from '@/lib/api';
import { formatCurrency, formatDate, formatRelative, truncate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import type { Collaborator } from '@/types';
import {
  ArrowLeft, Plus, Copy, ExternalLink, Trash2, X,
  Users, DollarSign, BarChart2, Clock,
} from 'lucide-react';

function AddCollabModal({ projectId, usedPercentage, onClose }: { projectId: string; usedPercentage: number; onClose: () => void }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      collabQueries.add(projectId, {
        email,
        name: name.trim(),
        percentage: parseFloat(percentage),
        pixKey: pixKey.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Colaborador adicionado!');
      qc.invalidateQueries({ queryKey: ['collaborators', projectId] });
      qc.invalidateQueries({ queryKey: ['project', projectId] });
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Nome obrigatório';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email inválido';
    const pct = parseFloat(percentage);
    if (isNaN(pct) || pct <= 0) e.percentage = 'Percentual deve ser maior que 0';
    else if (pct > (100 - usedPercentage)) e.percentage = `Máximo disponível: ${(100 - usedPercentage).toFixed(2)}%`;
    // pixKey é opcional — backend valida o formato
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    mutation.mutate();
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal fade-up">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>Adicionar colaborador</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px', border: 'none' }}>
            <X size={16} />
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-4)', marginBottom: 16 }}>
          Percentual disponível: <strong style={{ color: 'var(--ink-2)' }}>{(100 - usedPercentage).toFixed(2)}%</strong>
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          {[
            { label: 'Nome', key: 'name', value: name, setter: setName, placeholder: 'Nome do colaborador', type: 'text' },
            { label: 'Email', key: 'email', value: email, setter: setEmail, placeholder: 'email@exemplo.com', type: 'email' },
          ].map(({ label, key, value, setter, placeholder, type }) => (
            <div key={key}>
              <label className="field-label">{label}</label>
              <input
                className={`input${errors[key] ? ' error' : ''}`}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => setter(e.target.value)}
              />
              {errors[key] && <p style={{ fontSize: 11.5, color: '#EF4444', marginTop: 4 }}>{errors[key]}</p>}
            </div>
          ))}
          <div>
            <label className="field-label">Percentual (%)</label>
            <input
              className={`input${errors.percentage ? ' error' : ''}`}
              type="number"
              min="0.01"
              max={100 - usedPercentage}
              step="0.01"
              placeholder="Ex: 30"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
            />
            {errors.percentage && <p style={{ fontSize: 11.5, color: '#EF4444', marginTop: 4 }}>{errors.percentage}</p>}
          </div>
          <div>
            <label className="field-label">Chave Pix (opcional)</label>
            <input
              className="input"
              type="text"
              placeholder="CPF, telefone +55, email ou chave aleatória"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
            />
            <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 4 }}>
              Necessário para receber repasses manuais via Pix
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-ghost">Cancelar</button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adicionando…' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CollabRow({ collab, projectId }: { collab: Collaborator; projectId: string }) {
  const qc = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: () => collabQueries.remove(projectId, collab.id),
    onSuccess: () => {
      toast.success('Colaborador removido');
      qc.invalidateQueries({ queryKey: ['collaborators', projectId] });
      qc.invalidateQueries({ queryKey: ['project', projectId] });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  function handleDelete() {
    if (!window.confirm(`Remover ${collab.name}?`)) return;
    deleteMutation.mutate();
  }

  return (
    <tr>
      <td>
        <div>
          <p style={{ color: 'var(--ink-1)', fontWeight: 500 }}>{collab.name}</p>
          <p style={{ fontSize: 12, color: 'var(--ink-4)' }}>{collab.email}</p>
        </div>
      </td>
      <td>
        <span style={{
          fontFamily: 'var(--font-geist-mono, monospace)', fontWeight: 600,
          color: 'var(--accent)', fontSize: 13,
        }}>
          {collab.percentage}%
        </span>
      </td>
      <td style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontWeight: 500, color: 'var(--ink)' }}>
        {formatCurrency(collab.totalEarned ?? 0)}
      </td>
      <td style={{ color: 'var(--ink-4)' }}>
        {collab.lastTransfer ? formatRelative(collab.lastTransfer) : '—'}
      </td>
      <td>
        {collab.pixKey ? (
          <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--ink-3)', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>
            {truncate(collab.pixKey, 20)}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Não cadastrada</span>
        )}
      </td>
      <td>
        <button
          className="btn-ghost"
          style={{ padding: '5px', border: 'none', color: '#EF4444' }}
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const [showAddCollab, setShowAddCollab] = useState(false);

  const project = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectQueries.getById(id),
  });

  const collabs = useQuery({
    queryKey: ['collaborators', id],
    queryFn: () => collabQueries.list(id),
  });

  const p = project.data;
  const usedPercentage = collabs.data?.totalPercentage ?? 0;

  function copyLink() {
    if (!p?.paymentLink) return;
    navigator.clipboard.writeText(p.paymentLink);
    toast.success('Link copiado!');
  }

  if (project.isLoading) {
    return (
      <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="skeleton" style={{ height: 28, width: 200 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card skeleton" style={{ height: 80 }} />)}
        </div>
      </div>
    );
  }

  if (project.isError || !p) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--ink-4)' }}>Projeto não encontrado</p>
        <Link href="/projects" style={{ color: 'var(--accent)', fontSize: 13, textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <Link
          href="/projects"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-4)', textDecoration: 'none', marginBottom: 12 }}
        >
          <ArrowLeft size={13} /> Projetos
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</h1>
            {p.description && <p style={{ fontSize: 13.5, color: 'var(--ink-4)', marginTop: 4 }}>{p.description}</p>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="btn-ghost" onClick={copyLink}>
              <Copy size={13} /> Copiar link
            </button>
            <a
              href={p.paymentLink}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
              style={{ textDecoration: 'none' }}
            >
              <ExternalLink size={13} /> Abrir link
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Receita total', value: formatCurrency(p.stats?.totalRevenue ?? 0), icon: DollarSign },
          { label: 'Pagamentos', value: String(p.stats?.totalPayments ?? 0), icon: BarChart2 },
          { label: 'Média por pagamento', value: formatCurrency(p.stats?.averagePayment ?? 0), icon: TrendingUp },
          { label: 'Último pagamento', value: p.stats?.lastPayment ? formatRelative(p.stats.lastPayment) : '—', icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={16} style={{ color: 'var(--ink-4)' }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 600 }}>{label}</p>
              <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-geist-mono, monospace)' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Collaborators */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={15} style={{ color: 'var(--ink-4)' }} />
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)' }}>Colaboradores</p>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
              background: 'var(--surface-2)', color: 'var(--ink-4)',
            }}>
              {collabs.data?.collaborators.length ?? 0}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>
              {usedPercentage.toFixed(2)}% alocado
            </span>
            <button
              className="btn-primary"
              style={{ padding: '6px 12px', fontSize: 12.5 }}
              onClick={() => setShowAddCollab(true)}
              disabled={usedPercentage >= 100}
            >
              <Plus size={12} /> Adicionar
            </button>
          </div>
        </div>

        {collabs.isLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 44 }} />)}
          </div>
        ) : collabs.data?.collaborators.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <Users size={28} style={{ color: 'var(--ink-4)', margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 4 }}>Nenhum colaborador</p>
            <p style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>Adicione colaboradores para dividir os pagamentos automaticamente</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>%</th>
                <th>Total recebido</th>
                <th>Última transferência</th>
                <th>Chave Pix</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {collabs.data?.collaborators.map((c) => (
                <CollabRow key={c.id} collab={c} projectId={id} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddCollab && (
        <AddCollabModal
          projectId={id}
          usedPercentage={usedPercentage}
          onClose={() => setShowAddCollab(false)}
        />
      )}
    </div>
  );
}

function TrendingUp({ size, style }: { size: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
