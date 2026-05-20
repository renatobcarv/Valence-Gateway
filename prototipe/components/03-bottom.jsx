// Valence — bottom sections: Pricing (light zone), FAQ (dark), Footer

function Pricing() {
  return (
    <div className="light-zone" id="precos" data-screen-label="04 Preços">
      <section className="shell pricing-wrap">
        <header className="section-head reveal">
          <span className="eyebrow"><span className="dot"></span>Preços honestos</span>
          <h2 className="h-1">Sem mensalidade. <em>Você paga quando recebe.</em></h2>
          <p className="lede">Uma taxa só, transparente, cobrada no valor de cada repasse. Nada de assinatura, fidelidade ou cobrança escondida. Não entrou nada, você não pagou nada.</p>
        </header>

        <div className="pricing-row">
          <div className="price-card reveal">
            <span className="label">Plano padrão</span>
            <div>
              <div className="price">
                <span className="pct">2,99<sup>%</sup></span>
                <span className="plus">+ R$ 0,40 por split</span>
              </div>
              <p className="desc" style={{ marginTop: 10 }}>Cobrado sobre cada repasse — nunca em cima de você. Sem mensalidade, sem fidelidade.</p>
            </div>
            <ul>
              <li>Splits ilimitados via Pix instantâneo</li>
              <li>Até 20 colaboradores por projeto</li>
              <li>Dashboard em tempo real pro time inteiro</li>
              <li>Sem CNPJ — pessoa física funciona</li>
              <li>Cancelamento e exportação sem perguntas</li>
            </ul>
            <a href="#signup" className="btn btn-accent btn-lg" style={{ alignSelf: "flex-start" }}>Começar grátis <ArrowRight /></a>
          </div>

          <div className="price-card featured reveal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="label">Plano time</span>
              <span className="chip chip-accent" style={{ background: "rgba(255,74,42,.15)", borderColor: "rgba(255,74,42,.3)" }}>Fatura {">"} R$ 50k/mês</span>
            </div>
            <div>
              <div className="price">
                <span className="pct">1,99<sup>%</sup></span>
                <span className="plus">+ R$ 0,30 por split</span>
              </div>
              <p className="desc" style={{ marginTop: 10 }}>Condição negociada pra criadores e agências em volume. Suporte humano e API liberados.</p>
            </div>
            <ul>
              <li>Tudo do plano padrão</li>
              <li>Colaboradores ilimitados</li>
              <li>API + webhooks pra integrar no seu fluxo</li>
              <li>Suporte humano em até 1 dia útil</li>
              <li>Relatórios contábeis (.csv, .xlsx, .ofx)</li>
            </ul>
            <a href="#contato" className="btn btn-light btn-lg" style={{ alignSelf: "flex-start" }}>Falar com a gente <ArrowRight /></a>
          </div>
        </div>

        <div className="highlight-card reveal">
          <span className="eyebrow"><span className="dot"></span>Primeiros R$ 1.000 sem taxa</span>
          <h3 className="h-1" style={{ fontSize: "clamp(28px, 3.4vw, 44px)" }}>Teste com seu time. <em>Sem cartão, sem compromisso.</em></h3>
          <p className="lede">Faz o cadastro, cria um projeto, divide o primeiro pagamento de até R$ 1.000 sem pagar nada pra gente. Se gostar, segue. Se não, exporta tudo e cancela.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
            <a href="#signup" className="btn btn-accent btn-lg">Começar agora <ArrowRight /></a>
            <a href="#demo" className="btn btn-lg" style={{ background: "transparent", color: "var(--warm-ink)", border: "1px solid var(--warm-line)" }}>Agendar demo de 15 min</a>
          </div>
        </div>

        <div className="cta-card reveal">
          <h2>O seu time já sabe<br/><em>quem recebe o quê.</em></h2>
          <p>Configura em três minutos. Divide pra sempre. Sem planilha, sem cobrar no WhatsApp, sem desconforto.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="#signup" className="btn btn-accent btn-lg">Começar agora <ArrowRight /></a>
            <a href="#demo" className="btn btn-ghost btn-lg">Ver demo ao vivo</a>
          </div>
          <div style={{ marginTop: 28, display: "flex", gap: 22, fontSize: 13, color: "rgba(255,255,255,.55)", flexWrap: "wrap" }}>
            <span>· Sem cartão de crédito</span>
            <span>· Primeiros R$ 1.000 sem taxa</span>
            <span>· Cancela quando quiser</span>
          </div>
        </div>
      </section>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "É seguro? Quem segura o dinheiro?",
    a: [
      "O dinheiro nunca para com a gente. A Valence opera em cima de provedores autorizados pelo Banco Central (Pagar.me e Stripe Connect) — o split acontece dentro deles, não na nossa conta.",
      "Quando o pagamento entra, a infra já distribui pra cada Pix de colaborador automaticamente. Você vê tudo em tempo real no dashboard.",
    ],
  },
  {
    q: "Preciso de CNPJ pra usar?",
    a: [
      "Não. Pessoa física funciona, tanto pra você quanto pros seus colaboradores. Cada um precisa só de uma chave Pix válida.",
      "Se você tem CNPJ, melhor — a gente emite notas e relatórios prontos pra contabilidade.",
    ],
  },
  {
    q: "Quanto tempo demora pra cada um receber via Pix?",
    a: [
      "Média atual: 47 segundos do pagamento entrar até cada colaborador receber. Pico no horário comercial: até 2 minutos.",
      "Pix instantâneo de verdade — não tem D+1, D+30, nada disso.",
    ],
  },
  {
    q: "Posso mudar as porcentagens depois?",
    a: [
      "Pode, a qualquer momento. A mudança vale pra pagamentos futuros — pagamentos antigos ficam registrados com a divisão que estava ativa na hora.",
      "Histórico completo, auditável, sem rasura.",
    ],
  },
  {
    q: "Funciona com cartão de crédito também?",
    a: [
      "Funciona — Pix, cartão (parcelado ou à vista) e boleto. O split sai automático em todos.",
      "Cartão tem o prazo do adquirente (D+15 padrão); o split em cima já fica programado.",
    ],
  },
  {
    q: "Tem integração com YouTube, Patreon, Apoia.se?",
    a: [
      "A Valence funciona como camada de split em cima de qualquer recebimento. Se a plataforma te paga via Pix ou conta, você puxa o dinheiro pra um link Valence e a gente divide.",
      "Webhooks e API disponíveis no plano Time pra automatizar de ponta a ponta.",
    ],
  },
  {
    q: "E se eu quiser cancelar ou exportar tudo?",
    a: [
      "Cancela em um clique, sem ligação, sem retenção. Exporta histórico completo em .csv ou .xlsx — seus dados são seus.",
      "Não cobramos taxa de saída. Nada.",
    ],
  },
];

function FAQ() {
  const [open, setOpen] = React.useState(0);
  return (
    <section className="faq-zone" id="faq" data-screen-label="05 FAQ">
      <div className="shell">
        <div className="faq-row">
          <div className="reveal">
            <span className="eyebrow"><span className="dot"></span>Perguntas frequentes</span>
            <h2 className="h-1" style={{ marginTop: 18 }}>Tire suas <em>dúvidas</em> antes de começar.</h2>
            <p className="lede" style={{ marginTop: 20 }}>Reunimos o que mais perguntam pra quem está pensando em parar de dividir pagamento na mão.</p>
            <div style={{ marginTop: 32, padding: 20, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 14, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent-300)", border: "1px solid var(--accent-soft-2)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 36px" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10v7H9l-3 3v-3H3V4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
              </span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500, color: "var(--ink-1)" }}>Não achou sua dúvida aqui?</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>Chama no <a href="#" style={{ color: "var(--accent-300)", fontWeight: 500 }}>contato@valence.app</a> — a gente responde de gente.</div>
              </div>
            </div>
          </div>

          <div className="faq-list reveal">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className={"faq-item" + (open === i ? " open" : "")}>
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

function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo />
            <p>Split de pagamentos automático para criadores, podcasters, consultores e agências brasileiras.</p>
            <div className="social">
              <a href="#" aria-label="X">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M12.6 1.5h2.4l-5.2 5.9 6.1 8.1h-4.8l-3.7-4.9-4.3 4.9H.7l5.5-6.3L0 1.5h4.9l3.4 4.5 4.3-4.5zm-.8 12.6h1.3L4.3 2.9H2.9l8.9 11.2z"/></svg>
              </a>
              <a href="#" aria-label="GitHub">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 .2a8 8 0 00-2.5 15.6c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-1-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 2 .9 2.5.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-3.9 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3-1.8 3.7-3.6 3.9.3.2.5.7.5 1.4v2.1c0 .2.1.5.5.4A8 8 0 008 .2z"/></svg>
              </a>
              <a href="#" aria-label="Instagram">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="12" height="12" rx="3"/><circle cx="8" cy="8" r="2.5"/><circle cx="11.5" cy="4.5" r=".7" fill="currentColor"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4>Produto</h4>
            <ul>
              <li><a href="#produto">Dashboard</a></li>
              <li><a href="#como-funciona">Como funciona</a></li>
              <li><a href="#precos">Preços</a></li>
              <li><a href="#">API + Webhooks</a></li>
              <li><a href="#">Status</a></li>
            </ul>
          </div>
          <div>
            <h4>Empresa</h4>
            <ul>
              <li><a href="#">Sobre</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Casos de uso</a></li>
              <li><a href="#">Carreiras</a></li>
              <li><a href="#">Imprensa</a></li>
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

Object.assign(window, { Pricing, FAQ, Footer });
