import {createContext, useContext, useState, ReactNode} from "react";
import {useColorScheme} from "react-native";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  setTheme: () => {},
  isDark: false,
});

export function ThemeProvider({children}: {children: ReactNode}) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>("system");

  const isDark = theme === "system"
    ? systemColorScheme === "dark"
    : theme === "dark";

  return (
    <ThemeContext.Provider value={{theme, setTheme, isDark}}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

