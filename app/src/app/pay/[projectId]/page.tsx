'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '@/lib/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface ProjectInfo { id: string; name: string; description?: string | null }
interface IntentResult { clientSecret: string; paymentIntentId: string; amount: number }

function PaymentForm({ amount, projectId, onSuccess }: {
  amount: number; projectId: string; onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: stripeErr } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/pay/${projectId}/success` },
      redirect: 'if_required',
    });

    if (stripeErr) {
      setError(stripeErr.message ?? 'Erro no pagamento');
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement />
      {error && <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Processando...' : `Pagar R$ ${amount.toFixed(2).replace('.', ',')}`}
      </button>
    </form>
  );
}

export default function PayPage() {
  const params = useParams();
  const projectId = params['projectId'] as string;

  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [intent, setIntent] = useState<IntentResult | null>(null);
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/projects/${projectId}`)
      .then((r) => setProject(r.data))
      .catch(() => setPageError('Projeto não encontrado'));
  }, [projectId]);

  const handleGenerateIntent = useCallback(async () => {
    const amountNum = parseFloat(amount.replace(',', '.'));
    if (isNaN(amountNum) || amountNum < 0.5) {
      setFieldError('Valor mínimo: R$ 0,50');
      return;
    }
    setLoading(true);
    setFieldError(null);
    try {
      const { data } = await api.post(`/projects/${projectId}/create-intent`, {
        amount: amountNum,
        ...(customerEmail && { customerEmail }),
      });
      setIntent(data);
      setStep('payment');
    } catch {
      setFieldError('Erro ao gerar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [amount, customerEmail, projectId]);

  if (pageError) {
    return (
      <main className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4">
        <p className="text-white/50">{pageError}</p>
      </main>
    );
  }

  const displayAmount = parseFloat(amount.replace(',', '.'));

  return (
    <main className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 text-[#FF4A2A] text-xs font-medium mb-2 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4A2A] animate-pulse inline-block" />
            Pagamento seguro
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">{project?.name ?? '…'}</h1>
          {project?.description && <p className="text-white/40 text-sm">{project.description}</p>}
        </div>

        <div className="bg-[#161618] border border-white/8 rounded-2xl p-6 space-y-5">

          {/* Step 1 */}
          {step === 'info' && (
            <>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wide">Valor (R$)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-14 px-4 bg-[#1B1B1F] border border-white/8 rounded-xl text-white text-2xl font-semibold placeholder:text-white/20 outline-none focus:border-[#FF4A2A]/40 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/40 uppercase tracking-wide">Email (opcional — para comprovante)</label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full h-11 px-4 bg-[#1B1B1F] border border-white/8 rounded-xl text-white text-sm placeholder:text-white/20 outline-none focus:border-[#FF4A2A]/40 transition-colors"
                  />
                </div>
              </div>

              {fieldError && <p className="text-sm text-red-400 bg-red-500/10 rounded-xl px-3 py-2">{fieldError}</p>}

              <button
                onClick={handleGenerateIntent}
                disabled={loading || !amount}
                className="w-full h-14 bg-[#FF4A2A] text-white font-semibold rounded-xl hover:bg-[#E2331C] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Aguarde...' : 'Continuar →'}
              </button>
            </>
          )}

          {/* Step 2 */}
          {step === 'payment' && intent && (
            <>
              <div className="flex items-center justify-between">
                <button onClick={() => setStep('info')} className="text-white/40 text-sm hover:text-white transition-colors">← Voltar</button>
                <span className="text-white font-semibold text-lg">R$ {displayAmount.toFixed(2).replace('.', ',')}</span>
              </div>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: intent.clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: { colorPrimary: '#FF4A2A', colorBackground: '#1B1B1F', colorText: '#FFFFFF', borderRadius: '12px' },
                  },
                }}
              >
                <PaymentForm amount={displayAmount} projectId={projectId} onSuccess={() => setStep('success')} />
              </Elements>
            </>
          )}

          {/* Step 3 */}
          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Pagamento confirmado!</h2>
                <p className="text-white/50 text-sm mt-1">Os colaboradores receberão sua parte em breve.</p>
              </div>
              <div className="p-4 bg-[#1B1B1F] rounded-xl text-left space-y-1">
                <p className="text-xs text-white/40 uppercase tracking-wide">Valor pago</p>
                <p className="text-2xl font-semibold text-white">R$ {displayAmount.toFixed(2).replace('.', ',')}</p>
                <p className="text-xs text-white/30 mt-0.5">para {project?.name}</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-white/20">Powered by Valence × Stripe</p>
      </div>
    </main>
  );
}
