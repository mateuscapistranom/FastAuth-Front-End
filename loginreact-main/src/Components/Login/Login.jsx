import { useState, useEffect } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import "./Login.css";

const Login = () => {
  // Estados de controle de autenticação e fluxo
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const validatePassword = (password) => password.length >= 6;
  const validateEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);

  // Conexão com backend: Autenticação de usuário
  const authenticateUser = async (username, password) => {
    try {
      const response = await fetch("/api/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (data.isAuthenticated) setName(data.user?.name || "");
      return data.isAuthenticated;
    } catch (error) {
      console.error("Erro na autenticação", error);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const isValid = await authenticateUser(username, password);
    
    if (isValid) {
      setMessage({ text: "Bem-vindo!", type: "success" });
      setIsAuthenticated(true);
    } else {
      setMessage({ text: "Credenciais inválidas. Tente novamente.", type: "error" });
      setUsername("");
      setPassword("");
    }
    setIsLoading(false);
  };

  // Conexão com backend: Registro de novo usuário
  const handleRegister = async (event) => {
    event.preventDefault();
    if (!validateEmail(username)) return setMessage({ text: "E-mail inválido.", type: "error" });
    if (!validatePassword(password)) return setMessage({ text: "A senha precisa ter pelo menos 6 caracteres.", type: "error" });

    setIsLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, name }),
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage({ text: "Registro realizado com sucesso!", type: "success" });
        setIsRegistered(false);
        setUsername("");
        setPassword("");
        setName("");
      } else {
        setMessage({ text: data.error || "Erro ao registrar, tente novamente.", type: "error" });
      }
    } catch (error) {
      console.error("Erro no registro", error);
      setMessage({ text: "Erro ao registrar, tente novamente.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Conexão com backend: Recuperação de senha
  const handlePasswordRecovery = async (event) => {
    event.preventDefault();
    if (!validateEmail(email)) return setMessage({ text: "E-mail inválido.", type: "error" });

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
        setEmail("");
      } else {
        setMessage({ text: "Erro ao enviar o link de recuperação.", type: "error" });
      }
    } catch (error) {
      console.error("Erro na recuperação de senha", error);
      setMessage({ text: "Erro ao enviar o link de recuperação.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // Conexão com backend: Atualização de dados do usuário
  const handleSaveUserData = async (event) => {
    event.preventDefault();
    if (password && !validatePassword(password)) return setMessage({ text: "A senha precisa ter pelo menos 6 caracteres.", type: "error" });

    setIsLoading(true);
    try {
      const response = await fetch("/api/updateUser", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, ...(password && { newPassword: password }) }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({ text: "Dados atualizados com sucesso!", type: "success" });
        setIsEditing(false);
        setPassword("");
      } else {
        throw new Error(data.error || "Erro na atualização");
      }
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setName("");
    setIsEditing(false);
    setMessage({ text: "Você foi deslogado.", type: "success" });
  };

  const handleEditUserData = () => {
    isAuthenticated 
      ? setIsEditing(!isEditing) 
      : setMessage({ text: "Faça login para editar os dados.", type: "error" });
  };

  return (
    <div className="container">
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === "success" ? "✔" : "❌"}
          {message.text}
        </div>
      )}

      {!isAuthenticated && !isPasswordReset && !isRegistered && (
        <form onSubmit={handleSubmit} className="login-form">
          <h1>FastAuth: Autenticação Rápida</h1>
          <div className="input-field">
            <input
              type="email"
              placeholder="E-mail"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FaEnvelope className="icon" />
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
            <p className="text-btn" onClick={() => setIsPasswordReset(true)}>
              Esqueceu sua senha?
            </p>
          </div>
          <button type="submit" disabled={isLoading} className="primary-btn">
            {isLoading ? "Carregando..." : "Login"}
          </button>
          <div className="signup-link">
            <p>
              Não tem uma conta?{" "}
              <button type="button" className="text-btn" onClick={() => setIsRegistered(true)}>
                Registrar-se
              </button>
            </p>
          </div>
        </form>
      )}

      {isRegistered && (
        <form onSubmit={handleRegister} className="registration-form">
          <h1>Criar Nova Conta</h1>
          <div className="input-field">
            <input
              type="text"
              placeholder="Nome completo"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <FaUser className="icon" />
          </div>
          <div className="input-field">
            <input
              type="email"
              placeholder="E-mail"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <FaEnvelope className="icon" />
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
          <button type="submit" disabled={isLoading} className="primary-btn">
            {isLoading ? "Carregando..." : "Registrar"}
          </button>
          <div className="signin-link">
            <p>
              Já tem uma conta?{" "}
              <button type="button" className="text-btn" onClick={() => setIsRegistered(false)}>
                Entrar
              </button>
            </p>
          </div>
        </form>
      )}

      {isPasswordReset && (
        <form onSubmit={handlePasswordRecovery} className="password-recovery-form">
          <h1>Recuperação de Senha</h1>
          <div className="input-field">
            <input
              type="email"
              placeholder="Digite seu e-mail"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FaEnvelope className="icon" />
          </div>
          <button type="submit" disabled={isLoading} className="primary-btn">
            {isLoading ? "Carregando..." : "Recuperar Senha"}
          </button>
          <div className="signin-link">
            <p>
              Já tem uma conta?{" "}
              <button type="button" className="text-btn" onClick={() => setIsPasswordReset(false)}>
                Entrar
              </button>
            </p>
          </div>
        </form>
      )}

      {isAuthenticated && (
        <div className="user-dashboard">
          <h1>Bem-vindo, {name}!</h1>
          <button onClick={handleLogout} className="primary-btn">
            Sair
          </button>
          <button onClick={handleEditUserData} className="secondary-btn">
            {isEditing ? "Cancelar" : "Editar Dados"}
          </button>
          
          {isEditing && (
            <form onSubmit={handleSaveUserData} className="edit-user-form">
              <div className="input-field">
                <input
                  type="text"
                  placeholder="Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FaUser className="icon" />
              </div>
              <div className="input-field">
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <FaLock className="icon" />
              </div>
              <button type="submit" disabled={isLoading} className="primary-btn">
                {isLoading ? "Salvando..." : "Salvar"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Login;