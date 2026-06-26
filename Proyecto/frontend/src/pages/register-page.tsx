import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/features/auth/api/auth-api";
import { isAxiosError } from "axios";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authApi.register({ nombre, email, password });
      
      // Auto-login since verification is currently bypassed in backend
      try {
        await login({ email, password });
        navigate("/mapa");
      } catch (loginErr) {
        navigate("/login");
      }
    } catch (err: any) {
      if (isAxiosError(err) && err.response) {
        setError(err.response.data.detail || "Error al registrarse");
      } else {
        setError("Error de red o servidor no disponible");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-panel p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Crear Cuenta</h1>
          <p className="text-muted-foreground mt-2">Únete a AguaSabia para guardar tus análisis</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Nombre (Opcional)</label>
            <input 
              type="text" 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none transition"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input 
              type="password" 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirmar Contraseña</label>
            <input 
              type="password" 
              className="w-full p-2 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition disabled:opacity-50"
          >
            {isLoading ? "Registrando..." : "Registrarme"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline font-medium">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
