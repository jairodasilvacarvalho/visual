import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import "../styles/auth/register.css";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      await register({ email, password, remember: true });
      navigate("/");
    } catch (submitError) {
      setError(submitError.message || "Não foi possível criar a conta.");
    } finally {
      setIsSubmitting(false);
    }
  }

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

          <form className="register-form" onSubmit={handleSubmit}>

            <input
              type="text"
              placeholder="Seu nome"
              className="register-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />

            <input
              type="email"
              placeholder="Seu e-mail"
              className="register-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />

            <input
              type="password"
              placeholder="Crie uma senha"
              className="register-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              required
            />

            <input
              type="password"
              placeholder="Confirme sua senha"
              className="register-input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
            />

            {error && (
              <p role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="register-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar conta"}
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
