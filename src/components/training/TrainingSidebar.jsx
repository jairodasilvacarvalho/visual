import {
  BarChart3,
  BookOpen,
  Bot,
  History,
  LayoutDashboard,
  MessageSquareText,
  PlugZap,
  Settings,
  Smile,
  UserRound,
  Zap
} from "lucide-react";

const groups = [
  {
    title: "PLATAFORMA",
    items: [
      { label: "Dashboard", icon: LayoutDashboard },
      { label: "Treinamento", icon: MessageSquareText, active: true },
      { label: "Base de Conhecimento", icon: BookOpen },
      { label: "Desempenho", icon: BarChart3 },
      { label: "Histórico", icon: History }
    ]
  },
  {
    title: "AGENTES",
    items: [
      { label: "Agentes", icon: UserRound },
      { label: "Personalidade", icon: Smile },
      { label: "Canais", icon: Bot }
    ]
  },
  {
    title: "CONFIGURAÇÕES",
    items: [
      { label: "Integrações", icon: PlugZap },
      { label: "Configurações", icon: Settings }
    ]
  }
];

export default function TrainingSidebar() {
  return (
    <aside className="agent-training-sidebar">
      <div className="agent-training-sidebar__brand">
        <div className="agent-training-sidebar__logo">
          <Zap size={24} fill="currentColor" />
        </div>

        <strong>Training Studio IA</strong>
      </div>

      <nav className="agent-training-sidebar__nav" aria-label="Menu do Training Studio IA">
        {groups.map((group) => (
          <section className="agent-training-sidebar__group" key={group.title}>
            <p className="agent-training-sidebar__group-title">{group.title}</p>

            <div className="agent-training-sidebar__group-items">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    className={`agent-training-sidebar__nav-item${
                      item.active ? " agent-training-sidebar__nav-item--active" : ""
                    }`}
                    type="button"
                    key={item.label}
                  >
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </nav>

      <div className="agent-training-sidebar__user">
        <div className="agent-training-sidebar__avatar">J</div>

        <div>
          <strong>João Silva</strong>
          <span>Administrador</span>
        </div>
      </div>
    </aside>
  );
}
