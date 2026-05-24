export default function TrainingInput({
  value,
  onChange,
  onSend
}) {
  return (
    <footer className="agent-training-input">
      <div className="agent-training-input__container">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="agent-training-input__textarea"
          placeholder="Digite sua resposta aqui..."
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
        />

        <button
          onClick={onSend}
          className="agent-training-input__button"
          aria-label="Enviar resposta"
        >
          <svg
            className="agent-training-input__button-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M4 12L20 4L16 20L12.5 13.5L4 12Z" />
          </svg>
        </button>
      </div>

      <p className="agent-training-input__hint agent-training-input__hint--subtle">
        Pressione Enter para enviar
      </p></footer>
  );
}
