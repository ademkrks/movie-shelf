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
    useRouter,
} from "expo-router";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    forgotPassword,
} from "../api/auth.api";

import {
    ApiClientError,
} from "../api/client";

import useAuth from "../hooks/useAuth";

import { colors } from "../theme/colors";
import { radius } from "../theme/radius";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";


const EMAIL_REGEX =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export default function ForgotPasswordScreen() {
    const router =
        useRouter();

    const {
        isAuthenticated,
        isRestoring,
    } =
        useAuth();

    const [
        email,
        setEmail,
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
        successMessage,
        setSuccessMessage,
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


    if (isAuthenticated) {
        return (
            <Redirect
                href="/"
            />
        );
    }


    const handleSubmit =
        async () => {
            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

            setError(
                null
            );

            setSuccessMessage(
                null
            );

            setValidationErrors(
                []
            );

            if (
                !EMAIL_REGEX.test(
                    normalizedEmail
                )
            ) {
                setError(
                    "Geçerli bir e-posta adresi girin."
                );

                return;
            }

            setIsSubmitting(
                true
            );

            try {
                const response =
                    await forgotPassword({
                        email:
                            normalizedEmail,
                    });

                setSuccessMessage(
                    response.message
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
                        : "Şifre sıfırlama isteği gönderilemedi."
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
                                ← Geri
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
                                PASSWORD RECOVERY
                            </Text>

                            <Text
                                style={
                                    styles.title
                                }
                            >
                                Şifreni sıfırla
                            </Text>

                            <Text
                                style={
                                    styles.description
                                }
                            >
                                Hesabına bağlı e-posta adresini gir. Kayıtlıysa sana şifre sıfırlama bağlantısı göndereceğiz.
                            </Text>
                        </View>

                        <View
                            style={
                                styles.card
                            }
                        >
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
                                    E-posta
                                </Text>

                                <TextInput
                                    style={
                                        styles.input
                                    }
                                    value={
                                        email
                                    }
                                    onChangeText={
                                        setEmail
                                    }
                                    placeholder="you@example.com"
                                    placeholderTextColor={
                                        colors.textMuted
                                    }
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={
                                        false
                                    }
                                    autoComplete="email"
                                    textContentType="emailAddress"
                                    editable={
                                        !isSubmitting
                                    }
                                    maxLength={
                                        255
                                    }
                                    returnKeyType="send"
                                    onSubmitEditing={() => {
                                        if (
                                            !isSubmitting
                                        ) {
                                            void handleSubmit();
                                        }
                                    }}
                                />
                            </View>

                            {successMessage && (
                                <View
                                    style={
                                        styles.successBox
                                    }
                                >
                                    <Text
                                        style={
                                            styles.successText
                                        }
                                    >
                                        {
                                            successMessage
                                        }
                                    </Text>
                                </View>
                            )}

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
                                    styles.submitButton,

                                    pressed &&
                                        !isSubmitting &&
                                        styles.submitButtonPressed,

                                    isSubmitting &&
                                        styles.buttonDisabled,
                                ]}
                                disabled={
                                    isSubmitting
                                }
                                onPress={() => {
                                    void handleSubmit();
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
                                            styles.submitButtonText
                                        }
                                    >
                                        Sıfırlama Bağlantısı Gönder
                                    </Text>
                                )}
                            </Pressable>

                            <Pressable
                                style={
                                    styles.loginLink
                                }
                                disabled={
                                    isSubmitting
                                }
                                onPress={() =>
                                    router.replace(
                                        "/login"
                                    )
                                }
                            >
                                <Text
                                    style={
                                        styles.loginLinkText
                                    }
                                >
                                    Giriş ekranına dön
                                </Text>
                            </Pressable>
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

        successBox: {
            marginBottom:
                spacing.lg,

            padding:
                spacing.md,

            borderWidth: 1,

            borderColor:
                colors.success,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surfaceSoft,
        },

        successText: {
            ...typography.caption,

            color:
                colors.success,

            fontWeight:
                "600",
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

        submitButton: {
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

        submitButtonPressed: {
            backgroundColor:
                colors.primaryPressed,
        },

        buttonDisabled: {
            opacity:
                0.65,
        },

        submitButtonText: {
            ...typography.button,

            color:
                colors.text,

            textAlign:
                "center",
        },

        loginLink: {
            alignItems:
                "center",

            marginTop:
                spacing.xl,

            paddingVertical:
                spacing.sm,
        },

        loginLinkText: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "700",
        },
    });