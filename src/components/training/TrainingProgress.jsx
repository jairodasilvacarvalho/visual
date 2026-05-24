export default function TrainingProgress() {
  return (
    <section className="agent-training-progress-card">
      <div className="agent-training-progress-card__header">
        <span className="agent-training-progress-card__label">
          Progresso do treinamento
        </span>

        <span className="agent-training-progress-card__percentage">
          25%
        </span>
      </div>

      <div className="agent-training-progress-card__bar">
        <div className="agent-training-progress-card__fill" />
      </div>

      <div className="agent-training-progress-card__steps">
        <div className="agent-training-progress-card__step agent-training-progress-card__step--completed">
          Produto
        </div>

        <div className="agent-training-progress-card__step">
          Benefícios
        </div>

        <div className="agent-training-progress-card__step">
          Objeções
        </div>

        <div className="agent-training-progress-card__step">
          Prompt final
        </div>
      </div>
    </section>
  );
}
