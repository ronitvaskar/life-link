import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("token")
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    const loadUser = async () => {
      try {
        const response = await api.get("/users/me");
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to load user:", error);

        localStorage.removeItem("token");
        setToken(null);
        setUser(null);

        delete api.defaults.headers.common.Authorization;
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);

    api.defaults.headers.common.Authorization =
      `Bearer ${newToken}`;

    setToken(newToken);
    setUser(userData || null);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("token");

    delete api.defaults.headers.common.Authorization;

    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        logout,
        loading,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}