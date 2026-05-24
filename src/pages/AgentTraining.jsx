import { useState } from "react";
import { Save, RotateCcw } from "lucide-react";
import TrainingChatWindow from "../components/training/TrainingChatWindow";
import TrainingInput from "../components/training/TrainingInput";
import TrainingProgress from "../components/training/TrainingProgress";
import TrainingSidebar from "../components/training/TrainingSidebar";
import TrainingInsightPanel from "../components/training/TrainingInsightPanel";
import "../styles/training/agent-training.css";

export default function AgentTraining() {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content: "Vamos começar o treinamento. Qual o nome do seu produto?"
    }
  ]);

  function handleSendMessage() {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        role: "user",
        content: trimmedValue
      }
    ]);

    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Perfeito. Agora me explique quais os principais benefícios do seu produto."
        }
      ]);

      setIsTyping(false);
    }, 2200);
  }

  return (
    <main className="agent-training-page">
      <section className="agent-training-shell">
        <TrainingSidebar />

        <section className="agent-training-main-panel">
          <header className="agent-training-main-header">
            <div>
              <h1>Treinamento do Agente de Vendas IA</h1>
              <p>Treine seu agente para ser mais assertivo, persuasivo e eficiente.</p>
            </div>

            <button className="agent-training-save-button" type="button">
              <Save size={16} />
              Salvar Treinamento
            </button>
          </header>

          <TrainingProgress />

          <div className="agent-training-agent-selector">
            <span>Agente selecionado:</span>

            <select defaultValue="ortopedia">
              <option value="ortopedia">Vendedor IA - Ortopedia</option>
            </select>

            <button className="agent-training-reset-button" type="button">
              <RotateCcw size={15} />
              Redefinir conversa
            </button>
          </div>

          <div className="agent-training-conversation-panel">
            <TrainingChatWindow messages={messages} isTyping={isTyping} />

            <TrainingInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
            />
          </div>

          <p className="agent-training-conversation-panel__footer-note">
            As conversas são salvas automaticamente durante o treinamento.
          </p>
        </section>

        <TrainingInsightPanel />
      </section>
    </main>
  );
}
