import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "@/features/auth/api/auth-api";
import { isAxiosError } from "axios";

export function RegisterPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
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
      setStep("verify");
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await authApi.verifyEmail(email, verificationCode);
      setSuccess(true);
    } catch (err: any) {
      if (isAxiosError(err) && err.response) {
        setError(err.response.data.detail || "Código de verificación incorrecto");
      } else {
        setError("Código incorrecto o error al verificar");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-panel p-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">¡Registro Completado!</h1>
          <p className="text-muted-foreground mb-6">
            Tu correo electrónico ({email}) ha sido verificado con éxito. Tu cuenta ya está activa y lista para ser usada.
          </p>
          <Link to="/login" className="inline-block bg-primary text-primary-foreground py-2 px-6 rounded-md font-medium hover:bg-primary/90 transition">
            Iniciar Sesión ahora
          </Link>
        </div>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-panel p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary">Verificación de Correo</h1>
            <p className="text-muted-foreground mt-2">
              Hemos enviado un código de 6 dígitos a su correo <strong className="text-foreground">{email}</strong>.
            </p>
            <p className="text-xs text-amber-500 font-semibold mt-1">
              (Por favor, revise la consola del servidor backend para copiar el código generado)
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 text-center">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1 text-center">Código de Verificación</label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary outline-none transition text-center text-xl font-bold tracking-widest"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || verificationCode.length < 6}
              className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition disabled:opacity-50"
            >
              {isLoading ? "Verificando..." : "Verificar Código"}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ingresaste mal tu correo?{" "}
            <button onClick={() => setStep("register")} className="text-primary hover:underline font-medium">
              Volver al registro
            </button>
          </div>
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
