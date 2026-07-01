import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CheckCircle, ChevronLeft, ExternalLink, Eye, Headphones, Inbox, Info, MessageSquareText, RotateCcw, Save, ShieldCheck, UsersRound, Webhook } from "lucide-react";
import TrainingSidebar from "../components/training/TrainingSidebar";
import { API_BASE_URL, authenticatedFetch } from "../services/authService";
import "../styles/training/agent-training.css";

const EMPTY_FORM = {
  name: "",
  provider: "meta",
  phoneNumberId: "",
  displayPhoneNumber: "",
  businessAccountId: "",
  accessToken: ""
};

const MASKED_ACCESS_TOKEN = "************************************************";

const WIZARD_STEPS = [
  "Informações",
  "Validar",
  "Registrar Webhook",
  "Conectado"
];

const WIZARD_STEP_SUBTITLES = [
  "Dados da conta",
  "Credenciais Meta",
  "Eventos oficiais",
  "Pronto para uso"
];

function WhatsAppBrandIcon({ size = 26, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 448 512"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32 101.5 32 1.9 131.6 1.9 254c0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 438.7c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3s19.9 53.7 22.6 57.4c2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
  );
}

function getStatusLabel(status) {
  return status === "active" ? "Ativa" : "Inativa";
}

function getConnectionStatus(integration) {
  if (!integration || integration.status === "inactive") {
    return "Desativada";
  }

  if (integration.tokenStatus === "invalid") {
    return "Ativa — token inválido";
  }

  if (integration.webhookStatus === "error") {
    return "Erro";
  }

  if (integration.tokenStatus === "valid" && integration.webhookStatus === "registered") {
    return "Conectado";
  }

  return "Validando";
}

function getConnectionStatusKey(integration) {
  if (integration?.status === "active" && integration?.tokenStatus === "invalid") {
    return "erro";
  }

  return getConnectionStatus(integration)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatLastSync(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Ainda não sincronizada";
  }

  return date.toLocaleString("pt-BR");
}

function normalizeIntegrationPayload(form) {
  const payload = {
    name: form.name.trim(),
    provider: "meta",
    phoneNumberId: form.phoneNumberId.trim(),
    displayPhoneNumber: form.displayPhoneNumber.trim()
  };

  if (form.businessAccountId.trim() && !form.businessAccountId.includes("@")) {
    payload.businessAccountId = form.businessAccountId.trim();
  }

  if (form.accessToken.trim() && form.accessToken.trim() !== MASKED_ACCESS_TOKEN) {
    payload.accessToken = form.accessToken.trim();
  }

  return payload;
}

function isNumericId(value) {
  return /^\d+$/.test(String(value || "").trim());
}

function parseIntegrationMetadata(integration) {
  if (!integration.metadataJson) {
    return {};
  }

  try {
    return JSON.parse(integration.metadataJson);
  } catch {
    return {};
  }
}

function getStoredBusinessAccountId(integration) {
  const metadata = parseIntegrationMetadata(integration);
  const values = [
    integration.businessAccountId,
    integration.business_account_id,
    integration.whatsappBusinessAccountId,
    integration.whatsapp_business_account_id,
    integration.wabaId,
    integration.waba_id,
    metadata.businessAccountId,
    metadata.business_account_id,
    metadata.whatsappBusinessAccountId,
    metadata.whatsapp_business_account_id,
    metadata.whatsapp_business_account?.id
  ];

  return values.find(isNumericId) || values.find((value) => value && !String(value).includes("@")) || "";
}

function buildFormFromIntegration(integration) {
  return {
    name: integration.name || "",
    provider: integration.provider || "meta",
    phoneNumberId: integration.phoneNumberId || "",
    displayPhoneNumber: integration.displayPhoneNumber || "",
    businessAccountId: getStoredBusinessAccountId(integration),
    accessToken: MASKED_ACCESS_TOKEN
  };
}

function mergeIntegrationPreservingBusinessAccount(currentIntegration, nextIntegration) {
  const nextBusinessAccountId = getStoredBusinessAccountId(nextIntegration);
  const currentBusinessAccountId = getStoredBusinessAccountId(currentIntegration || {});

  return {
    ...currentIntegration,
    ...nextIntegration,
    businessAccountId: nextBusinessAccountId || currentBusinessAccountId || ""
  };
}

export default function WhatsAppIntegrations() {
  const [integrations, setIntegrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [wizardStep, setWizardStep] = useState(1);
  const [validationResult, setValidationResult] = useState(null);
  const [validationFeedback, setValidationFeedback] = useState("");
  const [webhookResult, setWebhookResult] = useState(null);

  const modalTitle = useMemo(
    () => editingIntegration ? "Editar integração" : "Nova integração",
    [editingIntegration]
  );
  const activeIntegrations = integrations.filter((integration) => integration.status === "active").length;
  const selectedIntegration = integrations.find((integration) => integration.status === "active") || integrations[0] || null;
  const isConnected = Boolean(selectedIntegration && selectedIntegration.status === "active");
  const isTokenValid = selectedIntegration?.tokenStatus === "valid";
  const isWebhookRegistered = selectedIntegration?.webhookStatus === "registered";
  const hasValidatedToken = isTokenValid || validationResult?.integration?.tokenStatus === "valid";
  const hasVerifiedPhoneNumber = Boolean(
    validationResult?.metadata?.id ||
    validationResult?.metadata?.display_phone_number ||
    selectedIntegration?.displayPhoneNumber
  );

  async function parseApiResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || "Não foi possível concluir a operação.");
    }

    return data;
  }

  async function loadIntegrations(showLoading = true) {
    if (showLoading) {
      setIsLoading(true);
    }

    setFeedback("");

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/whatsapp-integrations`);
      const data = await parseApiResponse(response);
      const loadedIntegrations = Array.isArray(data.integrations) ? data.integrations : [];
      const primaryIntegration = loadedIntegrations.find((integration) => integration.status === "active") || loadedIntegrations[0] || null;

      setIntegrations(loadedIntegrations);

      if (showLoading && primaryIntegration) {
        setEditingIntegration(primaryIntegration);
        setForm(buildFormFromIntegration(primaryIntegration));
      }
    } catch (error) {
      setFeedback(error.message);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    loadIntegrations();
  }, []);

  function openCreateModal() {
    setEditingIntegration(null);
    setForm(EMPTY_FORM);
    setFeedback("");
    setValidationResult(null);
    setValidationFeedback("");
    setWebhookResult(null);
    setWizardStep(1);
    setIsModalOpen(true);
  }

  function openEditModal(integration) {
    setEditingIntegration(integration);
    setForm(buildFormFromIntegration(integration));
    setFeedback("");
    setValidationResult(null);
    setValidationFeedback("");
    setWebhookResult(null);
    setWizardStep(1);
    setIsModalOpen(true);
  }

  function openTestConnection(integration) {
    openEditModal(integration);
    setWizardStep(2);
  }

  function clearConnectionFields() {
    setEditingIntegration(null);
    setForm(EMPTY_FORM);
    setWizardStep(1);
    setValidationResult(null);
    setValidationFeedback("");
    setWebhookResult(null);
    setFeedback("");
  }

  function closeModal() {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    const restoredIntegration = selectedIntegration
      ? mergeIntegrationPreservingBusinessAccount({ businessAccountId: form.businessAccountId }, selectedIntegration)
      : null;

    setEditingIntegration(restoredIntegration);
    setForm(restoredIntegration ? buildFormFromIntegration(restoredIntegration) : EMPTY_FORM);
    setWizardStep(1);
    setValidationResult(null);
    setValidationFeedback("");
    setWebhookResult(null);
  }

  function updateFormField(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: field === "businessAccountId" && String(value).includes("@")
        ? currentForm.businessAccountId
        : value
    }));
  }

  async function handleSave(event, validateAfterSave = false) {
    event.preventDefault();
    setIsSaving(true);
    setFeedback("");

    const isEditing = Boolean(editingIntegration?.id);
    const url = isEditing
      ? `${API_BASE_URL}/whatsapp-integrations/${editingIntegration.id}`
      : `${API_BASE_URL}/whatsapp-integrations`;

    try {
      const data = await parseApiResponse(await authenticatedFetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(normalizeIntegrationPayload(form))
      }));

      if (data.integration) {
        setEditingIntegration((currentIntegration) => (
          mergeIntegrationPreservingBusinessAccount(currentIntegration, data.integration)
        ));
      }

      if (validateAfterSave && data.integration?.id) {
        await handleValidateIntegration(data.integration.id);
        return;
      }

      await loadIntegrations();
      setWizardStep(2);
    } catch (error) {
      setFeedback(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleValidateIntegration(integrationId = editingIntegration?.id) {
    if (!integrationId) {
      setValidationFeedback("Selecione uma integração salva antes de validar as credenciais.");
      return;
    }

    setIsSaving(true);
    setFeedback("");
    setValidationFeedback("");

    try {
      const validateUrl = `${API_BASE_URL}/whatsapp-integrations/${integrationId}/validate`;

      const data = await parseApiResponse(await authenticatedFetch(
        validateUrl,
        { method: "POST" }
      ));

      if (data.integration) {
        setEditingIntegration((currentIntegration) => (
          mergeIntegrationPreservingBusinessAccount(currentIntegration, data.integration)
        ));
        setIntegrations((currentIntegrations) => (
          currentIntegrations.map((integration) => (
            integration.id === data.integration.id
              ? mergeIntegrationPreservingBusinessAccount(integration, data.integration)
              : integration
          ))
        ));
      }

      setValidationResult(data);
      setValidationFeedback("Credenciais válidas");
      setWebhookResult(data.webhook || null);
      setWizardStep(3);
      loadIntegrations(false);
    } catch (error) {
      setValidationResult(null);
      setValidationFeedback(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRegisterWebhook(integrationId = editingIntegration?.id || selectedIntegration?.id) {
    if (!integrationId) {
      setWebhookResult({
        message: "Selecione uma integração salva antes de registrar o webhook."
      });
      return;
    }

    setIsSaving(true);
    setWebhookResult(null);

    try {
      const data = await parseApiResponse(await authenticatedFetch(
        `${API_BASE_URL}/whatsapp-integrations/${integrationId}/register-webhook`,
        { method: "POST" }
      ));

      if (data.integration) {
        setEditingIntegration((currentIntegration) => (
          mergeIntegrationPreservingBusinessAccount(currentIntegration, data.integration)
        ));
        setIntegrations((currentIntegrations) => (
          currentIntegrations.map((integration) => (
            integration.id === data.integration.id
              ? mergeIntegrationPreservingBusinessAccount(integration, data.integration)
              : integration
          ))
        ));
      }

      setWebhookResult({
        ...data.webhook,
        message: "Webhook registrado com sucesso"
      });
      setWizardStep(4);
      loadIntegrations(false);
    } catch (error) {
      setWebhookResult({
        message: error.message
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function runIntegrationAction(path, method = "PATCH") {
    setFeedback("");

    try {
      await parseApiResponse(await authenticatedFetch(`${API_BASE_URL}${path}`, { method }));
      await loadIntegrations();
    } catch (error) {
      setFeedback(error.message);
    }
  }

  function renderWizardProgress() {
    return (
      <div className="whatsapp-integrations-wizard-progress">
        {WIZARD_STEPS.map((step, index) => {
          const stepNumber = index + 1;

          return (
            <div
              key={step}
              className={`whatsapp-integrations-wizard-progress__step${
                wizardStep >= stepNumber ? " whatsapp-integrations-wizard-progress__step--active" : ""
              }`}
            >
              <span>{stepNumber}</span>
              <div>
                <p>{step}</p>
                <small>{WIZARD_STEP_SUBTITLES[index]}</small>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderWizardStep() {
    if (wizardStep === 1) {
      return (
        <>
          <label className="whatsapp-integrations-field">
            Nome da integração
            <input
              value={form.name}
              onChange={(event) => updateFormField("name", event.target.value)}
            />
          </label>

          <label className="whatsapp-integrations-field">
            Provider
            <select
              value={form.provider}
              onChange={(event) => updateFormField("provider", event.target.value)}
            >
              <option value="meta">Meta</option>
            </select>
          </label>

          <label className="whatsapp-integrations-field">
            Phone Number ID
            <input
              value={form.phoneNumberId}
              onChange={(event) => updateFormField("phoneNumberId", event.target.value)}
            />
          </label>

          <label className="whatsapp-integrations-field">
            Display Phone Number
            <input
              value={form.displayPhoneNumber}
              onChange={(event) => updateFormField("displayPhoneNumber", event.target.value)}
            />
          </label>

          <label className="whatsapp-integrations-field">
            Access Token
            <input
              type="password"
              value={form.accessToken}
              onChange={(event) => updateFormField("accessToken", event.target.value)}
            />
          </label>

          <div className="agent-training-rename-modal__actions">
            <button type="button" className="agent-training-rename-modal__secondary" onClick={closeModal}>
              Cancelar
            </button>
            <button type="submit" className="agent-training-rename-modal__primary" disabled={isSaving}>
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </>
      );
    }

    if (wizardStep === 2) {
      return (
        <div className="whatsapp-integrations-wizard-step">
          <ShieldCheck size={28} />
          <strong>Validar credenciais na Meta.</strong>
          <p>Use as credenciais salvas para confirmar o token e o número informado.</p>

          <div className="agent-training-rename-modal__actions">
            <button type="button" className="agent-training-rename-modal__secondary" onClick={() => setWizardStep(1)}>
              Voltar
            </button>
            <button
              type="button"
              className="agent-training-rename-modal__primary"
              onClick={() => handleValidateIntegration(editingIntegration?.id || selectedIntegration?.id)}
              disabled={isSaving}
            >
              {isSaving ? "Validando..." : "Validar credenciais"}
            </button>
          </div>

          {validationFeedback ? (
            <div className="agent-training-training-modal__feedback" role="status">
              {validationFeedback}
            </div>
          ) : null}
        </div>
      );
    }

    if (wizardStep === 3) {
      return (
        <div className="whatsapp-integrations-wizard-step">
          <Webhook size={28} />
          <strong>Registrar Webhook.</strong>
          <p>{webhookResult?.message || "Registre o webhook para receber eventos oficiais da Meta."}</p>

          <div className="agent-training-rename-modal__actions">
            <button type="button" className="agent-training-rename-modal__secondary" onClick={() => setWizardStep(2)}>
              Voltar
            </button>
            <button
              type="button"
              className="agent-training-rename-modal__primary"
              onClick={() => handleRegisterWebhook(editingIntegration?.id || selectedIntegration?.id)}
              disabled={isSaving}
            >
              {isSaving ? "Registrando..." : "Registrar Webhook"}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="whatsapp-integrations-wizard-step">
        <CheckCircle2 size={28} />
        <strong>
          {validationResult?.success ? "Integração concluída." : "Integração concluída."}
        </strong>
        <p>{webhookResult?.message || "Webhook registrado com sucesso"}</p>

        <div className="agent-training-rename-modal__actions">
          <button type="button" className="agent-training-rename-modal__primary" onClick={closeModal}>
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="agent-training-page whatsapp-integrations-page">
      <section className="agent-training-shell">
        <TrainingSidebar activeItem="WhatsApp" />

        <section className="agent-training-main-panel">
          <header className="agent-training-main-header">
            <div className="whatsapp-integrations-header-copy">
              <button
                className="whatsapp-integrations-back-button"
                type="button"
                aria-label="Voltar"
              >
                <ChevronLeft size={13} strokeWidth={1.8} />
              </button>

              <div>
                <h1>Conexão WhatsApp</h1>
                <div className="whatsapp-integrations-header-subtitle-row">
                  <p>Conecte sua conta oficial do WhatsApp via Meta Cloud API</p>
                </div>
              </div>
            </div>

            <div className="agent-training-main-actions">
              <button
                className="agent-training-save-button"
                type="button"
              >
                <Save size={16} />
                Documentação
              </button>
            </div>
          </header>

          {feedback ? <div className="agent-training-training-modal__feedback">{feedback}</div> : null}

          <div className="whatsapp-integrations-guided-layout">
            <form className="whatsapp-integrations-connect-card" onSubmit={(event) => handleSave(event, true)} autoComplete="off">
              <div className="whatsapp-integrations-connect-card__header">
                <div>
                  <span>Conectar nova conta WhatsApp</span>
                  <small>Informe os dados da Meta Cloud API para iniciar a conexão oficial.</small>
                </div>
              </div>

              {renderWizardProgress()}

              <div className="whatsapp-integrations-connect-grid">
                <label className="whatsapp-integrations-field">
                  Nome da integração
                  <input
                    autoComplete="off"
                    name="whatsappIntegrationName"
                    value={form.name}
                    onChange={(event) => updateFormField("name", event.target.value)}
                  />
                </label>

                <label className="whatsapp-integrations-field">
                  Phone Number ID
                  <input
                    autoComplete="off"
                    inputMode="numeric"
                    name="whatsappPhoneNumberId"
                    value={form.phoneNumberId}
                    onChange={(event) => updateFormField("phoneNumberId", event.target.value)}
                  />
                </label>

                <label className="whatsapp-integrations-field">
                  Access Token
                  <input
                    autoComplete="new-password"
                    name="whatsappAccessToken"
                    type="password"
                    value={form.accessToken}
                    onChange={(event) => updateFormField("accessToken", event.target.value)}
                  />
                </label>

                <label className="whatsapp-integrations-field">
                  Business Account ID
                  <input
                    autoComplete="off"
                    inputMode="numeric"
                    name="whatsappBusinessAccountId"
                    value={form.businessAccountId}
                    onChange={(event) => updateFormField("businessAccountId", event.target.value)}
                  />
                </label>
              </div>

              <div className="whatsapp-integrations-help-box">
                <div className="whatsapp-integrations-help-box__content">
                  <div className="whatsapp-integrations-help-box__title">
                    <Info size={18} />
                    <strong>Onde encontrar essas informações?</strong>
                  </div>

                  <ul>
                    <li>
                      <span>Phone Number ID:</span> Configurações do seu número na Meta.
                    </li>
                    <li>
                      <span>Access Token:</span> Gere um token permanente com permissões adequadas.
                    </li>
                    <li>
                      <span>Business Account ID:</span> ID da sua conta comercial (WABA).
                    </li>
                  </ul>
                </div>

                <button type="button" className="whatsapp-integrations-help-box__button">
                  <ExternalLink size={14} />
                  Ver guia completo
                </button>
              </div>

              <div className="whatsapp-integrations-connect-card__actions">
                <button type="submit" className="agent-training-rename-modal__primary" disabled={isSaving}>
                  <ShieldCheck size={16} />
                  {isSaving ? "Validando..." : "Validar conexão"}
                </button>
                <button type="button" className="agent-training-rename-modal__secondary" onClick={clearConnectionFields}>
                  <RotateCcw size={16} />
                  Limpar campos
                </button>
              </div>
            </form>

            <section className="whatsapp-integrations-existing-card">
              <div className="whatsapp-integrations-existing-card__header">
                <div>
                  <span>Suas integrações</span>
                  <small>Gerencie suas contas conectadas</small>
                </div>
              </div>

              <div className="whatsapp-integrations-table-header">
                <span>Nome</span>
                <span>Número</span>
                <span>Status</span>
                <span>Webhook</span>
                <span>Última verificação</span>
                <span>Ações</span>
              </div>

              {isLoading ? (
                <p className="whatsapp-integrations-empty">Carregando integrações...</p>
              ) : integrations.length === 0 ? (
                <div className="whatsapp-integrations-empty-state">
                  <div className="whatsapp-integrations-empty-state__icon">
                    <Inbox size={24} />
                  </div>
                  <strong>Nenhuma integração encontrada</strong>
                  <p>Conecte sua primeira conta WhatsApp acima</p>
                </div>
              ) : (
                <div className="whatsapp-integrations-list">
                  {integrations.map((integration) => (
                    <article className="agent-training-saved-choice whatsapp-integrations-training-card" key={integration.id}>
                      <div className="agent-training-saved-choice__summary">
                        <div className="agent-training-saved-choice__summary-title">
                          <span>{integration.name || "Sem nome"}</span>
                          <strong className={`whatsapp-integrations-training-card__status whatsapp-integrations-training-card__status--${getConnectionStatusKey(integration)}`}>
                            {getConnectionStatus(integration)}
                          </strong>
                        </div>

                        <small>
                          {integration.displayPhoneNumber || integration.phoneNumberId || "Número não informado"}
                        </small>

                        <div className="whatsapp-integrations-training-card__details">
                          <p>
                            <span>Provider</span>
                            Meta Cloud API
                          </p>
                          <p>
                            <span>Última sincronização</span>
                            {formatLastSync(integration.lastVerifiedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="agent-training-saved-choice__actions">
                        <button
                          className="agent-training-saved-choice__edit"
                          type="button"
                          onClick={() => openEditModal(integration)}
                        >
                          Gerenciar
                        </button>
                        <button
                          className="agent-training-saved-choice__new"
                          type="button"
                          onClick={() => openTestConnection(integration)}
                        >
                          Testar conexão
                        </button>
                        <button
                          type="button"
                          className="agent-training-saved-choice__link"
                          onClick={() => runIntegrationAction(
                            `/whatsapp-integrations/${integration.id}/${integration.status === "inactive" ? "activate" : "deactivate"}`
                          )}
                        >
                          {integration.status === "inactive" ? "Ativar" : "Desativar"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>

        <aside className="agent-training-insight-panel whatsapp-integrations-side-panel">
          <div className="whatsapp-integrations-side-panel__scroll">
          <section className="agent-training-insight-panel__progress-box">
            <h3>Integrações</h3>

            <div className="whatsapp-integrations-summary-icon">
              <WhatsAppBrandIcon size={26} />
            </div>

            <p>{integrations.length} integrações cadastradas.</p>

            <div className="agent-training-insight-panel__divider" />

            <strong className="agent-training-insight-panel__topics-title">
              Status
            </strong>

            <div className="agent-training-insight-panel__topics-list">
              <div className={`agent-training-insight-panel__topic ${activeIntegrations ? "is-done" : "is-pending"}`}>
                <span />
                <p>{activeIntegrations} ativa(s)</p>
              </div>
              <div className="agent-training-insight-panel__topic is-pending">
                <span />
                <p>{Math.max(integrations.length - activeIntegrations, 0)} inativa(s)</p>
              </div>
            </div>
          </section>

          <section className="whatsapp-integrations-side-card">
            <strong>Status da conexão</strong>

            <div className="whatsapp-integrations-side-card__list">
              <div className={`whatsapp-integrations-side-card__item ${isConnected ? "is-done" : "is-pending"}`}>
                <span />
                <p>{isConnected ? "Conectado" : "Não conectado"}</p>
              </div>
              <div className={`whatsapp-integrations-side-card__item ${isTokenValid ? "is-done" : "is-pending"}`}>
                <span />
                <p>{isTokenValid ? "Token válido" : "Token inválido"}</p>
              </div>
              <div className={`whatsapp-integrations-side-card__item ${isWebhookRegistered ? "is-done" : "is-pending"}`}>
                <span />
                <p>{isWebhookRegistered ? "Webhook registrado" : "Webhook pendente"}</p>
              </div>
            </div>
          </section>

          <section className="whatsapp-integrations-side-card">
            <strong>Pré-requisitos</strong>

            <div className="whatsapp-integrations-side-card__list">
              <div className="whatsapp-integrations-side-card__item is-done">
                <span />
                <p>Conta WhatsApp Business</p>
              </div>
              <div className="whatsapp-integrations-side-card__item is-done">
                <span />
                <p>Conta Meta Business</p>
              </div>
              <div className={`whatsapp-integrations-side-card__item ${hasVerifiedPhoneNumber ? "is-done" : "is-pending"}`}>
                <span />
                <p>Número de telefone verificado</p>
              </div>
              <div className={`whatsapp-integrations-side-card__item ${hasValidatedToken ? "is-done" : "is-pending"}`}>
                <span />
                <p>Token com permissões adequadas</p>
              </div>
            </div>
          </section>

          <section className="whatsapp-integrations-side-card">
            <strong>Eventos que serão recebidos</strong>

            <div className="whatsapp-integrations-event-grid">
              <div className="whatsapp-integrations-event-row">
                <span className="whatsapp-integrations-event-icon">
                  <MessageSquareText size={13} />
                </span>
                <p>
                  <strong>messages</strong>
                  <small>Mensagens recebidas</small>
                </p>
              </div>
              <div className="whatsapp-integrations-event-row">
                <span className="whatsapp-integrations-event-icon">
                  <CheckCircle size={13} />
                </span>
                <p>
                  <strong>message_status</strong>
                  <small>Status das mensagens</small>
                </p>
              </div>
              <div className="whatsapp-integrations-event-row">
                <span className="whatsapp-integrations-event-icon">
                  <UsersRound size={13} />
                </span>
                <p>
                  <strong>contacts</strong>
                  <small>Dados de contato</small>
                </p>
              </div>
              <div className="whatsapp-integrations-event-row">
                <span className="whatsapp-integrations-event-icon">
                  <Eye size={13} />
                </span>
                <p>
                  <strong>messages_read</strong>
                  <small>Confirmações de leitura</small>
                </p>
              </div>
            </div>
          </section>

          <section className="whatsapp-integrations-side-card">
            <strong>Ajuda</strong>
            <p>
              Encontre Phone Number ID, WABA ID e Access Token no WhatsApp Manager da Meta.
            </p>
            <button type="button" className="whatsapp-integrations-support-button">
              <Headphones size={14} />
              Abrir suporte
            </button>
          </section>

          <section className="agent-training-insight-panel__tip-box">
            <strong>Dica IA</strong>
            <p>Valide as credenciais antes de ativar uma integração para produção.</p>
          </section>
          </div>
        </aside>
      </section>

      {isModalOpen ? (
        <div className="agent-training-training-modal" role="dialog" aria-modal="true" aria-label={modalTitle}>
          <button type="button" className="agent-training-training-modal__backdrop" onClick={closeModal} aria-label="Fechar modal" />

          <form className="agent-training-training-modal__content" onSubmit={handleSave}>
            <div className="agent-training-training-modal__header">
              <div>
                <span>{modalTitle}</span>
                <small>{WIZARD_STEPS[wizardStep - 1]}</small>
              </div>

              <button type="button" className="agent-training-training-modal__close" onClick={closeModal}>
                ×
              </button>
            </div>

            {renderWizardProgress()}
            {renderWizardStep()}
          </form>
        </div>
      ) : null}
    </main>
  );
}
