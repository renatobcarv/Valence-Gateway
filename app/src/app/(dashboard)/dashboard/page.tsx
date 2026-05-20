'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardQueries, projectQueries } from '@/lib/queries';
import { formatCurrency, formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, FolderOpen, ArrowLeftRight, Users, ArrowUpRight } from 'lucide-react';

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

function formatMonth(m: string) {
  const [, month] = m.split('-');
  return MONTH_LABELS[month] ?? m;
}

function StatCard({
  label, value, sub, icon: Icon, accent = false, trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: boolean;
  trend?: string;
}) {
  return (
    <div
      className="fade-up"
      style={{
        position: 'relative', overflow: 'hidden',
        background: '#050505', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 24, padding: '24px 24px 20px',
        display: 'flex', flexDirection: 'column', gap: 12,
        transition: 'border-color 200ms ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = accent ? 'rgba(255,74,42,0.25)' : 'rgba(255,255,255,0.1)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.05)';
      }}
    >
      {/* Corner glow */}
      {accent && (
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 80, height: 80,
          background: 'linear-gradient(135deg, #FF4A2A, #FF8C6B)',
          opacity: 0.1, filter: 'blur(24px)', borderRadius: '0 24px 0 0',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: accent ? 'rgba(255,74,42,0.12)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${accent ? 'rgba(255,74,42,0.2)' : 'rgba(255,255,255,0.06)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} style={{ color: accent ? '#FF4A2A' : 'rgba(255,255,255,0.4)' }} />
        </div>
        {trend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px', borderRadius: 999,
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)',
            fontSize: 10, fontWeight: 600, color: '#22C55E',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <ArrowUpRight size={9} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>
          {label}
        </p>
        <p style={{ fontSize: 28, fontWeight: 500, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}
        </p>
        {sub && (
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>{sub}</p>
        )}
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12, padding: '10px 14px', fontSize: 12,
    }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 4, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</p>
      <p style={{ color: '#fff', fontWeight: 600 }}>{formatCurrency(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

export default function DashboardPage() {
  const earnings = useQuery({ queryKey: ['earnings'], queryFn: dashboardQueries.earnings });
  const transfers = useQuery({ queryKey: ['transfers', 'recent'], queryFn: () => dashboardQueries.transfers({ limit: 8 }) });
  const chart = useQuery({ queryKey: ['revenueChart'], queryFn: dashboardQueries.revenueChart });
  const projects = useQuery({ queryKey: ['projects'], queryFn: () => projectQueries.list({ limit: 3 }) });

  const e = earnings.data;
  const chartData = (chart.data ?? []).map((p) => ({ ...p, label: formatMonth(p.month) }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 1100 }}>

      {/* Page header */}
      <div style={{ paddingTop: 8 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase', letterSpacing: '0.3em',
          marginBottom: 12,
        }}>
          Visão geral
        </div>
        <h1 style={{
          fontSize: 36, fontWeight: 500, color: '#fff',
          letterSpacing: '-0.03em', lineHeight: 1.1,
        }}>
          Painel de <span className="text-lava-gradient" style={{ fontWeight: 600 }}>receitas</span>
        </h1>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
        {earnings.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 24 }}>
              <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 16 }} />
              <div className="skeleton" style={{ height: 28, width: '80%' }} />
            </div>
          ))
        ) : (
          <>
            <StatCard
              label="Receita total"
              value={formatCurrency(
                (parseFloat(e?.asOwner.totalRevenue ?? '0') + parseFloat(e?.asCollaborator.totalEarned ?? '0'))
              )}
              sub="Como dono + colaborador"
              icon={TrendingUp}
              accent
            />
            <StatCard
              label="Como dono"
              value={formatCurrency(parseFloat(e?.asOwner.totalRevenue ?? '0'))}
              sub={`${e?.asOwner.totalPayments ?? 0} pagamento${e?.asOwner.totalPayments !== 1 ? 's' : ''}`}
              icon={FolderOpen}
            />
            <StatCard
              label="Como colaborador"
              value={formatCurrency(parseFloat(e?.asCollaborator.totalEarned ?? '0'))}
              sub={`${e?.asCollaborator.totalTransfers ?? 0} transferência${e?.asCollaborator.totalTransfers !== 1 ? 's' : ''}`}
              icon={ArrowLeftRight}
            />
            <StatCard
              label="Projetos ativos"
              value={String(e?.asOwner.totalProjects ?? 0)}
              sub={`${e?.asCollaborator.collaboratingIn ?? 0} como colaborador`}
              icon={Users}
            />
          </>
        )}
      </div>

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 3, height: 14, borderRadius: 99, background: 'linear-gradient(180deg, #FF4A2A, #FF8C6B)' }} />
        <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.25em', fontStyle: 'italic' }}>
          Análise de receita
        </p>
      </div>

      {/* Chart + projects */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12 }}>
        {/* Chart */}
        <div style={{
          background: '#050505', border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 28, padding: '28px 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>Receita mensal</p>
              <p style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>Últimos 6 meses</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF4A2A' }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Receita</span>
            </div>
          </div>
          {chart.isLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4A2A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF4A2A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.2)', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$${(v / 100).toFixed(0)}`}
                  width={48}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#FF4A2A"
                  strokeWidth={3}
                  fill="url(#areaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent projects */}
        <div style={{
          background: '#050505', border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 28, padding: '28px 20px', display: 'flex', flexDirection: 'column',
        }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 20 }}>
            Projetos recentes
          </p>
          {projects.isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 52, borderRadius: 12 }} />
              ))}
            </div>
          ) : projects.data?.projects.length === 0 ? (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '20px 0' }}>
              Nenhum projeto ainda
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {projects.data?.projects.map((p) => (
                <a
                  key={p.id}
                  href={`/projects/${p.id}`}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: 3,
                    padding: '10px 12px', borderRadius: 12, textDecoration: 'none',
                    border: '1px solid transparent',
                    transition: 'all 160ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{p.name}</p>
                  <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)' }}>
                    {formatCurrency(p.totalRevenue ?? 0)} · {p.collaboratorCount ?? 0} colab{p.collaboratorCount !== 1 ? 's' : ''}
                  </p>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent transfers table */}
      <div style={{
        background: '#050505', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 28, overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 3, height: 14, borderRadius: 99, background: 'linear-gradient(180deg, #FF4A2A, #FF8C6B)' }} />
          <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Transferências recentes
          </p>
        </div>
        {transfers.isLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 44, borderRadius: 10 }} />
            ))}
          </div>
        ) : transfers.data?.transfers.length === 0 ? (
          <p style={{ padding: 28, textAlign: 'center', fontSize: 13.5, color: 'rgba(255,255,255,0.2)' }}>
            Nenhuma transferência ainda
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Projeto', 'Colaborador', 'Valor', 'Status', 'Data'].map((h) => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left',
                    fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
                    textTransform: 'uppercase', letterSpacing: '0.15em',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transfers.data?.transfers.map((t) => (
                <tr
                  key={t.id}
                  style={{ transition: 'background 120ms ease' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                >
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {t.projectName}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: 'rgba(255,255,255,0.45)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {t.collaboratorName}
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#fff', letterSpacing: '-0.02em', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
                    {formatCurrency(parseFloat(t.amount))}
                  </td>
                  <td style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <StatusBadge status={t.status} />
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 11.5, color: 'rgba(255,255,255,0.25)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {formatDate(t.createdAt)}
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
