import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import "../styles/auth/login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");

      await login({ email, password, remember });
      navigate("/");
    } catch (submitError) {
      setError(submitError.message || "Não foi possível entrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <Link to="/" className="login-brand">
            AI Sales
          </Link>

          <p className="login-description">
            Automatize suas vendas no WhatsApp com inteligência, velocidade e escala.
          </p>

          <div className="login-evolution">
            Plataforma em evolução contínua.
          </div>
        </div>

        <div className="login-right">
          <h2 className="login-title">
            Entrar na sua conta
          </h2>

          <button type="button" className="login-google-button">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="login-google-icon" />
            Entrar com Google
          </button>

          <div className="login-divider login-divider-email">
            <span></span>
            <strong>ou entre com e-mail</strong>
            <span></span>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Seu e-mail"
              className="login-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <input
              type="password"
              placeholder="Sua senha"
              className="login-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <div className="login-options-row">
              <label className="login-remember-wrapper">
                <input
                  type="checkbox"
                  className="login-remember-checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span className="login-remember-label">Mantenha-me conectado</span>
              </label>

              <a href="#" className="login-forgot-link">
                Esqueceu a senha?
              </a>
            </div>

            {error && (
              <p role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="login-submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="login-divider">
            <span></span>
            <strong>ou</strong>
            <span></span>
          </div>

          <Link to="/register" className="login-create-button">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
