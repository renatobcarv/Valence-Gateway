'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Clock, CheckCircle2, ArrowLeftRight, DollarSign } from 'lucide-react';

interface CollabSummary {
  pending: number;
  sent: number;
  completed: number;
  total: number;
}

interface CollabInfo {
  name: string;
  email: string;
  pixKey: string | null;
  projectName: string;
}

interface HistoryItem {
  id: string;
  date: string;
  amount: number;
  status: string;
  sentAt: string | null;
  projectName: string;
}

interface EarningsData {
  collaborator: CollabInfo;
  summary: CollabSummary;
  history: HistoryItem[];
}

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Aguardando', color: 'text-amber-400' },
  sent: { label: 'Enviado', color: 'text-blue-400' },
  completed: { label: 'Confirmado', color: 'text-green-400' },
  failed: { label: 'Falhou', color: 'text-red-400' },
};

export default function CollaboratorEarningsPage() {
  const params = useParams();
  const collabId = params['collabId'] as string;

  const [data, setData] = useState<EarningsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/projects/collaborators/${collabId}/earnings`)
      .then((r) => setData(r.data))
      .catch(() => setError('Colaborador não encontrado'));
  }, [collabId]);

  if (error) {
    return (
      <main className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4">
        <p className="text-white/50">{error}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4">
        <p className="text-white/30 text-sm">Carregando...</p>
      </main>
    );
  }

  const { collaborator, summary, history } = data;

  return (
    <main className="min-h-screen bg-[#0A0A0C] p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[#FF4A2A] text-xs font-medium mb-2 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A2A] animate-pulse inline-block" />
            Valence
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">{collaborator.name}</h1>
          <p className="text-white/40 text-sm">{collaborator.email} · {collaborator.projectName}</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Aguardando repasse', value: summary.pending, icon: Clock, color: 'text-amber-400', bg: 'border-amber-400/20 bg-amber-400/5' },
            { label: 'Em trânsito', value: summary.sent, icon: ArrowLeftRight, color: 'text-blue-400', bg: 'border-blue-400/20 bg-blue-400/5' },
            { label: 'Já recebi', value: summary.completed, icon: CheckCircle2, color: 'text-green-400', bg: 'border-green-400/20 bg-green-400/5' },
            { label: 'Total ganho', value: summary.total, icon: DollarSign, color: 'text-white', bg: 'border-white/10 bg-white/3' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`rounded-xl border p-4 ${bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={13} className={color} />
                <p className="text-xs text-white/40 uppercase tracking-wide">{label}</p>
              </div>
              <p className={`text-xl font-semibold font-mono ${color}`}>{formatCurrency(value)}</p>
            </div>
          ))}
        </div>

        {/* Pix key info */}
        {collaborator.pixKey ? (
          <div className="bg-[#161618] border border-white/8 rounded-xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={14} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wide mb-0.5">Chave Pix cadastrada</p>
              <p className="text-sm font-mono text-white/80">{collaborator.pixKey}</p>
            </div>
          </div>
        ) : (
          <div className="bg-[#161618] border border-amber-400/20 rounded-xl p-4">
            <p className="text-sm text-amber-400 font-medium mb-0.5">Chave Pix não cadastrada</p>
            <p className="text-xs text-white/40">Peça ao criador do projeto para adicionar sua chave Pix. Sem ela, o repasse manual não pode ser feito.</p>
          </div>
        )}

        {/* Note */}
        <p className="text-xs text-white/25 text-center">
          Você receberá um Pix assim que o criador fizer a transferência. Os valores são calculados automaticamente a cada pagamento recebido.
        </p>

        {/* History */}
        <div className="bg-[#161618] border border-white/8 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/8">
            <p className="text-sm font-medium text-white">Histórico de ganhos</p>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-white/30 text-sm">Nenhum pagamento ainda</p>
              <p className="text-white/20 text-xs mt-1">Os ganhos aparecem aqui após cada pagamento ao projeto</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wide">Data</th>
                  <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wide">Projeto</th>
                  <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wide">Valor</th>
                  <th className="text-left p-4 text-xs font-medium text-white/40 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const cfg = STATUS_CFG[item.status] ?? STATUS_CFG['pending'];
                  return (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="p-4 text-white/40 text-xs">{formatDate(item.date)}</td>
                      <td className="p-4 text-white/60 text-xs max-w-[140px] truncate">{item.projectName}</td>
                      <td className="p-4 font-semibold text-white font-mono text-sm">{formatCurrency(item.amount)}</td>
                      <td className="p-4">
                        <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                        {item.sentAt && (
                          <p className="text-xs text-white/25 mt-0.5">{formatDate(item.sentAt)}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-center text-xs text-white/20">Powered by Valence × Stripe</p>
      </div>
    </main>
  );
}
