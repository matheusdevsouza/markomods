
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContextMods = createContext();

export const useThemeMods = () => {
  const context = useContext(ThemeContextMods);
  if (!context) {
    throw new Error('useThemeMods deve ser usado dentro de um ThemeProviderMods');
  }
  return context;
};

export const ThemeProviderMods = ({ children }) => {
  // Função para obter o tema salvo ou usar dark como padrão
  const getInitialTheme = () => {
    try {
      const savedTheme = localStorage.getItem('eu_marko_mods_theme');
      return savedTheme || 'dark'; // Dark como padrão se não houver tema salvo
    } catch (error) {
      console.log('Erro ao carregar tema do localStorage, usando dark como padrão');
      return 'dark';
    }
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Função para salvar o tema no localStorage
  const saveThemeToStorage = (newTheme) => {
    try {
      localStorage.setItem('eu_marko_mods_theme', newTheme);
      console.log('🎨 Tema salvo no localStorage:', newTheme);
    } catch (error) {
      console.error('Erro ao salvar tema no localStorage:', error);
    }
  };

  // Função para mudar o tema
  const changeTheme = (newTheme) => {
    console.log('🔄 Mudando tema para:', newTheme);
    setTheme(newTheme);
    
    // Salvar no localStorage
    saveThemeToStorage(newTheme);
    
    // Aplicar tema ao documento
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      console.log('🌙 Classe dark adicionada');
    } else {
      root.classList.remove('dark');
      console.log('☀️ Classe dark removida');
    }
  };

  // Aplicar tema quando o componente montar ou o tema mudar
  useEffect(() => {
    console.log('🎯 Aplicando tema inicial:', theme);
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      console.log('🌙 Classe dark aplicada inicialmente');
    } else {
      root.classList.remove('dark');
      console.log('☀️ Classe dark removida inicialmente');
    }
  }, [theme]);

  const value = {
    theme,
    changeTheme
  };

  return (
    <ThemeContextMods.Provider value={value}>
      {children}
    </ThemeContextMods.Provider>
  );
};
