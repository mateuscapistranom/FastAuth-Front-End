import { useState, useEffect } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // Novo estado para o nome
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const authenticateUser = async (username, password) => {
    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      return data.isAuthenticated;
    } catch (error) {
      console.error("Erro na autenticação", error);
      return false;
    }
  };

  const clearFields = () => {
    setUsername("");
    setPassword("");
    setEmail("");
    setName(""); // Limpa o campo de nome também
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!validateEmail(username)) {
      setMessage({ text: "E-mail inválido.", type: "error" });
      return;
    }
    if (!validatePassword(password)) {
      setMessage({ text: "A senha precisa ter pelo menos 6 caracteres.", type: "error" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, name }), // Inclui o nome no registro
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ text: "Registro realizado com sucesso!", type: "success" });
        setIsRegistered(true);
        clearFields(); // Limpa os campos após o registro bem-sucedido
      } else {
        setMessage({ text: data.error || "Erro ao registrar, tente novamente.", type: "error" });
        clearFields(); // Limpa os campos em caso de erro
      }
    } catch (error) {
      console.error("Erro no registro", error);
      setMessage({ text: "Erro ao registrar, tente novamente.", type: "error" });
      clearFields(); // Limpa os campos em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    if (!validateEmail(username)) {
      setMessage({ text: "E-mail inválido.", type: "error" });
      setIsLoading(false);
      clearFields(); // Limpa os campos em caso de e-mail inválido
      return;
    }
    const isValid = await authenticateUser(username, password);
    if (isValid) {
      setMessage({ text: "Bem-vindo!", type: "success" });
      setIsAuthenticated(true);
    } else {
      setMessage({ text: "Credenciais inválidas. Tente novamente.", type: "error" });
      clearFields(); // Limpa os campos em caso de credenciais inválidas
    }
    setIsLoading(false);
  };

  const handlePasswordRecovery = async (event) => {
    event.preventDefault();
    if (!validateEmail(email)) {
      setMessage({ text: "E-mail inválido.", type: "error" });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ text: "Um link de recuperação foi enviado.", type: "success" });
        setIsPasswordReset(true);
        clearFields(); // Limpa os campos após o envio bem-sucedido
      } else {
        setMessage({ text: "Erro ao enviar o link de recuperação.", type: "error" });
        clearFields(); // Limpa os campos em caso de erro
      }
    } catch (error) {
      console.error("Erro na recuperação de senha", error);
      setMessage({ text: "Erro ao enviar o link de recuperação.", type: "error" });
      clearFields(); // Limpa os campos em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === "success" ? (
            <span className="success-icon">✔</span>
          ) : (
            <span className="error-icon">❌</span>
          )}
          {message.text}
        </div>
      )}

      {!isAuthenticated && !isPasswordReset && !isRegistered && (
        <form onSubmit={handleSubmit}>
          <h1>Inicie sua sessão</h1>
          <div className="input-field">
            <input
              type="text"
              placeholder="E-mail"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FaUser className="icon" />
          </div>
          <div className="input-field">
            <input
              type="password"
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className="icon" />
          </div>
          <div className="recall-forget">
            <label>
              <input type="checkbox" />
              Lembre de mim
            </label>
            <a href="#" onClick={() => setIsPasswordReset(true)}>
              Esqueceu sua senha?
            </a>
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Carregando..." : "Login"}
          </button>
          <div className="signup-link">
            <p>
              Não tem uma conta?{" "}
              <a href="#" onClick={() => setIsRegistered(true)}>
                Registrar
              </a>
            </p>
          </div>
        </form>
      )}

      {isAuthenticated && (
        <div className="welcome-message">
          <h1>Bem-vindo, {username}!</h1>
          <p>Você foi autenticado com sucesso.</p>
        </div>
      )}

      {isRegistered && (
        <form onSubmit={handleRegister}>
          <h1>Registre-se</h1>
          <div className="input-field">
            <input
              type="text"
              placeholder="Nome"
              required
              value={name}
              onChange={(e) => setName(e.target.value)} // Campo de nome
            />
            <FaUser className="icon" />
          </div>
          <div className="input-field">
            <input
              type="text"
              placeholder="E-mail"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FaUser className="icon" />
          </div>
          <div className="input-field">
            <input
              type="password"
              placeholder="Senha"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <FaLock className="icon" />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Carregando..." : "Registrar"}
          </button>
          <div className="signup-link">
            <p>
              Já tem uma conta?{" "}
              <a href="#" onClick={() => setIsRegistered(false)}>
                Fazer login
              </a>
            </p>
          </div>
        </form>
      )}

      {isPasswordReset && (
        <form onSubmit={handlePasswordRecovery}>
          <h1>Recuperar Senha</h1>
          <div className="input-field">
            <input
              type="email"
              placeholder="E-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaEnvelope className="icon" />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Carregando..." : "Recuperar"}
          </button>
          <div className="signup-link">
            <p>
              Já lembrou sua senha?{" "}
              <a href="#" onClick={() => setIsPasswordReset(false)}>
                Voltar para login
              </a>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;