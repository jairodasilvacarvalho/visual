export default function TrainingProgress({ progress = 0, completedFields = {} }) {
  const steps = [
    {
      label: "Produto",
      done: completedFields.productName &&
        completedFields.conversionLink &&
        completedFields.description
    },
    {
      label: "Benefícios",
      done: completedFields.benefits && completedFields.differentials
    },
    {
      label: "Objeções",
      done: completedFields.objections
    },
    {
      label: "Prompt final",
      done: progress === 100
    }
  ];

  return (
    <section className="agent-training-progress-card">
      <div className="agent-training-progress-card__header">
        <span className="agent-training-progress-card__label">
          Progresso do treinamento
        </span>

        <span className="agent-training-progress-card__percentage">
          {progress}%
        </span>
      </div>

      <div className="agent-training-progress-card__bar">
        <div
          className="agent-training-progress-card__fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="agent-training-progress-card__steps">
        {steps.map((step) => (
          <div
            key={step.label}
            className={`agent-training-progress-card__step${
              step.done ? " agent-training-progress-card__step--completed" : ""
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>
    </section>
  );
}
