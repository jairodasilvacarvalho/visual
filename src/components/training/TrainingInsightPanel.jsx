export default function TrainingInsightPanel() {
  const topics = [
    { label: "Nome do produto", done: true },
    { label: "Benefícios principais", done: true },
    { label: "Resultados esperados", done: true },
    { label: "Diferenciais", done: false },
    { label: "Objeções comuns", done: false },
    { label: "Tom de voz", done: false },
  ];

  return (
    <aside className="agent-training-insight-panel">
      <section className="agent-training-insight-panel__progress-box">
        <h3>Progresso do Treinamento</h3>

        <div className="agent-training-insight-panel__progress-ring">
          <span>65%</span>
        </div>

        <p>Muito bom! Continue assim.</p>

        <div className="agent-training-insight-panel__divider" />

        <strong className="agent-training-insight-panel__topics-title">
          Tópicos abordados
        </strong>

        <div className="agent-training-insight-panel__topics-list">
          {topics.map((topic) => (
            <div
              key={topic.label}
              className={`agent-training-insight-panel__topic ${
                topic.done ? "is-done" : "is-pending"
              }`}
            >
              <span />
              <p>{topic.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="agent-training-insight-panel__tone-box">
        <h3>Referências de Tom</h3>

        <div className="agent-training-insight-panel__tone-list">
          <div>
            <span>✓</span>
            <p><strong>Empático</strong> Demonstre compreensão</p>
          </div>

          <div>
            <span>◇</span>
            <p><strong>Confiante</strong> Passe segurança</p>
          </div>

          <div>
            <span>◎</span>
            <p><strong>Especialista</strong> Use conhecimento técnico</p>
          </div>

          <div>
            <span>↗</span>
            <p><strong>Persuasivo</strong> Incentive a decisão</p>
          </div>
        </div>
      </section>

      <section className="agent-training-insight-panel__tip-box">
        <strong>Dica IA</strong>
        <p>Seja específico nos benefícios e sempre foque no resultado para o cliente.</p>
      </section>
    </aside>
  );
}