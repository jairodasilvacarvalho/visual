export default function Footer() {
  return (
    <footer className="px-8 pt-20 pb-10 border-t border-white/12 mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <h2 className="text-xl font-bold mb-4">AI Sales</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Automação inteligente para vendas no WhatsApp com IA que responde,
              negocia e recupera oportunidades automaticamente.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">Produto</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer transition duration-200 hover:translate-x-1">Funcionalidades</li>
              <li className="hover:text-white cursor-pointer transition duration-200 hover:translate-x-1">Planos</li>
              <li className="hover:text-white cursor-pointer transition duration-200 hover:translate-x-1">Demonstração</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">Empresa</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer transition duration-200 hover:translate-x-1">Sobre</li>
              <li className="hover:text-white cursor-pointer transition duration-200 hover:translate-x-1">Contato</li>
              <li className="hover:text-white cursor-pointer transition duration-200 hover:translate-x-1">Suporte</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-white">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="hover:text-white cursor-pointer transition duration-200 hover:translate-x-1">Privacidade</li>
              <li className="hover:text-white cursor-pointer transition duration-200 hover:translate-x-1">Termos</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/12 pt-6">
          <div>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} AI Sales. Todos os direitos reservados.
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Plataforma em evolução contínua.
            </p>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-[14px] transition shadow-lg shadow-blue-500/10">
            Começar agora
          </button>
        </div>
      </div>
    </footer>
  );
}
