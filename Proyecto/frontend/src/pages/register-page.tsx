import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/features/auth/api/auth-api";
import { isAxiosError } from "axios";

export function RegisterPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await authApi.register({ nombre, email, password });
      // Simular verificación automática para desarrollo/demostración
      try {
        await authApi.verifyEmail(email);
      } catch (verifErr) {
        console.error("Error al verificar correo automáticamente:", verifErr);
      }
      setSuccess(true);
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

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-panel p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">¡Registro Exitoso!</h1>
          <p className="text-muted-foreground mb-6">
            Hemos creado tu cuenta. <strong className="text-primary font-semibold">Para propósitos de demostración y pruebas académicas, tu correo electrónico ({email}) ha sido verificado automáticamente</strong> en el sistema. Ya puedes iniciar sesión de forma inmediata.
          </p>
          <Link to="/login" className="inline-block bg-primary text-primary-foreground py-2 px-6 rounded-md font-medium hover:bg-primary/90 transition">
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }


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
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition disabled:opacity-50"
          >
            {isLoading ? "Registrando..." : "Registrarme"}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
