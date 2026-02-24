import { contentData } from '@/data/contentMockData';

/**
 * Mock hook wrapper for useContent (videos/materials)
 * Returns mock content data in React Query format
 * Used when USE_DB=false for safe rollback
 */
export function useMockContent() {
    return {
        data: contentData,
        isLoading: false,
        error: null,
        isError: false,
        isFetching: false,
        isSuccess: true,
    };
}

/**
 * Mock hook for single content item by ID
 */
export function useMockContentItem(contentId: string | undefined) {
    const item = contentId
        ? contentData.find(c => c.id === contentId)
        : undefined;

    return {
        data: item,
        isLoading: false,
        error: null,
        isError: false,
        isSuccess: !!item,
    };
}

/**
 * Mock hook for creating content
 */
export function useMockCreateContent() {
    return {
        mutate: (data: any) => {
            console.log('[MOCK] Creating content:', data);
        },
        mutateAsync: async (data: any) => {
            console.log('[MOCK] Creating content:', data);
            return Promise.resolve(data);
        },
        isLoading: false,
        isError: false,
        error: null,
    };
}

/**
 * Mock hook for updating content
 */
export function useMockUpdateContent() {
    return {
        mutate: (data: any) => {
            console.log('[MOCK] Updating content:', data);
        },
        mutateAsync: async (data: any) => {
            console.log('[MOCK] Updating content:', data);
            return Promise.resolve(data);
        },
        isLoading: false,
        isError: false,
        error: null,
    };
}

/**
 * Mock hook for deleting content
 */
export function useMockDeleteContent() {
    return {
        mutate: (contentId: string) => {
            console.log('[MOCK] Deleting content:', contentId);
        },
        mutateAsync: async (contentId: string) => {
            console.log('[MOCK] Deleting content:', contentId);
            return Promise.resolve({ id: contentId });
        },
        isLoading: false,
        isError: false,
        error: null,
    };
}
