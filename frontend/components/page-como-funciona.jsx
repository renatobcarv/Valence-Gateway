// Como Funciona — dedicated page (dense, professional)

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

// — Tiny vault icon shared in mini flow
const IconVault = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="12" cy="15" r="1.2" fill="currentColor"/>
  </svg>
);
const IconPix = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M6 6l6 6-6 6m6-6l6 6-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconHands = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M3 13l3-1 4 4 7-7-3-3-4 4-3-3-4 6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  </svg>
);
const IconSplit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 4v4M12 8L6 14v6M12 8l6 6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// — Mini flow diagram (used in hero + main flow section)
function FlowMini({ currentStep = 2 }) {
  const nodes = [
    { ico: <IconPix />, lbl: "Cliente paga", sub: "Pix · cartão · boleto", stat: "R$ 2.800" },
    { ico: <IconVault />, lbl: "Travado em custódia", sub: "Pagar.me · BCB", stat: "00:14:32" },
    { ico: <IconHands />, lbl: "Trabalho em andamento", sub: "3 de 5 entregas", stat: "68%" },
    { ico: <IconCheck />, lbl: "Cliente confirma", sub: "Liberação automática", stat: "47s" },
    { ico: <IconSplit />, lbl: "Split entre o time", sub: "Você 60% · Marina 30%", stat: "Pix ✓" },
  ];
  return (
    <div className="cf-flow-mini">
      <div className="cf-flow-mini-head">
        <span className="ttl">Fluxo do pagamento</span>
        <span className="live"><span className="live-dot"></span>AO VIVO</span>
      </div>
      <div className="cf-flow-chain">
        {nodes.map((n, i) => (
          <React.Fragment key={i}>
            <div className={"cf-flow-node" + (i === currentStep ? " current" : "")}>
              <span className="ico">{n.ico}</span>
              <div className="body">
                <div className="lbl">{n.lbl}</div>
                <div className="sub">{n.sub}</div>
              </div>
              <span className="stat">{n.stat}</span>
            </div>
            {i < nodes.length - 1 && <div className={`cf-flow-connector c${i+1}`}></div>}
          </React.Fragment>
        ))}
      </div>
    </div>
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

      <div className="shell cf-hero-grid">
        <div className="cf-hero-copy reveal">
          <span className="eyebrow"><span className="dot"></span>Pagamento protegido · Split automático</span>
          <h1 className="h-display">Pare de depender da <em>palavra</em> da pessoa pra receber.</h1>
          <p className="lede">O valor fica travado em custódia antes do trabalho começar. Você entrega, o cliente confirma, o Pix sai automático.</p>
          <div className="hero-actions">
            <a href="#signup" className="btn btn-accent btn-lg">Começar agora <ArrowRight /></a>
            <a href="#fluxo" className="btn btn-ghost btn-lg">Ver o fluxo</a>
          </div>
          <div className="cf-hero-meta">
            <span className="item"><span className="live-dot"></span>2.4k freelas ativos</span>
            <span className="item">·</span>
            <span className="item">0 calotes desde 2024</span>
            <span className="item">·</span>
            <span className="item">Pix em 47s</span>
          </div>
        </div>
        <div className="reveal">
          <FlowMini currentStep={2} />
        </div>
      </div>
    </section>
  );
}

// — Problem section: stacked beats + quote card side-by-side
function CFProblem() {
  return (
    <section className="cf-problem" data-screen-label="02 Problema">
      <div className="shell">
        <div className="cf-problem-grid">
          <div className="cf-stack reveal">
            <span className="beat">Você faz.</span>
            <span className="beat">Entrega.</span>
            <span className="beat">Se dedica.</span>
            <span className="beat dim">E no final fica a dúvida silenciosa —</span>
          </div>
          <div className="cf-quote-card reveal">
            <span className="mark">"</span>
            <div className="body">Será que ele <span className="accent">vai fazer o Pix?</span></div>
            <div className="attr">o pensamento de toda sexta-feira</div>
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
        <div className="cf-pivot-row reveal">
          <span className="cf-pivot-eye">A virada<span className="bar"></span></span>
          <p className="cf-pivot-text">O problema nunca foi o dinheiro. <em>É trabalhar sem garantia.</em></p>
        </div>
      </div>
    </section>
  );
}

// — Main flow: sticky diagram + 5 step list (dense, single section)
function CFFlow() {
  const steps = [
    { n: "01", t: "Cliente paga adiantado.", d: "Você compartilha um link de cobrança. O cliente paga via Pix, cartão ou boleto — sem fricção, no canal que ele preferir.", meta: ["Pix instantâneo", "Cartão até 12x", "Boleto"] },
    { n: "02", t: <React.Fragment>Dinheiro fica <em>travado.</em></React.Fragment>, d: "O valor entra em conta segregada operada por Pagar.me/Stripe Connect — provedores autorizados pelo Banco Central. Ninguém move o dinheiro até o serviço ser confirmado.", meta: ["Conta segregada", "BCB-compliant", "Auditável"] },
    { n: "03", t: "Você trabalha tranquilo.", d: "Sem cobrar, sem mandar lembrete, sem se preocupar se o pagamento vai chegar — porque já chegou. O foco volta a ser o serviço.", meta: ["Status compartilhado", "Sem WhatsApp"] },
    { n: "04", t: <React.Fragment>Confirmou. Pix sai <em>automático.</em></React.Fragment>, d: "Cliente confirma a entrega, o valor sai da custódia e cai na sua conta em segundos. Sem botão de \"liberar\", sem nova etapa de cobrança.", meta: ["47s médio", "Pix instantâneo"] },
    { n: "05", t: <React.Fragment>Split <em>automático</em> com o time.</React.Fragment>, d: "Parceiro, equipe ou comissão de indicação? Defina porcentagens uma vez. Quando o pagamento for liberado, cada Pix sai sozinho pra cada colab.", meta: ["Até 20 colabs", "100% rastreável"] },
  ];

  return (
    <section className="cf-flow" id="fluxo" data-screen-label="04 Fluxo">
      <div className="shell">
        <header className="section-head reveal" style={{ alignItems: "flex-start", textAlign: "left", maxWidth: "60ch", marginBottom: 0, margin: 0 }}>
          <span className="eyebrow"><span className="dot"></span>O fluxo completo</span>
          <h2 className="h-1" style={{ marginTop: 14 }}>Cinco passos. Dois confirmando, três <em>automáticos.</em></h2>
          <p className="lede" style={{ marginTop: 14 }}>Você não cobra, não persegue, não cruza dedo. A plataforma faz o caminho do dinheiro pra você.</p>
        </header>

        <div className="cf-flow-grid">
          <div className="cf-flow-diagram reveal">
            <FlowMini currentStep={2} />
          </div>

          <div className="cf-flow-steps reveal">
            {steps.map((s, i) => (
              <article className={"cf-flow-step" + (i === 2 ? " current" : "")} key={s.n}>
                <div className="cf-flow-step-num">{s.n}</div>
                <div className="cf-flow-step-body">
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                  <div className="meta">
                    {s.meta.map((m, j) => (
                      <React.Fragment key={j}>
                        <span>{m}</span>
                        {j < s.meta.length - 1 && <span className="dot"></span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// — Compact callout band
function CFCallout() {
  return (
    <section className="cf-callout">
      <div className="shell cf-callout-row">
        <div className="cf-callout-text reveal">Sem cobrança. Sem desculpa. <em>Sem "depois eu te mando."</em></div>
        <div className="cf-callout-pills reveal">
          <span className="pill x">"tô sem limite hoje"</span>
          <span className="pill x">"me chama amanhã"</span>
          <span className="pill x">"o Pix não caiu"</span>
        </div>
      </div>
    </section>
  );
}

function CFTwoSided() {
  return (
    <section className="cf-twosided" data-screen-label="06 Dois lados">
      <div className="shell">
        <header className="section-head reveal" style={{ alignItems: "flex-start", textAlign: "left", maxWidth: "56ch", margin: 0 }}>
          <span className="eyebrow"><span className="dot"></span>Pros dois lados</span>
          <h2 className="h-1" style={{ marginTop: 14 }}>Protege quem paga <em>e</em> quem recebe.</h2>
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
              <div className="cf-excuse">Pix já travado antes de começar</div>
              <div className="cf-excuse">Entrega → recebe, automático</div>
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
    if (kind === "design") return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 19l4-1 9-9-3-3-9 9-1 4z" stroke={s} strokeWidth="1.6" strokeLinejoin="round"/></svg>;
    if (kind === "video") return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="13" height="12" rx="2" stroke={s} strokeWidth="1.6"/><path d="M16 10l5-3v10l-5-3" stroke={s} strokeWidth="1.6" strokeLinejoin="round"/></svg>;
    if (kind === "dev") return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5M13 5l-2 14" stroke={s} strokeWidth="1.6" strokeLinecap="round"/></svg>;
    if (kind === "social") return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="6" cy="12" r="2.5" stroke={s} strokeWidth="1.6"/><circle cx="18" cy="6" r="2.5" stroke={s} strokeWidth="1.6"/><circle cx="18" cy="18" r="2.5" stroke={s} strokeWidth="1.6"/><path d="M8 11l8-4M8 13l8 4" stroke={s} strokeWidth="1.6"/></svg>;
    if (kind === "ads") return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 16V8l11-5v18l-11-5z" stroke={s} strokeWidth="1.6" strokeLinejoin="round"/></svg>;
    if (kind === "trades") return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 9l7-5 7 5v10H5z" stroke={s} strokeWidth="1.6" strokeLinejoin="round"/><circle cx="12" cy="14" r="2" stroke={s} strokeWidth="1.6"/></svg>;
    if (kind === "tech") return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke={s} strokeWidth="1.6"/><path d="M12 3v3M12 18v3M21 12h-3M6 12H3" stroke={s} strokeWidth="1.6" strokeLinecap="round"/></svg>;
    if (kind === "manual") return <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M14 4l6 6-2 2-3-3-6 6 2 2-6 4-3-3 4-6 2 2 6-6-3-3 2-2z" stroke={s} strokeWidth="1.6" strokeLinejoin="round"/></svg>;
    return null;
  };
  const pros = [
    { ico: "design", n: "Designers" },
    { ico: "video", n: "Editores de vídeo" },
    { ico: "dev", n: "Desenvolvedores" },
    { ico: "social", n: "Social media" },
    { ico: "ads", n: "Gestores de tráfego" },
    { ico: "trades", n: "Prestadores" },
    { ico: "tech", n: "Técnicos" },
    { ico: "manual", n: "Serviços manuais" },
  ];
  return (
    <section className="cf-forwhom" data-screen-label="07 Para quem">
      <div className="shell">
        <header className="section-head reveal" style={{ alignItems: "flex-start", textAlign: "left", maxWidth: "56ch", margin: 0 }}>
          <span className="eyebrow"><span className="dot"></span>Quem usa</span>
          <h2 className="h-1" style={{ marginTop: 14 }}>Pra quem trabalha <em>por conta.</em></h2>
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
    <section className="cf-trust" data-screen-label="08 Profissionalismo">
      <div className="shell cf-trust-grid">
        <div className="reveal">
          <span className="eyebrow"><span className="dot"></span>Por que importa</span>
          <h2 className="h-1" style={{ marginTop: 14 }}>O profissional <em>sério</em> transmite confiança.</h2>
          <p className="lede" style={{ marginTop: 16 }}>Quando você mostra que o pagamento já fica reservado antes do serviço começar, a percepção muda. Você deixa de parecer "tentando vender" e passa a parecer profissional, organizado e seguro.</p>
        </div>
        <div className="cf-trust-stats reveal">
          <div className="cf-trust-stat">
            <span className="v">0</span>
            <span className="l">Calotes em pagamentos via Valence desde 2024</span>
          </div>
          <div className="cf-trust-stat">
            <span className="v">47s</span>
            <span className="l">Da confirmação ao Pix cair na conta</span>
          </div>
          <div className="cf-trust-stat">
            <span className="v">3,2×</span>
            <span className="l">Ticket médio reportado por freelancers</span>
          </div>
          <div className="cf-trust-stat">
            <span className="v">−87%</span>
            <span className="l">Atrito em fechamento — clientes pagam antes</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CFFinal() {
  return (
    <section className="cf-final">
      <div className="shell">
        <div className="cf-final-card reveal">
          <div>
            <h2>Trabalhe com pagamento <em>protegido.</em></h2>
            <p>Configura em três minutos. Primeiro pagamento de até R$ 1.000 sem taxa. Sem cartão, sem fidelidade.</p>
            <div className="actions">
              <a href="#signup" className="btn btn-accent btn-lg">Começar agora <ArrowRight /></a>
              <a href="index.html#precos" className="btn btn-ghost btn-lg">Ver preços</a>
            </div>
          </div>
          <div className="cf-final-meta">
            <div className="row">
              <span className="ico"><IconCheck /></span>
              <div><div className="ttl">Sem mensalidade</div><div className="sub">Você só paga quando recebe</div></div>
            </div>
            <div className="row">
              <span className="ico"><IconVault /></span>
              <div><div className="ttl">Custódia BCB-compliant</div><div className="sub">Pagar.me · Stripe Connect</div></div>
            </div>
            <div className="row">
              <span className="ico"><IconPix /></span>
              <div><div className="ttl">Pix instantâneo</div><div className="sub">47s médio na liberação</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, {
  CFNav, CFHero, CFProblem, CFPivot, CFFlow,
  CFCallout, CFTwoSided, CFForWhom, CFTrust, CFFinal,
});
