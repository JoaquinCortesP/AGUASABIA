import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { UserProfile, LoginPayload } from "@/types/territory";
import { authApi } from "../api/auth-api";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (data: LoginPayload) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const claims = parseJwt(token);
      if (claims && claims.role === "admin") {
        const adminData = await authApi.getAdminProfile();
        setUser({
          id: adminData.id,
          nombre: adminData.nombre || "Administrador",
          email: adminData.email,
          plan: "premium", // Admins have unlimited/premium capabilities
          is_active: adminData.is_active,
          created_at: new Date().toISOString(),
          role: "admin"
        });
      } else {
        const profile = await authApi.getProfile();
        setUser({
          ...profile,
          role: "usuario"
        });
      }
    } catch (error) {
      console.error("Failed to load profile", error);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    loadUser();

    const handleUnauthorized = () => {
      setUser(null);
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const login = async (data: LoginPayload) => {
    const response = await authApi.login(data);
    localStorage.setItem("token", response.access_token);
    await loadUser();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
