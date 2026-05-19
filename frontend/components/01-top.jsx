// Valence — top components: Nav, Hero (centered), BrandStrip

const Logo = () => (
  <a className="logo" href="#">
    <span className="logo-mark"></span>
    <span>Valence</span>
  </a>
);

const ArrowRight = ({ size = 14 }) => (
  <svg className="arr" width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M3 7H11M11 7L7 3M11 7L7 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Check = ({ size = 10 }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
    <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Nav({ ctaText = "Começar agora" }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const on = () => setScrolled(window.scrollY > 32);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={"nav" + (scrolled ? " scrolled" : "")}>
      <div className="nav-inner">
        <Logo />
        <nav className="nav-links">
          <a href="#produto">Produto</a>
          <a href="como-funciona.html">Como funciona</a>
          <a href="#demo">Demo</a>
          <a href="#precos">Preços</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="nav-cta">
          <a href="#login" style={{ color: "var(--ink-2)", fontSize: 13.5, fontWeight: 500, padding: "8px 12px" }}>Entrar</a>
          <a href="#signup" className="btn btn-accent btn-sm">
            {ctaText}
            <ArrowRight />
          </a>
        </div>
      </div>
    </header>
  );
}

// — Hero copy variants (PT-BR)
const HERO_COPY = {
  A: {
    eyebrow: "SPLIT DE PAGAMENTOS · PIX INSTANTÂNEO",
    headline: <React.Fragment>Receba sua parte<br/><em>na hora.</em></React.Fragment>,
    sub: "Você cria. Seu time trabalha. A Valence divide automático — cada colaborador recebe sua porcentagem direto no Pix, em segundos.",
  },
  B: {
    eyebrow: "SEM PLANILHA. SEM ESPERA. SEM CONFUSÃO.",
    headline: <React.Fragment>Cansado de dividir<br/><em>manualmente?</em></React.Fragment>,
    sub: "A gente faz automático. Defina as porcentagens uma vez, compartilhe o link e cada pessoa do seu time recebe direto.",
  },
  C: {
    eyebrow: "PARA CRIADORES, PODCASTERS E CONSULTORES",
    headline: <React.Fragment>Trabalhe em time.<br/><em>Receba separado.</em></React.Fragment>,
    sub: "Um link de pagamento, divisão automática por porcentagem, Pix para cada colaborador. Simples assim — sem você tocar em planilha.",
  },
};

function HeroDashboardPreview() {
  return (
    <div className="dashboard">
      {/* Sidebar */}
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
          <div className="dash-nav-item">
            <svg className="ic" viewBox="0 0 14 14" fill="none"><path d="M3 11l3-6 2 4 3-2 2 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Relatórios
          </div>
        </div>
        <div className="dash-nav-section">
          <div className="ttl">Projetos ativos</div>
          <div className="dash-nav-item active" style={{ paddingLeft: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 50, background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }}></span>
            Podcast Tech
            <span className="count">12</span>
          </div>
          <div className="dash-nav-item" style={{ paddingLeft: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 50, background: "#E58A52" }}></span>
            Cohort 04
            <span className="count">4</span>
          </div>
          <div className="dash-nav-item" style={{ paddingLeft: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: 50, background: "#8B5CF6" }}></span>
            Campanha Garage
            <span className="count">2</span>
          </div>
        </div>
        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10, fontSize: 12.5 }}>
          <span className="avatar avatar-sm" style={{ background: "var(--accent)", color: "#fff", borderColor: "transparent" }}>JS</span>
          <div style={{ lineHeight: 1.2, minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 500, color: "var(--ink-1)" }}>João Silva</div>
            <div style={{ color: "var(--ink-3)", fontSize: 11 }}>Plano Pro</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="dash-main">
        <div className="dash-topbar">
          <div className="dash-search">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.4"/><path d="M11 11L8.5 8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            Buscar projeto, colaborador, transação...
            <kbd>⌘K</kbd>
          </div>
          <div className="dash-account">
            <button className="btn btn-sm btn-ghost" style={{ padding: "0 10px" }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/><path d="M6.5 4v3l2 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Últimos 30 dias
            </button>
            <button className="btn btn-sm btn-accent">+ Novo split</button>
          </div>
        </div>

        <div className="dash-content">
          <div className="dash-header">
            <div>
              <div className="crumb">Projetos<span style={{color:"var(--ink-4)"}}>/</span><span className="now">Podcast Tech</span></div>
              <h2>Podcast Tech <span className="chip chip-accent">● Ativo</span></h2>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
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
            <div className="kpi">
              <div className="l">Splits feitos</div>
              <div className="v">142</div>
              <div className="d">+18 esta semana</div>
            </div>
            <div className="kpi">
              <div className="l">Tempo médio</div>
              <div className="v">47<span className="small">s</span></div>
              <div className="d">−3s mais rápido</div>
            </div>
            <div className="kpi">
              <div className="l">Colaboradores</div>
              <div className="v">3 <span className="small">/ 100%</span></div>
              <div className="d neutral">Soma fecha 100% ✓</div>
            </div>
          </div>

          <div className="dash-main-row">
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>Entradas — últimas 12 semanas</h3>
                <span className="meta">R$ 15.340,00</span>
              </div>
              <MiniChart />
            </div>

            <div className="dash-card">
              <div className="dash-card-head">
                <h3>Divisão do projeto</h3>
                <button className="btn btn-sm btn-ghost" style={{ height: 26, padding: "0 10px", fontSize: 11.5 }}>Editar</button>
              </div>
              <div className="collab-list">
                <div className="collab">
                  <span className="avatar" style={{ background: "var(--accent-soft)", color: "var(--accent-300)", borderColor: "var(--accent-soft-2)" }}>J</span>
                  <div>
                    <div className="nm">João Mendes</div>
                    <div className="em">john@example.com</div>
                  </div>
                  <div className="pct">70%</div>
                  <div className="val">R$ 10.738</div>
                </div>
                <div className="collab">
                  <span className="avatar" style={{ background: "rgba(255,138,58,.14)", color: "#FFB287", borderColor: "rgba(255,138,58,.22)" }}>M</span>
                  <div>
                    <div className="nm">Maria Lopes</div>
                    <div className="em">jane@example.com</div>
                  </div>
                  <div className="pct">20%</div>
                  <div className="val">R$ 3.068</div>
                </div>
                <div className="collab">
                  <span className="avatar" style={{ background: "rgba(139,92,246,.14)", color: "#BFA6FF", borderColor: "rgba(139,92,246,.22)" }}>P</span>
                  <div>
                    <div className="nm">Pedro Castro</div>
                    <div className="em">pedro@example.com</div>
                  </div>
                  <div className="pct">10%</div>
                  <div className="val">R$ 1.534</div>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-head">
              <h3>Transações recentes</h3>
              <a href="#" style={{ fontSize: 12.5, color: "var(--accent-300)", fontWeight: 500 }}>Ver todas →</a>
            </div>
            <div className="tx-list">
              <div className="tx">
                <span className="ic">+</span>
                <div>
                  <div className="nm">Pix recebido · Apoiador anônimo</div>
                  <div className="dt">Hoje, 14:32 · ref. #PIX-09a4</div>
                </div>
                <div className="v pos">+ R$ 1.500,00</div>
                <div className="s">Split completo</div>
              </div>
              <div className="tx">
                <span className="ic out">↗</span>
                <div>
                  <div className="nm">Repasse · João Mendes (70%)</div>
                  <div className="dt">Hoje, 14:32 · Pix instantâneo</div>
                </div>
                <div className="v neg">− R$ 1.050,00</div>
                <div className="s">Confirmado</div>
              </div>
              <div className="tx">
                <span className="ic out">↗</span>
                <div>
                  <div className="nm">Repasse · Maria Lopes (20%)</div>
                  <div className="dt">Hoje, 14:32 · Pix instantâneo</div>
                </div>
                <div className="v neg">− R$ 300,00</div>
                <div className="s pending">Em rota (3s)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// — Mini chart, shared with hero preview
function MiniChart() {
  const data = [12, 18, 14, 22, 19, 28, 24, 32, 30, 38, 34, 47];
  const max = Math.max(...data), min = 0;
  const w = 480, h = 140, pad = 22;
  const stepX = (w - pad * 2) / (data.length - 1);
  const toY = (v) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const points = data.map((v, i) => [pad + i * stepX, toY(v)]);
  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
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
      <path d={linePath} className="chart-line" style={{ strokeDasharray: 2000, strokeDashoffset: 2000, animation: "draw 1.8s ease forwards .3s" }} />
      <style>{`@keyframes draw { to { stroke-dashoffset: 0; } }`}</style>
      {points.map(([x, y], i) => i === points.length - 1 ? (
        <circle key={i} cx={x} cy={y} r="4" className="chart-dot" />
      ) : null)}
      <g className="chart-axis">
        {["sem 1", "sem 4", "sem 8", "sem 12"].map((lbl, i) => (
          <text key={i} x={pad + (i * (w - pad * 2)) / 3} y={h - 4} textAnchor={i === 0 ? "start" : i === 3 ? "end" : "middle"}>{lbl}</text>
        ))}
      </g>
    </svg>
  );
}

function Hero({ variant = "A", ctaText = "Começar agora" }) {
  const copy = HERO_COPY[variant] || HERO_COPY.A;
  return (
    <section className="hero" id="produto" data-screen-label="01 Hero">
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
        <span className="eyebrow"><span className="dot"></span>{copy.eyebrow}</span>
        <h1 className="h-display">{copy.headline}</h1>
        <p className="lede">{copy.sub}</p>
        <div className="hero-actions">
          <a href="#signup" className="btn btn-accent btn-lg">
            {ctaText} <ArrowRight />
          </a>
          <a href="#como-funciona" className="btn btn-ghost btn-lg">
            Ver como funciona
          </a>
        </div>
        <div className="hero-trust">
          <span className="item"><span className="check"><Check /></span>Sem mensalidade</span>
          <span className="item"><span className="check"><Check /></span>Pix instantâneo</span>
          <span className="item"><span className="check"><Check /></span>Cancela quando quiser</span>
        </div>

        <div className="hero-preview reveal" style={{ position: "relative" }}>
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

        <div style={{ display: "flex", justifyContent: "center", marginTop: 28, opacity: .9 }}>
          <LiveTimestamp />
        </div>
      </div>
    </section>
  );
}

function BrandStrip() {
  const brands = [
    { name: "PodcastTech" },
    { name: "cast.fm", font: "var(--font-mono)" },
    { name: ["novelo", " studio"], italic: 0 },
    { name: "BRUNO+TIME", spacing: "0.18em", weight: 500 },
    { name: "cohort/04" },
    { name: "Garage", italic: true },
    { name: "ROTA—9", font: "var(--font-mono)" },
    { name: "studio.bcd" },
    { name: "REPUBLICA", spacing: "0.2em" },
    { name: "ofício", italic: true },
  ];
  return (
    <section className="brand-strip">
      <div className="shell" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <span style={{ fontSize: 11.5, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>
            Já usado por times de criadores brasileiros
          </span>
        </div>
        <Marquee>
          {brands.map((b, i) => (
            <span key={i} className="brand-mark" style={{
              fontFamily: b.font,
              fontStyle: b.italic === true ? "italic" : undefined,
              letterSpacing: b.spacing,
              fontWeight: b.weight,
              whiteSpace: "nowrap",
            }}>
              {Array.isArray(b.name) ? b.name.map((p, j) => (
                <span key={j} style={{ fontStyle: b.italic === j ? "italic" : undefined }}>{p}</span>
              )) : b.name}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, Hero, BrandStrip, Logo, ArrowRight, Check, MiniChart });
