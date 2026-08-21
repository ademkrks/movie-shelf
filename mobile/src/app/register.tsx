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
    register,
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


export default function RegisterScreen() {
    const router =
        useRouter();

    const {
        isAuthenticated,
        isRestoring,
    } =
        useAuth();

    const [
        name,
        setName,
    ] =
        useState("");

    const [
        email,
        setEmail,
    ] =
        useState("");

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


    if (isAuthenticated) {
        return (
            <Redirect
                href="/"
            />
        );
    }


    const handleRegister =
        async () => {
            const normalizedName =
                name.trim();

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

            setError(
                null
            );

            setValidationErrors(
                []
            );

            if (!normalizedName) {
                setError(
                    "Adınızı girin."
                );

                return;
            }

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

            if (
                password.length <
                8
            ) {
                setError(
                    "Şifre en az 8 karakter olmalıdır."
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
                await register({
                    name:
                        normalizedName,

                    email:
                        normalizedEmail,

                    password,
                });

                router.replace({
                    pathname:
                        "/login",

                    params: {
                        registered:
                            "1",
                    },
                });
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
                        : "Hesap oluşturulurken bilinmeyen bir hata oluştu."
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
                                JOIN MOVIESHELF
                            </Text>

                            <Text
                                style={
                                    styles.title
                                }
                            >
                                Hesabını oluştur
                            </Text>

                            <Text
                                style={
                                    styles.description
                                }
                            >
                                Kendi film arşivini oluşturmaya başla.
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
                                    Ad
                                </Text>

                                <TextInput
                                    style={
                                        styles.input
                                    }
                                    value={
                                        name
                                    }
                                    onChangeText={
                                        setName
                                    }
                                    placeholder="Adınız"
                                    placeholderTextColor={
                                        colors.textMuted
                                    }
                                    autoCapitalize="words"
                                    autoCorrect={
                                        false
                                    }
                                    autoComplete="name"
                                    textContentType="name"
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
                                    Şifre
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
                                    Şifre Tekrar
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
                                    placeholder="Şifrenizi tekrar girin"
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
                                            void handleRegister();
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
                                    styles.registerButton,

                                    pressed &&
                                        !isSubmitting &&
                                        styles.registerButtonPressed,

                                    isSubmitting &&
                                        styles.buttonDisabled,
                                ]}
                                disabled={
                                    isSubmitting
                                }
                                onPress={() => {
                                    void handleRegister();
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
                                            styles.registerButtonText
                                        }
                                    >
                                        Hesap Oluştur
                                    </Text>
                                )}
                            </Pressable>

                            <View
                                style={
                                    styles.footer
                                }
                            >
                                <Text
                                    style={
                                        styles.footerText
                                    }
                                >
                                    Zaten hesabın var?
                                </Text>

                                <Pressable
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
                                            styles.footerLink
                                        }
                                    >
                                        Giriş yap
                                    </Text>
                                </Pressable>
                            </View>
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

        registerButton: {
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

        registerButtonPressed: {
            backgroundColor:
                colors.primaryPressed,
        },

        buttonDisabled: {
            opacity:
                0.65,
        },

        registerButtonText: {
            ...typography.button,

            color:
                colors.text,
        },

        footer: {
            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "center",

            flexWrap:
                "wrap",

            marginTop:
                spacing.xl,
        },

        footerText: {
            ...typography.caption,

            marginRight:
                spacing.xs,

            color:
                colors.textSecondary,
        },

        footerLink: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "700",
        },
    });