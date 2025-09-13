import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout = () => {
  const { session, currentUserProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    logout();
    navigate('/'); 
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            to="/"
            className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base mb-4"
          >
            <img src="/favicon.svg" alt="Logo" className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Media Kit</span>
          </Link>
          <Link
            to="/admin"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
           <Link
            to="/"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10"
          >
            <Home className="h-4 w-4" />
            Ver Site Público
          </Link>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 flex-grow">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex-1">
             <h1 className="text-xl font-semibold gradient-text">Painel Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden md:inline">
              {currentUserProfile?.username || session?.user?.email} ({currentUserProfile?.role})
            </span>
            <Button onClick={handleLogoutClick} variant="outline" size="sm" className="glow-on-hover">
              <LogOut size={16} className="mr-2" /> Sair
            </Button>
          </div>
        </header>
        <main className="flex-grow p-4 sm:px-6 sm:py-0">
          <Outlet />
        </main>
        <footer className="text-center py-4 text-xs text-muted-foreground border-t">
            Painel Administrativo &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;