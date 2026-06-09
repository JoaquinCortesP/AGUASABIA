import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "@/app/layouts/public-layout";
import { MainLayout } from "@/app/layouts/main-layout";
import { AdminLayout } from "@/app/layouts/admin-layout";
import { HomePage } from "@/pages/home-page";
import { MapPage } from "@/pages/map-page";
import { LearnPage } from "@/pages/learn-page";
import { ProfilePage } from "@/pages/profile-page";
import { AdminPage } from "@/pages/admin-page";
import { LoginPage } from "@/pages/login-page";
import { RegisterPage } from "@/pages/register-page";
import { HistorialPage } from "@/pages/historial-page";
import { NotFoundPage } from "@/pages/not-found-page";

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ]
  },
  {
    element: <MainLayout />,
    children: [
      { path: "/mapa", element: <MapPage /> },
      { path: "/aprender", element: <LearnPage /> },
      { path: "/perfil", element: <ProfilePage /> },
      { path: "/historial", element: <HistorialPage /> },
    ]
  },
  {
    element: <AdminLayout />,
    children: [
      { path: "/admin", element: <AdminPage /> },
    ]
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
