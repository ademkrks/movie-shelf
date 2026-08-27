import {
    useState,
} from "react";

import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    Redirect,
    useLocalSearchParams,
    useRouter,
} from "expo-router";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    resetPassword,
} from "../api/auth.api";

import {
    ApiClientError,
} from "../api/client";

import useAuth from "../hooks/useAuth";

import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";


const RESET_TOKEN_REGEX =
    /^[a-fA-F0-9]{64}$/;


export default function ResetPasswordScreen() {
    const router =
        useRouter();

    const params =
        useLocalSearchParams<{
            token?: string;
        }>();

    const {
        isAuthenticated,
        isRestoring,
    } =
        useAuth();

    const token =
        typeof params.token ===
        "string"
            ? params.token
            : "";

    const isValidToken =
        RESET_TOKEN_REGEX.test(
            token
        );

    const [
        password,
        setPassword,
    ] =
        useState("");

    const [
        confirmPassword,
        setConfirmPassword,
    ] =
        useState("");

    const [
        error,
        setError,
    ] =
        useState<
            string | null
        >(
            null
        );

    const [
        validationErrors,
        setValidationErrors,
    ] =
        useState<
            string[]
        >(
            []
        );

    const [
        isSubmitting,
        setIsSubmitting,
    ] =
        useState(false);

    const [
        isSuccess,
        setIsSuccess,
    ] =
        useState(false);


    if (isAuthenticated) {
        return (
            <Redirect
                href="/"
            />
        );
    }


    const handleResetPassword =
        async () => {
            setError(
                null
            );

            setValidationErrors(
                []
            );

            if (!isValidToken) {
                setError(
                    "Şifre sıfırlama bağlantısı geçersiz."
                );

                return;
            }

            if (
                password.length <
                8
            ) {
                setError(
                    "Yeni şifre en az 8 karakter olmalıdır."
                );

                return;
            }

            if (
                password !==
                confirmPassword
            ) {
                setError(
                    "Şifreler eşleşmiyor."
                );

                return;
            }

            setIsSubmitting(
                true
            );

            try {
                await resetPassword({
                    token,

                    password,
                });

                setPassword(
                    ""
                );

                setConfirmPassword(
                    ""
                );

                setIsSuccess(
                    true
                );
            } catch (
                requestError
            ) {
                if (
                    requestError instanceof
                    ApiClientError
                ) {
                    setError(
                        requestError.message
                    );

                    setValidationErrors(
                        requestError.errors
                    );

                    return;
                }

                setError(
                    requestError instanceof
                        Error
                        ? requestError.message
                        : "Şifre güncellenirken bilinmeyen bir hata oluştu."
                );
            } finally {
                setIsSubmitting(
                    false
                );
            }
        };


    if (isRestoring) {
        return (
            <SafeAreaView
                style={
                    styles.safeArea
                }
            >
                <View
                    style={
                        styles.loadingContainer
                    }
                >
                    <ActivityIndicator
                        size="large"
                        color={
                            colors.primary
                        }
                    />

                    <Text
                        style={
                            styles.loadingText
                        }
                    >
                        Oturum kontrol ediliyor...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView
            style={styles.safeArea}
        >
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={
                    Platform.OS ===
                    "ios"
                        ? "padding"
                        : undefined
                }
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={
                        styles.scrollContent
                    }
                    keyboardShouldPersistTaps="handled"
                >
                    <View
                        style={
                            styles.container
                        }
                    >
                        <Pressable
                            style={
                                styles.backButton
                            }
                            onPress={() =>
                                router.replace(
                                    "/login"
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.backButtonText
                                }
                            >
                                ← Giriş ekranı
                            </Text>
                        </Pressable>

                        <View
                            style={
                                styles.brandContainer
                            }
                        >
                            <Text
                                style={
                                    styles.brand
                                }
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
                                style={
                                    styles.eyebrow
                                }
                            >
                                ŞİFRE SIFIRLAMA
                            </Text>

                            <Text
                                style={
                                    styles.title
                                }
                            >
                                Yeni şifreni oluştur
                            </Text>

                            <Text
                                style={
                                    styles.description
                                }
                            >
                                Hesabın için yeni bir şifre belirle.
                            </Text>
                        </View>

                        <View
                            style={
                                styles.card
                            }
                        >
                            {!isValidToken &&
                                !isSuccess && (
                                <View
                                    style={
                                        styles.errorBox
                                    }
                                >
                                    <Text
                                        style={
                                            styles.errorText
                                        }
                                    >
                                        Şifre sıfırlama bağlantısı geçersiz veya eksik.
                                    </Text>
                                </View>
                            )}

                            {isSuccess ? (
                                <>
                                    <View
                                        style={
                                            styles.successBox
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.successTitle
                                            }
                                        >
                                            Şifren güncellendi
                                        </Text>

                                        <Text
                                            style={
                                                styles.successText
                                            }
                                        >
                                            Yeni şifrenle hesabına giriş yapabilirsin.
                                        </Text>
                                    </View>

                                    <Pressable
                                        style={({
                                            pressed,
                                        }) => [
                                            styles.primaryButton,

                                            pressed &&
                                                styles.primaryButtonPressed,
                                        ]}
                                        onPress={() =>
                                            router.replace(
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
                                </>
                            ) : isValidToken ? (
                                <>
                                    <View
                                        style={
                                            styles.field
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.label
                                            }
                                        >
                                            Yeni Şifre
                                        </Text>

                                        <TextInput
                                            style={
                                                styles.input
                                            }
                                            value={
                                                password
                                            }
                                            onChangeText={
                                                setPassword
                                            }
                                            placeholder="En az 8 karakter"
                                            placeholderTextColor={
                                                colors.textMuted
                                            }
                                            secureTextEntry
                                            autoCapitalize="none"
                                            autoCorrect={
                                                false
                                            }
                                            autoComplete="new-password"
                                            textContentType="newPassword"
                                            editable={
                                                !isSubmitting
                                            }
                                            returnKeyType="next"
                                        />
                                    </View>

                                    <View
                                        style={
                                            styles.field
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.label
                                            }
                                        >
                                            Yeni Şifre Tekrar
                                        </Text>

                                        <TextInput
                                            style={
                                                styles.input
                                            }
                                            value={
                                                confirmPassword
                                            }
                                            onChangeText={
                                                setConfirmPassword
                                            }
                                            placeholder="Yeni şifreni tekrar gir"
                                            placeholderTextColor={
                                                colors.textMuted
                                            }
                                            secureTextEntry
                                            autoCapitalize="none"
                                            autoCorrect={
                                                false
                                            }
                                            autoComplete="new-password"
                                            textContentType="newPassword"
                                            editable={
                                                !isSubmitting
                                            }
                                            returnKeyType="done"
                                            onSubmitEditing={() => {
                                                if (
                                                    !isSubmitting
                                                ) {
                                                    void handleResetPassword();
                                                }
                                            }}
                                        />
                                    </View>

                                    {error && (
                                        <View
                                            style={
                                                styles.errorBox
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.errorText
                                                }
                                            >
                                                {error}
                                            </Text>

                                            {validationErrors
                                                .map(
                                                    (
                                                        validationError
                                                    ) => (
                                                        <Text
                                                            key={
                                                                validationError
                                                            }
                                                            style={
                                                                styles.validationError
                                                            }
                                                        >
                                                            •{" "}
                                                            {
                                                                validationError
                                                            }
                                                        </Text>
                                                    )
                                                )}
                                        </View>
                                    )}

                                    <Pressable
                                        style={({
                                            pressed,
                                        }) => [
                                            styles.primaryButton,

                                            pressed &&
                                                !isSubmitting &&
                                                styles.primaryButtonPressed,

                                            isSubmitting &&
                                                styles.buttonDisabled,
                                        ]}
                                        disabled={
                                            isSubmitting
                                        }
                                        onPress={() => {
                                            void handleResetPassword();
                                        }}
                                    >
                                        {isSubmitting ? (
                                            <ActivityIndicator
                                                size="small"
                                                color={
                                                    colors.text
                                                }
                                            />
                                        ) : (
                                            <Text
                                                style={
                                                    styles.primaryButtonText
                                                }
                                            >
                                                Şifreyi Güncelle
                                            </Text>
                                        )}
                                    </Pressable>
                                </>
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
                                        router.replace(
                                            "/forgot-password"
                                        )
                                    }
                                >
                                    <Text
                                        style={
                                            styles.primaryButtonText
                                        }
                                    >
                                        Yeni Bağlantı İste
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles =
    StyleSheet.create({
        flex: {
            flex: 1,
        },

        safeArea: {
            flex: 1,

            backgroundColor:
                colors.background,
        },

        loadingContainer: {
            flex: 1,

            alignItems:
                "center",

            justifyContent:
                "center",

            padding:
                spacing.xl,
        },

        loadingText: {
            ...typography.body,

            marginTop:
                spacing.md,

            color:
                colors.textSecondary,
        },

        scrollContent: {
            flexGrow: 1,
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
                spacing.xl,

            paddingVertical:
                spacing.xxl,
        },

        backButton: {
            alignSelf:
                "flex-start",

            marginBottom:
                spacing.xl,

            paddingVertical:
                spacing.sm,

            paddingRight:
                spacing.lg,
        },

        backButtonText: {
            ...typography.caption,

            color:
                colors.textSecondary,
        },

        brandContainer: {
            marginBottom:
                spacing.xl,
        },

        brand: {
            ...typography.heading,

            color:
                colors.text,

            letterSpacing:
                -0.7,
        },

        brandAccent: {
            color:
                colors.primary,
        },

        eyebrow: {
            ...typography.caption,

            marginTop:
                spacing.xl,

            color:
                colors.primary,

            fontWeight:
                "700",

            letterSpacing:
                1.5,
        },

        title: {
            ...typography.title,

            marginTop:
                spacing.sm,

            color:
                colors.text,
        },

        description: {
            ...typography.body,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,
        },

        card: {
            padding:
                spacing.xl,

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        field: {
            marginBottom:
                spacing.lg,
        },

        label: {
            ...typography.caption,

            marginBottom:
                spacing.sm,

            color:
                colors.text,

            fontWeight:
                "600",
        },

        input: {
            ...typography.body,

            minHeight: 52,

            paddingHorizontal:
                spacing.lg,

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.md,

            color:
                colors.text,

            backgroundColor:
                colors.surfaceSoft,
        },

        errorBox: {
            marginBottom:
                spacing.lg,

            padding:
                spacing.md,

            borderWidth: 1,

            borderColor:
                colors.error,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surfaceSoft,
        },

        errorText: {
            ...typography.caption,

            color:
                colors.error,

            fontWeight:
                "600",
        },

        validationError: {
            ...typography.caption,

            marginTop:
                spacing.xs,

            color:
                colors.error,
        },

        successBox: {
            marginBottom:
                spacing.xl,

            padding:
                spacing.lg,

            borderWidth: 1,

            borderColor:
                colors.success,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surfaceSoft,
        },

        successTitle: {
            ...typography.body,

            color:
                colors.success,

            fontWeight:
                "700",
        },

        successText: {
            ...typography.caption,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,
        },

        primaryButton: {
            minHeight: 52,

            alignItems:
                "center",

            justifyContent:
                "center",

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

            textAlign:
                "center",
        },

        buttonDisabled: {
            opacity:
                0.65,
        },
    });