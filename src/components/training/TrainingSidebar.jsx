export default function TrainingSidebar() {
  return (
    <aside className="agent-training-sidebar">
      <div className="agent-training-sidebar__brand">
        <span className="agent-training-sidebar__badge">
          AI SALES
        </span>

        <h2 className="agent-training-sidebar__title">
          Training Studio IA
        </h2>
      </div>

      <nav className="agent-training-sidebar__nav">
        <button className="agent-training-sidebar__nav-item agent-training-sidebar__nav-item--active">
          Produto
        </button>

        <button className="agent-training-sidebar__nav-item">
          Benefícios
        </button>

        <button className="agent-training-sidebar__nav-item">
          Objeções
        </button>

        <button className="agent-training-sidebar__nav-item">
          Tom de voz
        </button>
      </nav>
    </aside>
  );
}
