export default function TrainingMessage({ role = "assistant", children }) {
  return (
    <article className={`training-message training-message--${role}`}>
      <div className="training-message__avatar">
        {role === "assistant" ? "IA" : "EU"}
      </div>

      <div className="training-message__bubble">
        {children}
      </div>
    </article>
  );
}
