import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/config/supabase';

export interface SuperAdminUser {
    id: string;
    name: string;
    email: string;
    role: 'superadmin';
}

interface SuperAdminAuthContextType {
    superAdmin: SuperAdminUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'superAdminUser';

export const SuperAdminAuthProvider = ({ children }: { children: ReactNode }) => {
    const [superAdmin, setSuperAdmin] = useState<SuperAdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed?.id && parsed?.role === 'superadmin') {
                    setSuperAdmin(parsed);
                }
            } catch {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            // Step 1: Look up user by email (same as admin login)
            const { data: user, error: lookupError } = await supabase
                .from('users')
                .select('id, full_name, email, role, password_hash')
                .ilike('email', email)
                .maybeSingle();

            if (lookupError || !user) {
                console.warn('Super admin lookup failed — full error:', JSON.stringify(lookupError), '| user found:', !!user);
                return false;
            }

            // Step 2: Check role in JS — must be superadmin
            if (user.role !== 'superadmin') {
                console.warn('User found but role is not superadmin:', user.role);
                return false;
            }

            // Step 3: Verify password via bcrypt (same as admin login)
            if (user.password_hash) {
                const bcrypt = await import('bcryptjs');
                const match = await bcrypt.compare(password, user.password_hash);
                if (!match) {
                    console.warn('Password mismatch for superadmin');
                    return false;
                }
            } else {
                // No password hash — try Supabase Auth as fallback
                const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
                if (authError) {
                    console.warn('Supabase auth failed:', authError.message);
                    return false;
                }
            }

            // Step 4: Try to establish a Supabase Auth session for RLS (best effort)
            try {
                await supabase.auth.signInWithPassword({ email, password });
            } catch { /* ignore — bcrypt auth works even without Supabase session */ }

            // Step 5: Save to state + localStorage
            const adminUser: SuperAdminUser = {
                id: user.id,
                name: user.full_name || user.email,
                email: user.email,
                role: 'superadmin',
            };
            setSuperAdmin(adminUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
            return true;

        } catch (err) {
            console.error('Super admin login error:', err);
            return false;
        }
    };

    const logout = async () => {
        try { await supabase.auth.signOut(); } catch { /* ignore */ }
        setSuperAdmin(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <SuperAdminAuthContext.Provider value={{ superAdmin, isLoading, isAuthenticated: !!superAdmin, login, logout }}>
            {children}
        </SuperAdminAuthContext.Provider>
    );
};

export const useSuperAdminAuth = () => {
    const ctx = useContext(SuperAdminAuthContext);
    if (!ctx) throw new Error('useSuperAdminAuth must be used within SuperAdminAuthProvider');
    return ctx;
};
