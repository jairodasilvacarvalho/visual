import { Link, useLocation } from "react-router-dom";

export default function DashboardLayout({ children }) {
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Leads", path: "/leads" },
    { label: "Conversas", path: "/conversas" },
    { label: "Treinar Agente", path: "/agent-training" },
    { label: "Métricas", path: "/metricas" },
    { label: "Agenda", path: "/agenda" },
    { label: "Logs", path: "/logs" },
    { label: "Configurações", path: "/configuracoes" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0B0F14] text-white">
      <aside className="w-64 bg-[#111827] border-r border-white/10 flex flex-col p-6">
        
        <Link to="/" className="text-2xl font-bold mb-10 hover:opacity-80 transition">
          AI Sales
        </Link>

        <nav className="flex flex-col gap-2 text-sm">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={
                  active
                    ? "px-4 py-2 rounded-lg bg-blue-500/15 border border-blue-500/40 text-white font-semibold shadow-lg shadow-blue-500/10"
                    : "px-4 py-2 rounded-lg text-gray-300 transition-all duration-200 hover:bg-white/5 hover:text-white hover:translate-x-1 hover:shadow-md hover:shadow-black/30"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 text-sm text-gray-400">
          Plano Pro
        </div>

      </aside>

      <div className="flex-1 flex flex-col">
        
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0B0F14]">
          <h1 className="text-lg font-semibold">Dashboard</h1>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">Olá, usuário</div>
            <div className="w-9 h-9 rounded-full bg-blue-500"></div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>

      </div>
    </div>
  );
}
