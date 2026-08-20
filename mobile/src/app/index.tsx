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
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    getConfiguredApiBaseUrl,
} from "../api/client";

import {
    getHealth,
} from "../api/health.api";

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
                    error instanceof Error
                        ? error.message
                        : "Backend bağlantısı kurulamadı.",
            };
        }
    };


export default function HomeScreen() {
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


    const handleRetry =
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
                                styles.retryButton,

                                pressed &&
                                    styles.retryButtonPressed,
                            ]}
                            onPress={
                                handleRetry
                            }
                        >
                            <Text
                                style={
                                    styles.retryButtonText
                                }
                            >
                                Tekrar Dene
                            </Text>
                        </Pressable>
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

            alignItems:
                "center",

            justifyContent:
                "center",

            paddingHorizontal:
                spacing.xl,

            backgroundColor:
                colors.background,
        },

        brandContainer: {
            alignItems:
                "center",
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

            maxWidth: 420,

            marginTop:
                spacing.xxl,

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
                spacing.sm,

            borderRadius:
                radius.full,
        },

        statusText: {
            ...typography.body,

            flex: 1,

            marginLeft:
                spacing.sm,

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

        retryButton: {
            alignItems:
                "center",

            justifyContent:
                "center",

            marginTop:
                spacing.lg,

            minHeight: 48,

            paddingHorizontal:
                spacing.lg,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.primary,
        },

        retryButtonPressed: {
            backgroundColor:
                colors.primaryPressed,
        },

        retryButtonText: {
            ...typography.button,

            color:
                colors.text,
        },
    });