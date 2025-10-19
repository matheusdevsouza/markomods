import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <motion.footer 
      className="bg-stone-800/80 backdrop-blur-md text-center py-6 border-t-2 border-stone-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <p className="text-gray-400 text-sm">
        &copy; {year} Minecraft Mod Portal. Feito para fãs de Minecraft.
      </p>
      <p className="text-gray-500 text-xs mt-1">
        Minecraft é uma marca registrada da Mojang. Este site não é afiliado à Mojang.
      </p>
    </motion.footer>
  );
};

export default Footer;