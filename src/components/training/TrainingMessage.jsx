export default function TrainingMessage({ role = "assistant", children }) {
  return (
    <article className={`training-message training-message--${role}`}>
      <div className="training-message__bubble">
        {children}
      </div>
    </article>
  );
}

