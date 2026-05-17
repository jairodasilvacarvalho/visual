import { Link } from "react-router-dom";
import "../styles/auth/login.css";

export default function Login() {
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

          <form className="login-form">
            <input type="email" placeholder="Seu e-mail" className="login-input" />
            <input type="password" placeholder="Sua senha" className="login-input" />

            <div className="login-options-row">
              <label className="login-remember-wrapper">
                <input type="checkbox" className="login-remember-checkbox" />
                <span className="login-remember-label">Mantenha-me conectado</span>
              </label>

              <a href="#" className="login-forgot-link">
                Esqueceu a senha?
              </a>
            </div>

            <button type="submit" className="login-submit-button">
              Entrar
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
