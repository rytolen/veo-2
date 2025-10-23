
let apiKey: string | null = null;

export const setApiKey = (key: string): void => {
    if (key && key.trim()) {
        apiKey = key.trim();
        localStorage.setItem('gemini-api-key', apiKey);
    }
};

export const getApiKey = (): string | null => {
    if (apiKey) {
        return apiKey;
    }
    apiKey = localStorage.getItem('gemini-api-key');
    return apiKey;
};

export const hasApiKey = (): boolean => {
    return getApiKey() !== null;
};

export const clearApiKey = (): void => {
    apiKey = null;
    localStorage.removeItem('gemini-api-key');
}
