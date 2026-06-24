export default function TrainingInsightPanel({ progress = 0, completedFields = {} }) {
  const topics = [
    { label: "Nome do produto", done: completedFields.productName },
    { label: "Link de conversão", done: completedFields.conversionLink },
    { label: "Descrição", done: completedFields.description },
    { label: "Público", done: completedFields.targetAudience },
    { label: "Benefícios principais", done: completedFields.benefits },
    { label: "Diferenciais", done: completedFields.differentials },
    { label: "Preço", done: completedFields.price },
    { label: "Garantia", done: completedFields.guarantee },
    { label: "Objeções comuns", done: completedFields.objections },
    { label: "Tom de voz", done: completedFields.toneOfVoice }
  ];
  const progressDegrees = progress * 3.6;

  return (
    <aside className="agent-training-insight-panel">
      <section className="agent-training-insight-panel__progress-box">
        <h3>Progresso do Treinamento</h3>

        <div
          className="agent-training-insight-panel__progress-ring"
          style={{
            background: `conic-gradient(#3b82f6 0deg ${progressDegrees}deg, rgba(59,130,246,0.11) ${progressDegrees}deg 360deg)`
          }}
        >
          <span>{progress}%</span>
        </div>

        <p>
          {progress === 0
            ? "Escolha o tipo de agente para começar."
            : progress === 100
              ? "Treinamento completo."
              : "Muito bom! Continue assim."}
        </p>

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

      <section className="agent-training-insight-panel__tip-box">
        <strong>Dica IA</strong>
        <p>Seja específico nos benefícios e sempre foque no resultado para o cliente.</p>
      </section>
    </aside>
  );
}
