import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

const MediaKitLayout = () => {
  return (
    <motion.div 
      className="flex flex-col min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <main className="flex-grow">
        <Outlet />
      </main>
      <motion.footer 
        className="text-center py-6 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p>&copy; {new Date().getFullYear()} Eu, Marko! Todos os direitos reservados.</p>
        <p>Desenvolvido com ❤️ e muito café.</p>
      </motion.footer>
    </motion.div>
  );
};

export default MediaKitLayout;