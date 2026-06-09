import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/layouts/app-shell";
import { PublicLayout } from "@/app/layouts/public-layout";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { AlertasPage } from "@/pages/alertas-page";
import { AnalyticsPage } from "@/pages/analytics-page";
import { ConfiguracionPage } from "@/pages/configuracion-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { LoginPage } from "@/pages/login-page";
import { MapaTerritorialPage } from "@/pages/mapa-territorial-page";
import { MensajeriaPage } from "@/pages/mensajeria-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { ProductorProfilePage } from "@/pages/productor-profile-page";
import { ProductoresPage } from "@/pages/productores-page";
import { PublicDashboardPage } from "@/pages/public-dashboard-page";
import { PublicIndicatorsPage } from "@/pages/public-indicators-page";
import { PublicMapPage } from "@/pages/public-map-page";

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <PublicDashboardPage /> },
      { path: "indicadores", element: <PublicIndicatorsPage /> },
      { path: "mapa-publico", element: <PublicMapPage /> },
    ],
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "app",
        element: <AppShell />,
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "productores", element: <ProductoresPage /> },
          { path: "productores/:id", element: <ProductorProfilePage /> },
          { path: "mapa", element: <MapaTerritorialPage /> },
          { path: "analytics", element: <AnalyticsPage /> },
          { path: "alertas", element: <AlertasPage /> },
          { path: "mensajeria", element: <MensajeriaPage /> },
          { path: "configuracion", element: <ConfiguracionPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
