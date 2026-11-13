import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api.js";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    api("/me")
      .then((r) => {
        if (active) setUser(r.user);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const signIn = async (credentials) => {
    const r = await api("/login", { method: "POST", body: credentials });
    setUser(r.user);
    return r.user;
  };
  const register = async (details) => {
    const r = await api("/register", { method: "POST", body: details });
    setUser(r.user);
    return r.user;
  };
  const signOut = async () => {
    try {
      await api("/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("Auth context missing");
  return value;
}
