import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../lib/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("crafts_token");
    if (!token) { setLoading(false); return; }
    authAPI.me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem("crafts_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password, role) => {
    const data = await authAPI.login({ email, password, role });
    localStorage.setItem("crafts_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const data = await authAPI.register(formData);
    localStorage.setItem("crafts_token", data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("crafts_token");
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUser) => { setUser(updatedUser); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isLoggedIn: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
