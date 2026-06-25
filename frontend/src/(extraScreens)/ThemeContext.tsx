import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("darkMode");

        if (savedTheme !== null) {
          setIsDarkMode(JSON.parse(savedTheme));
        }
      } catch (err) {
        console.log("Error loading theme:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

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
      body: "#E0E0E0",
    },
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  if (loading) return null;

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        setIsDarkMode,
        theme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
