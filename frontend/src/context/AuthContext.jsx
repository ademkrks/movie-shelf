import {
    createContext,
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
    const [user, setUser] =
        useState(null);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);


    const logout = () => {
        localStorage.removeItem(
            TOKEN_KEY
        );

        setUser(null);
    };


    const login = async (
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


            if (!result.data) {
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
             * Şifre değiştiğinde backend tokenVersion
             * değerini artırdığı için mevcut JWT
             * artık geçersizdir.
             */
            logout();


            return result;
        };


    useEffect(() => {
        const restoreSession =
            async () => {
                const token =
                    localStorage.getItem(
                        TOKEN_KEY
                    );


                if (!token) {
                    setIsLoading(
                        false
                    );

                    return;
                }


                try {
                    const result =
                        await getProfile();


                    setUser(
                        result.data
                    );
                } catch {
                    localStorage.removeItem(
                        TOKEN_KEY
                    );

                    setUser(null);
                } finally {
                    setIsLoading(
                        false
                    );
                }
            };


        restoreSession();
    }, []);


    const value = {
        user,

        isAuthenticated:
            Boolean(user),

        isLoading,

        login,
        logout,
        updateProfile,
        changePassword,
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