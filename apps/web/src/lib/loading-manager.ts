/**
 * Loading Manager - Singleton to bridge Apollo Links and React Context
 * 
 * This manager tracks active API requests and notifies subscribers
 * when the loading state changes. It handles concurrent requests
 * by maintaining a counter.
 */

type LoadingCallback = (isLoading: boolean) => void;

class LoadingManager {
    private activeRequests = 0;
    private subscribers: Set<LoadingCallback> = new Set();
    private debounceTimer: NodeJS.Timeout | null = null;
    private readonly DEBOUNCE_DELAY = 200; // ms

    /**
     * Start a new loading operation
     */
    startLoading(): void {
        this.activeRequests++;
        console.log("Active requests: ", this.activeRequests);
        // Clear any pending debounce timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }

        // Notify subscribers immediately if this is the first request
        if (this.activeRequests === 1) {
            // Defer notification to avoid "Cannot update a component while rendering a different component" error
            setTimeout(() => this.notifySubscribers(true), 0);
        }
    }

    /**
     * Stop a loading operation
     */
    stopLoading(): void {
        this.activeRequests = Math.max(0, this.activeRequests - 1);

        // Only hide spinner when all requests are complete
        if (this.activeRequests === 0) {
            // Debounce to prevent flashing for very fast requests
            this.debounceTimer = setTimeout(() => {
                if (this.activeRequests === 0) {
                    this.notifySubscribers(false);
                }
            }, this.DEBOUNCE_DELAY);
        }
    }

    /**
     * Subscribe to loading state changes
     */
    subscribe(callback: LoadingCallback): () => void {
        this.subscribers.add(callback);

        // Return unsubscribe function
        return () => {
            this.subscribers.delete(callback);
        };
    }

    /**
     * Notify all subscribers of loading state change
     */
    private notifySubscribers(isLoading: boolean): void {
        this.subscribers.forEach(callback => callback(isLoading));
    }

    /**
     * Get current loading state
     */
    isLoading(): boolean {
        return this.activeRequests > 0;
    }

    /**
     * Reset the loading state (useful for testing)
     */
    reset(): void {
        this.activeRequests = 0;
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        this.notifySubscribers(false);
    }
}

// Export singleton instance
export const loadingManager = new LoadingManager();
