import { batches, type Batch } from '@/data/batchesMockData';

/**
 * Mock hook wrapper for useBatches
 * Returns mock batch data in React Query format
 * Used when USE_DB=false for safe rollback
 */
export function useMockBatches() {
    return {
        data: batches,
        isLoading: false,
        error: null,
        isError: false,
        isFetching: false,
        isSuccess: true,
    };
}

/**
 * Mock hook for single batch by ID
 */
export function useMockBatch(batchId: string | undefined) {
    const batch = batchId
        ? batches.find(b => b.id === batchId)
        : undefined;

    return {
        data: batch,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: !!batch,
    };
}

/**
 * Mock hook for creating batches
 */
export function useMockCreateBatch() {
    return {
        mutate: (data: any) => {
            console.log('[MOCK] Creating batch:', data);
        },
        mutateAsync: async (data: any) => {
            console.log('[MOCK] Creating batch:', data);
            return Promise.resolve(data);
        },
        isLoading: false,
        isError: false,
        error: null,
    };
}

/**
 * Mock hook for updating batches
 */
export function useMockUpdateBatch() {
    return {
        mutate: (data: any) => {
            console.log('[MOCK] Updating batch:', data);
        },
        mutateAsync: async (data: any) => {
            console.log('[MOCK] Updating batch:', data);
            return Promise.resolve(data);
        },
        isLoading: false,
        isError: false,
        error: null,
    };
}

/**
 * Mock hook for deleting batches
 */
export function useMockDeleteBatch() {
    return {
        mutate: (batchId: string) => {
            console.log('[MOCK] Deleting batch:', batchId);
        },
        mutateAsync: async (batchId: string) => {
            console.log('[MOCK] Deleting batch:', batchId);
            return Promise.resolve({ id: batchId });
        },
        isLoading: false,
        isError: false,
        error: null,
    };
}
