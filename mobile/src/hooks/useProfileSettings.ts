import {
    useCallback,
    useState,
} from "react";

import {
    changePassword,
    updateProfile,
} from "../api/auth.api";

import {
    ApiClientError,
} from "../api/client";

import useAuth from "./useAuth";


const MAX_NAME_LENGTH =
    100;

const MAX_EMAIL_LENGTH =
    255;

const MIN_PASSWORD_LENGTH =
    8;

const BCRYPT_MAX_PASSWORD_BYTES =
    72;


const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


const getRequestErrorMessage = (
    error: unknown
) => {
    if (
        error instanceof
        ApiClientError
    ) {
        return (
            error.errors[0] ??
            error.message
        );
    }

    if (
        error instanceof
        Error
    ) {
        return error.message;
    }

    return "İşlem sırasında bilinmeyen bir hata oluştu.";
};


const getUtf8ByteLength = (
    value: string
) => {
    let byteLength =
        0;


    for (
        let index = 0;
        index < value.length;
        index += 1
    ) {
        const codePoint =
            value.codePointAt(
                index
            );


        if (
            codePoint ===
            undefined
        ) {
            continue;
        }


        if (
            codePoint <=
            0x7f
        ) {
            byteLength +=
                1;
        } else if (
            codePoint <=
            0x7ff
        ) {
            byteLength +=
                2;
        } else if (
            codePoint <=
            0xffff
        ) {
            byteLength +=
                3;
        } else {
            byteLength +=
                4;

            /*
             * UTF-16 surrogate pair olduğu için
             * sonraki code unit'i ayrıca sayma.
             */
            index +=
                1;
        }
    }


    return byteLength;
};


export default function useProfileSettings() {
    const {
        user,
        refreshProfile,
        logout,
    } =
        useAuth();


    const [
        isProfilePending,
        setIsProfilePending,
    ] =
        useState(
            false
        );


    const [
        isPasswordPending,
        setIsPasswordPending,
    ] =
        useState(
            false
        );


    const [
        profileError,
        setProfileError,
    ] =
        useState<
            string | null
        >(
            null
        );


    const [
        passwordError,
        setPasswordError,
    ] =
        useState<
            string | null
        >(
            null
        );


    const [
        profileSuccess,
        setProfileSuccess,
    ] =
        useState<
            string | null
        >(
            null
        );


    const [
        passwordSuccess,
        setPasswordSuccess,
    ] =
        useState<
            string | null
        >(
            null
        );


    const clearProfileFeedback =
        useCallback(
            () => {
                setProfileError(
                    null
                );

                setProfileSuccess(
                    null
                );
            },
            []
        );


    const clearPasswordFeedback =
        useCallback(
            () => {
                setPasswordError(
                    null
                );

                setPasswordSuccess(
                    null
                );
            },
            []
        );


    const handleProfileUpdate =
        useCallback(
            async (
                name: string,
                email: string
            ) => {
                clearProfileFeedback();


                if (
                    !user
                ) {
                    setProfileError(
                        "Profil bilgileri bulunamadı."
                    );

                    return false;
                }


                const normalizedName =
                    name.trim();

                const normalizedEmail =
                    email
                        .trim()
                        .toLowerCase();


                if (
                    normalizedName.length ===
                    0
                ) {
                    setProfileError(
                        "Ad alanı boş bırakılamaz."
                    );

                    return false;
                }


                if (
                    normalizedName.length >
                    MAX_NAME_LENGTH
                ) {
                    setProfileError(
                        "Ad alanı en fazla 100 karakter olabilir."
                    );

                    return false;
                }


                if (
                    normalizedEmail.length ===
                    0
                ) {
                    setProfileError(
                        "E-posta alanı boş bırakılamaz."
                    );

                    return false;
                }


                if (
                    normalizedEmail.length >
                    MAX_EMAIL_LENGTH
                ) {
                    setProfileError(
                        "E-posta alanı en fazla 255 karakter olabilir."
                    );

                    return false;
                }


                if (
                    !EMAIL_REGEX.test(
                        normalizedEmail
                    )
                ) {
                    setProfileError(
                        "Geçerli bir e-posta adresi gir."
                    );

                    return false;
                }


                const input: {
                    name?: string;

                    email?: string;
                } =
                    {};


                if (
                    normalizedName !==
                    user.name.trim()
                ) {
                    input.name =
                        normalizedName;
                }


                if (
                    normalizedEmail !==
                    user.email
                        .trim()
                        .toLowerCase()
                ) {
                    input.email =
                        normalizedEmail;
                }


                if (
                    input.name ===
                        undefined &&
                    input.email ===
                        undefined
                ) {
                    setProfileError(
                        "Kaydedilecek bir değişiklik yok."
                    );

                    return false;
                }


                setIsProfilePending(
                    true
                );


                try {
                    await updateProfile(
                        input
                    );


                    /*
                     * Backend güncellemesi sonrasında
                     * AuthProvider içindeki user state'ini
                     * sunucudan yeniden senkronlarız.
                     */
                    await refreshProfile();


                    setProfileSuccess(
                        "Profil bilgilerin güncellendi."
                    );


                    return true;
                } catch (
                    requestError
                ) {
                    setProfileError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );


                    return false;
                } finally {
                    setIsProfilePending(
                        false
                    );
                }
            },
            [
                clearProfileFeedback,
                refreshProfile,
                user,
            ]
        );


    const handlePasswordChange =
        useCallback(
            async (
                currentPassword: string,
                newPassword: string,
                confirmNewPassword: string
            ) => {
                clearPasswordFeedback();


                if (
                    currentPassword.length ===
                    0
                ) {
                    setPasswordError(
                        "Mevcut şifreni gir."
                    );

                    return false;
                }


                if (
                    getUtf8ByteLength(
                        currentPassword
                    ) >
                    BCRYPT_MAX_PASSWORD_BYTES
                ) {
                    setPasswordError(
                        "Mevcut şifre UTF-8 olarak en fazla 72 byte olabilir."
                    );

                    return false;
                }


                if (
                    newPassword.length <
                    MIN_PASSWORD_LENGTH
                ) {
                    setPasswordError(
                        "Yeni şifre en az 8 karakter olmalıdır."
                    );

                    return false;
                }


                if (
                    getUtf8ByteLength(
                        newPassword
                    ) >
                    BCRYPT_MAX_PASSWORD_BYTES
                ) {
                    setPasswordError(
                        "Yeni şifre UTF-8 olarak en fazla 72 byte olabilir."
                    );

                    return false;
                }


                if (
                    newPassword ===
                    currentPassword
                ) {
                    setPasswordError(
                        "Yeni şifre mevcut şifre ile aynı olamaz."
                    );

                    return false;
                }


                if (
                    newPassword !==
                    confirmNewPassword
                ) {
                    setPasswordError(
                        "Yeni şifreler eşleşmiyor."
                    );

                    return false;
                }


                setIsPasswordPending(
                    true
                );


                try {
                    await changePassword({
                        currentPassword,
                        newPassword,
                    });


                    setPasswordSuccess(
                        "Şifren değiştirildi. Tekrar giriş yapmalısın."
                    );


                    /*
                     * Backend tokenVersion artırdığı için
                     * mevcut JWT artık geçersizdir.
                     * SecureStore tokenını da temizleriz.
                     */
                    try {
                        await logout();
                    } catch (
                        logoutError
                    ) {
                        setPasswordError(
                            "Şifre değiştirildi ancak yerel oturum tamamen temizlenemedi. Tekrar giriş yapmadan önce uygulamayı yeniden başlat."
                        );

                        console.warn(
                            "Password changed but logout cleanup failed:",
                            logoutError
                        );
                    }


                    return true;
                } catch (
                    requestError
                ) {
                    setPasswordError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );


                    return false;
                } finally {
                    setIsPasswordPending(
                        false
                    );
                }
            },
            [
                clearPasswordFeedback,
                logout,
            ]
        );


    return {
        isProfilePending,
        isPasswordPending,

        profileError,
        passwordError,

        profileSuccess,
        passwordSuccess,

        clearProfileFeedback,
        clearPasswordFeedback,

        handleProfileUpdate,
        handlePasswordChange,
    };
}