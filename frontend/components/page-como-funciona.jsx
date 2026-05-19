// Como Funciona — dedicated page sections (built from user copy)

function CFNav() {
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
        <a className="logo" href="index.html">
          <span className="logo-mark"></span>
          <span>Valence</span>
        </a>
        <nav className="nav-links">
          <a href="index.html#produto">Produto</a>
          <a href="como-funciona.html" style={{ color: "var(--ink)" }}>Como funciona</a>
          <a href="index.html#demo">Demo</a>
          <a href="index.html#precos">Preços</a>
          <a href="index.html#faq">FAQ</a>
        </nav>
        <div className="nav-cta">
          <a href="#login" style={{ color: "var(--ink-2)", fontSize: 13.5, fontWeight: 500, padding: "8px 12px" }}>Entrar</a>
          <a href="#signup" className="btn btn-accent btn-sm">
            Começar agora
            <ArrowRight />
          </a>
        </div>
      </div>
    </header>
  );
}

function CFHero() {
  return (
    <section className="hero cf-hero" data-screen-label="01 Hero">
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
        <span className="eyebrow"><span className="dot"></span>PAGAMENTO PROTEGIDO · SPLIT AUTOMÁTICO</span>
        <h1 className="cf-massive">Pare de depender da <em>palavra da pessoa</em> para receber.</h1>
        <p className="lede">O dinheiro fica travado antes do trabalho começar. Você entrega, o Pix sai automático.</p>
        <div className="hero-actions">
          <a href="#signup" className="btn btn-accent btn-lg">
            Começar agora <ArrowRight />
          </a>
          <a href="#fluxo" className="btn btn-ghost btn-lg">Ver o fluxo</a>
        </div>
      </div>
    </section>
  );
}

function CFProblem() {
  return (
    <section className="cf-problem" data-screen-label="02 Problema">
      <div className="shell">
        <div className="cf-problem-inner">
          <div className="cf-stack reveal">
            <span className="beat">Você faz.</span>
            <span className="beat">Entrega.</span>
            <span className="beat">Se dedica.</span>
            <span className="beat dim">E no final fica a dúvida silenciosa:</span>
          </div>

          <div className="cf-problem-quote reveal">
            <p className="cf-quote">"Será que ele <span className="accent">vai fazer o Pix?</span>"</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CFPivot() {
  return (
    <section className="cf-pivot" data-screen-label="03 Pivot">
      <div className="shell">
        <h2 className="cf-massive reveal">O problema nunca foi o dinheiro. <em>É trabalhar sem garantia.</em></h2>
      </div>
    </section>
  );
}

function CFSolution() {
  return (
    <section className="cf-solution" id="fluxo" data-screen-label="04 Solução">
      <div className="shell">
        <span className="eyebrow reveal"><span className="dot"></span>A solução</span>
        <h2 className="cf-massive reveal" style={{ marginTop: 20, maxWidth: "18ch", marginLeft: "auto", marginRight: "auto" }}>
          O pagamento fica <em>protegido</em> antes do trabalho começar.
        </h2>
      </div>
    </section>
  );
}

// ─── 5 STEPS ──────────────────────────────────────────────────────

function StepVisPixIn() {
  return (
    <div className="cf-visual">
      <div className="cf-vis-pixin">
        <span className="lbl"><span className="live-dot"></span>Cliente · Pagamento iniciado</span>
        <div className="amt"><span className="cur">R$</span>2.800,00</div>
        <div className="meta">
          <span className="avatar avatar-sm" style={{ background: "rgba(255,255,255,.15)", borderColor: "rgba(255,255,255,.18)", color: "#fff" }}>JD</span>
          <span>John Doe · Cliente</span>
          <span className="from">ref. #VAL-2K8</span>
        </div>
      </div>
    </div>
  );
}

function StepVisVault() {
  return (
    <div className="cf-visual">
      <div className="cf-vis-vault">
        <div className="cf-vault-box">
          <div className="cf-vault-head">
            <span className="cf-vault-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                <circle cx="12" cy="15" r="1.2" fill="currentColor"/>
                <path d="M12 16v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>Em custódia</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink-1)", marginTop: 2 }}>Conta segregada · Pagar.me</div>
            </div>
            <span className="cf-vault-status"><span className="live-dot" style={{ width: 6, height: 6 }}></span>Travado</span>
          </div>
          <div className="cf-vault-amount"><span className="cur">R$</span>2.800,00</div>
          <div className="cf-vault-meta">
            <div className="item"><div className="l">Travado em</div><div className="v">14:32 BRT · hoje</div></div>
            <div className="item"><div className="l">Liberação</div><div className="v">Após confirmação</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepVisWork() {
  return (
    <div className="cf-visual">
      <div className="cf-vis-work">
        <div className="cf-work-head">
          <div className="ttl">Projeto · Landing institucional</div>
          <span className="timer">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M6 4v2l1.5 1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            Em andamento · 3 de 5
          </span>
        </div>
        <div className="cf-work-progress"><div className="fill"></div></div>
        <div className="cf-work-tasks">
          <div className="cf-work-task done">
            <span className="checkbox">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4.5L3 6l3.5-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            Briefing alinhado
          </div>
          <div className="cf-work-task done">
            <span className="checkbox">
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4.5L3 6l3.5-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            Wireframes aprovados
          </div>
          <div className="cf-work-task active">
            <span className="checkbox"></span>
            UI em alta fidelidade
          </div>
          <div className="cf-work-task">
            <span className="checkbox"></span>
            Implementação
          </div>
          <div className="cf-work-task">
            <span className="checkbox"></span>
            Entrega final + handoff
          </div>
        </div>
      </div>
    </div>
  );
}

function StepVisRelease() {
  return (
    <div className="cf-visual">
      <div className="cf-vis-release">
        <div className="cf-confirm-card">
          <span className="ico">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
            <div className="ttl">Cliente confirmou a entrega</div>
            <div className="sub">John Doe · há 4 segundos · 14:36 BRT</div>
          </div>
        </div>
        <div className="cf-release-arrow">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 3v12M5 11l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="cf-pix-out">
          <span className="ico">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l6 6-6 6m6-6l6 6-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <div className="row">
            <div className="ttl">Pix enviado · Conta vinculada</div>
            <div className="sub">Liberação automática · 1.2s atrás</div>
          </div>
          <div className="amt">+R$ 2.800</div>
        </div>
      </div>
    </div>
  );
}

function StepVisSplit() {
  return (
    <div className="cf-visual">
      <div className="cf-vis-split">
        <div className="cf-split-input">
          <span className="ico">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l6 6-6 6m6-6l6 6-6-6 6-6" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <div>
            <div className="ttl" style={{ fontSize: 11.5, color: "var(--ink-4)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>Liberação</div>
            <div style={{ fontSize: 13, color: "var(--ink-1)" }}>Projeto · Landing institucional</div>
          </div>
          <span className="amt">R$ 2.800</span>
        </div>
        <div className="cf-split-arrows">
          <svg width="22" height="14" viewBox="0 0 22 14" fill="none"><path d="M11 0v3M11 3L2 10v3M11 3l9 7v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <div className="cf-split-out">
          <span className="avatar avatar-sm" style={{ background: "var(--accent-soft)", color: "var(--accent-300)", borderColor: "var(--accent-soft-2)" }}>V</span>
          <div>
            <div className="nm">Você</div>
            <div className="role">Designer · líder</div>
          </div>
          <span className="pct">60%</span>
          <span className="val">R$ 1.680</span>
        </div>
        <div className="cf-split-out">
          <span className="avatar avatar-sm" style={{ background: "rgba(255,138,58,.14)", color: "#FFB287", borderColor: "rgba(255,138,58,.22)" }}>M</span>
          <div>
            <div className="nm">Marina</div>
            <div className="role">Dev · parceira</div>
          </div>
          <span className="pct">30%</span>
          <span className="val">R$ 840</span>
        </div>
        <div className="cf-split-out">
          <span className="avatar avatar-sm" style={{ background: "rgba(139,92,246,.14)", color: "#BFA6FF", borderColor: "rgba(139,92,246,.22)" }}>R</span>
          <div>
            <div className="nm">Rafa</div>
            <div className="role">Indicação · 10%</div>
          </div>
          <span className="pct">10%</span>
          <span className="val">R$ 280</span>
        </div>
      </div>
    </div>
  );
}

function CFSteps() {
  const steps = [
    {
      n: "01",
      t: "Cliente envia o valor.",
      d: "Você compartilha o link, ele paga via Pix, cartão ou boleto.",
      vis: <StepVisPixIn />,
    },
    {
      n: "02",
      t: <React.Fragment>Dinheiro fica <em>travado.</em></React.Fragment>,
      d: "Conta segregada Pagar.me + Stripe — autorizada pelo BCB.",
      vis: <StepVisVault />,
    },
    {
      n: "03",
      t: "Você trabalha.",
      d: "Sem cobrar, sem se preocupar. O pagamento já chegou.",
      vis: <StepVisWork />,
    },
    {
      n: "04",
      t: <React.Fragment>Cliente confirma. Pix sai <em>automático.</em></React.Fragment>,
      d: "Sem botão de \"liberar\", sem nova etapa de cobrança.",
      vis: <StepVisRelease />,
    },
    {
      n: "05",
      t: <React.Fragment>Split <em>automático</em> com seu time.</React.Fragment>,
      d: "Define a porcentagem uma vez. Cada Pix sai sozinho.",
      vis: <StepVisSplit />,
    },
  ];
  return (
    <section className="shell cf-steps">
      {steps.map((s) => (
        <article className="cf-step" key={s.n}>
          <div className="cf-step-text reveal">
            <span className="cf-step-num">{s.n}<span className="bar"></span>PASSO</span>
            <h2>{s.t}</h2>
            <p>{s.d}</p>
          </div>
          <div className="cf-step-visual reveal">{s.vis}</div>
        </article>
      ))}
    </section>
  );
}

function CFCallout() {
  return (
    <section className="cf-callout">
      <div className="shell">
        <div className="cf-callout-stack">
          <div className="line reveal">Sem cobrança.</div>
          <div className="line reveal">Sem desculpa.</div>
          <div className="line reveal">Sem <em>"depois eu te mando."</em></div>
        </div>
      </div>
    </section>
  );
}

function CFTwoSided() {
  return (
    <section className="cf-twosided" data-screen-label="06 Dois lados">
      <div className="shell">
        <header className="section-head reveal" style={{ marginBottom: 0 }}>
          <span className="eyebrow"><span className="dot"></span>Pros dois lados</span>
          <h2 className="h-1">O pagamento <em>protege</em> quem paga e quem recebe.</h2>
        </header>

        <div className="cf-twosided-grid">
          <div className="cf-side reveal">
            <span className="who">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M2 13c.5-2.5 2.5-4 5-4s4.5 1.5 5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Para o cliente
            </span>
            <h3>Só libera <em>quando entregar.</em></h3>
            <div className="cf-excuses">
              <div className="cf-excuse">Pago, mas só com proteção</div>
              <div className="cf-excuse">Quero ver entregue antes</div>
            </div>
          </div>

          <div className="cf-side reveal">
            <span className="who">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="2" y="3" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/><path d="M4.5 6h5M4.5 8h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              Para você
            </span>
            <h3>Não trabalha <em>de graça.</em></h3>
            <div className="cf-excuses">
              <div className="cf-excuse">mano, tô sem limite hoje</div>
              <div className="cf-excuse">me chama amanhã</div>
              <div className="cf-excuse">o Pix não caiu, deve ser o banco</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CFForWhom() {
  const ProIcon = ({ kind }) => {
    const s = "currentColor";
    if (kind === "design") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 19l4-1 9-9-3-3-9 9-1 4z" stroke={s} strokeWidth="1.6" strokeLinejoin="round"/><path d="M14 6l3 3" stroke={s} strokeWidth="1.6" strokeLinecap="round"/></svg>;
    if (kind === "video") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="13" height="12" rx="2" stroke={s} strokeWidth="1.6"/><path d="M16 10l5-3v10l-5-3" stroke={s} strokeWidth="1.6" strokeLinejoin="round"/></svg>;
    if (kind === "dev") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5M13 5l-2 14" stroke={s} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    if (kind === "social") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="2.5" stroke={s} strokeWidth="1.6"/><circle cx="18" cy="6" r="2.5" stroke={s} strokeWidth="1.6"/><circle cx="18" cy="18" r="2.5" stroke={s} strokeWidth="1.6"/><path d="M8 11l8-4M8 13l8 4" stroke={s} strokeWidth="1.6"/></svg>;
    if (kind === "ads") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 16V8l11-5v18l-11-5z" stroke={s} strokeWidth="1.6" strokeLinejoin="round"/><path d="M14 9l5 3-5 3" stroke={s} strokeWidth="1.6" strokeLinejoin="round"/></svg>;
    if (kind === "trades") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 4l6 6-2 2-3-3-6 6 2 2-6 4-3-3 4-6 2 2 6-6-3-3 2-2z" stroke={s} strokeWidth="1.6" strokeLinejoin="round"/></svg>;
    if (kind === "tech") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={s} strokeWidth="1.6"/><path d="M12 3v3M12 18v3M21 12h-3M6 12H3M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1M18.4 18.4l-2.1-2.1M7.7 7.7L5.6 5.6" stroke={s} strokeWidth="1.6" strokeLinecap="round"/></svg>;
    if (kind === "manual") return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 21V11l7-7 7 7v10M9 21v-6h6v6" stroke={s} strokeWidth="1.6" strokeLinejoin="round"/></svg>;
    return null;
  };

  const pros = [
    { ico: "design", n: "Designers" },
    { ico: "video", n: "Editores de vídeo" },
    { ico: "dev", n: "Desenvolvedores" },
    { ico: "social", n: "Social media" },
    { ico: "ads", n: "Gestores de tráfego" },
    { ico: "trades", n: "Prestadores avulsos" },
    { ico: "tech", n: "Técnicos" },
    { ico: "manual", n: "Serviços manuais" },
  ];

  return (
    <section className="cf-forwhom" data-screen-label="07 Para quem">
      <div className="shell">
        <header className="section-head reveal">
          <span className="eyebrow"><span className="dot"></span>Quem usa</span>
          <h2 className="h-1">Pra quem trabalha <em>por conta.</em></h2>
        </header>

        <div className="cf-pros reveal reveal-stagger">
          {pros.map((p, i) => (
            <div className="cf-pro" key={i}>
              <span className="ico"><ProIcon kind={p.ico} /></span>
              <span className="n">{p.n}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CFTrust() {
  return (
    <section className="shell cf-trust" data-screen-label="08 Profissionalismo">
      <div className="col-1 reveal">
        <span className="eyebrow"><span className="dot"></span>Profissionalismo</span>
        <h2 className="h-1">O profissional <em>sério</em> transmite confiança.</h2>
        <p className="lede">Você deixa de parecer alguém tentando vender — passa a parecer alguém que trabalha de forma organizada e segura.</p>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <a href="#signup" className="btn btn-accent btn-lg">Começar agora <ArrowRight /></a>
          <a href="index.html#precos" className="btn btn-ghost btn-lg">Ver preços</a>
        </div>
      </div>

      <div className="col-2 reveal">
        <div className="cf-trust-stat">
          <span className="v">0</span>
          <span className="l">Calotes desde 2024 — o dinheiro nunca depende de boa vontade</span>
        </div>
        <div className="cf-trust-stat">
          <span className="v">47s</span>
          <span className="l">Da confirmação ao Pix cair na conta</span>
        </div>
        <div className="cf-trust-stat">
          <span className="v">3,2×</span>
          <span className="l">Ticket médio relatado por freelancers que migraram</span>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, {
  CFNav, CFHero, CFProblem, CFPivot, CFSolution, CFSteps,
  CFCallout, CFTwoSided, CFForWhom, CFTrust,
});
