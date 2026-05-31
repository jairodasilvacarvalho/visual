import { useState } from "react";
import { Save, RotateCcw, Pencil } from "lucide-react";
import TrainingChatWindow from "../components/training/TrainingChatWindow";
import TrainingInput from "../components/training/TrainingInput";
import TrainingProgress from "../components/training/TrainingProgress";
import TrainingSidebar from "../components/training/TrainingSidebar";
import TrainingInsightPanel from "../components/training/TrainingInsightPanel";
import "../styles/training/agent-training.css";

const API_BASE_URL = "http://localhost:3000";

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: "assistant",
    content: "Vamos começar o treinamento. Qual o nome do seu produto?"
  }
];

const AGENT_TYPE_OPTIONS = [
  { value: "clinicas", label: "Atendente/Vendedor IA - Clínicas" },
  { value: "infoprodutos", label: "Vendedor IA - Infoprodutos" },
  { value: "produtos-fisicos", label: "Vendedor IA - Produtos Físicos" },
  { value: "servicos-locais", label: "Atendente IA - Serviços Locais" },
  { value: "recuperacao", label: "Recuperador IA - Leads e Carrinho" },
  { value: "pos-venda", label: "Suporte IA - Pós-venda" },
  { value: "outro", label: "Agente Personalizado" }
];

export default function AgentTraining() {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");
  const [selectedAgentType, setSelectedAgentType] = useState("clinicas");
  const [customAgentType, setCustomAgentType] = useState("");
  const [confirmedCustomAgentType, setConfirmedCustomAgentType] = useState("");
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);

  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  function handleResetConversation() {
    setMessages(INITIAL_MESSAGES);
    setInputValue("");
    setIsTyping(false);
  }

  function handleConfirmCustomAgentType() {
    const trimmedValue = customAgentType.trim();

    if (!trimmedValue) {
      return;
    }

    setConfirmedCustomAgentType(trimmedValue);
  }

  function buildTrainingPayload() {
    const userMessages = messages.filter((message) => message.role === "user");
    const firstUserMessage = userMessages[0]?.content?.trim();

    return {
      userId: 1,
      productName: firstUserMessage || "Treinamento do Agente de Vendas IA",
      trainingData: {
        agentType: selectedAgentType === "outro" ? "custom" : selectedAgentType,
        customAgentType: selectedAgentType === "outro" ? confirmedCustomAgentType : null,
        source: "agent-training-frontend",
        messages
      },
      finalPrompt: messages
        .map((message) => `${message.role === "assistant" ? "IA" : "Usuário"}: ${message.content}`)
        .join("\n")
    };
  }

  async function handleSaveTraining() {
    try {
      setIsSaving(true);
      setSaveFeedback("");

      const response = await fetch(`${API_BASE_URL}/agent-training/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(buildTrainingPayload())
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Erro ao salvar treinamento.");
      }

      setSaveFeedback("Treinamento salvo com sucesso."); setIsSaving(false); setTimeout(() => setSaveFeedback(""), 2200);
    } catch (error) {
      setSaveFeedback(error.message || "Não foi possível salvar o treinamento.");
    } finally {
      setIsSaving(false);
    }
  }

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

            <button
              className="agent-training-save-button"
              type="button"
              onClick={handleSaveTraining}
              disabled={isSaving}
            >
              <Save size={16} />
              {isSaving ? "Salvando..." : saveFeedback ? "Salvo ✓" : "Salvar Treinamento"}
            </button>
          </header>

          <TrainingProgress />

          <div className="agent-training-agent-selector">
            <span>Agente selecionado:</span>

            {selectedAgentType === "outro" ? (
              confirmedCustomAgentType ? (
                <div className="agent-training-custom-agent-badge">
                  <span>{confirmedCustomAgentType}</span>
                  <button className="agent-training-custom-agent-edit-button" type="button" onClick={() => setConfirmedCustomAgentType("")} aria-label="Editar agente personalizado">
                    <Pencil size={14} />
                  </button>
                </div>
              ) : (
                <div className="agent-training-custom-agent-field">
                  <input
                    className="agent-training-custom-agent-input"
                    type="text"
                    value={customAgentType}
                    onChange={(event) => setCustomAgentType(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleConfirmCustomAgentType();
                      }
                    }}
                    placeholder="Digite o tipo de agente"
                    autoFocus
                  />

                  <button className="agent-training-custom-agent-send-button" type="button" onClick={handleConfirmCustomAgentType} aria-label="Confirmar agente personalizado">
                    <svg
                      className="agent-training-custom-agent-send-icon"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M4 12L20 4L16 20L12.5 13.5L4 12Z" />
                    </svg>
                  </button>
                </div>
              )
            ) : (
              <select value={selectedAgentType} onChange={(event) => setSelectedAgentType(event.target.value)}>
                <option value="clinicas">Atendente/Vendedor IA - Clínicas</option>
                <option value="infoprodutos">Vendedor IA - Infoprodutos</option>
                <option value="produtos-fisicos">Vendedor IA - Produtos Físicos</option>
                <option value="servicos-locais">Atendente IA - Serviços Locais</option>
                <option value="recuperacao">Recuperador IA - Leads e Carrinho</option>
                <option value="pos-venda">Suporte IA - Pós-venda</option>
                <option value="outro">Agente Personalizado</option>
              </select>
            )}

            <button className="agent-training-reset-button" type="button" onClick={handleResetConversation}>
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
            {saveFeedback || "As conversas são salvas automaticamente durante o treinamento."}
          </p>
        </section>

        <TrainingInsightPanel />
      </section>
    </main>
  );
}




















