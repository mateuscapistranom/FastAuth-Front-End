import React, { useState, useEffect } from "react";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

// Função para obter o token CSRF do cookie
const getCsrfToken = () => {
  const cookie = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return cookie ? decodeURIComponent(cookie[1]) : "";
};

// Função de validação de inputs
const validateInputs = (name, email) => {
  if (!name || !email) {
    return { valid: false, message: "Nome e e-mail são obrigatórios" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, message: "Formato de e-mail inválido" };
  }
  return { valid: true };
};

const UserManagement = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/users", {
          credentials: "include",
          headers: {
            "X-XSRF-TOKEN": getCsrfToken(),
          },
        });

        const data = await response.json();

        if (!response.ok) throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
        
        setUsers(data);
      } catch (error) {
        setMessage({ text: `Erro ao buscar usuários: ${error.message}`, type: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const clearFields = () => {
    setName("");
    setEmail("");
    setPassword("");
    setEditingUserId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateInputs(name, email);
    if (!validation.valid) {
      setMessage({ text: validation.message, type: "error" });
      return;
    }

    if (!editingUserId && !password) {
      setMessage({ text: "Senha é obrigatória para novo usuário", type: "error" });
      return;
    }

    setIsLoading(true);
    const url = editingUserId ? `/api/users/${editingUserId}` : "/api/users";
    const method = editingUserId ? "PUT" : "POST";
    
    try {
      const userData = { name, email, ...(password && { password }) };

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": getCsrfToken(),
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(`Erro na API: ${response.status} - ${data.message}`);

      setUsers((prevUsers) => 
        editingUserId ? prevUsers.map(user => user.id === editingUserId ? data : user) : [...prevUsers, data]
      );

      setMessage({
        text: `Usuário ${editingUserId ? "atualizado" : "criado"} com sucesso!`,
        type: "success",
      });
      clearFields();
    } catch (error) {
      setMessage({ text: `Erro ao salvar usuário: ${error.message}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "X-XSRF-TOKEN": getCsrfToken(),
        },
      });

      if (!response.ok) throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      
      setUsers(users.filter(user => user.id !== id));
      setMessage({ text: "Usuário excluído com sucesso!", type: "success" });
    } catch (error) {
      setMessage({ text: `Erro ao excluir usuário: ${error.message}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setName(user.name);
    setEmail(user.email);
    setEditingUserId(user.id);
    setPassword(""); // Reseta o campo de senha ao editar um usuário
  };

  return (
    <div className="container">
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === "success" ? "✔" : "ERROR"} {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <h1>{editingUserId ? "Editar Usuário" : "Cadastrar um Novo Usuário"}</h1>

        <div className="input-field">
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
          <FaUser className="icon" />
        </div>

        <div className="input-field">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <FaEnvelope className="icon" />
        </div>

        <div className="input-field">
          <input
            type="password"
            placeholder={editingUserId ? "Nova senha (opcional)" : "Senha"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <FaLock className="icon" />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Carregando..." : editingUserId ? "Atualizar" : "Criar"}
        </button>
      </form>

      <div className="user-list">
        <h2>Usuários FastAuth</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <span>{user.name} - {user.email}</span>
              <div className="actions">
                <button onClick={() => handleEdit(user)}>Editar</button>
                <button onClick={() => handleDelete(user.id)}>Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserManagement;
