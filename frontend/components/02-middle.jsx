// Valence — middle sections: Como Funciona (dark feature grid), Stats, Testimonials

function FeatureIcon({ kind }) {
  const stroke = "currentColor";
  if (kind === "create") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="4" width="18" height="16" rx="3" stroke={stroke} strokeWidth="1.6"/>
      <path d="M3 9h18M7 14h6M7 17h4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
  if (kind === "team") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="9" r="3.5" stroke={stroke} strokeWidth="1.6"/>
      <path d="M3 19c0-3 2.5-5.5 6-5.5s6 2.5 6 5.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="17" cy="8" r="2.5" stroke={stroke} strokeWidth="1.6"/>
      <path d="M14.5 19c.4-2 1.7-3.5 3.5-4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
  if (kind === "link") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M9 15l6-6M7.5 11l-2 2a3.5 3.5 0 005 5l2-2M13.5 9l2-2a3.5 3.5 0 00-5-5l-2 2" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (kind === "split") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 6h4l8 12h4M4 18h4l3-4.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 4l3 2-3 2M18 14l3 2-3 2" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (kind === "auto") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.3 6.3l2 2M15.7 15.7l2 2M6.3 17.7l2-2M15.7 8.3l2-2" stroke={stroke} strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth="1.6"/>
    </svg>
  );
  if (kind === "shield") return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6l8-3z" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return null;
}

function StepArt({ kind }) {
  if (kind === "create") {
    return (
      <div className="feature-art">
        <div style={{ fontSize: 10.5, color: "var(--ink-4)", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 8 }}>Novo projeto</div>
        <div style={{ background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8, padding: "8px 10px", fontSize: 13, fontWeight: 500, color: "var(--ink-1)", fontFamily: "var(--font-mono)" }}>
          Podcast Tech<span style={{ color: "var(--accent)", marginLeft: 2, animation: "blink 1s steps(2) infinite" }}>|</span>
        </div>
        <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
      </div>
    );
  }
  if (kind === "collabs") {
    return (
      <div className="feature-art" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { n: "João", r: "Host", p: 70, c: "var(--accent-300)", bg: "var(--accent-soft)" },
          { n: "Maria", r: "Editora", p: 20, c: "#FFB287", bg: "rgba(255,138,58,.14)" },
          { n: "Pedro", r: "Produtor", p: 10, c: "#BFA6FF", bg: "rgba(139,92,246,.14)" },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="avatar avatar-sm" style={{ background: c.bg, color: c.c, borderColor: "transparent" }}>{c.n[0]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink-1)" }}>{c.n} <span style={{ color: "var(--ink-3)", fontWeight: 400 }}>· {c.r}</span></div>
            </div>
            <span className="mono" style={{ fontSize: 12, color: "var(--ink-1)" }}>{c.p}%</span>
          </div>
        ))}
        <div style={{ marginTop: 6, height: 6, borderRadius: 999, background: "var(--bg)", overflow: "hidden", display: "flex" }}>
          <span style={{ width: "70%", background: "var(--accent)" }}></span>
          <span style={{ width: "20%", background: "#FF8A3A" }}></span>
          <span style={{ width: "10%", background: "#8B5CF6" }}></span>
        </div>
      </div>
    );
  }
  if (kind === "link") {
    return (
      <div className="feature-art" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 26, height: 26, borderRadius: 7, background: "var(--bg)", border: "1px solid var(--line)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M5.5 8.5l3-3M4 6L2 8a2.5 2.5 0 003.5 3.5L7.5 9.5M10 8l2-2A2.5 2.5 0 008.5 2.5L6.5 4.5" stroke="var(--ink-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="mono" style={{ fontSize: 12, color: "var(--ink-1)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>valence.app/p/podcasttech</span>
        <span className="chip chip-accent" style={{ fontSize: 10, padding: "3px 7px" }}>Copiar</span>
      </div>
    );
  }
  if (kind === "split") {
    return (
      <div className="feature-art" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 10.5, color: "var(--ink-4)", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 500, marginBottom: 4 }}>R$ 100 pago → split em 47s</div>
        {[
          { n: "João", v: "R$ 70,00" },
          { n: "Maria", v: "R$ 20,00" },
          { n: "Pedro", v: "R$ 10,00" },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-2)" }}>
              <span style={{ width: 5, height: 5, borderRadius: 50, background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }}></span>
              {c.n}
            </span>
            <span className="mono" style={{ color: "var(--accent-300)", fontWeight: 600 }}>{c.v}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

function ComoFunciona() {
  const steps = [
    { n: "01", t: "Crie seu projeto", d: "Dê um nome ao trabalho — \"Podcast Tech\", \"Cohort 04\", \"Campanha Q3\". Pronto.", k: "create", icon: "create" },
    { n: "02", t: "Adicione seu time", d: "Cada colab com nome, Pix e a porcentagem. A soma fecha 100% — a Valence valida.", k: "collabs", icon: "team" },
    { n: "03", t: "Compartilhe o link", d: "Um único link de pagamento aceita Pix, cartão e boleto. Cole onde quiser.", k: "link", icon: "link" },
    { n: "04", t: "Cada um recebe sua parte", d: "Pagamento chega, Valence divide, cada Pix sai automático. Em segundos, sem você tocar em planilha.", k: "split", icon: "split" },
  ];
  return (
    <section className="section section-dark" id="como-funciona" data-screen-label="02 Como funciona">
      <div className="shell">
        <header className="section-head reveal">
          <span className="eyebrow"><span className="dot"></span>Como funciona</span>
          <h2 className="h-1">Quatro passos. <em>Zero planilha.</em></h2>
          <p className="lede">Do "vamos dividir" ao "tá na conta de cada um" — sem você abrir calculadora, sem cobrar ninguém no WhatsApp.</p>
        </header>

        <div className="feature-grid reveal reveal-stagger" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
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

function Stats() {
  const benefits = [
    {
      icon: "auto",
      t: "Split automático",
      d: "Defina porcentagens uma vez. Todo pagamento daquele projeto já cai dividido — Pix saindo pra cada colaborador em segundos.",
    },
    {
      icon: "shield",
      t: "Operação blindada",
      d: "Operamos sobre Pagar.me e Stripe Connect (autorizados pelo BCB). O dinheiro nunca para na nossa conta. Tudo rastreável, tudo auditável.",
    },
    {
      icon: "team",
      t: "Time vê tudo",
      d: "Cada colaborador acessa o próprio dashboard, vê histórico, baixa comprovante. Acaba o WhatsApp pra perguntar \"saiu meu Pix?\".",
    },
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
            <span className="quote-mark">"</span>
            <q>A gente perdia uma tarde por mês fazendo planilha de quem recebia o quê. Agora cai direto no Pix de cada um. Não vou mais voltar.</q>
            <div className="tcard-who">
              <span className="avatar avatar-lg" style={{ background: "var(--accent-soft)", color: "var(--accent-300)", borderColor: "var(--accent-soft-2)" }}>L</span>
              <div>
                <div className="name">Letícia Andrade</div>
                <div className="role">Host · Podcast Cohort/04</div>
              </div>
            </div>
          </div>
          <div className="tcard">
            <span className="quote-mark">"</span>
            <q>Meu time confia mais no projeto porque vê a divisão antes de aceitar. É transparência por padrão — não preciso pedir confiança a ninguém.</q>
            <div className="tcard-who">
              <span className="avatar avatar-lg" style={{ background: "rgba(139,92,246,.14)", color: "#BFA6FF", borderColor: "rgba(139,92,246,.22)" }}>R</span>
              <div>
                <div className="name">Rafael Tavares</div>
                <div className="role">Diretor · Novelo Studio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ComoFunciona, Stats });
