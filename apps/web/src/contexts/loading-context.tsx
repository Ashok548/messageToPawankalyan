'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadingManager } from '@/lib/loading-manager';
import { Spinner } from '@/components/ui/spinner';

interface LoadingContextValue {
    isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

interface LoadingProviderProps {
    children: ReactNode;
}

/**
 * Loading Provider - Manages global loading state
 * 
 * Subscribes to loading manager and displays a full-screen spinner
 * when API requests are in progress.
 */
export function LoadingProvider({ children }: LoadingProviderProps) {
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Subscribe to loading manager
        const unsubscribe = loadingManager.subscribe((loading) => {
            setIsLoading(loading);
        });

        // Cleanup on unmount
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <LoadingContext.Provider value={{ isLoading }}>
            {children}
            {isLoading && <Spinner fullScreen />}
        </LoadingContext.Provider>
    );
}

/**
 * Hook to access loading state
 */
export function useLoading(): LoadingContextValue {
    const context = useContext(LoadingContext);

    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }

    return context;
}
