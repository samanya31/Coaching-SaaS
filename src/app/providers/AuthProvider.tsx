import React, { createContext, useContext } from 'react';

interface AuthContextType {
    // Will be implemented in Phase 2
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Basic shell - will be implemented in Phase 2
    return (
        <AuthContext.Provider value={{}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
