import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Map, History, BookOpen, User, LogOut, Menu, X } from "lucide-react";

export function MainLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= 768 : false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isPro = user !== null && (["pago", "pro", "premium", "municipal"].includes(user.plan?.toLowerCase() || "") || user.role === "admin");

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    const collapsedClass = isCollapsed && !isMobile ? 'justify-center px-0' : '';
    return `flex items-center gap-2.5 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
      isActive 
        ? "bg-primary/10 text-primary border-l-4 border-primary rounded-l-none pl-3" 
        : "hover:bg-muted text-foreground hover:text-primary"
    } ${collapsedClass}`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Overlay for mobile when menu is open */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      <aside className={`
        ${isMobile 
          ? (isCollapsed ? '-translate-x-full' : 'translate-x-0') 
          : (isCollapsed ? 'w-20' : 'w-64')} 
        fixed md:relative z-50 h-full w-64 md:w-auto transition-transform md:transition-all duration-300 border-r border-border bg-card/95 backdrop-blur-md flex flex-col shadow-sm
      `}>
        <div className={`h-16 flex items-center ${(isCollapsed && !isMobile) ? 'justify-center' : 'px-6'} border-b border-border/60 justify-between`}>
          {(!isCollapsed || isMobile) && (
            <Link to="/" className="text-xl font-extrabold text-brand-gradient tracking-tight transition duration-300 hover:opacity-90">AguaSabia</Link>
          )}
          {(isCollapsed && !isMobile) && (
            <Link to="/" className="text-xl font-extrabold text-primary tracking-tight">AS</Link>
          )}
          {isMobile && !isCollapsed && (
            <button onClick={() => setIsCollapsed(true)} className="p-1">
               <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
        
        {!isMobile && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-5 bg-background border border-border rounded-full p-1 shadow-sm hover:bg-muted transition-colors z-10"
          >
            <Menu className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-hidden">
          <Link to="/mapa" className={getLinkClass("/mapa")} title={(isCollapsed && !isMobile) ? "Mapa Territorial" : undefined} onClick={() => isMobile && setIsCollapsed(true)}>
            <Map className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
            {(!isCollapsed || isMobile) && <span>Mapa Territorial</span>}
          </Link>
          
          {isAuthenticated && (
            <Link to="/historial" className={getLinkClass("/historial")} title={(isCollapsed && !isMobile) ? "Historial" : undefined} onClick={() => isMobile && setIsCollapsed(true)}>
              <History className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              {(!isCollapsed || isMobile) && <span>Historial</span>}
            </Link>
          )}
          
          <Link to="/aprender" className={getLinkClass("/aprender")} title={(isCollapsed && !isMobile) ? "Aprender" : undefined} onClick={() => isMobile && setIsCollapsed(true)}>
            <BookOpen className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
            {(!isCollapsed || isMobile) && <span>Aprender</span>}
          </Link>
        </nav>
        
        <div className={`p-4 border-t border-border/60 ${(isCollapsed && !isMobile) ? 'flex flex-col items-center gap-2' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/perfil" className={`flex items-center ${(isCollapsed && !isMobile) ? 'justify-center p-2' : 'justify-between px-4 py-2.5'} rounded-lg hover:bg-muted font-medium text-sm text-foreground hover:text-primary transition-all duration-200`} title={(isCollapsed && !isMobile) ? "Mi Perfil" : undefined} onClick={() => isMobile && setIsCollapsed(true)}>
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  {(!isCollapsed || isMobile) && <span>Mi Perfil</span>}
                </div>
                {(!isCollapsed || isMobile) && isPro && (
                  <span className="text-amber-400 text-xs drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" title="Plan Pro Activo">⭐</span>
                )}
              </Link>
              <button 
                onClick={() => { logout(); if (isMobile) setIsCollapsed(true); }}
                className={`w-full flex items-center ${(isCollapsed && !isMobile) ? 'justify-center p-2' : 'gap-2.5 px-4 py-2.5'} rounded-lg hover:bg-destructive/10 hover:text-destructive font-medium text-sm text-muted-foreground mt-1 transition-all duration-200`}
                title={(isCollapsed && !isMobile) ? "Cerrar Sesión" : undefined}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {(!isCollapsed || isMobile) && <span>Cerrar Sesión</span>}
              </button>
            </>
          ) : (
            <Link to="/login" className={`block ${(isCollapsed && !isMobile) ? 'p-2' : 'px-4 py-2.5'} rounded-lg bg-primary text-primary-foreground font-semibold text-sm text-center hover:bg-primary/90 transition-all duration-200 shadow-sm hover:scale-[1.02] active:scale-[0.98]`} title={(isCollapsed && !isMobile) ? "Iniciar Sesión" : undefined} onClick={() => isMobile && setIsCollapsed(true)}>
              {(isCollapsed && !isMobile) ? <User className="w-4 h-4" /> : "Iniciar Sesión"}
            </Link>
          )}
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-muted/20 relative">
        {/* Mobile menu toggle */}
        {isMobile && isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute top-4 left-4 z-40 p-2 bg-background border border-border rounded-md shadow-md hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        )}
        <Outlet />
      </main>
    </div>
  );
}
