import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 3, // Retry failed requests up to 3 times
            /**
             * @note uncomment the below retry block to enable custom retrying logic
             */

            // retry: (failureCount, error) => {
            //     if (error.response?.status === 404) {
            //         return false; // Don't retry on 404 errors
            //     }
            //     return failureCount < 3; // Retry up to 3 times for other errors
            // },
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff
            refetchOnWindowFocus: false, // Prevent automatic refetching on focus
            staleTime: 1000 * 60 * 5, // Mark data as fresh for 5 minutes
        },
    },
});

const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default QueryProvider;