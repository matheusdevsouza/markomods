import React, { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShieldCheck, UserCircle, LogIn, LogOut, UserPlus } from 'lucide-react';
import { AuthContext } from '@/App';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { currentUser, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <motion.nav 
      className="bg-card/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b-2 border-border"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <img  src="/assets/minecraft-logo.png" alt="Minecraft Mod Portal Logo" className="h-10 w-auto" src="https://images.unsplash.com/photo-1614680376739-414d95ff43df" />
            <span className="text-2xl font-bold gradient-text-minecraft">ModPortal</span>
          </Link>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <NavLink 
              to="/" 
              className={({isActive}) => 
                `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/20 ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:text-foreground'}`
              }
            >
              <Home size={18} className="mr-0 md:mr-2" />
              <span className="hidden md:inline">Início</span>
            </NavLink>

            {currentUser?.role === 'admin' && (
              <>
                <NavLink 
                  to="/admin" 
                  className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/20 ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:text-foreground'}`
                  }
                >
                  <ShieldCheck size={18} className="mr-0 md:mr-2" />
                  <span className="hidden md:inline">Admin</span>
                </NavLink>
              </>
            )}

            {currentUser ? (
              <>
                <span className="text-sm text-foreground/70 hidden lg:inline">Olá, {currentUser.display_name || currentUser.username}!</span>
                <Button onClick={onLogout} variant="outline" size="sm" className="minecraft-btn border-destructive text-destructive-foreground hover:bg-destructive/80">
                  <LogOut size={16} className="mr-0 md:mr-2" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </>
            ) : (
              <>
                <NavLink 
                  to="/login" 
                  className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/20 ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:text-foreground'}`
                  }
                >
                  <LogIn size={18} className="mr-0 md:mr-2" />
                  <span className="hidden md:inline">Login</span>
                </NavLink>
                <NavLink 
                  to="/register" 
                  className={({isActive}) => 
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/20 ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:text-foreground'}`
                  }
                >
                  <UserPlus size={18} className="mr-0 md:mr-2" />
                  <span className="hidden md:inline">Registrar</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;