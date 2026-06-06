import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Droplets, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { demoAdmin, useAuthStore } from "@/app/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/features/auth/hooks/use-login";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";

export function LoginPage() {
  const navigate = useNavigate();
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const login = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@aguasabia.cl",
      password: "aguasabia",
    },
  });

  function startDemoSession() {
    setCredentials("demo-municipal-token", demoAdmin);
    navigate("/app/dashboard", { replace: true });
  }

  return (
    <main className="grid min-h-screen bg-muted/30 lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/12">
            <Droplets className="h-6 w-6" />
          </span>
          <div>
            <div className="text-base font-semibold">AGUASABIA</div>
            <div className="text-sm text-primary-foreground/72">
              Plataforma municipal inteligente
            </div>
          </div>
        </div>
        <div className="max-w-2xl">
          <p className="text-sm uppercase text-primary-foreground/70">
            Gestion hidrica territorial
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal">
            Monitoreo comunal, productores, parcelas y alertas en una consola B2G.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-primary-foreground/75">
            Disenada para administradores municipales, oficinas de riego y programas
            PRODESAL que necesitan operar con datos territoriales claros.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="rounded-lg border border-white/15 bg-white/10 p-4">
            ET0
            <div className="mt-2 text-2xl font-semibold">4,8 mm</div>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 p-4">
            Productores
            <div className="mt-2 text-2xl font-semibold">418</div>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 p-4">
            Alertas
            <div className="mt-2 text-2xl font-semibold">12</div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Acceso administrador municipal</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ingresa con credenciales JWT del backend FastAPI o usa la sesion demo.
            </p>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => login.mutate(values))}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Correo institucional</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" className="pl-9" {...form.register("email")} />
                </div>
                {form.formState.errors.email ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contrasena</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    className="pl-9"
                    type="password"
                    {...form.register("password")}
                  />
                </div>
                {form.formState.errors.password ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>

              {login.isError ? (
                <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950 dark:text-amber-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  No fue posible iniciar sesion con la API. Puedes revisar credenciales
                  o continuar con la sesion demo municipal.
                </div>
              ) : null}

              <Button className="w-full" type="submit" disabled={login.isPending}>
                {login.isPending ? "Validando..." : "Ingresar"}
              </Button>
              <Button
                className="w-full"
                type="button"
                variant="outline"
                onClick={startDemoSession}
              >
                Entrar en modo demo municipal
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
