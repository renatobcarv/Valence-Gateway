// Valence — motion utilities + new sections (LiveSplit, marquee, counter, scroll progress)

// ── Animated counter ────────────────────────────────────────────
function useInView(ref, opts = { threshold: 0.3 }) {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { setInView(true); io.disconnect(); }
      }
    }, opts);
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return inView;
}

function Counter({ to, duration = 1800, prefix = "", suffix = "", decimals = 0, format = "plain" }) {
  const ref = React.useRef(null);
  const inView = useInView(ref);
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setV(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  let txt;
  if (format === "brl-compact") {
    // e.g. "12,4" for millions
    txt = v.toFixed(1).replace(".", ",");
  } else if (format === "thousands") {
    txt = Math.round(v).toLocaleString("pt-BR");
  } else {
    txt = v.toFixed(decimals);
  }
  return <span ref={ref} className="counter">{prefix}{txt}{suffix}</span>;
}

// ── Scroll progress bar ─────────────────────────────────────────
function ScrollProgress() {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      setP(h > 0 ? Math.min(100, (y / h) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" style={{ width: `${p}%` }} aria-hidden="true" />;
}

// ── Spotlight wrapper — mouse-follow glow ────────────────────────
function Spotlight({ children, className = "", ...rest }) {
  const ref = React.useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onMouseMove={onMove} className={"spotlight " + className} {...rest}>
      {children}
    </div>
  );
}

// ── Marquee (infinite scroll) ────────────────────────────────────
function Marquee({ children }) {
  // Duplicate children so the loop is seamless
  return (
    <div className="marquee">
      <div className="marquee-track">
        {children}
        {children}
      </div>
    </div>
  );
}

// ── Live timestamp (updates every minute) ───────────────────────
function LiveTimestamp() {
  const [t, setT] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setT(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const hh = String(t.getHours()).padStart(2, "0");
  const mm = String(t.getMinutes()).padStart(2, "0");
  return (
    <span className="timestamp-pill" aria-live="polite">
      <span className="live-dot"></span>
      AO VIVO · {hh}:{mm} BRT
    </span>
  );
}

// ── Hero floating notifications ────────────────────────────────
function HeroNotifs() {
  return (
    <div className="hero-notifs" aria-hidden="true">
      <div className="notif n1">
        <span className="ic-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
        <div>
          <div className="nt-title">Pix enviado · João</div>
          <div className="nt-sub">Repasse 70% · 1.4s atrás</div>
        </div>
        <span className="nt-amt">+R$ 1.050</span>
      </div>
      <div className="notif n2">
        <span className="ic-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
        <div>
          <div className="nt-title">Pix enviado · Maria</div>
          <div className="nt-sub">Repasse 20% · 2.1s atrás</div>
        </div>
        <span className="nt-amt">+R$ 300</span>
      </div>
      <div className="notif n3">
        <span className="ic-wrap">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
        <div>
          <div className="nt-title">Pix enviado · Pedro</div>
          <div className="nt-sub">Repasse 10% · 2.8s atrás</div>
        </div>
        <span className="nt-amt">+R$ 150</span>
      </div>
    </div>
  );
}

// ── Live Split section — animated SVG demo ─────────────────────
function LiveSplit() {
  const ref = React.useRef(null);
  const inView = useInView(ref, { threshold: 0.35 });
  // SVG paths from a single point at top center down to 3 spread points at bottom
  // viewBox 0 0 800 120 — input at (400, 0), outputs roughly at (133, 120), (400, 120), (667, 120)
  const paths = [
    "M 400 0 C 400 60, 133 60, 133 120",
    "M 400 0 L 400 120",
    "M 400 0 C 400 60, 667 60, 667 120",
  ];

  return (
    <section className="live-split-section" id="demo" ref={ref} data-screen-label="03 Live split">
      <div className="shell">
        <header className="section-head reveal">
          <span className="eyebrow"><span className="dot"></span>Demo ao vivo</span>
          <h2 className="h-1">Um pagamento entra. <em>Três Pix saem.</em></h2>
          <p className="lede">Em tempo real, no dashboard. Sem botão de "dividir", sem aprovação manual, sem você abrir nada. A regra do projeto faz o trabalho.</p>
        </header>

        <div className={"split-demo reveal" + (inView ? " go" : "")}>
          {/* Input */}
          <div className="split-input">
            <span className="ic-pix">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 6l6 6-6 6m6-6l6 6-6-6 6-6" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
            <div style={{ flex: 1 }}>
              <div className="lbl">Pix recebido · Podcast Tech</div>
              <div className="amt"><span className="cur">R$</span>1.500,00</div>
            </div>
            <LiveTimestamp />
          </div>

          {/* Flow paths */}
          <div className={"split-flow" + (inView ? " go" : "")}>
            <svg viewBox="0 0 800 120" preserveAspectRatio="none" aria-hidden="true">
              {paths.map((d, i) => (
                <path key={i} d={d} className={`flow-path p${i+1}`} />
              ))}
            </svg>
          </div>

          {/* Outputs */}
          <div className="split-outputs">
            <div className="split-out">
              <div className="row1">
                <span className="avatar" style={{ background: "var(--accent-soft)", color: "var(--accent-300)", borderColor: "var(--accent-soft-2)" }}>J</span>
                <div>
                  <div className="nm">João Mendes</div>
                  <div className="role">Host</div>
                </div>
                <span className="pct">70%</span>
              </div>
              <div className="row2"><span className="cur">R$</span>1.050,00</div>
              <div className="row3">
                <span className="live-dot"></span>Pix confirmado
                <span className="time">+1.4s</span>
              </div>
            </div>

            <div className="split-out">
              <div className="row1">
                <span className="avatar" style={{ background: "rgba(255,138,58,.14)", color: "#FFB287", borderColor: "rgba(255,138,58,.22)" }}>M</span>
                <div>
                  <div className="nm">Maria Lopes</div>
                  <div className="role">Editora</div>
                </div>
                <span className="pct">20%</span>
              </div>
              <div className="row2"><span className="cur">R$</span>300,00</div>
              <div className="row3">
                <span className="live-dot"></span>Pix confirmado
                <span className="time">+2.1s</span>
              </div>
            </div>

            <div className="split-out">
              <div className="row1">
                <span className="avatar" style={{ background: "rgba(139,92,246,.14)", color: "#BFA6FF", borderColor: "rgba(139,92,246,.22)" }}>P</span>
                <div>
                  <div className="nm">Pedro Castro</div>
                  <div className="role">Produtor</div>
                </div>
                <span className="pct">10%</span>
              </div>
              <div className="row2"><span className="cur">R$</span>150,00</div>
              <div className="row3">
                <span className="live-dot"></span>Pix confirmado
                <span className="time">+2.8s</span>
              </div>
            </div>
          </div>

          {/* Footer of demo */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 24, borderTop: "1px solid var(--line)", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--ink-3)", fontSize: 12.5 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span className="live-dot"></span>
                Operação real · processada via Pagar.me
              </span>
            </div>
            <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>
              ref. <span style={{ color: "var(--ink-1)" }}>#PIX-09a4-b71f</span> · taxa <span style={{ color: "var(--accent-300)" }}>R$ 44,85 (2,99%)</span>
            </div>
          </div>
        </div>

        <div className="integrations">
          <span style={{ fontSize: 11.5, color: "var(--ink-4)", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 500, marginRight: 6 }}>Integra com</span>
          {["Pagar.me", "Stripe Connect", "Pix BCB", "Banco Inter", "Mercado Pago", "Webhooks", "API REST"].map((n) => (
            <span key={n} className="int-chip"><span className="dot"></span>{n}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Hero parallax hook ──────────────────────────────────────────
// Adds gentle scroll-driven Y offset on top of each blob's CSS animation,
// so they drift extra as the user scrolls. Uses translate3d to avoid
// fighting the keyframe animations (we layer transforms by setting a
// custom property the keyframes read).
function useHeroParallax() {
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const apply = () => {
      const y = window.scrollY;
      const heroTex = document.querySelector(".hero-tex");
      if (heroTex) {
        // Subtle whole-layer parallax — just a hint
        heroTex.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;
      }
      const vig = document.querySelector(".hero-tex .vignette");
      if (vig) vig.style.opacity = Math.min(1, 0.55 + y * 0.0008);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);
}

// ── Stagger reveal hook (for elements with .reveal-stagger) ─────
function useStaggerReveal() {
  React.useEffect(() => {
    const els = document.querySelectorAll(".reveal-stagger");
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

Object.assign(window, {
  Counter, ScrollProgress, Spotlight, Marquee, LiveTimestamp,
  HeroNotifs, LiveSplit, useHeroParallax, useStaggerReveal, useInView,
});
