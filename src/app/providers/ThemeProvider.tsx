import React, { createContext, useContext } from 'react';

interface ThemeContextType {
    // Will be implemented in Phase 2
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Basic shell - will be implemented in Phase 2
    return (
        <ThemeContext.Provider value={{}}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};
