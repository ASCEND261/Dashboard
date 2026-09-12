"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setToken, removeToken } from "./api";

export type UserRole = "MEMBER" | "CORE_MEMBER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: { id: string; name: string; code: string };
  team?: { id: string; name: string };
  status?: string;
  has_access_code?: boolean;
  branch?: string;
  section?: string;
  department_unit?: string;
  enrollment_number?: string;
  sprint_track?: string;
}

export interface DemoAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_id: string;
  department_code?: string;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  demoAccounts: DemoAccount[];
  login: (email: string, password: string) => Promise<User>;
  loginWithOtp: (email: string, otp: string) => Promise<{ user: User; status: string }>;
  loginWithAccessCode: (code: string) => Promise<{ user: User; redirectUrl: string }>;
  loginWithDemo: (account: DemoAccount) => void;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

function normalizeRole(role: any): UserRole {
  const r = String(role || "").toUpperCase().replace(/[\s_-]/g, "");
  if (r.includes("ADMIN")) return "ADMIN";
  if (r.includes("CORE")) return "CORE_MEMBER";
  return "MEMBER";
}

function normalizeUser(u: any): User | null {
  if (!u) return null;
  return {
    ...u,
    role: normalizeRole(u.role),
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);

  // Initialize cached session synchronously to avoid layout flicker
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("ascend_user");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUser(normalizeUser(parsed));
        } catch {
          localStorage.removeItem("ascend_user");
        }
      }
    }

    // 1. Fetch available accounts (Sarthak Admin)
    api.getDemoAccounts()
      .then((accounts) => {
        setDemoAccounts(accounts);
      })
      .catch((err) => console.error("Error loading demo accounts:", err));

    // 2. Re-validate session in background with backend if token exists
    const token = typeof window !== "undefined" ? localStorage.getItem("ascend_token") : null;
    if (token) {
      api.getMe()
        .then((userData) => {
          if (userData) {
            const norm = normalizeUser(userData);
            setUser(norm);
            if (typeof window !== "undefined") {
              localStorage.setItem("ascend_user", JSON.stringify(norm));
            }
          }
        })
        .catch(() => {
          // Expired or invalid token
          removeToken();
          if (typeof window !== "undefined") {
            localStorage.removeItem("ascend_user");
          }
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.login({ email, password });
    setToken(res.access_token);
    const norm = normalizeUser(res.user)!;
    setUser(norm);
    if (typeof window !== "undefined") {
      localStorage.setItem("ascend_user", JSON.stringify(norm));
    }
    return norm;
  };

  const loginWithOtp = async (email: string, otp: string): Promise<{ user: User; status: string }> => {
    const res = await api.verifyOtp(email, otp);
    setToken(res.access_token);
    const norm = normalizeUser(res.user)!;
    setUser(norm);
    if (typeof window !== "undefined") {
      localStorage.setItem("ascend_user", JSON.stringify(norm));
    }
    return { user: norm, status: res.status };
  };

  const loginWithAccessCode = async (code: string): Promise<{ user: User; redirectUrl: string }> => {
    const res = await api.verifyAccessCode(code);
    setToken(res.access_token);
    const norm = normalizeUser(res.user)!;
    setUser(norm);
    if (typeof window !== "undefined") {
      localStorage.setItem("ascend_user", JSON.stringify(norm));
    }
    return { user: norm, redirectUrl: res.redirect_url };
  };

  const refreshUser = async (): Promise<User | null> => {
    try {
      const userData = await api.getMe();
      const norm = normalizeUser(userData);
      setUser(norm);
      if (typeof window !== "undefined") {
        localStorage.setItem("ascend_user", JSON.stringify(norm));
      }
      return norm;
    } catch {
      return null;
    }
  };

  const loginWithDemo = (account: DemoAccount) => {
    setToken(account.access_token);
    const personaUser: User = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: normalizeRole(account.role),
      status: "APPROVED",
      has_access_code: true,
      team: { id: account.team_id, name: account.team_id },
      department: account.department_code
        ? { id: "d1", name: account.department_code, code: account.department_code }
        : undefined,
    };
    setUser(personaUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("ascend_user", JSON.stringify(personaUser));
    }
  };

  const logout = () => {
    removeToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem("ascend_user");
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        demoAccounts,
        login,
        loginWithOtp,
        loginWithAccessCode,
        loginWithDemo,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
