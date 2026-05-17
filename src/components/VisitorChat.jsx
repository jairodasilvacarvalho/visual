import { useState } from "react";

export default function VisitorChat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-7 right-7 z-50 w-14 h-14 rounded-\[12px\] bg-blue-500 hover:bg-blue-600 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center transition hover:scale-105 border border-white/10"
          aria-label="Abrir chat"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          </svg>
        </button>
      )}

      {open && (
        <div className="fixed bottom-24 right-7 z-50 w-[340px] overflow-hidden rounded-\[12px\] border border-white/10 bg-[#101827] text-white shadow-2xl shadow-blue-500/10">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="font-bold">Assistente IA</p>
              <p className="text-xs text-green-400">online agora</p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-\[10px\] bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition flex items-center justify-center"
              aria-label="Fechar chat"
            >
              X
            </button>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-sm leading-relaxed text-gray-300">
              Quer ver como essa IA funcionaria no seu negocio?
            </p>

            <button className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 px-4 py-3 text-sm font-semibold transition shadow-lg shadow-blue-500/20">
              Ver no meu negocio
            </button>

            <button className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm font-semibold transition">
              Quero implementar isso
            </button>

            <button className="w-full rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-3 text-sm font-semibold transition">
              Tenho duvidas
            </button>
          </div>
        </div>
      )}
    </>
  );
}
