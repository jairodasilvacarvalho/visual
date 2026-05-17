import { useState } from "react";
import "../styles/institucional/institucional-plans.css";

const billingOptions = [
  { id: "6m", label: "6 meses", discount: 0, suffix: "por usuário/mês" },
  { id: "9m", label: "9 meses", discount: 0.08, suffix: "por usuário/mês" },
  { id: "1y", label: "1 ano", discount: 0.15, suffix: "por usuário/mês" },
  { id: "2y", label: "2 anos", discount: 0.25, suffix: "por usuário/mês" },
];

const plans = [
  {
    name: "Básico",
    basePrice: 97,
    className: "plan-card-basic",
    features: [
      ["Respostas automáticas", true],
      ["Integração com WhatsApp", true],
      ["Cadastro de leads", true],
      ["Histórico de conversas", true],
      ["Follow-up inteligente", false],
      ["Recuperação automática de leads", false],
      ["Métricas avançadas", false],
      ["Suporte prioritário", false],
    ],
  },
  {
    name: "Pro",
    basePrice: 197,
    className: "plan-card-pro is-featured",
    badge: "MAIS ESCOLHIDO",
    features: [
      ["Respostas automáticas", true],
      ["Integração com WhatsApp", true],
      ["Cadastro de leads", true],
      ["Histórico de conversas", true],
      ["Follow-up inteligente", true],
      ["Recuperação automática de leads", true],
      ["Métricas avançadas", true],
      ["Suporte prioritário", false],
    ],
  },
  {
    name: "Premium",
    basePrice: 297,
    className: "plan-card-premium",
    features: [
      ["Respostas automáticas", true],
      ["Integração com WhatsApp", true],
      ["Cadastro de leads", true],
      ["Histórico de conversas", true],
      ["Follow-up inteligente", true],
      ["Recuperação automática de leads", true],
      ["Métricas avançadas", true],
      ["Suporte prioritário", true],
    ],
  },
];

export default function Plans() {
  const [billingCycle, setBillingCycle] = useState("6m");
  const selectedBilling = billingOptions.find((option) => option.id === billingCycle) ?? billingOptions[0];

  const formatPrice = (price) => {
    const discountedPrice = Math.round(price * (1 - selectedBilling.discount));
    return `R$${discountedPrice}`;
  };

  return (
    <section className="plans-section">
      <h3 className="plans-title">Escolha seu plano</h3>

      <div className="plans-toolbar">
        <div className="plans-billing-tabs" aria-label="Selecionar período de cobrança">
          {billingOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`plans-billing-tab ${billingCycle === option.id ? "is-active" : ""}`}
              onClick={() => setBillingCycle(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button type="button" className="plans-currency-button">
          R$ BRL
          <span aria-hidden="true">&#9662;</span>
        </button>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <article key={plan.name} className={`plan-card ${plan.className}`}>
            {plan.badge && <span className="plan-badge">{plan.badge}</span>}

            <h4 className="plan-name">{plan.name}</h4>
            <p className="plan-price">{formatPrice(plan.basePrice)}</p>
            <p className="plan-price-note">{selectedBilling.suffix}</p>

            <ul className="plan-features">
              {plan.features.map(([feature, included]) => (
                <li key={feature} className={included ? "is-included" : "is-disabled"}>
                  {feature}
                </li>
              ))}
            </ul>

            <button className="plan-button">Assinar</button>
          </article>
        ))}
      </div>
    </section>
  );
}
