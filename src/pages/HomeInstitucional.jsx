import React from "react";
import ChatPreview from "../components/ChatPreview";
import MetricsShowcase from "../components/MetricsShowcase";
import Plans from "../components/Plans";
import TestimonialsCarousel from "../components/TestimonialsCarousel";
import Footer from "../components/Footer";
import "../styles/institucional/institucional-home.css";
import "../styles/institucional/institucional-header.css";
import "../styles/institucional/institucional-support-chat.css";

export default function HomeInstitucional() {
  const [chatOpen, setChatOpen] = React.useState(false);

  return (
    <main className="institucional-home">
      <header className="institucional-header">
        <a href="/" className="institucional-logo">
          AI Sales
        </a>

        <nav className="institucional-nav">
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#planos">Planos</a>
          <a href="#depoimentos">Depoimentos</a>
        </nav>

        <div className="institucional-header-user-area">
          <a href="/login" className="institucional-header-button">
            Entrar
          </a>

          <a href="/register" className="institucional-header-register">
            Registrar
          </a>
        </div>
      </header>

      <section className="institucional-hero-section">
        <div className="institucional-hero-content">
          <p className="institucional-hero-badge">
            IA para WhatsApp • Vendas • Atendimento automático
          </p>

          <h1 className="institucional-hero-title">
            Transforme conversas no WhatsApp em vendas automáticas
          </h1>

          <p className="institucional-hero-description">
            Um agente inteligente para responder leads, recuperar oportunidades e automatizar seu atendimento comercial com aparência profissional.
          </p>

          <div className="institucional-hero-actions">
            <a href="/register" className="institucional-primary-button">
              Começar agora
            </a>

            <a href="/login" className="institucional-secondary-button">
              Entrar
            </a>
          </div>
        </div>

        <div className="institucional-hero-preview">
          <ChatPreview />
        </div>
      </section>

      <section id="funcionalidades">
        <MetricsShowcase />
      </section>

      <section id="planos" className="institucional-plans-section">
        <Plans />
      </section>

      <TestimonialsCarousel />

      <Footer />

      {chatOpen && (
        <div className="institucional-support-chat-panel">
          <div className="institucional-support-chat-panel-header">
            <div>
              <strong>Suporte AI Sales</strong>
              <span><span className="institucional-support-chat-online-dot"></span>Online agora</span>
            </div>
            
          </div>

          <div className="institucional-support-chat-panel-body">
            <div className="institucional-support-chat-message bot">
              Olá! Como posso te ajudar sobre a AI Sales?
            </div>
          </div>

          <div className="institucional-support-chat-panel-input">
            <input type="text" placeholder="Digite sua mensagem..." />
            <button type="button">Enviar</button>
          </div>
        </div>
      )}
      <button className={`institucional-support-chat-trigger ${chatOpen ? "is-open" : ""}`} aria-label="Abrir chat de suporte" onClick={() => setChatOpen(!chatOpen)}>
        {chatOpen ? <span className="institucional-support-chat-close-icon">×</span> : <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="institucional-support-chat-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 9.75h6.75m-6.75 3h4.5M21 12c0 4.97-4.03 9-9 9a8.96 8.96 0 01-4.255-1.067L3 21l1.067-4.745A8.96 8.96 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9z"
          />
        </svg>}
      </button>
    </main>
  );
}
