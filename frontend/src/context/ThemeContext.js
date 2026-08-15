import { createContext, useContext, useEffect, useState } from 'react';
import localStorageService from '../services/localStorageService';

/**
 * Contexto de tema (dark/light).
 * O padrão do app sempre foi dark — só passa a "light" se o usuário escolher
 * explicitamente. A escolha fica salva em localStorage e é aplicada via
 * atributo data-theme na tag <html>, que as variáveis CSS (src/index.css)
 * usam pra decidir a paleta.
 */

const STORAGE_KEY = 'AGILFACIL_THEME';

export const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorageService.getItem(STORAGE_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorageService.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (value) => setThemeState(value === 'light' ? 'light' : 'dark');
  const toggleTheme = () => setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

/** Hook de atalho */
export const useAppTheme = () => useContext(ThemeContext);
