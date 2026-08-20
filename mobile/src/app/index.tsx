import {
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    useRouter,
} from "expo-router";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    getConfiguredApiBaseUrl,
} from "../api/client";

import {
    getHealth,
} from "../api/health.api";

import useAuth from "../hooks/useAuth";

import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";


type ConnectionState = {
    status:
        | "checking"
        | "connected"
        | "error";

    message: string;
};


const checkBackendConnection =
    async (): Promise<ConnectionState> => {
        try {
            const response =
                await getHealth();

            if (
                response.success &&
                response.status ===
                    "ok"
            ) {
                return {
                    status:
                        "connected",

                    message:
                        "Backend connection established",
                };
            }

            return {
                status:
                    "error",

                message:
                    "Backend beklenmeyen bir yanıt döndürdü.",
            };
        } catch (error) {
            return {
                status:
                    "error",

                message:
                    error instanceof
                        Error
                        ? error.message
                        : "Backend bağlantısı kurulamadı.",
            };
        }
    };


export default function HomeScreen() {
    const router =
        useRouter();

    const {
        user,
        sessionStatus,
        sessionError,
        isAuthenticated,
        isRestoring,
        logout,
        restoreSession,
    } =
        useAuth();

    const [
        connection,
        setConnection,
    ] =
        useState<ConnectionState>({
            status:
                "checking",

            message:
                "Backend bağlantısı kontrol ediliyor...",
        });

    const [
        apiBaseUrl,
    ] =
        useState(() => {
            try {
                return getConfiguredApiBaseUrl();
            } catch {
                return "API adresi yapılandırılmamış";
            }
        });

    const [
        authActionError,
        setAuthActionError,
    ] =
        useState<
            string | null
        >(
            null
        );

    const [
        isLoggingOut,
        setIsLoggingOut,
    ] =
        useState(false);


    useEffect(
        () => {
            let isActive =
                true;

            const runCheck =
                async () => {
                    const result =
                        await checkBackendConnection();

                    if (isActive) {
                        setConnection(
                            result
                        );
                    }
                };

            void runCheck();

            return () => {
                isActive =
                    false;
            };
        },
        []
    );


    const handleRetryConnection =
        async () => {
            setConnection({
                status:
                    "checking",

                message:
                    "Backend bağlantısı kontrol ediliyor...",
            });

            const result =
                await checkBackendConnection();

            setConnection(
                result
            );
        };


    const handleLogout =
        async () => {
            setAuthActionError(
                null
            );

            setIsLoggingOut(
                true
            );

            try {
                await logout();
            } catch (error) {
                setAuthActionError(
                    error instanceof
                        Error
                        ? error.message
                        : "Çıkış yapılırken bilinmeyen bir hata oluştu."
                );
            } finally {
                setIsLoggingOut(
                    false
                );
            }
        };


    const handleRestoreSession =
        async () => {
            setAuthActionError(
                null
            );

            try {
                await restoreSession();
            } catch (error) {
                setAuthActionError(
                    error instanceof
                        Error
                        ? error.message
                        : "Oturum yeniden kontrol edilemedi."
                );
            }
        };


    const isChecking =
        connection.status ===
        "checking";

    const isConnected =
        connection.status ===
        "connected";


    return (
        <SafeAreaView
            style={styles.safeArea}
        >
            <View
                style={styles.container}
            >
                <View
                    style={
                        styles.brandContainer
                    }
                >
                    <Text
                        style={styles.brand}
                    >
                        Movie
                        <Text
                            style={
                                styles.brandAccent
                            }
                        >
                            Shelf
                        </Text>
                    </Text>

                    <Text
                        style={styles.tagline}
                    >
                        Your movies.
                        Your shelf.
                    </Text>
                </View>

                <View
                    style={styles.card}
                >
                    <Text
                        style={
                            styles.cardTitle
                        }
                    >
                        API Connection
                    </Text>

                    <View
                        style={
                            styles.statusRow
                        }
                    >
                        {isChecking ? (
                            <ActivityIndicator
                                size="small"
                                color={
                                    colors.primary
                                }
                            />
                        ) : (
                            <View
                                style={[
                                    styles.statusDot,

                                    {
                                        backgroundColor:
                                            isConnected
                                                ? colors.success
                                                : colors.error,
                                    },
                                ]}
                            />
                        )}

                        <Text
                            style={
                                styles.statusText
                            }
                        >
                            {
                                connection.message
                            }
                        </Text>
                    </View>

                    <Text
                        style={
                            styles.apiUrl
                        }
                        numberOfLines={1}
                    >
                        {apiBaseUrl}
                    </Text>

                    {connection.status ===
                        "error" && (
                        <Pressable
                            style={({
                                pressed,
                            }) => [
                                styles.primaryButton,

                                pressed &&
                                    styles.primaryButtonPressed,
                            ]}
                            onPress={() => {
                                void handleRetryConnection();
                            }}
                        >
                            <Text
                                style={
                                    styles.primaryButtonText
                                }
                            >
                                Tekrar Dene
                            </Text>
                        </Pressable>
                    )}
                </View>

                <View
                    style={styles.card}
                >
                    <Text
                        style={
                            styles.cardTitle
                        }
                    >
                        Session
                    </Text>

                    {isRestoring ? (
                        <View
                            style={
                                styles.statusRow
                            }
                        >
                            <ActivityIndicator
                                size="small"
                                color={
                                    colors.primary
                                }
                            />

                            <Text
                                style={
                                    styles.statusText
                                }
                            >
                                Oturum kontrol ediliyor...
                            </Text>
                        </View>
                    ) : isAuthenticated &&
                      user ? (
                        <>
                            <View
                                style={
                                    styles.statusRow
                                }
                            >
                                <View
                                    style={[
                                        styles.statusDot,

                                        {
                                            backgroundColor:
                                                colors.success,
                                        },
                                    ]}
                                />

                                <Text
                                    style={
                                        styles.statusText
                                    }
                                >
                                    Authenticated
                                </Text>
                            </View>

                            <View
                                style={
                                    styles.userContainer
                                }
                            >
                                <Text
                                    style={
                                        styles.userName
                                    }
                                >
                                    {
                                        user.name
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.userEmail
                                    }
                                >
                                    {
                                        user.email
                                    }
                                </Text>

                                <Text
                                    style={
                                        styles.userMeta
                                    }
                                >
                                    User #
                                    {
                                        user.id
                                    }
                                </Text>
                            </View>

                            <Pressable
                                style={({
                                    pressed,
                                }) => [
                                    styles.secondaryButton,

                                    pressed &&
                                        styles.secondaryButtonPressed,

                                    isLoggingOut &&
                                        styles.buttonDisabled,
                                ]}
                                disabled={
                                    isLoggingOut
                                }
                                onPress={() => {
                                    void handleLogout();
                                }}
                            >
                                {isLoggingOut ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={
                                            colors.text
                                        }
                                    />
                                ) : (
                                    <Text
                                        style={
                                            styles.secondaryButtonText
                                        }
                                    >
                                        Çıkış Yap
                                    </Text>
                                )}
                            </Pressable>
                        </>
                    ) : (
                        <>
                            <View
                                style={
                                    styles.statusRow
                                }
                            >
                                <View
                                    style={[
                                        styles.statusDot,

                                        {
                                            backgroundColor:
                                                sessionStatus ===
                                                "unavailable"
                                                    ? colors.warning
                                                    : colors.textMuted,
                                        },
                                    ]}
                                />

                                <Text
                                    style={
                                        styles.statusText
                                    }
                                >
                                    {sessionStatus ===
                                    "unavailable"
                                        ? "Oturum doğrulanamadı"
                                        : "Guest"}
                                </Text>
                            </View>

                            {sessionError && (
                                <Text
                                    style={
                                        styles.errorText
                                    }
                                >
                                    {
                                        sessionError
                                    }
                                </Text>
                            )}

                            {sessionStatus ===
                            "unavailable" ? (
                                <Pressable
                                    style={({
                                        pressed,
                                    }) => [
                                        styles.secondaryButton,

                                        pressed &&
                                            styles.secondaryButtonPressed,
                                    ]}
                                    onPress={() => {
                                        void handleRestoreSession();
                                    }}
                                >
                                    <Text
                                        style={
                                            styles.secondaryButtonText
                                        }
                                    >
                                        Oturumu Tekrar Kontrol Et
                                    </Text>
                                </Pressable>
                            ) : (
                                <Pressable
                                    style={({
                                        pressed,
                                    }) => [
                                        styles.primaryButton,

                                        pressed &&
                                            styles.primaryButtonPressed,
                                    ]}
                                    onPress={() =>
                                        router.push(
                                            "/login"
                                        )
                                    }
                                >
                                    <Text
                                        style={
                                            styles.primaryButtonText
                                        }
                                    >
                                        Giriş Yap
                                    </Text>
                                </Pressable>
                            )}
                        </>
                    )}

                    {authActionError && (
                        <Text
                            style={
                                styles.errorText
                            }
                        >
                            {
                                authActionError
                            }
                        </Text>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}


const styles =
    StyleSheet.create({
        safeArea: {
            flex: 1,

            backgroundColor:
                colors.background,
        },

        container: {
            flex: 1,

            width: "100%",

            maxWidth: 480,

            alignSelf:
                "center",

            justifyContent:
                "center",

            paddingHorizontal:
                spacing.lg,

            backgroundColor:
                colors.background,
        },

        brandContainer: {
            alignItems:
                "center",

            marginBottom:
                spacing.xl,
        },

        brand: {
            ...typography.title,

            color:
                colors.text,

            letterSpacing:
                -1,
        },

        brandAccent: {
            color:
                colors.primary,
        },

        tagline: {
            ...typography.body,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,

            textAlign:
                "center",
        },

        card: {
            width: "100%",

            marginBottom:
                spacing.lg,

            padding:
                spacing.lg,

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        cardTitle: {
            ...typography.heading,

            color:
                colors.text,
        },

        statusRow: {
            flexDirection:
                "row",

            alignItems:
                "center",

            marginTop:
                spacing.lg,
        },

        statusDot: {
            width: 10,
            height: 10,

            marginRight:
                spacing.md,

            borderRadius:
                radius.full,
        },

        statusText: {
            ...typography.body,

            flex: 1,

            color:
                colors.textSecondary,
        },

        apiUrl: {
            ...typography.caption,

            marginTop:
                spacing.md,

            color:
                colors.textMuted,
        },

        userContainer: {
            marginTop:
                spacing.lg,

            padding:
                spacing.lg,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surfaceSoft,
        },

        userName: {
            ...typography.heading,

            color:
                colors.text,
        },

        userEmail: {
            ...typography.body,

            marginTop:
                spacing.xs,

            color:
                colors.textSecondary,
        },

        userMeta: {
            ...typography.caption,

            marginTop:
                spacing.sm,

            color:
                colors.textMuted,
        },

        primaryButton: {
            minHeight: 48,

            alignItems:
                "center",

            justifyContent:
                "center",

            marginTop:
                spacing.lg,

            paddingHorizontal:
                spacing.lg,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.primary,
        },

        primaryButtonPressed: {
            backgroundColor:
                colors.primaryPressed,
        },

        primaryButtonText: {
            ...typography.button,

            color:
                colors.text,
        },

        secondaryButton: {
            minHeight: 48,

            alignItems:
                "center",

            justifyContent:
                "center",

            marginTop:
                spacing.lg,

            paddingHorizontal:
                spacing.lg,

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surfaceSoft,
        },

        secondaryButtonPressed: {
            backgroundColor:
                colors.surfaceElevated,
        },

        secondaryButtonText: {
            ...typography.button,

            color:
                colors.text,
        },

        buttonDisabled: {
            opacity:
                0.65,
        },

        errorText: {
            ...typography.caption,

            marginTop:
                spacing.md,

            color:
                colors.error,
        },
    });