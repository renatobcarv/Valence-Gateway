'use client';

import './landing.css';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ── Utilities ──────────────────────────────────────────────────────────────────

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.3) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) { if (e.isIntersecting) { setInView(true); io.disconnect(); } } },
      { threshold }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return inView;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const ArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg className="arr" width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Check = ({ size = 10 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function FeatureIcon({ kind }: { kind: string }) {
  const s = 'currentColor';
  if (kind === 'create') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" stroke={s} strokeWidth="1.6"/><path d="M3 9h18M7 14h6M7 17h4" stroke={s} strokeWidth="1.6" strokeLinecap="round"/></svg>;
  if (kind === 'team') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="9" r="3.5" stroke={s} strokeWidth="1.6"/><path d="M3 19c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5" stroke={s} strokeWidth="1.6" strokeLinecap="round"/><circle cx="17" cy="8" r="2.5" stroke={s} strokeWidth="1.6"/><path d="M14.5 19c.4-2 1.7-3.5 3.5-4" stroke={s} strokeWidth="1.6" strokeLinecap="round"/></svg>;
  if (kind === 'link') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M9 15l6-6M7.5 11l-2 2a3.5 3.5 0 005 5l2-2M13.5 9l2-2a3.5 3.5 0 00-5-5l-2 2" stroke={s} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (kind === 'split') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h4l8 12h4M4 18h4l3-4.5" stroke={s} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 4l3 2-3 2M18 14l3 2-3 2" stroke={s} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (kind === 'auto') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.3 6.3l2 2M15.7 15.7l2 2M6.3 17.7l2-2M15.7 8.3l2-2" stroke={s} strokeWidth="1.6" strokeLinecap="round"/><circle cx="12" cy="12" r="3" stroke={s} strokeWidth="1.6"/></svg>;
  if (kind === 'shield') return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z" stroke={s} strokeWidth="1.6" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke={s} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  return null;
}

// ── Motion components ──────────────────────────────────────────────────────────

function Counter({ to, duration = 1800, format = 'plain', decimals = 0 }: {
  to: number; duration?: number; format?: string; decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  let txt: string;
  if (format === 'brl-compact') txt = v.toFixed(1).replace('.', ',');
  else if (format === 'thousands') txt = Math.round(v).toLocaleString('pt-BR');
  else txt = v.toFixed(decimals);
  return <span ref={ref} className="counter">{txt}</span>;
}

function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${p}%` }} aria-hidden="true" />;
}

function Spotlight({ children, className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={'spotlight ' + className} {...rest}>
      {children}
    </div>
  );
}

function MarqueeScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="marquee">
      <div className="marquee-track">
        {children}
        {children}
      </div>
    </div>
  );
}

function LiveTimestamp() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const hh = String(t.getHours()).padStart(2, '0');
  const mm = String(t.getMinutes()).padStart(2, '0');
  return (
    <span className="timestamp-pill" aria-live="polite">
      <span className="live-dot"></span>
      AO VIVO · {hh}:{mm} BRT
    </span>
  );
}

// ── Logo ───────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <Link href="/" className="logo">
      <span className="logo-mark"></span>
      <span>Valence</span>
    </Link>
  );
}

// ── Nav ────────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 32);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={'nav' + (scrolled ? ' scrolled' : '')}>
      <div className="nav-inner">
        <Logo />
        <nav className="nav-links">
          <a href="#produto">Produto</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#precos">Preços</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-cta">
          <Link href="/login" style={{ color: 'var(--ink-2)', fontSize: 13.5, fontWeight: 500, padding: '8px 12px' }}>Entrar</Link>
          <Link href="/register" className="btn btn-accent btn-sm">
            Começar agora <ArrowRight />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── MiniChart ──────────────────────────────────────────────────────────────────

function MiniChart() {
  const data = [12, 18, 14, 22, 19, 28, 24, 32, 30, 38, 34, 47];
  const max = Math.max(...data);
  const w = 480, h = 140, pad = 22;
  const stepX = (w - pad * 2) / (data.length - 1);
  const toY = (v: number) => h - pad - ((v / max)) * (h - pad * 2);
  const points = data.map((v, i) => [pad + i * stepX, toY(v)] as [number, number]);
  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${h - pad} L ${points[0][0]} ${h - pad} Z`;
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity=".28" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="chart-grid">
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line key={i} x1={pad} x2={w - pad} y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)} strokeDasharray="2 4" />
        ))}
      </g>
      <path d={areaPath} className="chart-area" />
      <path d={linePath} className="chart-glow" />
      <path d={linePath} className="chart-line" style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: 'draw 1.8s ease forwards .3s' }} />
      <style>{`@keyframes draw { to { stroke-dashoffset: 0; } }`}</style>
      {points.map(([x, y], i) => i === points.length - 1 ? (
        <circle key={i} cx={x} cy={y} r="4" className="chart-dot" />
      ) : null)}
      <g className="chart-axis">
        {['sem 1', 'sem 4', 'sem 8', 'sem 12'].map((lbl, i) => (
          <text key={i} x={pad + (i * (w - pad * 2)) / 3} y={h - 4} textAnchor={i === 0 ? 'start' : i === 3 ? 'end' : 'middle'}>{lbl}</text>
        ))}
      </g>
    </svg>
  );
}

// ── Hero Dashboard Preview ─────────────────────────────────────────────────────

function HeroDashboardPreview() {
  return (
    <div className="dashboard">
      <aside className="dash-side">
        <div className="logo" style={{ paddingLeft: 4 }}>
          <span className="logo-mark"></span>
          <span>Valence</span>
        </div>
        <div className="dash-nav-section">
          <div className="ttl">Workspace</div>
          <div className="dash-nav-item">
            <svg className="ic" viewBox="0 0 14 14" fill="none"><rect x="2" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="2" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="2" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="8" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>
            Dashboard
          </div>
          <div className="dash-nav-item active">
            <svg className="ic" viewBox="0 0 14 14" fill="none"><path d="M2 4l5-2 5 2v6l-5 2-5-2V4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            Projetos
            <span className="count">8</span>
          </div>
          <div className="dash-nav-item">
            <svg className="ic" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M2 12c0-2 1.5-3.5 3-3.5S8 10 8 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><circle cx="10" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.4"/></svg>
            Colaboradores
            <span className="count">24</span>
          </div>
          <div className="dash-nav-item">
            <svg className="ic" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M2 4h10M2 10h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            Transações
          </div>
        </div>
        <div className="dash-nav-section">
          <div className="ttl">Projetos ativos</div>
          <div className="dash-nav-item active" style={{ paddingLeft: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 50, background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}></span>
            Podcast Tech
            <span className="count">12</span>
          </div>
          <div className="dash-nav-item" style={{ paddingLeft: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 50, background: '#E58A52' }}></span>
            Cohort 04
          </div>
          <div className="dash-nav-item" style={{ paddingLeft: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 50, background: '#8B5CF6' }}></span>
            Campanha Garage
          </div>
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
          <span className="avatar avatar-sm" style={{ background: 'var(--accent)', color: '#fff', borderColor: 'transparent' }}>JS</span>
          <div style={{ lineHeight: 1.2, minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 500, color: 'var(--ink-1)' }}>João Silva</div>
            <div style={{ color: 'var(--ink-3)', fontSize: 11 }}>Plano Pro</div>
          </div>
        </div>
      </aside>

      <div className="dash-main">
        <div className="dash-topbar">
          <div className="dash-search">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 11L8.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            Buscar projeto, colaborador...
            <kbd>⌘K</kbd>
          </div>
          <div className="dash-account">
            <button className="btn btn-sm btn-ghost" style={{ padding: '0 10px' }}>Últimos 30 dias</button>
            <button className="btn btn-sm btn-accent">+ Novo split</button>
          </div>
        </div>
        <div className="dash-content">
          <div className="dash-header">
            <div>
              <div className="crumb">Projetos<span style={{ color: 'var(--ink-4)' }}>/</span><span className="now">Podcast Tech</span></div>
              <h2>Podcast Tech <span className="chip chip-accent">● Ativo</span></h2>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-ghost">Compartilhar link</button>
              <button className="btn btn-sm btn-accent">Configurar split</button>
            </div>
          </div>
          <div className="kpi-grid">
            <div className="kpi accent">
              <div className="l">Recebido total</div>
              <div className="v"><span className="cur">R$</span>15.340<span className="small">,00</span></div>
              <div className="d">▲ +12,4% vs. mês anterior</div>
            </div>
            <div className="kpi"><div className="l">Splits feitos</div><div className="v">142</div><div className="d">+18 esta semana</div></div>
            <div className="kpi"><div className="l">Tempo médio</div><div className="v">47<span className="small">s</span></div><div className="d">−3s mais rápido</div></div>
            <div className="kpi"><div className="l">Colaboradores</div><div className="v">3 <span className="small">/ 100%</span></div><div className="d neutral">Soma fecha 100% ✓</div></div>
          </div>
          <div className="dash-main-row">
            <div className="dash-card">
              <div className="dash-card-head"><h3>Entradas — últimas 12 semanas</h3><span className="meta">R$ 15.340,00</span></div>
              <MiniChart />
            </div>
            <div className="dash-card">
              <div className="dash-card-head"><h3>Divisão do projeto</h3><button className="btn btn-sm btn-ghost" style={{ height: 26, padding: '0 10px', fontSize: 11.5 }}>Editar</button></div>
              <div className="collab-list">
                {[
                  { init: 'J', name: 'João Mendes', email: 'john@example.com', pct: '70%', val: 'R$ 10.738', bg: 'var(--accent-soft)', color: 'var(--accent-300)', border: 'var(--accent-soft-2)' },
                  { init: 'M', name: 'Maria Lopes', email: 'jane@example.com', pct: '20%', val: 'R$ 3.068', bg: 'rgba(255,138,58,.14)', color: '#FFB287', border: 'rgba(255,138,58,.22)' },
                  { init: 'P', name: 'Pedro Castro', email: 'pedro@example.com', pct: '10%', val: 'R$ 1.534', bg: 'rgba(139,92,246,.14)', color: '#BFA6FF', border: 'rgba(139,92,246,.22)' },
                ].map((c, i) => (
                  <div key={i} className="collab">
                    <span className="avatar" style={{ background: c.bg, color: c.color, borderColor: c.border }}>{c.init}</span>
                    <div><div className="nm">{c.name}</div><div className="em">{c.email}</div></div>
                    <div className="pct">{c.pct}</div>
                    <div className="val">{c.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="dash-card">
            <div className="dash-card-head"><h3>Transações recentes</h3><a href="#" style={{ fontSize: 12.5, color: 'var(--accent-300)', fontWeight: 500 }}>Ver todas →</a></div>
            <div className="tx-list">
              <div className="tx"><span className="ic">+</span><div><div className="nm">Pix recebido · Apoiador anônimo</div><div className="dt">Hoje, 14:32 · ref. #PIX-09a4</div></div><div className="v pos">+ R$ 1.500,00</div><div className="s">Split completo</div></div>
              <div className="tx"><span className="ic out">↗</span><div><div className="nm">Repasse · João Mendes (70%)</div><div className="dt">Hoje, 14:32 · Pix instantâneo</div></div><div className="v neg">− R$ 1.050,00</div><div className="s">Confirmado</div></div>
              <div className="tx"><span className="ic out">↗</span><div><div className="nm">Repasse · Maria Lopes (20%)</div><div className="dt">Hoje, 14:32 · Pix instantâneo</div></div><div className="v neg">− R$ 300,00</div><div className="s pending">Em rota (3s)</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="hero" id="produto">
      <div className="hero-tex" aria-hidden="true">
        <div className="bg-base"></div>
        <div className="blob green"></div>
        <div className="blob cyan"></div>
        <div className="blob purple"></div>
        <div className="blob emerald-deep"></div>
        <div className="flare"></div>
        <div className="particles"></div>
        <div className="noise"></div>
        <div className="grain"></div>
        <div className="vignette"></div>
      </div>
      <div className="shell hero-inner">
        <span className="eyebrow"><span className="dot"></span>SPLIT DE PAGAMENTOS · PIX INSTANTÂNEO</span>
        <h1 className="h-display">Receba sua parte<br/><em>na hora.</em></h1>
        <p className="lede">Você cria. Seu time trabalha. A Valence divide automático — cada colaborador recebe sua porcentagem direto no Pix, em segundos.</p>
        <div className="hero-actions">
          <Link href="/register" className="btn btn-accent btn-lg">
            Começar agora <ArrowRight />
          </Link>
          <a href="#como-funciona" className="btn btn-ghost btn-lg">Ver como funciona</a>
        </div>
        <div className="hero-trust">
          <span className="item"><span className="check"><Check /></span>Sem mensalidade</span>
          <span className="item"><span className="check"><Check /></span>Pix instantâneo</span>
          <span className="item"><span className="check"><Check /></span>Cancela quando quiser</span>
        </div>
        <div className="hero-preview reveal" style={{ position: 'relative' }}>
          <div className="hero-live-badge" aria-hidden="true">
            <span className="live-dot"></span>
            <span>AO VIVO</span>
            <span className="sep">·</span>
            <span className="mono">3 splits / min</span>
          </div>
          <div className="frame">
            <HeroDashboardPreview />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28, opacity: 0.9 }}>
          <LiveTimestamp />
        </div>
      </div>
    </section>
  );
}

// ── BrandStrip ─────────────────────────────────────────────────────────────────

function BrandStrip() {
  const brands = [
    'PodcastTech', 'cast.fm', 'novelo studio', 'BRUNO+TIME',
    'cohort/04', 'Garage', 'ROTA—9', 'studio.bcd', 'REPUBLICA', 'ofício',
  ];
  return (
    <section className="brand-strip">
      <div className="shell" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: 11.5, color: 'var(--ink-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
            Já usado por times de criadores brasileiros
          </span>
        </div>
        <MarqueeScroll>
          {brands.map((name, i) => (
            <span key={i} className="brand-mark" style={{ whiteSpace: 'nowrap' }}>{name}</span>
          ))}
        </MarqueeScroll>
      </div>
    </section>
  );
}

// ── StepArt ────────────────────────────────────────────────────────────────────

function StepArt({ kind }: { kind: string }) {
  if (kind === 'create') return (
    <div className="feature-art">
      <div style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 8 }}>Novo projeto</div>
      <div style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 10px', fontSize: 13, fontWeight: 500, color: 'var(--ink-1)', fontFamily: 'var(--font-mono)' }}>
        Podcast Tech<span style={{ color: 'var(--accent)', marginLeft: 2, animation: 'blink 1s steps(2) infinite' }}>|</span>
      </div>
      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </div>
  );
  if (kind === 'collabs') return (
    <div className="feature-art" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[
        { n: 'João', r: 'Host', p: 70, c: 'var(--accent-300)', bg: 'var(--accent-soft)' },
        { n: 'Maria', r: 'Editora', p: 20, c: '#FFB287', bg: 'rgba(255,138,58,.14)' },
        { n: 'Pedro', r: 'Produtor', p: 10, c: '#BFA6FF', bg: 'rgba(139,92,246,.14)' },
      ].map((c, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="avatar avatar-sm" style={{ background: c.bg, color: c.c, borderColor: 'transparent' }}>{c.n[0]}</span>
          <div style={{ flex: 1 }}><span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink-1)' }}>{c.n}</span> <span style={{ color: 'var(--ink-3)', fontWeight: 400, fontSize: 12 }}>· {c.r}</span></div>
          <span style={{ fontSize: 12, color: 'var(--ink-1)', fontFamily: 'var(--font-mono)' }}>{c.p}%</span>
        </div>
      ))}
      <div style={{ marginTop: 6, height: 6, borderRadius: 999, background: 'var(--bg)', overflow: 'hidden', display: 'flex' }}>
        <span style={{ width: '70%', background: 'var(--accent)' }}></span>
        <span style={{ width: '20%', background: '#FF8A3A' }}></span>
        <span style={{ width: '10%', background: '#8B5CF6' }}></span>
      </div>
    </div>
  );
  if (kind === 'link') return (
    <div className="feature-art" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--bg)', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5.5 8.5l3-3M4 6L2 8a2.5 2.5 0 003.5 3.5L7.5 9.5M10 8l2-2A2.5 2.5 0 008.5 2.5L6.5 4.5" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </span>
      <span style={{ fontSize: 12, color: 'var(--ink-1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>valence.app/p/podcasttech</span>
      <span className="chip chip-accent" style={{ fontSize: 10, padding: '3px 7px' }}>Copiar</span>
    </div>
  );
  if (kind === 'split') return (
    <div className="feature-art" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '.06em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 4 }}>R$ 100 pago → split em 47s</div>
      {[{ n: 'João', v: 'R$ 70,00' }, { n: 'Maria', v: 'R$ 20,00' }, { n: 'Pedro', v: 'R$ 10,00' }].map((c, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}>
            <span style={{ width: 5, height: 5, borderRadius: 50, background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)', display: 'inline-block' }}></span>
            {c.n}
          </span>
          <span style={{ color: 'var(--accent-300)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{c.v}</span>
        </div>
      ))}
    </div>
  );
  return null;
}

// ── ComoFunciona ───────────────────────────────────────────────────────────────

function ComoFunciona() {
  const steps = [
    { n: '01', t: 'Crie seu projeto', d: 'Dê um nome ao trabalho — "Podcast Tech", "Cohort 04", "Campanha Q3". Pronto.', k: 'create', icon: 'create' },
    { n: '02', t: 'Adicione seu time', d: 'Cada colab com nome, Pix e a porcentagem. A soma fecha 100% — a Valence valida.', k: 'collabs', icon: 'team' },
    { n: '03', t: 'Compartilhe o link', d: 'Um único link de pagamento aceita Pix, cartão e boleto. Cole onde quiser.', k: 'link', icon: 'link' },
    { n: '04', t: 'Cada um recebe sua parte', d: 'Pagamento chega, Valence divide, cada Pix sai automático. Em segundos, sem você tocar em planilha.', k: 'split', icon: 'split' },
  ];
  return (
    <section className="section section-dark" id="como-funciona">
      <div className="shell">
        <header className="section-head reveal">
          <span className="eyebrow"><span className="dot"></span>Como funciona</span>
          <h2 className="h-1">Quatro passos. <em>Zero planilha.</em></h2>
          <p className="lede">Do "vamos dividir" ao "tá na conta de cada um" — sem você abrir calculadora, sem cobrar ninguém no WhatsApp.</p>
        </header>
        <div className="feature-grid reveal reveal-stagger" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {steps.map((s) => (
            <Spotlight key={s.n} className="feature">
              <div className="feature-icon"><FeatureIcon kind={s.icon} /></div>
              <div className="feature-num">{s.n}<span className="bar"></span></div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
              <StepArt kind={s.k} />
            </Spotlight>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Stats ──────────────────────────────────────────────────────────────────────

function Stats() {
  const benefits = [
    { icon: 'auto', t: 'Split automático', d: 'Defina porcentagens uma vez. Todo pagamento daquele projeto já cai dividido — Pix saindo pra cada colaborador em segundos.' },
    { icon: 'shield', t: 'Operação blindada', d: 'Operamos sobre Pagar.me e Stripe Connect (autorizados pelo BCB). O dinheiro nunca para na nossa conta. Tudo rastreável, tudo auditável.' },
    { icon: 'team', t: 'Time vê tudo', d: 'Cada colaborador acessa o próprio dashboard, vê histórico, baixa comprovante. Acaba o WhatsApp pra perguntar "saiu meu Pix?".' },
  ];
  return (
    <section className="section section-dark">
      <div className="shell">
        <header className="section-head reveal">
          <span className="eyebrow"><span className="dot"></span>Por que Valence</span>
          <h2 className="h-1">Construído pra quem trabalha em <em>time.</em></h2>
          <p className="lede">Não é mais uma planilha. É a camada de pagamento que entende que vocês são três, quatro, dez pessoas dividindo o mesmo resultado.</p>
        </header>
        <div className="feature-grid reveal reveal-stagger">
          {benefits.map((b, i) => (
            <Spotlight key={i} className="feature">
              <div className="feature-icon"><FeatureIcon kind={b.icon} /></div>
              <h3>{b.t}</h3>
              <p>{b.d}</p>
            </Spotlight>
          ))}
        </div>
        <div className="stats-band reveal">
          <div className="stat">
            <div className="v"><em>R$ <Counter to={12.4} format="brl-compact" />M</em><span className="small">repassados</span></div>
            <div className="l">Em splits automáticos via Pix e cartão</div>
          </div>
          <div className="stat">
            <div className="v"><em><Counter to={8421} format="thousands" /></em><span className="small">criadores</span></div>
            <div className="l">Podcasters, agências e produtores ativos</div>
          </div>
          <div className="stat">
            <div className="v"><em><Counter to={47} /></em><span className="small">segundos</span></div>
            <div className="l">Entre o pagamento entrar e cada um receber</div>
          </div>
        </div>
        <div className="tcards reveal">
          <div className="tcard">
            <span className="quote-mark">&ldquo;</span>
            <q>A gente perdia uma tarde por mês fazendo planilha de quem recebia o quê. Agora cai direto no Pix de cada um. Não vou mais voltar.</q>
            <div className="tcard-who">
              <span className="avatar avatar-lg" style={{ background: 'var(--accent-soft)', color: 'var(--accent-300)', borderColor: 'var(--accent-soft-2)' }}>L</span>
              <div><div className="name">Letícia Andrade</div><div className="role">Host · Podcast Cohort/04</div></div>
            </div>
          </div>
          <div className="tcard">
            <span className="quote-mark">&ldquo;</span>
            <q>Meu time confia mais no projeto porque vê a divisão antes de aceitar. É transparência por padrão — não preciso pedir confiança a ninguém.</q>
            <div className="tcard-who">
              <span className="avatar avatar-lg" style={{ background: 'rgba(139,92,246,.14)', color: '#BFA6FF', borderColor: 'rgba(139,92,246,.22)' }}>R</span>
              <div><div className="name">Rafael Tavares</div><div className="role">Diretor · Novelo Studio</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pricing ────────────────────────────────────────────────────────────────────

function Pricing() {
  return (
    <div className="light-zone" id="precos">
      <section className="shell pricing-wrap">
        <header className="section-head reveal">
          <span className="eyebrow"><span className="dot"></span>Preços honestos</span>
          <h2 className="h-1">Sem mensalidade. <em>Você paga quando recebe.</em></h2>
          <p className="lede">Uma taxa só, transparente, cobrada no valor de cada repasse. Nada de assinatura, fidelidade ou cobrança escondida.</p>
        </header>
        <div className="pricing-row">
          <div className="price-card reveal">
            <span className="label">Plano padrão</span>
            <div>
              <div className="price"><span className="pct">2,99<sup>%</sup></span><span className="plus">+ R$ 0,40 por split</span></div>
              <p className="desc" style={{ marginTop: 10 }}>Cobrado sobre cada repasse — nunca em cima de você. Sem mensalidade, sem fidelidade.</p>
            </div>
            <ul>
              <li>Splits ilimitados via Pix instantâneo</li>
              <li>Até 20 colaboradores por projeto</li>
              <li>Dashboard em tempo real pro time inteiro</li>
              <li>Sem CNPJ — pessoa física funciona</li>
              <li>Cancelamento e exportação sem perguntas</li>
            </ul>
            <Link href="/register" className="btn btn-accent btn-lg" style={{ alignSelf: 'flex-start' }}>Começar grátis <ArrowRight /></Link>
          </div>
          <div className="price-card featured reveal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="label">Plano time</span>
              <span className="chip chip-accent" style={{ background: 'rgba(255,74,42,.15)', borderColor: 'rgba(255,74,42,.3)' }}>Fatura &gt; R$ 50k/mês</span>
            </div>
            <div>
              <div className="price"><span className="pct">1,99<sup>%</sup></span><span className="plus">+ R$ 0,30 por split</span></div>
              <p className="desc" style={{ marginTop: 10 }}>Condição negociada pra criadores e agências em volume. Suporte humano e API liberados.</p>
            </div>
            <ul>
              <li>Tudo do plano padrão</li>
              <li>Colaboradores ilimitados</li>
              <li>API + webhooks pra integrar no seu fluxo</li>
              <li>Suporte humano em até 1 dia útil</li>
              <li>Relatórios contábeis (.csv, .xlsx, .ofx)</li>
            </ul>
            <a href="mailto:contato@valence.app" className="btn btn-light btn-lg" style={{ alignSelf: 'flex-start' }}>Falar com a gente <ArrowRight /></a>
          </div>
        </div>
        <div className="highlight-card reveal">
          <span className="eyebrow"><span className="dot"></span>Primeiros R$ 1.000 sem taxa</span>
          <h3 className="h-1" style={{ fontSize: 'clamp(28px, 3.4vw, 44px)' }}>Teste com seu time. <em>Sem cartão, sem compromisso.</em></h3>
          <p className="lede">Faz o cadastro, cria um projeto, divide o primeiro pagamento de até R$ 1.000 sem pagar nada pra gente.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
            <Link href="/register" className="btn btn-accent btn-lg">Começar agora <ArrowRight /></Link>
          </div>
        </div>
        <div className="cta-card reveal">
          <h2>O seu time já sabe<br/><em>quem recebe o quê.</em></h2>
          <p>Configura em três minutos. Divide pra sempre. Sem planilha, sem cobrar no WhatsApp, sem desconforto.</p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/register" className="btn btn-accent btn-lg">Começar agora <ArrowRight /></Link>
            <Link href="/login" className="btn btn-ghost btn-lg">Entrar na conta</Link>
          </div>
          <div style={{ marginTop: 28, display: 'flex', gap: 22, fontSize: 13, color: 'rgba(255,255,255,.55)', flexWrap: 'wrap' }}>
            <span>· Sem cartão de crédito</span>
            <span>· Primeiros R$ 1.000 sem taxa</span>
            <span>· Cancela quando quiser</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── FAQ ────────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
  { q: 'É seguro? Quem segura o dinheiro?', a: ['O dinheiro nunca para com a gente. A Valence opera em cima de provedores autorizados pelo Banco Central (Pagar.me e Stripe Connect) — o split acontece dentro deles, não na nossa conta.', 'Quando o pagamento entra, a infra já distribui pra cada Pix de colaborador automaticamente. Você vê tudo em tempo real no dashboard.'] },
  { q: 'Preciso de CNPJ pra usar?', a: ['Não. Pessoa física funciona, tanto pra você quanto pros seus colaboradores. Cada um precisa só de uma chave Pix válida.', 'Se você tem CNPJ, melhor — a gente emite notas e relatórios prontos pra contabilidade.'] },
  { q: 'Quanto tempo demora pra cada um receber via Pix?', a: ['Média atual: 47 segundos do pagamento entrar até cada colaborador receber. Pico no horário comercial: até 2 minutos.', 'Pix instantâneo de verdade — não tem D+1, D+30, nada disso.'] },
  { q: 'Posso mudar as porcentagens depois?', a: ['Pode, a qualquer momento. A mudança vale pra pagamentos futuros — pagamentos antigos ficam registrados com a divisão que estava ativa na hora.', 'Histórico completo, auditável, sem rasura.'] },
  { q: 'Funciona com cartão de crédito também?', a: ['Funciona — Pix, cartão (parcelado ou à vista) e boleto. O split sai automático em todos.', 'Cartão tem o prazo do adquirente (D+15 padrão); o split em cima já fica programado.'] },
  { q: 'E se eu quiser cancelar ou exportar tudo?', a: ['Cancela em um clique, sem ligação, sem retenção. Exporta histórico completo em .csv ou .xlsx — seus dados são seus.', 'Não cobramos taxa de saída. Nada.'] },
];

function FAQSection() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq-zone" id="faq">
      <div className="shell">
        <div className="faq-row">
          <div className="reveal">
            <span className="eyebrow"><span className="dot"></span>Perguntas frequentes</span>
            <h2 className="h-1" style={{ marginTop: 18 }}>Tire suas <em>dúvidas</em> antes de começar.</h2>
            <p className="lede" style={{ marginTop: 20 }}>Reunimos o que mais perguntam pra quem está pensando em parar de dividir pagamento na mão.</p>
            <div style={{ marginTop: 32, padding: 20, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent-300)', border: '1px solid var(--accent-soft-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 36px' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10v7H9l-3 3v-3H3V4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
              </span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink-1)' }}>Não achou sua dúvida aqui?</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>Chama no <a href="mailto:contato@valence.app" style={{ color: 'var(--accent-300)', fontWeight: 500 }}>contato@valence.app</a> — a gente responde de gente.</div>
              </div>
            </div>
          </div>
          <div className="faq-list reveal">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className={'faq-item' + (open === i ? ' open' : '')}>
                <button className="faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
                  <span>{item.q}</span>
                  <span className="faq-icon"></span>
                </button>
                <div className="faq-a">
                  <div className="faq-a-inner">
                    {item.a.map((p, j) => <p key={j}>{p}</p>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>Split de pagamentos automático para criadores, podcasters, consultores e agências brasileiras.</p>
            <div className="social">
              <a href="#" aria-label="X"><svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M12.6 1.5h2.4l-5.2 5.9 6.1 8.1h-4.8l-3.7-4.9-4.3 4.9H.7l5.5-6.3L0 1.5h4.9l3.4 4.5 4.3-4.5zm-.8 12.6h1.3L4.3 2.9H2.9l8.9 11.2z"/></svg></a>
              <a href="#" aria-label="GitHub"><svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .2a8 8 0 00-2.5 15.6c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-1-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 2 .9 2.5.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-3.9 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3-1.8 3.7-3.6 3.9.3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4A8 8 0 008 .2z"/></svg></a>
              <a href="#" aria-label="Instagram"><svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="3"/><circle cx="8" cy="8" r="2.5"/><circle cx="11.5" cy="4.5" r=".7" fill="currentColor"/></svg></a>
            </div>
          </div>
          <div>
            <h4>Produto</h4>
            <ul>
              <li><a href="#produto">Dashboard</a></li>
              <li><a href="#como-funciona">Como funciona</a></li>
              <li><a href="#precos">Preços</a></li>
              <li><a href="#">API + Webhooks</a></li>
            </ul>
          </div>
          <div>
            <h4>Empresa</h4>
            <ul>
              <li><a href="#">Sobre</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Casos de uso</a></li>
              <li><a href="#">Carreiras</a></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Termos de uso</a></li>
              <li><a href="#">Privacidade</a></li>
              <li><a href="#">Compliance BCB</a></li>
              <li><a href="#">Segurança</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Valence Pagamentos. Operado em parceria com Pagar.me e Stripe Connect.</span>
          <span>Feito no Brasil — pra criadores brasileiros.</span>
        </div>
      </div>
    </footer>
  );
}

// ── Root Page ──────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const router = useRouter();
  useReveal();

  useEffect(() => {
    const user = localStorage.getItem('valence_user');
    if (user) router.replace('/dashboard');
  }, [router]);

  return (
    <div className="page">
      <ScrollProgress />
      <Nav />
      <Hero />
      <BrandStrip />
      <ComoFunciona />
      <Stats />
      <Pricing />
      <FAQSection />
      <Footer />
    </div>
  );
}
