
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Home, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Star,
  Rocket,
  Gamepad2,
  Palette,
  Music,
  Heart,
  Trophy
} from 'lucide-react';
import endermanImage from '../../assets/images/enderman2.png';
import particleImage from '../../assets/images/particle_roxa.png';

const NotFoundPage = () => {
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [floatingElements, setFloatingElements] = useState([]);
  const [isHovering, setIsHovering] = useState(false);
  const [gameMode, setGameMode] = useState(false);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState([]);
  const [gameTime, setGameTime] = useState(30);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const elements = [
      { id: 1, icon: Sparkles, delay: 0, x: 20, y: 20 },
      { id: 2, icon: Zap, delay: 0.5, x: 80, y: 60 },
      { id: 3, icon: Star, delay: 1, x: 60, y: 80 },
      { id: 4, icon: Rocket, delay: 1.5, x: 40, y: 40 },
      { id: 5, icon: Gamepad2, delay: 2, x: 70, y: 30 },
      { id: 6, icon: Palette, delay: 2.5, x: 30, y: 70 },
      { id: 7, icon: Music, delay: 3, x: 90, y: 50 },
      { id: 8, icon: Heart, delay: 3.5, x: 50, y: 90 },
    ];

    setFloatingElements(elements);
  }, []);

  useEffect(() => {
    if (!gameMode) return;

    const gameInterval = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          setGameMode(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    const targetInterval = setInterval(() => {
      if (gameMode) {
        setTargets(prev => [
          ...prev,
          {
            id: Date.now(),
            x: Math.random() * 80 + 10,
            y: Math.random() * 60 + 20,
            size: Math.random() * 20 + 20
          }
        ]);
      }
    }, 1000);

    return () => {
      clearInterval(gameInterval);
      clearInterval(targetInterval);
    };
  }, [gameMode]);

  useEffect(() => {
    const cleanup = setInterval(() => {
      setTargets(prev => prev.filter(target => Date.now() - target.id < 3000));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  const handleTargetClick = (targetId, targetX, targetY) => {
    setScore(prev => prev + 10);
    setTargets(prev => prev.filter(t => t.id !== targetId));
    
    const newParticle = {
      id: Date.now(),
      x: targetX,
      y: targetY,
      opacity: 1,
      scale: 0.5
    };
    
    setParticles(prev => [...prev, newParticle]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 750);
  };

  const startGame = () => {
    setGameMode(true);
    setScore(0);
    setGameTime(30);
    setTargets([]);
  };

  const parallaxX = (mousePosition.x - window.innerWidth / 2) * 0.01;
  const parallaxY = (mousePosition.y - window.innerHeight / 2) * 0.01;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1F1335] via-[#311C4A] to-[#000000] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((element) => {
          const IconComponent = element.icon;
          return (
            <motion.div
              key={element.id}
              className="absolute text-[#9F6E9F]/20"
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1, 0],
                rotate: [0, 360],
                y: [0, -20, 0]
              }}
              transition={{
                duration: 4,
                delay: element.delay,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <IconComponent size={24} />
            </motion.div>
          );
        })}
      </div>

      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(159, 110, 159, 0.35) 0%, transparent 50%)`
        }}
      />

      {gameMode && targets.map(target => (
        <motion.div
          key={target.id}
          className="absolute cursor-pointer z-20"
          style={{
            left: `${target.x}%`,
            top: `${target.y}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={() => handleTargetClick(target.id, target.x, target.y)}
          whileHover={{ scale: 1.2 }}
        >
          <img 
            src={endermanImage} 
            alt="Enderman" 
            style={{ width: `${target.size}px`, height: `${target.size}px` }}
            className="object-contain drop-shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200" 
          />
        </motion.div>
      ))}

      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute pointer-events-none z-30"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          initial={{ 
            opacity: 0, 
            scale: 0.3
          }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0.3, 1.5, 0]
          }}
          transition={{
            duration: 0.3,
            ease: "easeOut"
          }}
        >
          <img 
            src={particleImage} 
            alt="Partícula de Teleporte" 
            style={{ 
              width: '60px', 
              height: '60px',
              filter: 'drop-shadow(0 0 10px rgba(147, 51, 234, 0.8))'
            }}
            className="object-contain" 
          />
        </motion.div>
      ))}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center p-4">
        
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <motion.h1 
            className="text-9xl md:text-[12rem] font-black bg-gradient-to-r from-[#1F1335] via-[#9F6E9F] to-[#311C4A] bg-clip-text text-transparent"
            animate={{ 
              textShadow: [
                "0 0 20px rgba(159, 110, 159, 0.5)",
                "0 0 40px rgba(49, 28, 74, 0.8)",
                "0 0 20px rgba(159, 110, 159, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            404
          </motion.h1>
        </motion.div>

        <motion.div
          className="mb-12 max-w-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t('notFound.title')}
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            {t('notFound.description.line1')}
            <br />
            {t('notFound.description.line2')} <strong>{t('notFound.description.solution')}</strong>
            <i className="fas fa-arrow-down ml-2 text-gray-300"></i>
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link to="/">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#1F1335] via-[#9F6E9F] to-[#311C4A] hover:from-[#0D071A] hover:via-[#805B80] hover:to-[#1F1335] text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('notFound.actions.backToHome')}
              <AnimatePresence>
                {isHovering && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="ml-2"
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </Link>
        </motion.div>

        <motion.div
          className="fixed bottom-6 right-6 z-30"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {gameMode && (
            <motion.div
              className="absolute bottom-full right-0 mb-4 w-80 bg-black/80 backdrop-blur-md rounded-xl p-4 border border-purple-400/50 shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
            >
              {gameTime > 0 ? (
                <>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-[#CCFCDE] mb-2">🎯 {t('notFound.game.active')}</h3>
                    <p className="text-sm text-gray-300 mb-3">
                      {t('notFound.game.instructions')}
                    </p>
                    
                    <div className="flex justify-between items-center bg-[#1F1335]/40 rounded-lg p-3 mb-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-400">{score}</div>
                        <div className="text-xs text-gray-300">{t('notFound.game.points')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">{gameTime}</div>
                        <div className="text-xs text-gray-300">{t('notFound.game.seconds')}</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-yellow-400 mb-2">🏆 {t('notFound.game.finished')}</h3>
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      <div className="text-3xl font-black">{score}</div>
                                              <div className="text-sm">{t('notFound.game.totalScore')}</div>
                    </div>
                    
                    <p className="text-sm text-gray-300 mt-2">
                      {score === 0 && t('notFound.game.messages.tryAgain')}
                      {score > 0 && score < 50 && t('notFound.game.messages.goodTry')}
                      {score >= 50 && score < 100 && t('notFound.game.messages.excellent')}
                      {score >= 100 && t('notFound.game.messages.master')}
                    </p>
                  </div>
                </>
              )}
              
              <div className="flex gap-2">
                {gameTime === 0 ? (
                  <Button
                    onClick={startGame}
                    size="sm"
                    className="flex-1 bg-[#311C4A] hover:bg-[#1F1335] text-white"
                  >
                    {t('notFound.game.actions.playAgain')}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setGameMode(false);
                      setScore(0);
                      setGameTime(30);
                      setTargets([]);
                    }}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-red-400/50 text-red-400 hover:bg-red-400/10 hover:text-red-400"
                  >
                    {t('notFound.game.actions.stopGame')}
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          <Button
            onClick={startGame}
            variant="outline"
            size="lg"
            className="bg-black/20 border-[#9F6E9F]/50 text-[#CCFCDE] hover:bg-[#311C4A]/30 hover:border-[#2D6364] hover:text-white backdrop-blur-sm shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            🎮 {t('notFound.easterEgg.title')}
          </Button>
        </motion.div>

        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#9F6E9F]/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 border border-[#9F6E9F]/20 rounded-none pointer-events-none" />
    </div>
  );
};

export default NotFoundPage;
