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

function SocialButton({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <button type="button" className="flex items-center justify-center gap-2.5 h-11 w-full bg-black border border-white/10 rounded-xl text-sm font-medium text-white hover:bg-white/5 transition-colors">
      <Icon size={16} />
      {label}
    </button>
  );
}

function InputGroup({ label, placeholder, type = 'text', value, onChange, error, rightSlot }: {
  label: string; placeholder: string; type?: string;
  value: string; onChange: (v: string) => void; error?: string;
  rightSlot?: React.ReactNode;
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
    </div>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email inválido';
    if (!password) e.password = 'Senha obrigatória';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await login(email, password);
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

        <motion.div className="relative z-10 w-full max-w-xs space-y-6" variants={stagger} initial="hidden" animate="show">
          <motion.div variants={fadeUp}>
            <Logo size={28} />
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-2">
            <h1 className="text-4xl font-medium tracking-tight text-white">Bem-vindo de volta</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              Acesse seu workspace e gerencie seus splits de pagamento.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Right column ── */}
      <div className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          className="w-full max-w-xl space-y-8 lg:space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } }}
        >
          <div className="space-y-1">
            <h2 className="text-3xl font-medium tracking-tight text-white">Entrar</h2>
            <p className="text-white/40 text-sm">Acesse sua conta Valence.</p>
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
            <InputGroup label="Email" placeholder="joao@exemplo.com" type="email" value={email} onChange={setEmail} error={errors.email} />

            <InputGroup
              label="Senha"
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              error={errors.password}
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
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40">
            Não tem conta?{' '}
            <Link href="/register" className="text-white font-medium hover:underline">Criar conta</Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
