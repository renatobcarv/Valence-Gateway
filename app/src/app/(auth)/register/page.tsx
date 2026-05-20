'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Eye, EyeOff, Globe, GitBranch } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/api';
import { Logo } from '@/components/ui/Logo';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepItem({ number, text, active = false }: { number: number; text: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${active ? 'bg-white text-black border-white' : 'bg-[#1A1A1A] text-white border-transparent'}`}>
      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${active ? 'bg-black text-white' : 'bg-white/10 text-white/40'}`}>
        {number}
      </span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
}

function SocialButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button type="button" className="flex items-center justify-center gap-2.5 h-11 w-full bg-black border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/5 transition-colors">
      <Icon size={16} />
      {label}
    </button>
  );
}

function InputGroup({ label, placeholder, type = 'text', value, onChange, error, rightSlot, hint }: {
  label: string; placeholder: string; type?: string;
  value: string; onChange: (v: string) => void; error?: string;
  rightSlot?: React.ReactNode; hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white">{label}</label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-11 px-4 bg-[#1A1A1A] border-none rounded-xl text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-white/20 transition-all text-sm ${rightSlot ? 'pr-10' : ''} ${error ? 'ring-2 ring-red-500/50' : ''}`}
        />
        {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-white/30">{hint}</p>}
    </div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'Obrigatório';
    if (!lastName.trim())  e.lastName  = 'Obrigatório';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email inválido';
    if (!password || password.length < 8)     e.password = 'Mínimo 8 caracteres';
    else if (!/[A-Z]/.test(password))         e.password = 'Precisa de ao menos uma letra maiúscula';
    else if (!/[0-9]/.test(password))         e.password = 'Precisa de ao menos um número';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await register(email, password, `${firstName.trim()} ${lastName.trim()}`);
      router.push('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">

      {/* ── Left column ── */}
      <div className="hidden lg:flex relative w-[52%] flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4" type="video/mp4" />
        </video>

        <motion.div className="relative z-10 w-full max-w-xs space-y-8" variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp}>
            <Logo size={28} />
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-2">
            <h1 className="text-4xl font-medium tracking-tight text-white">Comece agora</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              Divida pagamentos com colaboradores automaticamente via Stripe.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-2">
            <StepItem number={1} text="Crie sua conta" active />
            <StepItem number={2} text="Configure seus projetos" />
            <StepItem number={3} text="Receba automaticamente" />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right column ── */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          className="w-full max-w-xl space-y-8 lg:space-y-6 sm:space-y-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } }}
        >
          <div className="space-y-1">
            <h2 className="text-3xl font-medium tracking-tight text-white">Criar conta</h2>
            <p className="text-white/40 text-sm">Preencha seus dados para começar a dividir pagamentos.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SocialButton icon={Globe} label="Google" />
            <SocialButton icon={GitBranch} label="Github" />
          </div>

          <div className="relative flex items-center">
            <div className="flex-1 border-t border-white/10" />
            <span className="bg-black px-4 text-xs font-medium text-white/40 uppercase tracking-widest">Ou</span>
            <div className="flex-1 border-t border-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputGroup label="Nome" placeholder="João" value={firstName} onChange={setFirstName} error={errors.firstName} />
              <InputGroup label="Sobrenome" placeholder="Silva" value={lastName} onChange={setLastName} error={errors.lastName} />
            </div>

            <InputGroup label="Email" placeholder="joao@exemplo.com" type="email" value={email} onChange={setEmail} error={errors.email} />

            <InputGroup
              label="Senha"
              placeholder="Mín. 8 chars, 1 maiúscula, 1 número"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              error={errors.password}
              hint="Ex: Valence1 — mínimo 8 caracteres, uma maiúscula e um número."
              rightSlot={
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-white/40 hover:text-white transition-colors p-0 border-none bg-transparent cursor-pointer flex">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white text-black font-semibold rounded-xl hover:bg-white/90 active:scale-[0.98] mt-4 transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta…' : 'Criar conta'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40">
            Já tem conta?{' '}
            <Link href="/login" className="text-white font-medium hover:underline">Entrar</Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
