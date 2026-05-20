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

const STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: Clock },
  sent: { label: 'Enviado', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: ArrowLeftRight },
  completed: { label: 'Confirmado', color: 'text-green-400 bg-green-400/10 border-green-400/20', icon: CheckCircle2 },
  failed: { label: 'Falhou', color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: XCircle },
};

function StatusChip({ status }: { status: string }) {
  const cfg = STATUS_LABELS[status] ?? STATUS_LABELS['pending'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
      <Icon size={11} />
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
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
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
    for (const id of ids) {
      await markSent.mutateAsync(id);
    }
    setSelected(new Set());
  }

  const pendingList = transfers.filter((t) => t.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">Repasses</h1>
        <p className="text-white/40 text-sm mt-0.5">Gerencie as transferências Pix para os colaboradores</p>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Pendente', value: summary.pending, color: 'text-amber-400', bg: 'border-amber-400/20 bg-amber-400/5' },
            { label: 'Enviado', value: summary.sent, color: 'text-blue-400', bg: 'border-blue-400/20 bg-blue-400/5' },
            { label: 'Confirmado', value: summary.completed, color: 'text-green-400', bg: 'border-green-400/20 bg-green-400/5' },
            { label: 'Falhou', value: summary.failed, color: 'text-red-400', bg: 'border-red-400/20 bg-red-400/5' },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
              <p className="text-xs text-white/40 uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-xl font-semibold ${s.color}`}>{formatCurrency(parseFloat(s.value))}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter + bulk actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {['', 'pending', 'sent', 'completed', 'failed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {s === '' ? 'Todos' : STATUS_LABELS[s]?.label ?? s}
            </button>
          ))}
        </div>

        {selected.size > 0 && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={copySelectedKeys}
              className="h-8 px-3 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/70 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Copy size={12} />
              Copiar {selected.size} chave{selected.size > 1 ? 's' : ''}
            </button>
            <button
              onClick={markSelectedSent}
              disabled={markSent.isPending}
              className="h-8 px-3 rounded-lg text-xs font-medium bg-[#FF4A2A] text-white hover:bg-[#E2331C] flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Check size={12} />
              Marcar como enviado
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#161618] border border-white/8 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-white/30 text-sm">Carregando...</div>
        ) : transfers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ArrowLeftRight size={32} className="text-white/20 mx-auto" />
            <p className="text-white/40 text-sm">Nenhum repasse encontrado</p>
            <p className="text-white/25 text-xs">Os repasses aparecem aqui após cada pagamento recebido</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size > 0 && selected.size === pendingList.length}
                    onChange={toggleAll}
                    className="accent-[#FF4A2A]"
                  />
                </th>
                <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wide">Colaborador</th>
                <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wide">Chave Pix</th>
                <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wide">Valor</th>
                <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wide">Projeto</th>
                <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wide">Data</th>
                <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wide">Status</th>
                <th className="p-4 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                  <td className="p-4">
                    {t.status === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selected.has(t.id)}
                        onChange={() => toggleSelect(t.id)}
                        className="accent-[#FF4A2A]"
                      />
                    )}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{t.collaboratorName}</div>
                    <div className="text-xs text-white/40 mt-0.5">{t.collaboratorEmail}</div>
                  </td>
                  <td className="p-4">
                    {t.pixKey ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white/70 max-w-[140px] truncate">{t.pixKey}</span>
                        <button
                          onClick={() => copyPixKey(t.id, t.pixKey!)}
                          className="text-white/30 hover:text-[#FF4A2A] transition-colors flex-shrink-0"
                        >
                          {copiedId === t.id ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-white/25 text-xs italic">não cadastrado</span>
                    )}
                  </td>
                  <td className="p-4 font-semibold text-white font-mono">{formatCurrency(parseFloat(t.amount))}</td>
                  <td className="p-4 text-white/60 max-w-[120px] truncate">{t.projectName}</td>
                  <td className="p-4 text-white/40 text-xs">{formatDate(t.createdAt)}</td>
                  <td className="p-4"><StatusChip status={t.status} /></td>
                  <td className="p-4">
                    {t.status === 'pending' && (
                      <button
                        onClick={() => markSent.mutate(t.id)}
                        disabled={markSent.isPending}
                        className="h-7 px-2.5 rounded-lg bg-[#FF4A2A]/15 text-[#FF4A2A] text-xs font-medium hover:bg-[#FF4A2A]/25 transition-colors disabled:opacity-50 whitespace-nowrap"
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
