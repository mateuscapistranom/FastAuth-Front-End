const API_URL = "";

export const api = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha na autenticação");
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return { error: error.message || "Erro ao conectar-se ao servidor" };
    }
  },

  register: async (username, email, password) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha no registro");
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao registrar:", error);
      return { error: error.message || "Erro ao conectar-se ao servidor" };
    }
  },

  recoverPassword: async (email) => {
    try {
      const response = await fetch(`${API_URL}/recover-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha na recuperação de senha");
      }
      return await response.json();
    } catch (error) {
      console.error("Erro ao recuperar senha:", error);
      return { error: error.message || "Erro ao conectar-se ao servidor" };
    }
  },
};
