const DEFAULT_LOCAL_API_BASE_URL =
    "http://localhost:5000";

const configuredApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL
        ?.trim();


// API adresinin geçerli HTTP/HTTPS URL olduğunu doğrular
const validateApiBaseUrl = (
    value
) => {
    let parsedUrl;

    try {
        parsedUrl =
            new URL(value);
    } catch {
        throw new Error(
            "VITE_API_BASE_URL geçerli bir URL olmalıdır."
        );
    }

    if (
        parsedUrl.protocol !==
            "http:" &&
        parsedUrl.protocol !==
            "https:"
    ) {
        throw new Error(
            "VITE_API_BASE_URL HTTP veya HTTPS kullanmalıdır."
        );
    }

    /*
     * Endpoint birleştirilirken çift slash
     * oluşmaması için sondaki slash'leri kaldırır.
     */
    return value.replace(
        /\/+$/,
        ""
    );
};


const API_BASE_URL =
    validateApiBaseUrl(
        configuredApiBaseUrl ||
        DEFAULT_LOCAL_API_BASE_URL
    );


const TOKEN_KEY =
    "movieshelf_token";

const DEFAULT_REQUEST_TIMEOUT_MS =
    15000;


const getStoredToken = () => {
    return localStorage.getItem(
        TOKEN_KEY
    );
};


const createRequestError = (
    message,
    {
        status = null,
        errors = [],
        code = "REQUEST_ERROR",
    } = {}
) => {
    const error =
        new Error(
            message
        );

    error.status =
        status;

    error.errors =
        errors;

    error.code =
        code;

    return error;
};


const parseResponseBody =
    async (
        response
    ) => {
        if (
            response.status ===
            204
        ) {
            return null;
        }

        const contentType =
            response.headers.get(
                "content-type"
            ) || "";

        try {
            if (
                contentType.includes(
                    "application/json"
                )
            ) {
                return await response.json();
            }

            const text =
                await response.text();

            if (!text) {
                return null;
            }

            return {
                message: text,
            };
        } catch {
            return null;
        }
    };


const apiRequest = async (
    endpoint,
    options = {}
) => {
    const {
        timeoutMs =
            DEFAULT_REQUEST_TIMEOUT_MS,

        signal:
            externalSignal,

        headers:
            customHeaders,

        ...fetchOptions
    } = options;

    const token =
        getStoredToken();

    const headers =
        new Headers(
            customHeaders ||
            {}
        );

    if (
        !headers.has(
            "Accept"
        )
    ) {
        headers.set(
            "Accept",
            "application/json"
        );
    }

    const hasBody =
        fetchOptions.body !==
            undefined &&
        fetchOptions.body !==
            null;

    const isFormData =
        typeof FormData !==
            "undefined" &&
        fetchOptions.body instanceof
            FormData;

    const isUrlSearchParams =
        typeof URLSearchParams !==
            "undefined" &&
        fetchOptions.body instanceof
            URLSearchParams;

    if (
        hasBody &&
        !isFormData &&
        !isUrlSearchParams &&
        !headers.has(
            "Content-Type"
        )
    ) {
        headers.set(
            "Content-Type",
            "application/json"
        );
    }

    if (
        token &&
        !headers.has(
            "Authorization"
        )
    ) {
        headers.set(
            "Authorization",
            `Bearer ${token}`
        );
    }

    const controller =
        new AbortController();

    let didTimeout =
        false;

    const normalizedTimeout =
        Number.isFinite(
            timeoutMs
        ) &&
        timeoutMs > 0
            ? timeoutMs
            : DEFAULT_REQUEST_TIMEOUT_MS;

    const timeoutId =
        setTimeout(
            () => {
                didTimeout =
                    true;

                controller.abort();
            },
            normalizedTimeout
        );

    const handleExternalAbort =
        () => {
            controller.abort();
        };

    if (
        externalSignal
    ) {
        if (
            externalSignal.aborted
        ) {
            controller.abort();
        } else {
            externalSignal.addEventListener(
                "abort",
                handleExternalAbort,
                {
                    once: true,
                }
            );
        }
    }

    try {
        const response =
            await fetch(
                `${API_BASE_URL}${endpoint}`,
                {
                    ...fetchOptions,

                    headers,

                    signal:
                        controller.signal,
                }
            );

        const body =
            await parseResponseBody(
                response
            );

        if (
            !response.ok
        ) {
            throw createRequestError(
                body?.message ||
                    `İstek başarısız oldu (${response.status}).`,
                {
                    status:
                        response.status,

                    errors:
                        body?.errors ||
                        [],

                    code:
                        "HTTP_ERROR",
                }
            );
        }

        return body;
    } catch (error) {
        if (
            error?.code ===
            "HTTP_ERROR"
        ) {
            throw error;
        }

        if (
            controller.signal
                .aborted
        ) {
            if (
                didTimeout
            ) {
                throw createRequestError(
                    "İstek zaman aşımına uğradı. Lütfen tekrar deneyin.",
                    {
                        code:
                            "REQUEST_TIMEOUT",
                    }
                );
            }

            throw createRequestError(
                "İstek iptal edildi.",
                {
                    code:
                        "REQUEST_ABORTED",
                }
            );
        }

        throw createRequestError(
            "Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.",
            {
                code:
                    "NETWORK_ERROR",
            }
        );
    } finally {
        clearTimeout(
            timeoutId
        );

        if (
            externalSignal
        ) {
            externalSignal
                .removeEventListener(
                    "abort",
                    handleExternalAbort
                );
        }
    }
};


export {
    API_BASE_URL,
    apiRequest,
};