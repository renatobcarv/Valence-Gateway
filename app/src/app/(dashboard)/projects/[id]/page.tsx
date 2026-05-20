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
  Users, DollarSign, BarChart2, Clock, TrendingUp,
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
          <div>
            <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 4 }}>
              {(100 - usedPercentage).toFixed(2)}% disponível
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em' }}>Adicionar colaborador</h2>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '7px', border: 'none' }}>
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 5 }}>
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

  return (
    <tr>
      <td>
        <div>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: 13.5 }}>{collab.name}</p>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{collab.email}</p>
        </div>
      </td>
      <td>
        <span style={{
          fontFamily: 'var(--font-geist-mono, monospace)', fontWeight: 700,
          color: '#FF4A2A', fontSize: 13,
        }}>
          {collab.percentage}%
        </span>
      </td>
      <td style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontWeight: 600, color: '#fff', fontSize: 13 }}>
        {formatCurrency(collab.totalEarned ?? 0)}
      </td>
      <td style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
        {collab.lastTransfer ? formatRelative(collab.lastTransfer) : '—'}
      </td>
      <td>
        {collab.pixKey ? (
          <span style={{
            fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)',
            background: 'rgba(255,255,255,0.05)', padding: '3px 8px',
            borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {truncate(collab.pixKey, 20)}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Não cadastrada</span>
        )}
      </td>
      <td>
        <button
          className="btn-ghost"
          style={{ padding: '5px', border: 'none', color: 'rgba(239,68,68,0.6)' }}
          onClick={() => { if (!window.confirm(`Remover ${collab.name}?`)) return; deleteMutation.mutate(); }}
          disabled={deleteMutation.isPending}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(239,68,68,0.6)')}
        >
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
        <div className="skeleton" style={{ height: 28, width: 200, borderRadius: 8 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 20 }} />)}
        </div>
      </div>
    );
  }

  if (project.isError || !p) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)' }}>Projeto não encontrado</p>
        <Link href="/projects" style={{ color: '#FF4A2A', fontSize: 13, textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>
          Voltar
        </Link>
      </div>
    );
  }

  const STATS = [
    { label: 'Receita total', value: formatCurrency(p.stats?.totalRevenue ?? 0), icon: DollarSign },
    { label: 'Pagamentos', value: String(p.stats?.totalPayments ?? 0), icon: BarChart2 },
    { label: 'Média por pagamento', value: formatCurrency(p.stats?.averagePayment ?? 0), icon: TrendingUp },
    { label: 'Último pagamento', value: p.stats?.lastPayment ? formatRelative(p.stats.lastPayment) : '—', icon: Clock },
  ];

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Breadcrumb + header */}
      <div style={{ paddingTop: 8 }}>
        <Link
          href="/projects"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none',
            marginBottom: 14, transition: 'color 140ms',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
        >
          <ArrowLeft size={12} /> Projetos
        </Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{p.name}</h1>
            {p.description && <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>{p.description}</p>}
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
              <ExternalLink size={13} /> Abrir
            </a>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        {STATS.map(({ label, value, icon: Icon }) => (
          <div key={label} style={{
            background: '#050505', border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 20, padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={15} style={{ color: 'rgba(255,255,255,0.35)' }} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
                {label}
              </p>
              <p style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Collaborators */}
      <div style={{
        background: '#050505', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 24, overflow: 'hidden',
      }}>
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 3, height: 14, borderRadius: 99, background: 'linear-gradient(180deg, #FF4A2A, #FF8C6B)' }} />
            <Users size={14} style={{ color: 'rgba(255,255,255,0.3)' }} />
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Colaboradores
            </p>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              {collabs.data?.collaborators.length ?? 0}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
              <span style={{ color: '#FF4A2A', fontWeight: 600 }}>{usedPercentage.toFixed(2)}%</span> alocado
            </span>
            <button
              className="btn-primary"
              style={{ padding: '7px 14px', fontSize: 12 }}
              onClick={() => setShowAddCollab(true)}
              disabled={usedPercentage >= 100}
            >
              <Plus size={12} /> Adicionar
            </button>
          </div>
        </div>

        {collabs.isLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 10 }} />)}
          </div>
        ) : collabs.data?.collaborators.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Users size={28} style={{ color: 'rgba(255,255,255,0.15)' }} />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>Nenhum colaborador</p>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.2)' }}>
              Adicione colaboradores para dividir os pagamentos automaticamente
            </p>
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
