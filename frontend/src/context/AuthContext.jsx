import {
    createContext,
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    changePassword as changePasswordRequest,
    getProfile,
    login as loginRequest,
    updateProfile as updateProfileRequest,
} from "../api/auth.api";


const AuthContext =
    createContext(null);


const TOKEN_KEY =
    "movieshelf_token";


function AuthProvider({
    children,
}) {
    const [
        user,
        setUser,
    ] = useState(null);

    const [
        isLoading,
        setIsLoading,
    ] = useState(
        () =>
            Boolean(
                localStorage.getItem(
                    TOKEN_KEY
                )
            )
    );

    const [
        sessionError,
        setSessionError,
    ] = useState("");


    const logout =
        useCallback(() => {
            localStorage.removeItem(
                TOKEN_KEY
            );

            setUser(null);

            setSessionError("");
        }, []);


    const handleSessionError =
        useCallback(
            (
                requestError
            ) => {
                /*
                 * 401:
                 * Token geçersiz veya süresi dolmuş.
                 *
                 * 404:
                 * Token geçerli görünse bile kullanıcı
                 * hesabı artık mevcut değil.
                 */
                if (
                    requestError.status ===
                        401 ||
                    requestError.status ===
                        404
                ) {
                    localStorage.removeItem(
                        TOKEN_KEY
                    );

                    setUser(null);

                    setSessionError("");


                    return false;
                }


                /*
                 * Network, timeout veya 5xx gibi
                 * geçici hatalarda token korunur.
                 */
                setUser(null);

                setSessionError(
                    requestError.message ||
                        "Oturum doğrulanamadı. Lütfen tekrar deneyin."
                );


                return false;
            },
            []
        );


    const login =
        async (
            credentials
        ) => {
            const result =
                await loginRequest(
                    credentials
                );


            const authData =
                result.data;


            if (
                !authData?.token ||
                !authData?.user
            ) {
                throw new Error(
                    "Giriş cevabı geçersiz."
                );
            }


            localStorage.setItem(
                TOKEN_KEY,
                authData.token
            );


            setUser(
                authData.user
            );

            setSessionError("");


            return authData.user;
        };


    const updateProfile =
        async (
            profileData
        ) => {
            const result =
                await updateProfileRequest(
                    profileData
                );


            if (
                !result.data
            ) {
                throw new Error(
                    "Profil güncelleme cevabı geçersiz."
                );
            }


            setUser(
                result.data
            );


            return result;
        };


    const changePassword =
        async (
            passwordData
        ) => {
            const result =
                await changePasswordRequest(
                    passwordData
                );


            /*
             * Backend tokenVersion değerini
             * artırdığı için mevcut JWT artık
             * geçersiz hale gelir.
             */
            logout();


            return result;
        };


    const retrySession =
        useCallback(
            async () => {
                const token =
                    localStorage.getItem(
                        TOKEN_KEY
                    );


                setSessionError("");


                if (!token) {
                    setUser(null);

                    setIsLoading(
                        false
                    );


                    return false;
                }


                setIsLoading(
                    true
                );


                try {
                    const result =
                        await getProfile();


                    if (
                        !result?.data
                    ) {
                        throw new Error(
                            "Profil cevabı geçersiz."
                        );
                    }


                    setUser(
                        result.data
                    );

                    setSessionError("");


                    return true;
                } catch (
                    requestError
                ) {
                    return handleSessionError(
                        requestError
                    );
                } finally {
                    setIsLoading(
                        false
                    );
                }
            },
            [
                handleSessionError,
            ]
        );


    useEffect(() => {
        const token =
            localStorage.getItem(
                TOKEN_KEY
            );


        if (!token) {
            return undefined;
        }


        let cancelled =
            false;


        getProfile()
            .then(
                (result) => {
                    if (
                        cancelled
                    ) {
                        return;
                    }


                    if (
                        !result?.data
                    ) {
                        throw new Error(
                            "Profil cevabı geçersiz."
                        );
                    }


                    setUser(
                        result.data
                    );

                    setSessionError("");
                }
            )
            .catch(
                (
                    requestError
                ) => {
                    if (
                        cancelled
                    ) {
                        return;
                    }


                    handleSessionError(
                        requestError
                    );
                }
            )
            .finally(
                () => {
                    if (
                        !cancelled
                    ) {
                        setIsLoading(
                            false
                        );
                    }
                }
            );


        return () => {
            cancelled =
                true;
        };
    }, [
        handleSessionError,
    ]);


    const value = {
        user,

        isAuthenticated:
            Boolean(user),

        isLoading,

        sessionError,

        login,
        logout,
        updateProfile,
        changePassword,

        retrySession,
    };


    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}


export {
    AuthContext,
    AuthProvider,
};