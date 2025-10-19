
import React from 'react';
import { motion } from 'framer-motion';
import { useThemeMods } from '@/contexts/ThemeContextMods';

const BackgroundEffects = () => {
  const { theme } = useThemeMods();
  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-0 left-0 w-[150vw] h-[150vh] opacity-5"
        style={{
          backgroundImage: 'url("/src/assets/images/minecraft-bg.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '512px',
        }}
        animate={{
          x: ['-50px', '50px', '-50px'],
          y: ['-50px', '0px', '-50px'],
        }}
        transition={{
          duration: 60,
          ease: "linear",
          repeat: Infinity,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-background opacity-50" />
      
      {/* orbs flutuantes */}
      {[
        { top: '15%', left: '20%', width: 180, height: 180, animX: 30, animY: 20, duration: 18 },
        { top: '65%', left: '75%', width: 220, height: 220, animX: -25, animY: 15, duration: 22 },
        { top: '35%', left: '80%', width: 150, height: 150, animX: 20, animY: -30, duration: 16 },
        { top: '80%', left: '15%', width: 200, height: 200, animX: -20, animY: -25, duration: 20 },
        { top: '45%', left: '45%', width: 160, height: 160, animX: 15, animY: 25, duration: 19 }
      ].map((orb, i) => (
        <motion.div
          key={`orb-${i}`}
          className={`absolute rounded-full blur-3xl ${
            isLight 
              ? 'bg-primary/25 shadow-2xl shadow-primary/30' 
              : 'bg-primary/10'
          }`}
          style={{
            width: orb.width,
            height: orb.height,
            top: orb.top,
            left: orb.left,
          }}
          animate={{
            x: [0, orb.animX, 0],
            y: [0, orb.animY, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: orb.duration,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      ))}

      {/* orbs adicionais */}
      {isLight && [
        { top: '25%', left: '60%', width: 120, height: 120, animX: 35, animY: -20, duration: 24 },
        { top: '70%', left: '60%', width: 100, height: 100, animX: -30, animY: 25, duration: 26 },
        { top: '50%', left: '25%', width: 140, height: 140, animX: 25, animY: 30, duration: 23 }
      ].map((orb, i) => (
        <motion.div
          key={`light-orb-${i}`}
          className="absolute rounded-full bg-purple-400/20 blur-2xl shadow-xl shadow-purple-400/40"
          style={{
            width: orb.width,
            height: orb.height,
            top: orb.top,
            left: orb.left,
          }}
          animate={{
            x: [0, orb.animX, 0],
            y: [0, orb.animY, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: orb.duration,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        />
      ))}

      {/* gradientes */}
      {isLight && (
        <>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-100/10 via-transparent to-blue-100/10" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-200/15 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-100/10 via-transparent to-transparent" />
        </>
      )}
    </div>
  );
};

export default BackgroundEffects;
