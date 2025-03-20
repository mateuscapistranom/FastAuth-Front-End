import React, { useState, useEffect } from "react";
import "./App.css";
import Login from "./Components/Login/Login";

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulação de chamada ao backend
        // const response = await fetch('/api/endpoint');
        // const data = await response.json();
      } catch (err) {
        setError("Erro ao carregar dados. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="App loading-screen">
        <div className="spinner">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App error-screen">
        <h1>Ocorreu um erro</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="App">
      {user ? (
        <div className="welcome-screen">
          <h1>Bem-vindo, {user.name}!</h1>
          <p>Email: {user.email}</p>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;