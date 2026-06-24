import { useState, useEffect, useRef } from "react";
import { Save, RotateCcw, Pencil, ChevronDown } from "lucide-react";
import TrainingChatWindow from "../components/training/TrainingChatWindow";
import TrainingInput from "../components/training/TrainingInput";
import TrainingProgress from "../components/training/TrainingProgress";
import TrainingSidebar from "../components/training/TrainingSidebar";
import TrainingInsightPanel from "../components/training/TrainingInsightPanel";
import { getCurrentUserId } from "../services/currentUser";
import "../styles/training/agent-training.css";

const API_BASE_URL = "http://localhost:3000";

const AGENT_TYPE_REQUIRED_MESSAGE = "Antes de começar, escolha acima o tipo de agente que você quer treinar.";
const AGENT_TYPE_BLOCKED_MESSAGE = "Escolha primeiro o tipo de agente no botão acima.";
const TRAININGS_CHOICE_MESSAGE = "Selecione um treinamento salvo ou comece um novo.";
const INITIAL_MESSAGES = [{
  id: "agent-type-required",
  role: "assistant",
  content: AGENT_TYPE_REQUIRED_MESSAGE
}];

const AGENT_TYPE_OPTIONS = [
  { value: "clinicas", label: "Atendente/Vendedor IA - Clínicas" },
  { value: "infoprodutos", label: "Vendedor IA - Infoprodutos" },
  { value: "produtos-fisicos", label: "Vendedor IA - Produtos Físicos" },
  { value: "servicos-locais", label: "Atendente IA - Serviços Locais" },
  { value: "recuperacao", label: "Recuperador IA - Leads e Carrinho" },
  { value: "pos-venda", label: "Suporte IA - Pós-venda" },
  { value: "outro", label: "Agente Personalizado" }
];

const TONE_OF_VOICE_OPTIONS = [
  "Simples",
  "Empático",
  "Profissional",
  "Consultivo",
  "Direto",
  "Premium",
  "Amigável",
  "Acolhedor"
];

const TRAINING_PROGRESS_FIELDS = [
  "productName",
  "conversionLink",
  "description",
  "targetAudience",
  "benefits",
  "differentials",
  "price",
  "guarantee",
  "objections",
  "toneOfVoice"
];

function hasTrainingValue(value) {
  if (Array.isArray(value)) {
    return value.some((item) => String(item || "").trim());
  }

  return Boolean(String(value || "").trim());
}

function isCompatibleTraining(training) {
  const restoredTrainingData = training?.training_data ?? {};
  const restoredFinalPrompt = training?.final_prompt ?? "";

  return Boolean(
    training?.training_data &&
    restoredTrainingData.product &&
    restoredTrainingData.salesBase &&
    restoredTrainingData.agent?.agentType &&
    restoredFinalPrompt &&
    (
      restoredFinalPrompt.includes("OBJETIVO DO AGENTE") ||
      restoredFinalPrompt.includes("REGRAS DE ATENDIMENTO")
    )
  );
}

function getTrainingDisplayName(training) {
  return training?.product_name
    || training?.training_data?.product?.productName
    || training?.training_data?.product?.name
    || "Treinamento sem nome";
}

function getTrainingMeta(training) {
  const agentType = training?.training_data?.agent?.agentType;
  const createdAtDate = training?.created_at ? new Date(training.created_at) : null;
  const createdAt = createdAtDate && !Number.isNaN(createdAtDate.getTime())
    ? createdAtDate.toLocaleDateString("pt-BR")
    : "";

  return [agentType, createdAt ? `Criado em ${createdAt}` : ""]
    .filter(Boolean)
    .join(" • ");
}

function isProductionTraining(training) {
  return Number(training?.active_for_production || 0) === 1;
}

export default function AgentTraining() {
  const currentUserId = getCurrentUserId();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState("");
  const [selectedAgentType, setSelectedAgentType] = useState("");
  const [customAgentType, setCustomAgentType] = useState("");
  const [confirmedCustomAgentType, setConfirmedCustomAgentType] = useState("");
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(null);
  const [trainingData, setTrainingData] = useState({});
  const [finalAgentPrompt, setFinalAgentPrompt] = useState("");
  const [nextField, setNextField] = useState(null);
  const [selectedTones, setSelectedTones] = useState([]);
  const [availableTrainings, setAvailableTrainings] = useState([]);
  const [isTrainingListModalOpen, setIsTrainingListModalOpen] = useState(false);
  const [currentTrainingId, setCurrentTrainingId] = useState(null);
  const [currentTraining, setCurrentTraining] = useState(null);
  const [selectingProductionId, setSelectingProductionId] = useState(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const agentDropdownRef = useRef(null);
  const hasStartedRef = useRef(false);
  const currentStepRef = useRef(null);
  const trainingDataRef = useRef({});

  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const isAgentTypeReady = Boolean(
    selectedAgentType &&
    (selectedAgentType !== "outro" || confirmedCustomAgentType.trim())
  );
  const completedFields = {
    productName: hasTrainingValue(trainingData.product?.productName),
    conversionLink: hasTrainingValue(trainingData.product?.checkoutLink),
    description: hasTrainingValue(trainingData.product?.description),
    targetAudience: hasTrainingValue(trainingData.audience?.targetAudience),
    benefits: hasTrainingValue(trainingData.salesBase?.benefits),
    differentials: hasTrainingValue(trainingData.salesBase?.differentials),
    price: hasTrainingValue(trainingData.commercial?.price),
    guarantee: hasTrainingValue(trainingData.commercial?.guarantee),
    objections: hasTrainingValue(trainingData.audience?.objections),
    toneOfVoice: hasTrainingValue(trainingData.salesBase?.toneOfVoice)
  };
  const completedFieldCount = isAgentTypeReady
    ? TRAINING_PROGRESS_FIELDS.filter((field) => completedFields[field]).length
    : 0;
  const trainingProgress = Math.round(
    (completedFieldCount / TRAINING_PROGRESS_FIELDS.length) * 100
  );

  function syncTrainingState(data) {
    const nextTrainingData = data.trainingData ?? {};
    const nextCurrentStep = data.currentStep ?? null;
    const resolvedNextField = data.nextField
      ?? nextTrainingData.metadata?.editingField
      ?? null;

    trainingDataRef.current = nextTrainingData;
    currentStepRef.current = nextCurrentStep;
    setTrainingData(nextTrainingData);
    setCurrentStep(nextCurrentStep);
    setNextField(resolvedNextField);
  }

  function requireCurrentUserId() {
    if (!currentUserId) {
      throw new Error("Usuário atual não identificado.");
    }

    return currentUserId;
  }

  function waitForAgentType() {
    currentStepRef.current = null;
    trainingDataRef.current = {};
    setCurrentStep(null);
    setTrainingData({});
    setFinalAgentPrompt("");
    setNextField(null);
    setSelectedTones([]);
    setAvailableTrainings([]);
    setIsTrainingListModalOpen(false);
    setCurrentTrainingId(null);
    setCurrentTraining(null);
    setIsRenameModalOpen(false);
    setRenameValue("");
    setMessages(INITIAL_MESSAGES);
  }

  const isChoosingTraining = availableTrainings.length > 0;
  const latestTraining = availableTrainings[0] ?? null;
  const hasOtherTrainings = availableTrainings.length > 1;
  const isCurrentTrainingProduction = isProductionTraining(currentTraining);
  const currentTrainingName = currentTraining
    ? getTrainingDisplayName(currentTraining)
    : trainingData.product?.productName || "";

  function showTrainingChoices(trainings) {
    currentStepRef.current = null;
    trainingDataRef.current = {};
    setCurrentStep(null);
    setTrainingData({});
    setFinalAgentPrompt("");
    setNextField(null);
    setSelectedTones([]);
    setSelectedAgentType("");
    setCustomAgentType("");
    setConfirmedCustomAgentType("");
    setAvailableTrainings(trainings);
    setCurrentTraining(null);
    setIsTrainingListModalOpen(false);
    setIsRenameModalOpen(false);
    setRenameValue("");
    setMessages([{
      id: "training-list-available",
      role: "assistant",
      content: TRAININGS_CHOICE_MESSAGE
    }]);
  }

  function handleRestoreTraining(training) {
    if (!training) {
      return;
    }

    const restoredTrainingData = training.training_data;
    const restoredFinalPrompt = training.final_prompt;
    const restoredAgentType = restoredTrainingData.agent.agentType;
    const restoredCustomAgentType = restoredTrainingData.agent.customAgentType ?? "";

    syncTrainingState({
      currentStep: restoredTrainingData.metadata?.currentStep ?? 3,
      trainingData: restoredTrainingData,
      nextField: restoredTrainingData.metadata?.editingField ?? null
    });
    setFinalAgentPrompt(restoredFinalPrompt);
    setSelectedAgentType(restoredAgentType === "custom" ? "outro" : restoredAgentType);
    setConfirmedCustomAgentType(restoredCustomAgentType);
    setCustomAgentType(restoredCustomAgentType);
    setSelectedTones([]);
    setAvailableTrainings([]);
    setIsTrainingListModalOpen(false);
    setIsRenameModalOpen(false);
    setRenameValue("");
    setCurrentTrainingId(training.id ?? null);
    setCurrentTraining(training);
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content: restoredFinalPrompt
      },
      {
        id: Date.now() + 1,
        role: "assistant",
        content: "Você pode pedir uma alteração específica ou salvar o treinamento."
      }
    ]);
  }

  function handleNewTraining() {
    setAvailableTrainings([]);
    setIsTrainingListModalOpen(false);
    setCurrentTrainingId(null);
    setCurrentTraining(null);
    setIsRenameModalOpen(false);
    setRenameValue("");
    setSelectedAgentType("");
    setCustomAgentType("");
    setConfirmedCustomAgentType("");
    setInputValue("");
    waitForAgentType();
  }

  function showAgentTypeBlockedMessage() {
    setMessages((currentMessages) => {
      if (currentMessages.at(-1)?.content === AGENT_TYPE_BLOCKED_MESSAGE) {
        return currentMessages;
      }

      return [
        ...currentMessages,
        {
          id: Date.now(),
          role: "assistant",
          content: AGENT_TYPE_BLOCKED_MESSAGE
        }
      ];
    });
  }

  async function startTraining(agentType = selectedAgentType, customType = confirmedCustomAgentType) {
    if (!agentType || (agentType === "outro" && !customType.trim())) {
      waitForAgentType();
      return;
    }

    try {
      setAvailableTrainings([]);
      setIsTrainingListModalOpen(false);
      setCurrentTrainingId(null);
      setCurrentTraining(null);
      setIsTyping(true);

      const response = await fetch(`${API_BASE_URL}/agent-training/start`);
      const result = await response.json();
      const data = result.data ?? result;

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Erro ao iniciar treinamento.");
      }

      syncTrainingState(data);
      setFinalAgentPrompt("");
      setSelectedTones([]);
      setMessages(data.nextQuestion
        ? [{
            id: Date.now(),
            role: "assistant",
            content: data.nextQuestion
          }]
        : []);
    } catch (error) {
      setMessages([{
        id: Date.now(),
        role: "assistant",
        content: error.message || "Não foi possível iniciar o treinamento."
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  async function loadUserTrainings() {
    try {
      const userId = requireCurrentUserId();

      setIsTyping(true);

      const response = await fetch(`${API_BASE_URL}/agent-training/user/${encodeURIComponent(userId)}`);
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Erro ao buscar treinamentos.");
      }

      const compatibleTrainings = (result.trainings || []).filter(isCompatibleTraining);

      if (!compatibleTrainings.length) {
        setAvailableTrainings([]);
        waitForAgentType();
        return;
      }

      showTrainingChoices(compatibleTrainings);
    } catch (error) {
      console.error("Não foi possível listar os treinamentos:", error);
      setAvailableTrainings([]);
      waitForAgentType();
      setMessages([{
        id: Date.now(),
        role: "assistant",
        content: error.message || "Não foi possível listar os treinamentos."
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
    loadUserTrainings();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!agentDropdownRef.current || agentDropdownRef.current.contains(event.target)) {
        return;
      }

      setIsAgentDropdownOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  async function handleResetConversation() {
    setAvailableTrainings([]);
    setIsTrainingListModalOpen(false);
    setCurrentTrainingId(null);
    setCurrentTraining(null);
    setMessages(INITIAL_MESSAGES);
    setInputValue("");
    currentStepRef.current = null;
    trainingDataRef.current = {};
    setCurrentStep(null);
    setTrainingData({});
    setFinalAgentPrompt("");
    setNextField(null);
    setSelectedTones([]);
    if (isAgentTypeReady) {
      await startTraining();
    } else {
      waitForAgentType();
    }
  }

  async function handleConfirmCustomAgentType() {
    const trimmedValue = customAgentType.trim();

    if (!trimmedValue) {
      return;
    }

    setConfirmedCustomAgentType(trimmedValue);
    await startTraining("outro", trimmedValue);
  }

  function buildTrainingPayload() {
    return {
      userId: requireCurrentUserId(),
      productName: currentTraining?.product_name || trainingData.product?.productName || "Treinamento do Agente de Vendas IA",
      trainingData,
      finalPrompt: finalAgentPrompt
    };
  }

  async function handleConfirmRename() {
    const nextName = renameValue.trim();

    if (!currentTrainingId || !nextName || isRenaming) {
      return;
    }

    try {
      const userId = requireCurrentUserId();

      setIsRenaming(true);
      setSaveFeedback("");

      const response = await fetch(`${API_BASE_URL}/agent-training/user/${encodeURIComponent(userId)}/${currentTrainingId}/name`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          productName: nextName
        })
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Erro ao renomear treinamento.");
      }

      setCurrentTraining((training) => ({
        ...(training || { id: currentTrainingId }),
        product_name: nextName,
        training_data: trainingData,
        final_prompt: finalAgentPrompt
      }));
      setAvailableTrainings((trainings) => trainings.map((training) => (
        String(training.id) === String(currentTrainingId)
          ? { ...training, product_name: nextName }
          : training
      )));
      setIsRenameModalOpen(false);
      setRenameValue("");
      setSaveFeedback("Treinamento renomeado.");
      setTimeout(() => setSaveFeedback(""), 2200);
    } catch (error) {
      setSaveFeedback(error.message || "Não foi possível renomear o treinamento.");
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleSaveTraining() {
    try {
      const userId = requireCurrentUserId();

      setIsSaving(true);
      setSaveFeedback("");

      const saveUrl = currentTrainingId
        ? `${API_BASE_URL}/agent-training/user/${encodeURIComponent(userId)}/${currentTrainingId}`
        : `${API_BASE_URL}/agent-training/save`;
      const saveMethod = currentTrainingId ? "PUT" : "POST";

      const response = await fetch(saveUrl, {
        method: saveMethod,
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(buildTrainingPayload())
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Erro ao salvar treinamento.");
      }

      if (!currentTrainingId && result.trainingId) {
        setCurrentTrainingId(result.trainingId);
        setCurrentTraining({
          id: result.trainingId,
          product_name: buildTrainingPayload().productName,
          training_data: trainingData,
          final_prompt: finalAgentPrompt,
          active_for_production: 0
        });
      }

      setSaveFeedback("Treinamento salvo com sucesso."); setIsSaving(false); setTimeout(() => setSaveFeedback(""), 2200);
    } catch (error) {
      setSaveFeedback(error.message || "Não foi possível salvar o treinamento.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSelectTrainingForProduction(trainingId) {
    if (!trainingId || selectingProductionId) {
      return;
    }

    try {
      const userId = requireCurrentUserId();

      setSelectingProductionId(trainingId);

      const response = await fetch(`${API_BASE_URL}/agent-training/user/${encodeURIComponent(userId)}/${trainingId}/select-production`, {
        method: "PUT"
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Erro ao selecionar treinamento para produção.");
      }

      setAvailableTrainings((currentTrainings) => currentTrainings.map((training) => ({
        ...training,
        active_for_production: String(training.id) === String(trainingId) ? 1 : 0
      })));
      setCurrentTraining((training) => {
        const loadedTrainingId = training?.id ?? currentTrainingId;

        if (String(loadedTrainingId) !== String(trainingId)) {
          return training;
        }

        return {
          ...(training || { id: trainingId }),
          active_for_production: 1
        };
      });
      setSaveFeedback("Treinamento definido para produção.");
      setTimeout(() => setSaveFeedback(""), 2200);
    } catch (error) {
      setSaveFeedback(error.message || "Não foi possível selecionar o treinamento.");
    } finally {
      setSelectingProductionId(null);
    }
  }

  function handleToneSelection(tone) {
    setSelectedTones((currentTones) => {
      if (currentTones.includes(tone)) {
        return currentTones.filter((currentTone) => currentTone !== tone);
      }

      if (currentTones.length >= 3) {
        return currentTones;
      }

      return [...currentTones, tone];
    });
  }

  function handleConfirmTones() {
    if (!selectedTones.length) {
      return;
    }

    handleSendMessage(selectedTones.map((tone) => tone.toLowerCase()).join(", "));
  }

  async function handleSendMessage(answerOverride) {
    const trimmedValue = typeof answerOverride === "string"
      ? answerOverride.trim()
      : inputValue.trim();

    if (!isAgentTypeReady) {
      showAgentTypeBlockedMessage();
      return;
    }

    if (!trimmedValue || isTyping || currentStepRef.current === null) {
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

    try {
      const agentType = selectedAgentType === "outro"
        ? confirmedCustomAgentType || "custom"
        : selectedAgentType;
      const response = await fetch(`${API_BASE_URL}/agent-training/answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify({
          currentStep: currentStepRef.current,
          answer: trimmedValue,
          trainingData: trainingDataRef.current,
          agentType
        })
      });
      const result = await response.json();
      const data = result.data ?? result;

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Erro ao enviar resposta.");
      }

      syncTrainingState(data);
      setFinalAgentPrompt(data.finalAgentPrompt ?? "");
      setSelectedTones([]);

      const assistantMessages = [];

      if (data.suggestion) {
        assistantMessages.push({
          id: Date.now() + 1,
          role: "assistant",
          content: data.suggestion
        });
      }

      if (data.finalAgentPrompt) {
        assistantMessages.push({
          id: Date.now() + 2,
          role: "assistant",
          content: data.finalAgentPrompt
        });
      }

      if (data.nextQuestion) {
        assistantMessages.push({
          id: Date.now() + 3,
          role: "assistant",
          content: data.nextQuestion
        });
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        ...assistantMessages
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: error.message || "Não foi possível enviar sua resposta."
        }
      ]);
    } finally {
      setIsTyping(false);
    }
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

            <div className="agent-training-main-actions">
              {currentTrainingId && (
                <button
                  className="agent-training-rename-button"
                  type="button"
                  onClick={() => {
                    setRenameValue(currentTrainingName);
                    setIsRenameModalOpen(true);
                  }}
                >
                  Renomear
                </button>
              )}

              {currentTrainingId && isCurrentTrainingProduction && (
                <span className="agent-training-production-badge">Em produção</span>
              )}

              {currentTrainingId && !isCurrentTrainingProduction && (
                <button
                  className="agent-training-production-button"
                  type="button"
                  onClick={() => handleSelectTrainingForProduction(currentTrainingId)}
                  disabled={selectingProductionId === currentTrainingId}
                >
                  {selectingProductionId === currentTrainingId ? "Selecionando..." : "Definir como principal"}
                </button>
              )}

              <button
                className="agent-training-save-button"
                type="button"
                onClick={handleSaveTraining}
                disabled={isSaving || !finalAgentPrompt.trim()}
              >
                <Save size={16} />
                {isSaving ? "Salvando..." : saveFeedback ? "Salvo ✓" : "Salvar Treinamento"}
              </button>
            </div>
          </header>

          <TrainingProgress
            progress={trainingProgress}
            completedFields={completedFields}
          />

          <div className={`agent-training-agent-selector${!isAgentTypeReady ? " agent-training-agent-selector--required" : ""}`}>
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
                    onBlur={() => {
                      if (!customAgentType.trim() && !confirmedCustomAgentType) {
                        setSelectedAgentType("");
                        setCustomAgentType("");
                      }
                    }}
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
              <div className="agent-training-agent-dropdown" ref={agentDropdownRef}>
                <button
                  className="agent-training-agent-dropdown__trigger"
                  type="button"
                  disabled={isChoosingTraining}
                  onClick={() => setIsAgentDropdownOpen((current) => !current)}
                >
                  <span>
                    {(AGENT_TYPE_OPTIONS.find((option) => option.value === selectedAgentType)?.label
                      ?? selectedAgentType)
                      || "Escolha o tipo de agente"}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {isAgentDropdownOpen && (
                  <div className="agent-training-agent-dropdown__menu">
                    {AGENT_TYPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        className={`agent-training-agent-dropdown__option ${selectedAgentType === option.value ? "agent-training-agent-dropdown__option--active" : ""}`}
                        type="button"
                        onClick={() => {
                          setSelectedAgentType(option.value);
                          setIsAgentDropdownOpen(false);

                          if (option.value !== "outro") {
                            setCustomAgentType("");
                            setConfirmedCustomAgentType("");
                            startTraining(option.value);
                          }
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button className="agent-training-reset-button" type="button" onClick={handleResetConversation}>
              <RotateCcw size={15} />
              Redefinir conversa
            </button>
          </div>

          <div className="agent-training-conversation-panel">
            {!isChoosingTraining && (
              <TrainingChatWindow messages={messages} isTyping={isTyping} />
            )}

            {isChoosingTraining && (
              <div className="agent-training-chat-window agent-training-chat-window--empty" aria-hidden="true" />
            )}

            {isChoosingTraining && (
              <div className="agent-training-saved-choice">
                <div className="agent-training-saved-choice__header">
                  <span>Último treinamento</span>
                  <small>Continue de onde parou ou comece um novo treinamento</small>
                </div>

                <div className="agent-training-saved-choice__summary">
                  <div className="agent-training-saved-choice__summary-title">
                    <span>{getTrainingDisplayName(latestTraining)}</span>
                    {isProductionTraining(latestTraining) && (
                      <strong>Em produção</strong>
                    )}
                  </div>
                  {getTrainingMeta(latestTraining) && (
                    <small>{getTrainingMeta(latestTraining)}</small>
                  )}
                </div>

                <div className="agent-training-saved-choice__actions">
                  <button
                    className="agent-training-saved-choice__edit"
                    type="button"
                    onClick={() => handleRestoreTraining(latestTraining)}
                  >
                    Editar treinamento
                  </button>

                  <button
                    className="agent-training-saved-choice__new"
                    type="button"
                    onClick={handleNewTraining}
                  >
                    + Novo treinamento
                  </button>

                  {hasOtherTrainings && (
                    <button
                      className="agent-training-saved-choice__link"
                      type="button"
                      onClick={() => setIsTrainingListModalOpen(true)}
                    >
                      Outros treinamentos
                    </button>
                  )}
                </div>
              </div>
            )}

            {isChoosingTraining && isTrainingListModalOpen && (
              <div className="agent-training-training-modal" role="dialog" aria-modal="true" aria-label="Outros treinamentos">
                <div className="agent-training-training-modal__backdrop" onClick={() => setIsTrainingListModalOpen(false)} />

                <div className="agent-training-training-modal__content">
                  <div className="agent-training-training-modal__header">
                    <div>
                      <span>Seus treinamentos</span>
                      <small>Escolha qual treinamento deseja editar</small>
                    </div>

                    <button
                      className="agent-training-training-modal__close"
                      type="button"
                      onClick={() => setIsTrainingListModalOpen(false)}
                      aria-label="Fechar lista de treinamentos"
                    >
                      ×
                    </button>
                  </div>

                <div className="agent-training-training-modal__list">
                  {availableTrainings.map((training) => (
                    <div
                      key={training.id}
                      className="agent-training-training-modal__item"
                    >
                      <button
                        key={training.id}
                        className="agent-training-saved-choice__item"
                        type="button"
                        onClick={() => handleRestoreTraining(training)}
                      >
                        <span>
                          {getTrainingDisplayName(training)}
                        </span>
                        {getTrainingMeta(training) && (
                          <small>{getTrainingMeta(training)}</small>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            )}

            {isRenameModalOpen && (
              <div className="agent-training-rename-modal" role="dialog" aria-modal="true" aria-label="Renomear treinamento">
                <div className="agent-training-rename-modal__backdrop" onClick={() => setIsRenameModalOpen(false)} />

                <div className="agent-training-rename-modal__content">
                  <div className="agent-training-rename-modal__header">
                    <div>
                      <span>Renomear treinamento</span>
                      <small>Defina um nome para identificar este treinamento.</small>
                    </div>

                    <button
                      className="agent-training-rename-modal__close"
                      type="button"
                      onClick={() => setIsRenameModalOpen(false)}
                      aria-label="Fechar renomeação"
                    >
                      ×
                    </button>
                  </div>

                  <input
                    className="agent-training-rename-modal__input"
                    type="text"
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        handleConfirmRename();
                      }
                    }}
                    autoFocus
                  />

                  <div className="agent-training-rename-modal__actions">
                    <button
                      className="agent-training-rename-modal__secondary"
                      type="button"
                      onClick={() => setIsRenameModalOpen(false)}
                    >
                      Cancelar
                    </button>

                    <button
                      className="agent-training-rename-modal__primary"
                      type="button"
                      onClick={handleConfirmRename}
                      disabled={!renameValue.trim() || isRenaming}
                    >
                      {isRenaming ? "Salvando..." : "Salvar nome"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {nextField === "toneOfVoice" && (
              <div className="agent-training-tone-selector">
                <div className="agent-training-tone-selector__header">
                  <span>Escolha até 3 tons</span>
                  <small>{selectedTones.length}/3 selecionados</small>
                </div>

                <div className="agent-training-tone-selector__options">
                  {TONE_OF_VOICE_OPTIONS.map((tone) => {
                    const isSelected = selectedTones.includes(tone);

                    return (
                      <button
                        key={tone}
                        className={`agent-training-tone-selector__chip${isSelected ? " agent-training-tone-selector__chip--selected" : ""}`}
                        type="button"
                        onClick={() => handleToneSelection(tone)}
                        disabled={!isSelected && selectedTones.length >= 3}
                      >
                        {tone}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="agent-training-tone-selector__confirm"
                  type="button"
                  onClick={handleConfirmTones}
                  disabled={!selectedTones.length || isTyping}
                >
                  Confirmar tons
                </button>
              </div>
            )}

            <TrainingInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendMessage}
              disabled={!isAgentTypeReady || isChoosingTraining}
              onBlockedInteraction={isChoosingTraining ? undefined : showAgentTypeBlockedMessage}
            />
          </div>

          <p className="agent-training-conversation-panel__footer-note">
            {saveFeedback || "As conversas são salvas automaticamente durante o treinamento."}
          </p>
        </section>

        <TrainingInsightPanel
          progress={trainingProgress}
          completedFields={completedFields}
        />
      </section>
    </main>
  );
}































