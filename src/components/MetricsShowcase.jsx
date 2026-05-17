export default function MetricsShowcase() {
  const metrics = [
    {
      value: "+R$ 48.320",
      label: "em vendas geradas",
      description: "Receita estimada recuperada com atendimento e follow-up automático."
    },
    {
      value: "3.281",
      label: "leads atendidos",
      description: "Conversas respondidas sem depender de atendimento manual imediato."
    },
    {
      value: "92%",
      label: "taxa de resposta",
      description: "Mais velocidade para responder, qualificar e manter o lead aquecido."
    },
    {
      value: "18s",
      label: "tempo médio",
      description: "Respostas rápidas para reduzir abandono e aumentar oportunidades."
    }
  ];

  return (
    <section className="px-8 py-20">
      <div className="max-w-6xl mx-auto rounded-[12px] border border-white/5 bg-[#101827]/80 p-8 md:p-10 shadow-2xl shadow-blue-500/10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <p className="text-[#5a8fe0] font-semibold mb-4 text-[12px] tracking-[0.18em] uppercase">PERFORMANCE OPERACIONAL</p>
            <h3 className="text-3xl md:text-4xl font-bold mb-3">
              Resultados impulsionados por IA
            </h3>
            <p className="text-gray-400 max-w-2xl">
              Métricas estratégicas que demonstram a eficiência operacional, velocidade de resposta e crescimento impulsionado por IA.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-5 py-4">
            <p className="text-sm text-blue-300 font-semibold">Painel em tempo real</p>
            <p className="text-xs text-gray-400 mt-1">dados simulados para demonstracao</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 transition duration-300"
            >
              <p className="text-3xl font-extrabold text-white mb-2">{item.value}</p>
              <p className="text-blue-300 font-semibold mb-3">{item.label}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
