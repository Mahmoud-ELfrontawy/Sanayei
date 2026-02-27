import { createContext, useContext, useEffect, useState } from "react";

/* ================= TYPES ================= */
type Theme = "light" | "dark";

interface ThemeContextType {
    isDark: boolean;
    toggleTheme: () => void;
}

/* ================= CONTEXT ================= */
const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggleTheme: () => { },
});

/* ================= PROVIDER ================= */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        // Read saved preference from localStorage (default: light)
        const saved = localStorage.getItem("sanayei-theme");
        return (saved === "dark" ? "dark" : "light") as Theme;
    });

    // Apply data-theme attribute to <html> element
    useEffect(() => {
        const html = document.documentElement;
        html.setAttribute("data-theme", theme);
        localStorage.setItem("sanayei-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ isDark: theme === "dark", toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

/* ================= HOOK ================= */
export const useTheme = () => useContext(ThemeContext);
