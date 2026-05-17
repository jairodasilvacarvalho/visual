import { useEffect, useState } from "react";

export default function ChatPreview() {
  const messages = [
    { type: "user", text: "Oi, isso funciona mesmo?", time: "09:18" },
    { type: "bot", text: "Sim! Eu respondo seus leads automaticamente e faço follow-up por você.", time: "09:18" },
    { type: "user", text: "Mas ajuda a vender de verdade?", time: "09:19" },
    { type: "bot", text: "Ajuda sim. A ideia é não deixar nenhum lead esfriar e conduzir a conversa até a compra.", time: "09:19" },
    { type: "user", text: "Como começo?", time: "09:20" },
    { type: "bot", text: "Clique em Começar agora e ative seu agente em poucos minutos.", time: "09:20" }
  ];

  const [visibleMessages, setVisibleMessages] = useState([]);
  const [index, setIndex] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (index < messages.length) {
      setTyping(true);

      const typingTimer = setTimeout(() => {
        setTyping(false);
        setVisibleMessages((prev) => [...prev, messages[index]]);
        setIndex((prev) => prev + 1);
      }, 1800);

      return () => clearTimeout(typingTimer);
    }

    const resetTimer = setTimeout(() => {
      setVisibleMessages([]);
      setIndex(0);
    }, 3500);

    return () => clearTimeout(resetTimer);
  }, [index]);

  return (
    <div className="w-[266px] h-[540px] rounded-[38px] bg-[#050505] border border-white/10 shadow-2xl shadow-blue-500/20 p-3 flex flex-col overflow-hidden">
      <div className="bg-[#101820] rounded-t-[30px] px-4 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            AI
          </div>

          <div>
            <p className="font-semibold text-sm">Agente IA</p>
            <p className="text-xs text-green-400">online agora</p>
          </div>
        </div>

        <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-lg shadow-green-400/50"></div>
      </div>

      <div className="flex-1 bg-[#0B141A] px-3 py-4 flex flex-col justify-end gap-3 overflow-hidden">
        {visibleMessages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-1.5 text-sm leading-relaxed ${
                message.type === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-[#1F2C34] text-white rounded-bl-sm"
              }`}
            >
              <p>{message.text}</p>
              <p className="text-[10px] text-white/50 text-right mt-1">{message.time}</p>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-[#1F2C34] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#101820] rounded-b-[30px] p-3 border-t border-white/10">
        <div className="bg-[#1F2C34] rounded-full px-4 py-3 text-sm text-gray-400">
          Mensagem
        </div>
      </div>
    </div>
  );
}

