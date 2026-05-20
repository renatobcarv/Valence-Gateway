'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { ArrowLeftRight, Copy, Check, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface Transfer {
  id: string;
  collaboratorId: string;
  collaboratorName: string;
  collaboratorEmail: string;
  pixKey: string | null;
  amount: string;
  projectId: string;
  projectName: string;
  status: 'pending' | 'sent' | 'completed' | 'failed';
  sentAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface PendingData {
  transfers: Transfer[];
  summary: { pending: string; sent: string; completed: string; failed: string };
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  pending:   { label: 'Pendente',   color: '#FBBF24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.15)',  icon: Clock },
  sent:      { label: 'Enviado',    color: '#60A5FA', bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.15)',  icon: ArrowLeftRight },
  completed: { label: 'Confirmado', color: '#34D399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.15)',  icon: CheckCircle2 },
  failed:    { label: 'Falhou',     color: '#F87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)', icon: XCircle },
};

function StatusChip({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG['pending'];
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600,
      color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`,
      textTransform: 'uppercase' as const, letterSpacing: '0.06em',
    }}>
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

export default function TransfersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PendingData>({
    queryKey: ['pending-transfers', statusFilter],
    queryFn: async () => {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const r = await api.get(`/dashboard/pending-transfers${params}`);
      return r.data;
    },
  });

  const markSent = useMutation({
    mutationFn: (splitId: string) => api.patch(`/transfers/${splitId}/mark-sent`),
    onSuccess: (_, splitId) => {
      toast.success('Marcado como enviado');
      setSelected((s) => { const n = new Set(s); n.delete(splitId); return n; });
      queryClient.invalidateQueries({ queryKey: ['pending-transfers'] });
    },
    onError: () => toast.error('Erro ao atualizar status'),
  });

  const transfers = data?.transfers ?? [];
  const summary = data?.summary;

  function toggleSelect(id: string) {
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    const pending = transfers.filter((t) => t.status === 'pending').map((t) => t.id);
    if (selected.size === pending.length) setSelected(new Set());
    else setSelected(new Set(pending));
  }

  function copyPixKey(id: string, key: string) {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    toast.success('Chave Pix copiada');
    setTimeout(() => setCopiedId(null), 2000);
  }

  function copySelectedKeys() {
    const keys = transfers
      .filter((t) => selected.has(t.id) && t.pixKey)
      .map((t) => `${t.collaboratorName}: ${t.pixKey} (R$ ${t.amount})`)
      .join('\n');
    if (!keys) { toast.error('Nenhuma chave Pix disponível'); return; }
    navigator.clipboard.writeText(keys);
    toast.success(`${selected.size} chaves copiadas`);
  }

  async function markSelectedSent() {
    const ids = Array.from(selected).filter((id) =>
      transfers.find((t) => t.id === id)?.status === 'pending',
    );
    for (const id of ids) await markSent.mutateAsync(id);
    setSelected(new Set());
  }

  const pendingList = transfers.filter((t) => t.status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ paddingTop: 8 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase' as const, letterSpacing: '0.3em', marginBottom: 10,
        }}>
          Financeiro
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
          Repasses
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>
          Gerencie as transferências Pix para os colaboradores
        </p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
          {([
            { key: 'pending',   label: 'Pendente',   value: summary.pending },
            { key: 'sent',      label: 'Enviado',    value: summary.sent },
            { key: 'completed', label: 'Confirmado', value: summary.completed },
            { key: 'failed',    label: 'Falhou',     value: summary.failed },
          ] as const).map((s) => {
            const cfg = STATUS_CFG[s.key];
            return (
              <div key={s.key} style={{
                background: '#050505', border: `1px solid ${cfg.border}`,
                borderRadius: 18, padding: '18px 20px',
              }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
                  {s.label}
                </p>
                <p style={{ fontSize: 20, fontWeight: 600, color: cfg.color, letterSpacing: '-0.02em', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                  {formatCurrency(parseFloat(s.value))}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter tabs + bulk actions */}
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', gap: 10 }}>
        <div style={{
          display: 'flex', gap: 4, padding: '4px', borderRadius: 12,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
        }}>
          {(['', 'pending', 'sent', 'completed', 'failed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                height: 30, padding: '0 12px', borderRadius: 8, border: 'none',
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                transition: 'all 160ms ease',
                background: statusFilter === s ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: statusFilter === s ? '#fff' : 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase' as const, letterSpacing: '0.08em',
              }}
            >
              {s === '' ? 'Todos' : STATUS_CFG[s]?.label ?? s}
            </button>
          ))}
        </div>

        {selected.size > 0 && (
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button
              onClick={copySelectedKeys}
              className="btn-ghost"
              style={{ fontSize: 12, height: 34 }}
            >
              <Copy size={12} />
              Copiar {selected.size} chave{selected.size > 1 ? 's' : ''}
            </button>
            <button
              onClick={markSelectedSent}
              disabled={markSent.isPending}
              className="btn-primary"
              style={{ fontSize: 12, height: 34 }}
            >
              <Check size={12} />
              Marcar como enviado
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: '#050505', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 24, overflow: 'hidden',
      }}>
        {isLoading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
            Carregando...
          </div>
        ) : transfers.length === 0 ? (
          <div style={{ padding: '56px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <ArrowLeftRight size={32} style={{ color: 'rgba(255,255,255,0.1)' }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 500 }}>Nenhum repasse encontrado</p>
            <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>Os repasses aparecem aqui após cada pagamento recebido</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <th style={{ padding: '12px 20px', width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selected.size > 0 && selected.size === pendingList.length}
                    onChange={toggleAll}
                    style={{ accentColor: '#FF4A2A', cursor: 'pointer' }}
                  />
                </th>
                {['Colaborador', 'Chave Pix', 'Valor', 'Projeto', 'Data', 'Status', ''].map((h) => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '12px 16px',
                    fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
                    textTransform: 'uppercase', letterSpacing: '0.15em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr
                  key={t.id}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 120ms ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 20px' }}>
                    {t.status === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selected.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        style={{ accentColor: '#FF4A2A', cursor: 'pointer' }}
                      />
                    )}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{t.collaboratorName}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{t.collaboratorEmail}</p>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {t.pixKey ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          fontFamily: 'monospace', fontSize: 11.5,
                          color: 'rgba(255,255,255,0.5)',
                          maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          display: 'block',
                        }}>
                          {t.pixKey}
                        </span>
                        <button
                          onClick={() => copyPixKey(t.id, t.pixKey!)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: copiedId === t.id ? '#34D399' : 'rgba(255,255,255,0.2)',
                            transition: 'color 140ms', flexShrink: 0,
                            display: 'flex', alignItems: 'center',
                          }}
                          onMouseEnter={(e) => { if (copiedId !== t.id) e.currentTarget.style.color = '#FF4A2A'; }}
                          onMouseLeave={(e) => { if (copiedId !== t.id) e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; }}
                        >
                          {copiedId === t.id ? <Check size={13} /> : <Copy size={13} />}
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>não cadastrado</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-geist-mono, monospace)', fontWeight: 600, color: '#fff', fontSize: 14 }}>
                    {formatCurrency(parseFloat(t.amount))}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 13, color: 'rgba(255,255,255,0.4)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.projectName}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: 11.5, color: 'rgba(255,255,255,0.25)' }}>
                    {formatDate(t.createdAt)}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <StatusChip status={t.status} />
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {t.status === 'pending' && (
                      <button
                        onClick={() => markSent.mutate(t.id)}
                        disabled={markSent.isPending}
                        style={{
                          height: 30, padding: '0 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: 'rgba(255,74,42,0.1)', color: '#FF4A2A',
                          fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                          transition: 'background 140ms', textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,74,42,0.2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,74,42,0.1)')}
                      >
                        Marcar enviado
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
