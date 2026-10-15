import React, { createContext, useState, useEffect, useContext } from 'react';
import { DEFAULT_THEME } from '../constants/theme';
import api from '../api/api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [colors, setColors] = useState(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(false);

  // Future-proof hook: check backend for customized admin theme colors
  useEffect(() => {
    const fetchCustomTheme = async () => {
      setIsLoading(true);
      try {
        // Point to our backend machine API
        const response = await api.get('/theme', { timeout: 3000 });
        if (response.data && response.data.colors) {
          setColors({
            ...DEFAULT_THEME,
            ...response.data.colors
          });
        }
      } catch (err) {
        // Fallback silently to default theme if backend server is unreachable or doesn't have custom styling
        console.log('[Theme] Using local default styles:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ colors, isLoading, setColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
