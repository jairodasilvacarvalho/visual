import { useState, useEffect, useRef } from "react";
import { Save, RotateCcw, Pencil, ChevronDown, History } from "lucide-react";
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

function formatVersionCreatedAt(createdAt) {
  const createdAtDate = createdAt ? new Date(createdAt) : null;

  return createdAtDate && !Number.isNaN(createdAtDate.getTime())
    ? createdAtDate.toLocaleString("pt-BR")
    : "";
}

function parseVersionTrainingData(trainingDataJson) {
  if (!trainingDataJson) {
    return {};
  }

  if (typeof trainingDataJson === "object") {
    return trainingDataJson;
  }

  try {
    return JSON.parse(trainingDataJson);
  } catch {
    return {};
  }
}

function formatVersionValue(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean).join(", ");
  }

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value).trim();
}

function buildVersionDetailSections(version) {
  const data = parseVersionTrainingData(version?.training_data_json);
  const knownTopLevelKeys = new Set(["agent", "product", "commercial", "audience", "salesBase", "metadata", "messages"]);
  const extraFields = Object.entries(data || {})
    .filter(([key]) => !knownTopLevelKeys.has(key))
    .map(([key, value]) => [key, value]);
  const sections = [
    {
      title: "Produto",
      fields: [
        ["Nome", version?.product_name || data?.product?.productName],
        ["Categoria", data?.product?.category],
        ["Segmento", data?.product?.segment],
        ["Subnicho", data?.product?.subniche],
        ["Descrição", data?.product?.description],
        ["Página", data?.product?.pageUrl],
        ["Link de conversão", data?.product?.checkoutLink],
        ["Ação de conversão", data?.product?.conversionAction]
      ]
    },
    {
      title: "Comercial",
      fields: [
        ["Preço", data?.commercial?.price],
        ["Oferta", data?.commercial?.offer],
        ["Garantia", data?.commercial?.guarantee],
        ["Entrega", data?.commercial?.delivery],
        ["Formas de pagamento", data?.commercial?.paymentMethods],
        ["Regras de desconto", data?.commercial?.discountRules],
        ["Regras de negociação", data?.commercial?.negotiationRules]
      ]
    },
    {
      title: "Público",
      fields: [
        ["Público", data?.audience?.targetAudience],
        ["Dores", data?.audience?.pains],
        ["Desejos", data?.audience?.desires],
        ["Objeções", data?.audience?.objections],
        ["Nível de consciência", data?.audience?.awarenessLevel]
      ]
    },
    {
      title: "Base de vendas",
      fields: [
        ["Benefícios", data?.salesBase?.benefits],
        ["Diferenciais", data?.salesBase?.differentials],
        ["Provas", data?.salesBase?.proof],
        ["FAQ", data?.salesBase?.faq],
        ["Claims proibidas", data?.salesBase?.forbiddenClaims],
        ["Tom de voz", data?.salesBase?.toneOfVoice]
      ]
    },
    {
      title: "Agente",
      fields: [
        ["Tipo", data?.agent?.agentType],
        ["Agente personalizado", data?.agent?.customAgentType],
        ["Objetivo", data?.agent?.objective]
      ]
    },
    {
      title: "Metadados",
      fields: Object.entries(data?.metadata || {})
    },
    {
      title: "Mensagens",
      fields: Array.isArray(data?.messages)
        ? data.messages.map((message, index) => [
            `Mensagem ${index + 1}`,
            [
              message?.role ? `Origem: ${message.role}` : "",
              message?.field ? `Campo: ${message.field}` : "",
              message?.content || ""
            ].filter(Boolean).join(" | ")
          ])
        : []
    },
    {
      title: "Outros dados",
      fields: extraFields
    },
    {
      title: "Prompt final",
      fields: [
        ["Prompt", version?.final_prompt]
      ]
    }
  ];

  return sections
    .map((section) => ({
      ...section,
      fields: section.fields
        .map(([label, value]) => [label, formatVersionValue(value)])
        .filter(([, value]) => value)
    }))
    .filter((section) => section.fields.length);
}

function isProductionTraining(training) {
  return Number(training?.active_for_production || 0) === 1;
}

export default function AgentTraining() {
  const currentUserId = getCurrentUserId();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
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
  const [archivedTrainings, setArchivedTrainings] = useState([]);
  const [isViewingArchivedTrainings, setIsViewingArchivedTrainings] = useState(false);
  const [isTrainingListModalOpen, setIsTrainingListModalOpen] = useState(false);
  const [modalFeedback, setModalFeedback] = useState("");
  const [isVersionHistoryModalOpen, setIsVersionHistoryModalOpen] = useState(false);
  const [trainingVersions, setTrainingVersions] = useState([]);
  const [isLoadingTrainingVersions, setIsLoadingTrainingVersions] = useState(false);
  const [versionHistoryFeedback, setVersionHistoryFeedback] = useState("");
  const [isVersionDetailModalOpen, setIsVersionDetailModalOpen] = useState(false);
  const [selectedTrainingVersion, setSelectedTrainingVersion] = useState(null);
  const [loadingTrainingVersionId, setLoadingTrainingVersionId] = useState(null);
  const [versionDetailFeedback, setVersionDetailFeedback] = useState("");
  const [currentTrainingId, setCurrentTrainingId] = useState(null);
  const [currentTraining, setCurrentTraining] = useState(null);
  const [selectingProductionId, setSelectingProductionId] = useState(null);
  const [managingTrainingId, setManagingTrainingId] = useState(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const agentDropdownRef = useRef(null);
  const hasStartedRef = useRef(false);
  const currentStepRef = useRef(null);
  const trainingDataRef = useRef({});
  const modalFeedbackTimeoutRef = useRef(null);

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

  function showModalFeedback(message, duration = 2600) {
    setModalFeedback(message);

    if (modalFeedbackTimeoutRef.current) {
      window.clearTimeout(modalFeedbackTimeoutRef.current);
    }

    modalFeedbackTimeoutRef.current = window.setTimeout(() => {
      setModalFeedback("");
      modalFeedbackTimeoutRef.current = null;
    }, duration);
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
    setArchivedTrainings([]);
    setIsViewingArchivedTrainings(false);
    setIsTrainingListModalOpen(false);
    setModalFeedback("");
    setIsVersionHistoryModalOpen(false);
    setTrainingVersions([]);
    setVersionHistoryFeedback("");
    setIsVersionDetailModalOpen(false);
    setSelectedTrainingVersion(null);
    setLoadingTrainingVersionId(null);
    setVersionDetailFeedback("");
    setCurrentTrainingId(null);
    setCurrentTraining(null);
    setIsRenameModalOpen(false);
    setRenameValue("");
    setMessages(INITIAL_MESSAGES);
  }

  const isChoosingTraining = availableTrainings.length > 0;
  const latestTraining = availableTrainings[0] ?? null;
  const hasOtherTrainings = availableTrainings.length > 1;
  const modalTrainings = isViewingArchivedTrainings ? archivedTrainings : availableTrainings;
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
    setIsViewingArchivedTrainings(false);
    setCurrentTraining(null);
    setIsTrainingListModalOpen(false);
    setModalFeedback("");
    setIsVersionHistoryModalOpen(false);
    setTrainingVersions([]);
    setVersionHistoryFeedback("");
    setIsVersionDetailModalOpen(false);
    setSelectedTrainingVersion(null);
    setLoadingTrainingVersionId(null);
    setVersionDetailFeedback("");
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
    setArchivedTrainings([]);
    setIsViewingArchivedTrainings(false);
    setIsTrainingListModalOpen(false);
    setModalFeedback("");
    setIsVersionHistoryModalOpen(false);
    setTrainingVersions([]);
    setVersionHistoryFeedback("");
    setIsVersionDetailModalOpen(false);
    setSelectedTrainingVersion(null);
    setLoadingTrainingVersionId(null);
    setVersionDetailFeedback("");
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
    setArchivedTrainings([]);
    setIsViewingArchivedTrainings(false);
    setIsTrainingListModalOpen(false);
    setModalFeedback("");
    setIsVersionHistoryModalOpen(false);
    setTrainingVersions([]);
    setVersionHistoryFeedback("");
    setIsVersionDetailModalOpen(false);
    setSelectedTrainingVersion(null);
    setLoadingTrainingVersionId(null);
    setVersionDetailFeedback("");
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
      setArchivedTrainings([]);
      setIsViewingArchivedTrainings(false);
      setIsTrainingListModalOpen(false);
      setModalFeedback("");
      setIsVersionHistoryModalOpen(false);
      setTrainingVersions([]);
      setVersionHistoryFeedback("");
      setIsVersionDetailModalOpen(false);
      setSelectedTrainingVersion(null);
      setLoadingTrainingVersionId(null);
      setVersionDetailFeedback("");
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
        const archived = await loadArchivedTrainings();
        setAvailableTrainings([]);

        if (archived.length) {
          setIsViewingArchivedTrainings(true);
          setIsTrainingListModalOpen(true);
          setMessages([{
            id: "archived-training-list-available",
            role: "assistant",
            content: "Você não tem treinamentos ativos. Veja os arquivados ou comece um novo treinamento."
          }]);
          return;
        }

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

  async function loadArchivedTrainings() {
    const userId = requireCurrentUserId();

    const response = await fetch(`${API_BASE_URL}/agent-training/user/${encodeURIComponent(userId)}/archived`);
    const result = await response.json();

    if (!response.ok || result.success === false) {
      throw new Error(result.message || "Erro ao buscar treinamentos arquivados.");
    }

    const compatibleTrainings = (result.trainings || []).filter(isCompatibleTraining);
    setArchivedTrainings(compatibleTrainings);

    return compatibleTrainings;
  }

  async function handleOpenArchivedTrainings() {
    try {
      setManagingTrainingId("archived-list");
      setModalFeedback("");

      await loadArchivedTrainings();
      setIsViewingArchivedTrainings(true);
      setIsTrainingListModalOpen(true);
      showModalFeedback("Treinamentos arquivados carregados.", 1800);
    } catch (error) {
      setIsTrainingListModalOpen(true);
      showModalFeedback(error.message || "Não foi possível carregar os treinamentos arquivados.");
    } finally {
      setManagingTrainingId(null);
    }
  }

  async function handleOpenVersionHistory() {
    if (!currentTrainingId || isLoadingTrainingVersions) {
      return;
    }

    try {
      const userId = requireCurrentUserId();

      setIsVersionHistoryModalOpen(true);
      setIsLoadingTrainingVersions(true);
      setTrainingVersions([]);
      setVersionHistoryFeedback("");

      const response = await fetch(`${API_BASE_URL}/agent-training/user/${encodeURIComponent(userId)}/${currentTrainingId}/versions`);
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Erro ao buscar histórico de versões.");
      }

      setTrainingVersions(result.versions || []);
    } catch (error) {
      setVersionHistoryFeedback(error.message || "Não foi possível carregar o histórico de versões.");
    } finally {
      setIsLoadingTrainingVersions(false);
    }
  }

  async function handleOpenVersionDetail(versionId) {
    if (!currentTrainingId || !versionId || loadingTrainingVersionId) {
      return;
    }

    try {
      const userId = requireCurrentUserId();

      setIsVersionDetailModalOpen(true);
      setSelectedTrainingVersion(null);
      setVersionDetailFeedback("");
      setLoadingTrainingVersionId(versionId);

      const response = await fetch(`${API_BASE_URL}/agent-training/user/${encodeURIComponent(userId)}/${currentTrainingId}/versions/${versionId}`);
      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Erro ao buscar versão do treinamento.");
      }

      setSelectedTrainingVersion(result.version || null);
    } catch (error) {
      setVersionDetailFeedback(error.message || "Não foi possível carregar a versão do treinamento.");
    } finally {
      setLoadingTrainingVersionId(null);
    }
  }

  function clearLoadedTrainingIfNeeded(trainingId, nextActiveTrainings) {
    if (String(currentTrainingId) !== String(trainingId)) {
      return;
    }

    const nextTraining = nextActiveTrainings.find((training) => String(training.id) !== String(trainingId));

    if (nextTraining) {
      handleRestoreTraining(nextTraining);
      return;
    }

    handleNewTraining();
  }

  async function handleArchiveTraining(training) {
    if (!training?.id || managingTrainingId) {
      return;
    }

    if (isProductionTraining(training)) {
      showModalFeedback("Não é possível arquivar um treinamento em produção.");
      return;
    }

    try {
      const userId = requireCurrentUserId();

      setManagingTrainingId(training.id);
      setModalFeedback("");

      const response = await fetch(`${API_BASE_URL}/agent-training/user/${encodeURIComponent(userId)}/${training.id}/archive`, {
        method: "PATCH"
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Erro ao arquivar treinamento.");
      }

      const nextActiveTrainings = availableTrainings.filter((item) => String(item.id) !== String(training.id));
      setAvailableTrainings(nextActiveTrainings);
      clearLoadedTrainingIfNeeded(training.id, nextActiveTrainings);
      showModalFeedback("Treinamento arquivado.", 2200);
    } catch (error) {
      showModalFeedback(error.message || "Não foi possível arquivar o treinamento.");
    } finally {
      setManagingTrainingId(null);
    }
  }

  async function handleDeleteTraining(training) {
    if (!training?.id || managingTrainingId) {
      return;
    }

    if (isProductionTraining(training)) {
      showModalFeedback("Não é possível excluir um treinamento em produção.");
      return;
    }

    try {
      const userId = requireCurrentUserId();

      setManagingTrainingId(training.id);
      setModalFeedback("");

      const response = await fetch(`${API_BASE_URL}/agent-training/user/${encodeURIComponent(userId)}/${training.id}`, {
        method: "DELETE"
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Erro ao excluir treinamento.");
      }

      const nextActiveTrainings = availableTrainings.filter((item) => String(item.id) !== String(training.id));
      setAvailableTrainings(nextActiveTrainings);
      clearLoadedTrainingIfNeeded(training.id, nextActiveTrainings);
      showModalFeedback("Treinamento excluído.", 2200);
    } catch (error) {
      showModalFeedback(error.message || "Não foi possível excluir o treinamento.");
    } finally {
      setManagingTrainingId(null);
    }
  }

  async function handleRestoreArchivedTraining(training) {
    if (!training?.id || managingTrainingId) {
      return;
    }

    try {
      const userId = requireCurrentUserId();

      setManagingTrainingId(training.id);
      setModalFeedback("");

      const response = await fetch(`${API_BASE_URL}/agent-training/user/${encodeURIComponent(userId)}/${training.id}/restore`, {
        method: "PATCH"
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Erro ao restaurar treinamento.");
      }

      setArchivedTrainings((trainings) => trainings.filter((item) => String(item.id) !== String(training.id)));
      const activeResponse = await fetch(`${API_BASE_URL}/agent-training/user/${encodeURIComponent(userId)}`);
      const activeResult = await activeResponse.json();

      if (!activeResponse.ok || activeResult.success === false) {
        throw new Error(activeResult.message || "Erro ao recarregar treinamentos ativos.");
      }

      setAvailableTrainings((activeResult.trainings || []).filter(isCompatibleTraining));
      setIsViewingArchivedTrainings(false);
      setIsTrainingListModalOpen(true);
      showModalFeedback("Treinamento restaurado.", 2200);
    } catch (error) {
      showModalFeedback(error.message || "Não foi possível restaurar o treinamento.");
    } finally {
      setManagingTrainingId(null);
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
      setShowSaveSuccess(false);
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

      setSaveFeedback("Treinamento salvo com sucesso.");
      setShowSaveSuccess(true);
      setIsSaving(false);
      setTimeout(() => {
        setSaveFeedback("");
        setShowSaveSuccess(false);
      }, 2200);
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

              {currentTrainingId && (
                <button
                  className="agent-training-rename-button agent-training-history-button"
                  type="button"
                  onClick={handleOpenVersionHistory}
                  disabled={isLoadingTrainingVersions}
                >
                  <History size={15} />
                  {isLoadingTrainingVersions ? "Carregando..." : "Histórico"}
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
                {isSaving ? "Salvando..." : showSaveSuccess ? "Salvo ✓" : "Salvar Treinamento"}
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
                      onClick={() => {
                        setModalFeedback("");
                        setIsViewingArchivedTrainings(false);
                        setIsTrainingListModalOpen(true);
                      }}
                    >
                      Outros treinamentos
                    </button>
                  )}

                  <button
                    className="agent-training-saved-choice__link"
                    type="button"
                    onClick={handleOpenArchivedTrainings}
                    disabled={managingTrainingId === "archived-list"}
                  >
                    {managingTrainingId === "archived-list" ? "Carregando..." : "Ver arquivados"}
                  </button>
                </div>
              </div>
            )}

            {isTrainingListModalOpen && (
              <div className="agent-training-training-modal" role="dialog" aria-modal="true" aria-label={isViewingArchivedTrainings ? "Treinamentos arquivados" : "Outros treinamentos"}>
                <div
                  className="agent-training-training-modal__backdrop"
                  onClick={() => {
                    setModalFeedback("");
                    setIsTrainingListModalOpen(false);
                  }}
                />

                <div className="agent-training-training-modal__content">
                  <div className="agent-training-training-modal__header">
                    <div>
                      <span>{isViewingArchivedTrainings ? "Treinamentos arquivados" : "Seus treinamentos"}</span>
                      <small>{isViewingArchivedTrainings ? "Restaure um treinamento para voltar a editá-lo" : "Escolha qual treinamento deseja editar"}</small>
                    </div>

                    <button
                      className="agent-training-training-modal__close"
                      type="button"
                      onClick={() => {
                        setModalFeedback("");
                        setIsTrainingListModalOpen(false);
                      }}
                      aria-label="Fechar lista de treinamentos"
                    >
                      ×
                    </button>
                  </div>

                  {modalFeedback && (
                    <div className="agent-training-training-modal__feedback" role="status">
                      {modalFeedback}
                    </div>
                  )}

                <div className="agent-training-training-modal__list">
                  {isViewingArchivedTrainings && (
                    <button
                      className="agent-training-saved-choice__link"
                      type="button"
                      onClick={() => {
                        setModalFeedback("");
                        setIsViewingArchivedTrainings(false);
                      }}
                    >
                      Ver ativos
                    </button>
                  )}

                  {!isViewingArchivedTrainings && (
                    <>
                      {currentTrainingId && (
                        <button
                          className="agent-training-saved-choice__link"
                          type="button"
                          onClick={handleOpenVersionHistory}
                          disabled={isLoadingTrainingVersions}
                        >
                          {isLoadingTrainingVersions ? "Carregando..." : "Histórico"}
                        </button>
                      )}

                      <button
                        className="agent-training-saved-choice__link"
                        type="button"
                        onClick={handleOpenArchivedTrainings}
                        disabled={managingTrainingId === "archived-list"}
                      >
                        {managingTrainingId === "archived-list" ? "Carregando..." : "Ver arquivados"}
                      </button>
                    </>
                  )}

                  {!modalTrainings.length && (
                    <div className="agent-training-saved-choice__summary">
                      <span>{isViewingArchivedTrainings ? "Nenhum treinamento arquivado" : "Nenhum treinamento ativo"}</span>
                    </div>
                  )}

                  {modalTrainings.map((training) => (
                    <div
                      key={training.id}
                      className="agent-training-training-modal__item"
                    >
                      {!isViewingArchivedTrainings && (
                        <button
                          key={training.id}
                          className="agent-training-saved-choice__item"
                          type="button"
                          onClick={() => handleRestoreTraining(training)}
                        >
                          <span>
                            {getTrainingDisplayName(training)}
                            {isProductionTraining(training) && (
                              <strong>Em produção</strong>
                            )}
                          </span>
                          {getTrainingMeta(training) && (
                            <small>{getTrainingMeta(training)}</small>
                          )}
                        </button>
                      )}

                      {isViewingArchivedTrainings && (
                        <div className="agent-training-saved-choice__summary">
                          <span>{getTrainingDisplayName(training)}</span>
                          {getTrainingMeta(training) && (
                            <small>{getTrainingMeta(training)}</small>
                          )}
                        </div>
                      )}

                      <div className="agent-training-saved-choice__actions agent-training-training-modal__actions">
                        {!isViewingArchivedTrainings && (
                          <>
                            <button
                              className={`agent-training-saved-choice__link agent-training-training-modal__action${isProductionTraining(training) ? " agent-training-training-modal__action--muted" : ""}`}
                              type="button"
                              onClick={() => handleArchiveTraining(training)}
                              aria-disabled={isProductionTraining(training)}
                              disabled={managingTrainingId === training.id}
                            >
                              {managingTrainingId === training.id ? "Arquivando..." : "Arquivar"}
                            </button>

                            <button
                              className={`agent-training-saved-choice__link agent-training-training-modal__action agent-training-training-modal__action--danger${isProductionTraining(training) ? " agent-training-training-modal__action--muted" : ""}`}
                              type="button"
                              onClick={() => handleDeleteTraining(training)}
                              aria-disabled={isProductionTraining(training)}
                              disabled={managingTrainingId === training.id}
                            >
                              {managingTrainingId === training.id ? "Excluindo..." : "Excluir"}
                            </button>
                          </>
                        )}

                        {isViewingArchivedTrainings && (
                          <button
                            className="agent-training-saved-choice__edit"
                            type="button"
                            onClick={() => handleRestoreArchivedTraining(training)}
                            disabled={managingTrainingId === training.id}
                          >
                            {managingTrainingId === training.id ? "Restaurando..." : "Restaurar"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            )}

            {isVersionHistoryModalOpen && (
              <div className="agent-training-training-modal" role="dialog" aria-modal="true" aria-label="Histórico de versões">
                <div
                  className="agent-training-training-modal__backdrop"
                  onClick={() => {
                    setIsVersionHistoryModalOpen(false);
                    setVersionHistoryFeedback("");
                  }}
                />

                <div className="agent-training-training-modal__content">
                  <div className="agent-training-training-modal__header">
                    <div>
                      <span>Histórico de versões</span>
                      <small>{currentTrainingName || "Treinamento selecionado"}</small>
                    </div>

                    <button
                      className="agent-training-training-modal__close"
                      type="button"
                      onClick={() => {
                        setIsVersionHistoryModalOpen(false);
                        setVersionHistoryFeedback("");
                      }}
                      aria-label="Fechar histórico de versões"
                    >
                      ×
                    </button>
                  </div>

                  {versionHistoryFeedback && (
                    <div className="agent-training-training-modal__feedback" role="status">
                      {versionHistoryFeedback}
                    </div>
                  )}

                  <div className="agent-training-training-modal__list">
                    {isLoadingTrainingVersions && (
                      <div className="agent-training-saved-choice__summary">
                        <span>Carregando histórico...</span>
                      </div>
                    )}

                    {!isLoadingTrainingVersions && !trainingVersions.length && (
                      <div className="agent-training-saved-choice__summary">
                        <span>Nenhuma versão encontrada.</span>
                      </div>
                    )}

                    {!isLoadingTrainingVersions && trainingVersions.map((version) => (
                      <button
                        key={version.id}
                        className="agent-training-saved-choice__item"
                        type="button"
                        onClick={() => handleOpenVersionDetail(version.id)}
                        disabled={loadingTrainingVersionId === version.id}
                      >
                        <span>{loadingTrainingVersionId === version.id ? "Carregando versão..." : `Versão ${version.version_number}`}</span>
                        <small>{version.product_name || "Treinamento sem nome"}</small>
                        {formatVersionCreatedAt(version.created_at) && (
                          <small>{formatVersionCreatedAt(version.created_at)}</small>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isVersionDetailModalOpen && (
              <div className="agent-training-training-modal" role="dialog" aria-modal="true" aria-label="Visualizar versão do treinamento">
                <div
                  className="agent-training-training-modal__backdrop"
                  onClick={() => {
                    setIsVersionDetailModalOpen(false);
                    setSelectedTrainingVersion(null);
                    setVersionDetailFeedback("");
                  }}
                />

                <div className="agent-training-training-modal__content">
                  <div className="agent-training-training-modal__header">
                    <div>
                      <span>
                        {selectedTrainingVersion
                          ? `Versão ${selectedTrainingVersion.version_number}`
                          : "Visualizar versão"}
                      </span>
                      <small>
                        {selectedTrainingVersion?.created_at
                          ? `Criada em ${formatVersionCreatedAt(selectedTrainingVersion.created_at)}`
                          : "Consulta somente leitura"}
                      </small>
                    </div>

                    <button
                      className="agent-training-training-modal__close"
                      type="button"
                      onClick={() => {
                        setIsVersionDetailModalOpen(false);
                        setSelectedTrainingVersion(null);
                        setVersionDetailFeedback("");
                      }}
                      aria-label="Fechar visualização da versão"
                    >
                      ×
                    </button>
                  </div>

                  {versionDetailFeedback && (
                    <div className="agent-training-training-modal__feedback" role="status">
                      {versionDetailFeedback}
                    </div>
                  )}

                  <div className="agent-training-training-modal__list">
                    {loadingTrainingVersionId && !selectedTrainingVersion && (
                      <div className="agent-training-saved-choice__summary">
                        <span>Carregando versão...</span>
                      </div>
                    )}

                    {!loadingTrainingVersionId && !selectedTrainingVersion && !versionDetailFeedback && (
                      <div className="agent-training-saved-choice__summary">
                        <span>Nenhuma versão selecionada.</span>
                      </div>
                    )}

                    {selectedTrainingVersion && buildVersionDetailSections(selectedTrainingVersion).map((section) => (
                      <div
                        key={section.title}
                        className="agent-training-saved-choice__summary"
                      >
                        <span>{section.title}</span>
                        {section.fields.map(([label, value]) => (
                          <small key={label}>
                            <strong>{label}:</strong> {value}
                          </small>
                        ))}
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































