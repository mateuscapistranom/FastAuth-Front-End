import { useState, useEffect } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";
import "./Login.css";

const Login = () => {
  // Estados de controle de autenticação e fluxo
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");

  const API_URL = "http://localhost:5000";

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message.text]);

  const validatePassword = (password) => password.length >= 6;
  const validateEmail = (email) =>
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);

  // Conexão com backend: Autenticação de usuário
  const authenticateUser = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem("authToken", data.token); // Armazena o token
        fetchUserData();
        setPassword("");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro na autenticação", error);
      return false;
    }
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("Token não encontrado.");
      setIsAuthenticated(false); // Desautentica o usuário se não houver token
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // Enviando o token na requisição
        },
      });

      if (response.status === 401) {
        // Token expirado ou inválido
        console.error("Token expirado ou inválido.");
        localStorage.removeItem("authToken"); // Remove o token inválido
        setIsAuthenticated(false); // Desautentica o usuário
        return null;
      }

      if (!response.ok) {
        console.error("Erro ao buscar dados do usuário.");
        setIsAuthenticated(false); // Desautentica o usuário em caso de erro
        return null;
      }

      const data = await response.json();
      console.log(data); // Use os dados do usuário conforme necessário
      if (data.name) {
        setName(data.name); // Armazena o nome do usuário no estado
        setEmail(data.email); // Armazena o email do usuário no estado
        setIsAuthenticated(true); // Define como autenticado
      }
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      setIsAuthenticated(false); // Desautentica o usuário em caso de erro
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const isValid = await authenticateUser(email, password);

    if (isValid) {
      setMessage({ text: "Bem-vindo!", type: "success" });
      setIsAuthenticated(true);
    } else {
      setMessage({
        text: "Credenciais inválidas. Tente novamente.",
        type: "error",
      });
      setEmail("");
      setPassword("");
    }
    setIsLoading(false);
  };

  // Conexão com backend: Registro de novo usuário
  const handleRegister = async (event) => {
    event.preventDefault();
    if (!validateEmail(email))
      return setMessage({ text: "E-mail inválido.", type: "error" });
    if (!validatePassword(password))
      return setMessage({
        text: "A senha precisa ter pelo menos 6 caracteres.",
        type: "error",
      });

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (response.status === 201) {
        setMessage({
          text: "Registro realizado com sucesso!",
          type: "success",
        });
        setIsRegistered(false);
        setEmail("");
        setPassword("");
        setName("");
      } else {
        setMessage({
          text: data.error || "Erro ao registrar, tente novamente.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Erro no registro", error);
      setMessage({
        text: "Erro ao registrar, tente novamente.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Conexão com backend: Recuperação de senha
  const handlePasswordRecovery = async (event) => {
    event.preventDefault();
    if (!validateEmail(email))
      return setMessage({ text: "E-mail inválido.", type: "error" });

    setIsLoading(true);
    try {
      const response = await fetch("/api/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({
          text: "Um link de recuperação foi enviado.",
          type: "success",
        });
        setIsPasswordReset(true);
        setEmail("");
      } else {
        setMessage({
          text: "Erro ao enviar o link de recuperação.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Erro na recuperação de senha", error);
      setMessage({
        text: "Erro ao enviar o link de recuperação.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Conexão com backend: Atualização de dados do usuário
  const handleSaveUserData = async (event) => {
    event.preventDefault();
    if (password && !validatePassword(password))
      return setMessage({
        text: "A senha precisa ter pelo menos 6 caracteres.",
        type: "error",
      });

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (response.status === 200) {
        console.log(data);
        setMessage({ text: "Dados atualizados com sucesso!", type: "success" });
        setIsEditing(false);
        setPassword("");
        localStorage.setItem("authToken", data.token);
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
    localStorage.removeItem("authToken");
    setEmail("");
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

  const handleDeleteAccount = async () => {
    if (window.confirm("Tem certeza que deseja deletar sua conta?")) {
      try {
        const response = await fetch(`${API_URL}/users`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        if (response.status === 200) {
          setIsAuthenticated(false);
          localStorage.removeItem("authToken");
          setEmail("");
          setPassword("");
          setName("");
          setIsEditing(false);
          setMessage({ text: "Conta deletada com sucesso.", type: "success" });
        } else {
          throw new Error("Erro ao deletar conta.");
        }
      } catch (error) {
        setMessage({ text: error.message, type: "error" });
      }
    }
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              <button
                type="button"
                className="text-btn"
                onClick={() => setIsRegistered(true)}
              >
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              <button
                type="button"
                className="text-btn"
                onClick={() => setIsRegistered(false)}
              >
                Entrar
              </button>
            </p>
          </div>
        </form>
      )}

      {isPasswordReset && (
        <form
          onSubmit={handlePasswordRecovery}
          className="password-recovery-form"
        >
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
              <button
                type="button"
                className="text-btn"
                onClick={() => setIsPasswordReset(false)}
              >
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
          <button onClick={handleDeleteAccount} className="danger-btn">
            Deletar Conta
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
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FaEnvelope className="icon" />
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
              <button
                type="submit"
                disabled={isLoading}
                className="primary-btn"
                onClick={handleSaveUserData}
              >
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
