'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { loadingManager } from '@/lib/loading-manager';

/**
 * Layout-level component that watches pathname changes and stops 
 * navigation-triggered loading. This persists across page transitions
 * unlike per-page useEffect hooks.
 */
export function NavigationLoadingWatcher() {
    const pathname = usePathname();
    const prevPathname = useRef(pathname);

    useEffect(() => {
        if (prevPathname.current !== pathname) {
            prevPathname.current = pathname;

            // Pathname changed — navigation complete
            // Give a small delay for GraphQL queries to start before stopping
            if (loadingManager.navigationLoading) {
                const timer = setTimeout(() => {
                    loadingManager.stopNavigation();
                }, 300);
                return () => clearTimeout(timer);
            }
        }
    }, [pathname]);

    return null;
}
