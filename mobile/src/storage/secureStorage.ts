import * as SecureStore from "expo-secure-store";


const AUTH_TOKEN_KEY =
    "movieshelf_token";


let cachedAuthToken:
    | string
    | null
    | undefined;


export const getAuthToken =
    async (): Promise<
        string | null
    > => {
        if (
            cachedAuthToken !==
            undefined
        ) {
            return cachedAuthToken;
        }

        const token =
            await SecureStore
                .getItemAsync(
                    AUTH_TOKEN_KEY
                );

        cachedAuthToken =
            token;

        return token;
    };


export const setAuthToken =
    async (
        token: string
    ): Promise<void> => {
        const normalizedToken =
            token.trim();

        if (!normalizedToken) {
            throw new Error(
                "Geçerli bir oturum tokenı gereklidir."
            );
        }

        await SecureStore
            .setItemAsync(
                AUTH_TOKEN_KEY,
                normalizedToken
            );

        cachedAuthToken =
            normalizedToken;
    };


export const clearAuthToken =
    async (): Promise<void> => {
        /*
         * Uygulama belleğindeki tokenı
         * hemen geçersiz hale getirir.
         */
        cachedAuthToken =
            null;

        await SecureStore
            .deleteItemAsync(
                AUTH_TOKEN_KEY
            );
    };