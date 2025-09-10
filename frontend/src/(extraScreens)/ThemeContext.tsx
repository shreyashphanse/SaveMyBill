import React, { createContext, useState, useContext } from "react";

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const lightTheme = {
    background: "#fff",
    text: {
      primary: "#003366",
      secondary: "#333333",
      highlight: "#2E4E3E",
      body: "#777777",
    },
  };

  const darkTheme = {
    background: "#181818",
    text: {
      primary: "#FFD54F",
      secondary: "#CCCCCC",
      highlight: "#BBDEFB",
      body: "#e0e0e0e7",
    },
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
