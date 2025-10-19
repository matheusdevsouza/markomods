
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
  // função para obter o tema salvo ou usar dark como padrão
  const getInitialTheme = () => {
    try {
      const savedTheme = localStorage.getItem('eu_marko_mods_theme');
      return savedTheme || 'dark';
    } catch (error) {
      return 'dark';
    }
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // função para salvar o tema no localStorage
  const saveThemeToStorage = (newTheme) => {
    try {
      localStorage.setItem('eu_marko_mods_theme', newTheme);
    } catch (error) {
    }
  };

  // função para mudar o tema
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    
    // salvar no localStorage
    saveThemeToStorage(newTheme);
    
    // aplicar tema ao documento
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // aplicar tema quando o componente montar ou o tema mudar
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
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
