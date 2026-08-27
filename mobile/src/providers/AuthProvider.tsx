import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import type {
    PropsWithChildren,
} from "react";

import {
    getProfile,
    login as loginRequest,
} from "../api/auth.api";

import {
    ApiClientError,
    setUnauthorizedHandler,
} from "../api/client";

import {
    AuthContext,
} from "../context/AuthContext";

import {
    clearAuthToken,
    getAuthToken,
    setAuthToken,
} from "../storage/secureStorage";

import type {
    AuthUser,
    LoginInput,
    SessionStatus,
} from "../types/auth";


type StoredSessionResult = {
    user:
        AuthUser | null;

    status:
        Exclude<
            SessionStatus,
            "restoring"
        >;

    error:
        string | null;
};


const getErrorMessage =
    (
        error: unknown
    ) => {
        if (
            error instanceof
            Error
        ) {
            return error.message;
        }

        return "Oturum işlemi sırasında bilinmeyen bir hata oluştu.";
    };


const resolveStoredSession =
    async (): Promise<
        StoredSessionResult
    > => {
        try {
            const token =
                await getAuthToken();

            if (!token) {
                return {
                    user:
                        null,

                    status:
                        "guest",

                    error:
                        null,
                };
            }

            try {
                const response =
                    await getProfile();

                return {
                    user:
                        response.data,

                    status:
                        "authenticated",

                    error:
                        null,
                };
            } catch (error) {
                if (
                    error instanceof
                        ApiClientError &&
                    error.statusCode ===
                        401
                ) {
                    try {
                        await clearAuthToken();

                        return {
                            user:
                                null,

                            status:
                                "guest",

                            error:
                                null,
                        };
                    } catch (
                        storageError
                    ) {
                        return {
                            user:
                                null,

                            status:
                                "guest",

                            error:
                                getErrorMessage(
                                    storageError
                                ),
                        };
                    }
                }

                return {
                    user:
                        null,

                    status:
                        "unavailable",

                    error:
                        getErrorMessage(
                            error
                        ),
                };
            }
        } catch (error) {
            return {
                user:
                    null,

                status:
                    "unavailable",

                error:
                    getErrorMessage(
                        error
                    ),
            };
        }
    };


export function AuthProvider({
    children,
}: PropsWithChildren) {
    const [
        user,
        setUser,
    ] =
        useState<
            AuthUser | null
        >(
            null
        );

    const [
        sessionStatus,
        setSessionStatus,
    ] =
        useState<SessionStatus>(
            "restoring"
        );

    const [
        sessionError,
        setSessionError,
    ] =
        useState<
            string | null
        >(
            null
        );


    const applySessionResult =
        useCallback(
            (
                result:
                    StoredSessionResult
            ) => {
                setUser(
                    result.user
                );

                setSessionStatus(
                    result.status
                );

                setSessionError(
                    result.error
                );
            },
            []
        );


    const restoreSession =
        useCallback(
            async () => {
                setSessionStatus(
                    "restoring"
                );

                setSessionError(
                    null
                );

                const result =
                    await resolveStoredSession();

                applySessionResult(
                    result
                );
            },
            [
                applySessionResult,
            ]
        );


    const login =
        useCallback(
            async (
                input: LoginInput
            ) => {
                setSessionError(
                    null
                );

                const response =
                    await loginRequest(
                        input
                    );

                const {
                    token,
                    user:
                        authenticatedUser,
                } =
                    response.data;

                if (
                    !token?.trim() ||
                    !authenticatedUser
                ) {
                    throw new ApiClientError(
                        "Sunucudan geçerli bir giriş yanıtı alınamadı."
                    );
                }

                /*
                 * Kullanıcı authenticated
                 * sayılmadan önce token güvenli
                 * storage'a yazılır.
                 */
                await setAuthToken(
                    token
                );

                setUser(
                    authenticatedUser
                );

                setSessionStatus(
                    "authenticated"
                );

                return authenticatedUser;
            },
            []
        );


    const logout =
        useCallback(
            async () => {
                setSessionError(
                    null
                );

                try {
                    await clearAuthToken();
                } catch (error) {
                    setSessionError(
                        getErrorMessage(
                            error
                        )
                    );

                    throw error;
                } finally {
                    /*
                     * Logout istendiğinde UI
                     * her durumda guest olur.
                     */
                    setUser(
                        null
                    );

                    setSessionStatus(
                        "guest"
                    );
                }
            },
            []
        );


    useEffect(
        () => {
            setUnauthorizedHandler(
                logout
            );

            return () => {
                setUnauthorizedHandler(
                    null
                );
            };
        },
        [
            logout,
        ]
    );


    useEffect(
        () => {
            let isActive =
                true;

            void resolveStoredSession()
                .then(
                    (result) => {
                        if (
                            !isActive
                        ) {
                            return;
                        }

                        applySessionResult(
                            result
                        );
                    }
                );

            return () => {
                isActive =
                    false;
            };
        },
        [
            applySessionResult,
        ]
    );


    const refreshProfile =
        useCallback(
            async () => {
                try {
                    const response =
                        await getProfile();

                    setUser(
                        response.data
                    );

                    setSessionStatus(
                        "authenticated"
                    );

                    setSessionError(
                        null
                    );

                    return response.data;
                } catch (error) {
                    if (
                        error instanceof
                            ApiClientError &&
                        error.statusCode ===
                            401
                    ) {
                        try {
                            await clearAuthToken();
                        } catch (
                            storageError
                        ) {
                            setSessionError(
                                getErrorMessage(
                                    storageError
                                )
                            );
                        }

                        setUser(
                            null
                        );

                        setSessionStatus(
                            "guest"
                        );
                    }

                    throw error;
                }
            },
            []
        );


    const value =
        useMemo(
            () => ({
                user,

                sessionStatus,

                sessionError,

                isAuthenticated:
                    sessionStatus ===
                        "authenticated" &&
                    user !== null,

                isRestoring:
                    sessionStatus ===
                    "restoring",

                login,

                logout,

                restoreSession,

                refreshProfile,
            }),
            [
                user,
                sessionStatus,
                sessionError,
                login,
                logout,
                restoreSession,
                refreshProfile,
            ]
        );


    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}