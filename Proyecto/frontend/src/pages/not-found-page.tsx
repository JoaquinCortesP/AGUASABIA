import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md">
        <CardContent className="p-6 text-center">
          <div className="text-sm font-medium text-muted-foreground">404</div>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">
            Vista no encontrada
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            La ruta solicitada no existe dentro de la consola AGUASABIA.
          </p>
          <Link to="/app/dashboard" className={buttonVariants({ className: "mt-5" })}>
            Volver al dashboard
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
