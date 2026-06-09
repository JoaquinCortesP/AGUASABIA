import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export function RegisterPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend
    console.log("Register", { nombre, email, password });
    navigate("/mapa");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-panel p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Crear Cuenta</h1>
          <p className="text-muted-foreground mt-2">Únete a AguaSabia para guardar tus análisis</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 transition"
          >
            Registrarme
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta? <Link to="/login" className="text-primary hover:underline">Inicia sesión</Link>
        </div>
      </div>
    </div>
  );
}
