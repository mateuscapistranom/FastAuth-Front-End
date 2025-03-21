import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Login from "./Components/Login/Login";
import UserManagement from "./Components/UserManagement/UserManagement"; 

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulação de verificação de sessão
        // const response = await fetch('/api/check-session');
        // const data = await response.json();
        // if (data.user) setUser(data.user);
      } catch (err) {
        setError("Erro ao verificar sessão.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Salvar no localStorage se necessário
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    // Limpar localStorage
    localStorage.removeItem('user');
  };

  if (loading) {
    return <div className="App loading-screen">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="App error-screen">
        <h1>Erro</h1>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Recarregar</button>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <div className="welcome-screen">
                  <h1>Bem-vindo, {user.name}!</h1>
                  <p>Email: {user.email}</p>
                  <button className="logout-button" onClick={handleLogout}>
                    Logout
                  </button>
                  <UserManagement />
                </div>
              ) : (
                <Login 
                  onLogin={handleLogin} 
                  onLogout={handleLogout} 
                />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;