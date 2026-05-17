import { Link } from "react-router-dom";
import "../styles/auth/register.css";

export default function Register() {
  return (
    <div className="register-page">

      <div className="register-container">

        <div className="register-left">

          <Link to="/" className="register-brand">
            AI Sales
          </Link>

          <p className="register-description">
            Crie sua conta e comece a transformar conversas em vendas com IA.
          </p>

          <div className="register-evolution">
            Plataforma em evolução contínua.
          </div>

        </div>

        <div className="register-right">

          <h2 className="register-title">
            Criar sua conta
          </h2>

          <p className="register-subtitle">
            Comece em poucos minutos.
          </p>

          <form className="register-form">

            <input
              type="text"
              placeholder="Seu nome"
              className="register-input"
            />

            <input
              type="email"
              placeholder="Seu e-mail"
              className="register-input"
            />

            <input
              type="password"
              placeholder="Crie uma senha"
              className="register-input"
            />

            <input
              type="password"
              placeholder="Confirme sua senha"
              className="register-input"
            />

            <button
              type="submit"
              className="register-submit-button"
            >
              Criar conta
            </button>

          </form>

          <div className="register-divider">
            <span></span>
            <strong>OU</strong>
            <span></span>
          </div>

          <Link
            to="/login"
            className="register-login-button"
          >
            Já tenho conta
          </Link>

        </div>

      </div>

    </div>
  );
}
