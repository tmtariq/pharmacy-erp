/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const ACCENT_COLOR_MAP = {
  brand: { name: 'Medical Navy (Primary)', bg: 'bg-[#0B5E8E]', text: 'text-[#0B5E8E]', hex: '#0B5E8E' },
  secondary: { name: 'Teal (Secondary)', bg: 'bg-[#168A8A]', text: 'text-[#168A8A]', hex: '#168A8A' },
  accent: { name: 'Mint Glow (Accent)', bg: 'bg-[#72D6C1]', text: 'text-[#72D6C1]', hex: '#72D6C1' },
  emerald: { name: 'Clinical Success', bg: 'bg-[#249B72]', text: 'text-[#249B72]', hex: '#249B72' },
  amber: { name: 'Warning Amber', bg: 'bg-[#D99A2B]', text: 'text-[#D99A2B]', hex: '#D99A2B' },
  info: { name: 'Info Cyan', bg: 'bg-[#3B8FC4]', text: 'text-[#3B8FC4]', hex: '#3B8FC4' },
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || 'brand');

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    if (themeMode === 'light') {
      document.documentElement.classList.add('light-mode');
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('light-mode');
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
    document.documentElement.setAttribute('data-accent', accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const changeAccent = (color) => {
    if (ACCENT_COLOR_MAP[color]) {
      setAccentColor(color);
    }
  };

  const currentAccent = ACCENT_COLOR_MAP[accentColor] || ACCENT_COLOR_MAP.blue;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        toggleTheme,
        accentColor,
        changeAccent,
        currentAccent,
        availableAccents: ACCENT_COLOR_MAP
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
