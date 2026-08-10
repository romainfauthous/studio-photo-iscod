import { useState } from "react";
import { AuthContext } from "./authContextInstance";

// Le fournisseur : il englobe l'app et distribue les infos d'auth
export function AuthProvider({ children }) {
  // On lit l'utilisateur stocké au démarrage (s'il existe déjà)
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  // Appelée au login réussi : on mémorise le token + l'utilisateur
  function login(token, userData) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  // Appelée à la déconnexion : on efface tout
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}