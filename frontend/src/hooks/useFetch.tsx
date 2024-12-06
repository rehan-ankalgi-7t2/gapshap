import { useState, useEffect } from 'react';

interface FetchState<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
}

function useFetch<T>(url: string): FetchState<T> {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        error: null,
        isLoading: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const result: T = await response.json();
                setState({ data: result, error: null, isLoading: false });
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
                setState({ data: null, error: errorMessage, isLoading: false });
            }
        };

        fetchData();
    }, [url]);

    return state;
}

export default useFetch;