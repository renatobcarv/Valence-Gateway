import { cn } from '@/lib/utils';

type Variant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending' | 'processing';

const variants: Record<Variant, string> = {
  success:    'bg-[rgba(34,197,94,.12)] text-[#22C55E]',
  warning:    'bg-[rgba(245,158,11,.12)] text-[#F59E0B]',
  error:      'bg-[rgba(239,68,68,.12)] text-[#EF4444]',
  info:       'bg-[rgba(99,102,241,.12)] text-[#818CF8]',
  pending:    'bg-[rgba(245,158,11,.12)] text-[#F59E0B]',
  processing: 'bg-[rgba(99,102,241,.12)] text-[#818CF8]',
  neutral:    'bg-[var(--surface-2)] text-[var(--ink-3)]',
};

export function Badge({ variant, children, className }: { variant: Variant; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11.5px] font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: Variant }> = {
    completed:  { label: 'Concluído',   variant: 'success' },
    pending:    { label: 'Pendente',    variant: 'pending' },
    processing: { label: 'Processando', variant: 'processing' },
    failed:     { label: 'Falhou',      variant: 'error' },
    transferred:{ label: 'Transferido', variant: 'success' },
  };
  const config = map[status] ?? { label: status, variant: 'neutral' as Variant };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
