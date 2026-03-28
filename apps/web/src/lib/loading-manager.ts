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
    private _navigationLoading = false;
    private lastEmittedState = false;

    private clearDebounceTimer(): void {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
    }

    private emitLoadingState(isLoading: boolean): void {
        if (this.lastEmittedState === isLoading) {
            return;
        }

        this.lastEmittedState = isLoading;
        this.notifySubscribers(isLoading);
    }

    private scheduleIdleCheck(): void {
        this.clearDebounceTimer();

        if (this.isLoading()) {
            this.emitLoadingState(true);
            return;
        }

        this.debounceTimer = setTimeout(() => {
            if (!this.isLoading()) {
                this.emitLoadingState(false);
            }
        }, this.DEBOUNCE_DELAY);
    }

    /**
     * Start a new loading operation
     */
    startLoading(): void {
        const wasLoading = this.isLoading();
        this.activeRequests++;
        this.clearDebounceTimer();

        // Notify subscribers immediately if this is the first request
        if (!wasLoading) {
            // Defer notification to avoid "Cannot update a component while rendering a different component" error
            setTimeout(() => this.emitLoadingState(true), 0);
        }
    }

    /**
     * Stop a loading operation
     */
    stopLoading(): void {
        this.activeRequests = Math.max(0, this.activeRequests - 1);
        this.scheduleIdleCheck();
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
        return this._navigationLoading || this.activeRequests > 0;
    }

    /**
     * Reset the loading state (useful for testing)
     */
    reset(): void {
        this.activeRequests = 0;
        this._navigationLoading = false;
        this.clearDebounceTimer();
        this.emitLoadingState(false);
    }

    /**
     * Mark that a navigation-triggered loading is active
     */
    startNavigation(): void {
        if (this._navigationLoading) {
            return;
        }

        const wasLoading = this.isLoading();
        this._navigationLoading = true;
        this.clearDebounceTimer();

        if (!wasLoading) {
            setTimeout(() => this.emitLoadingState(true), 0);
        }
    }

    /**
     * Check if a navigation-triggered loading is active
     */
    get navigationLoading(): boolean {
        return this._navigationLoading;
    }

    /**
     * Stop navigation loading and decrement counter
     */
    stopNavigation(): void {
        if (this._navigationLoading) {
            this._navigationLoading = false;
            this.scheduleIdleCheck();
        }
    }
}

// Export singleton instance
export const loadingManager = new LoadingManager();
