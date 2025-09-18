import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextMods';
import BannerEditModal from './BannerEditModal';

const EditableBanner = ({ bannerUrl, onBannerUpdate, children, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { currentUser } = useAuth();

  // Verificar se o usuário é super_admin
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleBannerSave = (newBannerUrl) => {
    onBannerUpdate(newBannerUrl);
    setIsEditModalOpen(false);
  };

  if (!isSuperAdmin) {
    return <div className={className}>{children}</div>;
  }

  return (
    <>
      <motion.div
        className={`relative group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {/* Overlay escuro no hover */}
        <motion.div
          className="absolute inset-0 bg-black/70 z-10 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Ícone de edição centralizado */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8
          }}
          transition={{ duration: 0.2 }}
        >
          <motion.button
            onClick={handleEditClick}
            className="p-4 bg-white/20 hover:bg-white/30 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Edit3 size={24} />
          </motion.button>
        </motion.div>

        {/* Conteúdo do banner */}
        <div className="relative z-0">
          {children}
        </div>
      </motion.div>

      {/* Modal de edição */}
      <BannerEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentBannerUrl={bannerUrl}
        onSave={handleBannerSave}
      />
    </>
  );
};

export default EditableBanner;
