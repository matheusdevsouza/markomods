import React, { useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, ShieldCheck } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const PublicLayout = () => {
  const { session, currentUserProfile, logout, loadingAuth } = useAuth();
  const { mediaKitPublicData } = useData();
  const { toast } = useToast();

  const handleLogoutClick = () => {
    logout();
    toast({ title: "Logout Realizado", description: "Você foi desconectado com sucesso."});
  };

  const profileFullName = mediaKitPublicData?.profile?.full_name || "Seu Nome";

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
             <img src="/marko logo.png" alt="Eu Marko Mods Logo" className="h-6 w-auto" />
            <span className="font-bold sm:inline-block gradient-text">Media Kit</span>
          </Link>
          <nav className="flex flex-1 items-center space-x-4">
            {/* Add public navigation links here if needed later */}
          </nav>
          <div className="flex items-center space-x-3">
            {loadingAuth ? (
              <div className="h-5 w-20 bg-muted/50 animate-pulse rounded-md"></div>
            ) : session?.user ? (
              <>
                {currentUserProfile?.role === 'admin' && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin" className="flex items-center">
                      <Settings size={16} className="mr-1 md:mr-2"/> <span className="hidden md:inline">Admin</span>
                    </Link>
                  </Button>
                )}
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {currentUserProfile?.username || session.user.email}
                  {currentUserProfile?.is_verified && <ShieldCheck className="inline h-4 w-4 ml-1 text-accent" title="Verificado"/>}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogoutClick} className="glow-on-hover">
                  <LogOut size={16} className="mr-1 md:mr-2" /> <span className="hidden md:inline">Sair</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="bg-gradient-to-r from-purple-500 to-purple-600 text-white glow-on-hover">
                  <Link to="/contact">Contato</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t border-border/40 bg-background/95">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} {profileFullName}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;