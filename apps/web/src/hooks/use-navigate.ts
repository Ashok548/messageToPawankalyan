'use client';

import { useRouter } from 'next/navigation';
import { loadingManager } from '@/lib/loading-manager';

/**
 * Navigation hook that shows the global spinner instantly on click.
 * 
 * Drop-in replacement for router.push() — call navigate(href) instead.
 * The spinner stays visible through JS bundle download + GraphQL queries,
 * and hides automatically when NavigationLoadingWatcher detects the pathname change.
 */
export function useNavigate() {
    const router = useRouter();

    const navigate = (href: string) => {
        loadingManager.startNavigation();
        router.push(href);
    };

    return { navigate, router };
}
