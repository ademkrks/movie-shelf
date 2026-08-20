const DEFAULT_TIMEOUT_MS =
    10000;


type ApiErrorPayload = {
    success?: boolean;
    status?: string;
    message?: string;
};


type RequestOptions =
    RequestInit & {
        timeoutMs?: number;
    };


const getApiBaseUrl = () => {
    const configuredUrl =
        process.env
            .EXPO_PUBLIC_API_BASE_URL
            ?.trim();

    if (!configuredUrl) {
        throw new Error(
            "EXPO_PUBLIC_API_BASE_URL tanımlanmamış."
        );
    }

    let parsedUrl: URL;

    try {
        parsedUrl =
            new URL(
                configuredUrl
            );
    } catch {
        throw new Error(
            "EXPO_PUBLIC_API_BASE_URL geçerli bir URL olmalıdır."
        );
    }

    if (
        parsedUrl.protocol !==
            "http:" &&
        parsedUrl.protocol !==
            "https:"
    ) {
        throw new Error(
            "EXPO_PUBLIC_API_BASE_URL HTTP veya HTTPS kullanmalıdır."
        );
    }

    return configuredUrl.replace(
        /\/+$/,
        ""
    );
};


export class ApiClientError
    extends Error {
    statusCode?: number;

    payload?: ApiErrorPayload;

    constructor(
        message: string,
        statusCode?: number,
        payload?: ApiErrorPayload
    ) {
        super(message);

        this.name =
            "ApiClientError";

        this.statusCode =
            statusCode;

        this.payload =
            payload;
    }
}


const parseResponseBody =
    async (
        response: Response
    ): Promise<unknown> => {
        const text =
            await response.text();

        if (!text) {
            return null;
        }

        try {
            return JSON.parse(
                text
            );
        } catch {
            return text;
        }
    };


export const apiRequest =
    async <T>(
        path: string,
        options: RequestOptions = {}
    ): Promise<T> => {
        const {
            timeoutMs =
                DEFAULT_TIMEOUT_MS,

            signal:
                externalSignal,

            headers:
                customHeaders,

            ...fetchOptions
        } = options;

        const controller =
            new AbortController();

        let didTimeout =
            false;

        const timeoutId =
            setTimeout(
                () => {
                    didTimeout =
                        true;

                    controller.abort();
                },
                timeoutMs
            );

        const handleExternalAbort =
            () => {
                controller.abort();
            };

        if (externalSignal) {
            if (
                externalSignal.aborted
            ) {
                controller.abort();
            }
            else {
                externalSignal.addEventListener(
                    "abort",
                    handleExternalAbort
                );
            }
        }

        try {
            const baseUrl =
                getApiBaseUrl();

            const normalizedPath =
                path.startsWith("/")
                    ? path
                    : `/${path}`;

            const response =
                await fetch(
                    `${baseUrl}${normalizedPath}`,
                    {
                        ...fetchOptions,

                        signal:
                            controller.signal,

                        headers: {
                            Accept:
                                "application/json",

                            ...customHeaders,
                        },
                    }
                );

            const body =
                await parseResponseBody(
                    response
                );

            if (!response.ok) {
                const payload =
                    typeof body ===
                        "object" &&
                    body !== null
                        ? body as
                            ApiErrorPayload
                        : undefined;

                throw new ApiClientError(
                    payload?.message ??
                        `API isteği başarısız oldu (${response.status}).`,
                    response.status,
                    payload
                );
            }

            return body as T;
        } catch (error) {
            if (
                error instanceof
                ApiClientError
            ) {
                throw error;
            }

            if (
                didTimeout
            ) {
                throw new ApiClientError(
                    "Sunucu isteği zaman aşımına uğradı."
                );
            }

            if (
                error instanceof
                    Error &&
                error.name ===
                    "AbortError"
            ) {
                throw new ApiClientError(
                    "İstek iptal edildi."
                );
            }

            if (
                error instanceof
                Error
            ) {
                throw new ApiClientError(
                    error.message
                );
            }

            throw new ApiClientError(
                "Sunucuya bağlanırken bilinmeyen bir hata oluştu."
            );
        } finally {
            clearTimeout(
                timeoutId
            );

            externalSignal
                ?.removeEventListener(
                    "abort",
                    handleExternalAbort
                );
        }
    };


export const getConfiguredApiBaseUrl =
    () => {
        return getApiBaseUrl();
    };