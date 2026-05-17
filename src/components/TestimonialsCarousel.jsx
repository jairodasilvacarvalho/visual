export default function TestimonialsCarousel() {
  const testimonials = [
    {
      name: "Carlos Mendes",
      role: "Gestor comercial",
      metric: "1.284 leads atendidos",
      text: "O follow-up automático recuperou contatos que antes esfriavam no WhatsApp."
    },
    {
      name: "Ana Souza",
      role: "Empreendedora",
      metric: "+38% em conversão",
      text: "A IA passou a responder meus leads automaticamente e parei de perder vendas por demora."
    },
    {
      name: "Marina Lopes",
      role: "Infoprodutora",
      metric: "24h vendendo",
      text: "Meus leads recebem resposta mesmo fora do horário comercial. Isso mudou minha operação."
    },
    {
      name: "Rafael Lima",
      role: "Agência de tráfego",
      metric: "+27% em vendas",
      text: "O atendimento ficou rápido, organizado e muito mais fácil de escalar."
    }
  ];

  const duplicated = [...testimonials, ...testimonials];

  return (
    <section id="depoimentos" className="px-8 py-24 relative overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.10),transparent_58%)] pointer-events-none"></div><div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-[#030816] to-transparent z-10 pointer-events-none"></div><div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-[#030816] to-transparent z-10 pointer-events-none"></div>
      <div className="max-w-4xl mx-auto text-center mb-8">
        <p className="text-[#5a8fe0] font-semibold mb-2 text-sm tracking-wide">RESULTADOS REAIS</p>
        <h3 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] mb-5 text-white\/95">Quem usa, vende mais</h3>
        <p className="text-gray-400 text-sm md:text-base">
          Empresas aumentando conversão, velocidade de resposta e faturamento com automação inteligente.
        </p>
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-[#070B12] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-[#070B12] to-transparent z-10"></div>

        <div className="flex gap-16 w-max animate-[testimonialMarquee_52s_linear_infinite]">
          {duplicated.map((item, index) => (
            <div key={index} className="w-[680px] shrink-0">
              
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.role}</p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-400/20">
                  {item.metric}
                </span>
              </div>

              <p className="text-base md:text-lg text-white leading-tight font-medium">
                “{item.text}”
              </p>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
