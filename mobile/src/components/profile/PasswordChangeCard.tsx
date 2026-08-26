import {
    useState,
} from "react";

import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    colors,
} from "../../theme/colors";

import {
    radius,
} from "../../theme/radius";

import {
    spacing,
} from "../../theme/spacing";

import {
    typography,
} from "../../theme/typography";


const MIN_PASSWORD_LENGTH =
    8;


type PasswordChangeCardProps = {
    isPending: boolean;

    error:
        | string
        | null;

    success:
        | string
        | null;

    onSubmit:
        (
            currentPassword: string,
            newPassword: string,
            confirmNewPassword: string
        ) =>
            Promise<boolean>;
};


export default function PasswordChangeCard({
    isPending,
    error,
    success,
    onSubmit,
}: PasswordChangeCardProps) {
    const [
        currentPassword,
        setCurrentPassword,
    ] =
        useState(
            ""
        );


    const [
        newPassword,
        setNewPassword,
    ] =
        useState(
            ""
        );


    const [
        confirmNewPassword,
        setConfirmNewPassword,
    ] =
        useState(
            ""
        );


    const [
        showCurrentPassword,
        setShowCurrentPassword,
    ] =
        useState(
            false
        );


    const [
        showNewPassword,
        setShowNewPassword,
    ] =
        useState(
            false
        );


    const [
        showConfirmPassword,
        setShowConfirmPassword,
    ] =
        useState(
            false
        );


    const hasMinimumLength =
        newPassword.length >=
        MIN_PASSWORD_LENGTH;


    const passwordsMatch =
        newPassword.length >
            0 &&
        newPassword ===
            confirmNewPassword;


    const canSubmit =
        !isPending &&
        currentPassword.length >
            0 &&
        hasMinimumLength &&
        passwordsMatch;


    const handleSubmit =
        async () => {
            if (
                !canSubmit
            ) {
                return;
            }


            const didChange =
                await onSubmit(
                    currentPassword,
                    newPassword,
                    confirmNewPassword
                );


            if (
                didChange
            ) {
                setCurrentPassword(
                    ""
                );

                setNewPassword(
                    ""
                );

                setConfirmNewPassword(
                    ""
                );
            }
        };


    return (
        <View
            style={
                styles.card
            }
        >
            <View
                style={
                    styles.header
                }
            >
                <View
                    style={
                        styles.iconContainer
                    }
                >
                    <Ionicons
                        name="lock-closed-outline"
                        size={
                            22
                        }
                        color={
                            colors.primary
                        }
                    />
                </View>

                <View
                    style={
                        styles.headerContent
                    }
                >
                    <Text
                        style={
                            styles.title
                        }
                    >
                        Şifre Değiştir
                    </Text>

                    <Text
                        style={
                            styles.description
                        }
                    >
                        Şifren değiştiğinde tüm mevcut oturumların geçersiz olur.
                    </Text>
                </View>
            </View>

            <View
                style={
                    styles.form
                }
            >
                <View>
                    <Text
                        style={
                            styles.label
                        }
                    >
                        Mevcut Şifre
                    </Text>

                    <View
                        style={
                            styles.passwordField
                        }
                    >
                        <TextInput
                            value={
                                currentPassword
                            }
                            onChangeText={
                                setCurrentPassword
                            }
                            editable={
                                !isPending
                            }
                            secureTextEntry={
                                !showCurrentPassword
                            }
                            autoCapitalize="none"
                            autoCorrect={
                                false
                            }
                            autoComplete="current-password"
                            placeholder="Mevcut şifren"
                            placeholderTextColor={
                                colors.textMuted
                            }
                            style={
                                styles.passwordInput
                            }
                        />

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={
                                showCurrentPassword
                                    ? "Mevcut şifreyi gizle"
                                    : "Mevcut şifreyi göster"
                            }
                            onPress={() =>
                                setShowCurrentPassword(
                                    (
                                        current
                                    ) =>
                                        !current
                                )
                            }
                            disabled={
                                isPending
                            }
                            hitSlop={
                                8
                            }
                            style={
                                styles.visibilityButton
                            }
                        >
                            <Ionicons
                                name={
                                    showCurrentPassword
                                        ? "eye-off-outline"
                                        : "eye-outline"
                                }
                                size={
                                    20
                                }
                                color={
                                    colors.textSecondary
                                }
                            />
                        </Pressable>
                    </View>
                </View>

                <View>
                    <Text
                        style={
                            styles.label
                        }
                    >
                        Yeni Şifre
                    </Text>

                    <View
                        style={
                            styles.passwordField
                        }
                    >
                        <TextInput
                            value={
                                newPassword
                            }
                            onChangeText={
                                setNewPassword
                            }
                            editable={
                                !isPending
                            }
                            secureTextEntry={
                                !showNewPassword
                            }
                            autoCapitalize="none"
                            autoCorrect={
                                false
                            }
                            autoComplete="new-password"
                            placeholder="Yeni şifren"
                            placeholderTextColor={
                                colors.textMuted
                            }
                            style={
                                styles.passwordInput
                            }
                        />

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={
                                showNewPassword
                                    ? "Yeni şifreyi gizle"
                                    : "Yeni şifreyi göster"
                            }
                            onPress={() =>
                                setShowNewPassword(
                                    (
                                        current
                                    ) =>
                                        !current
                                )
                            }
                            disabled={
                                isPending
                            }
                            hitSlop={
                                8
                            }
                            style={
                                styles.visibilityButton
                            }
                        >
                            <Ionicons
                                name={
                                    showNewPassword
                                        ? "eye-off-outline"
                                        : "eye-outline"
                                }
                                size={
                                    20
                                }
                                color={
                                    colors.textSecondary
                                }
                            />
                        </Pressable>
                    </View>

                    <View
                        style={
                            styles.requirementRow
                        }
                    >
                        <Ionicons
                            name={
                                hasMinimumLength
                                    ? "checkmark-circle"
                                    : "ellipse-outline"
                            }
                            size={
                                15
                            }
                            color={
                                hasMinimumLength
                                    ? colors.primary
                                    : colors.textMuted
                            }
                        />

                        <Text
                            style={[
                                styles.requirementText,

                                hasMinimumLength
                                    ? styles.requirementTextValid
                                    : null,
                            ]}
                        >
                            En az 8 karakter
                        </Text>
                    </View>
                </View>

                <View>
                    <Text
                        style={
                            styles.label
                        }
                    >
                        Yeni Şifre Tekrar
                    </Text>

                    <View
                        style={
                            styles.passwordField
                        }
                    >
                        <TextInput
                            value={
                                confirmNewPassword
                            }
                            onChangeText={
                                setConfirmNewPassword
                            }
                            editable={
                                !isPending
                            }
                            secureTextEntry={
                                !showConfirmPassword
                            }
                            autoCapitalize="none"
                            autoCorrect={
                                false
                            }
                            autoComplete="new-password"
                            placeholder="Yeni şifreni tekrar gir"
                            placeholderTextColor={
                                colors.textMuted
                            }
                            style={
                                styles.passwordInput
                            }
                        />

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={
                                showConfirmPassword
                                    ? "Şifre tekrarını gizle"
                                    : "Şifre tekrarını göster"
                            }
                            onPress={() =>
                                setShowConfirmPassword(
                                    (
                                        current
                                    ) =>
                                        !current
                                )
                            }
                            disabled={
                                isPending
                            }
                            hitSlop={
                                8
                            }
                            style={
                                styles.visibilityButton
                            }
                        >
                            <Ionicons
                                name={
                                    showConfirmPassword
                                        ? "eye-off-outline"
                                        : "eye-outline"
                                }
                                size={
                                    20
                                }
                                color={
                                    colors.textSecondary
                                }
                            />
                        </Pressable>
                    </View>

                    {confirmNewPassword.length >
                    0 ? (
                        <View
                            style={
                                styles.requirementRow
                            }
                        >
                            <Ionicons
                                name={
                                    passwordsMatch
                                        ? "checkmark-circle"
                                        : "close-circle-outline"
                                }
                                size={
                                    15
                                }
                                color={
                                    passwordsMatch
                                        ? colors.primary
                                        : colors.error
                                }
                            />

                            <Text
                                style={[
                                    styles.requirementText,

                                    passwordsMatch
                                        ? styles.requirementTextValid
                                        : styles.requirementTextError,
                                ]}
                            >
                                {passwordsMatch
                                    ? "Şifreler eşleşiyor"
                                    : "Şifreler eşleşmiyor"}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>

            {error ? (
                <View
                    style={[
                        styles.feedbackCard,
                        styles.errorCard,
                    ]}
                >
                    <Ionicons
                        name="alert-circle-outline"
                        size={
                            18
                        }
                        color={
                            colors.error
                        }
                    />

                    <Text
                        style={
                            styles.errorText
                        }
                    >
                        {
                            error
                        }
                    </Text>
                </View>
            ) : null}

            {success ? (
                <View
                    style={
                        styles.feedbackCard
                    }
                >
                    <Ionicons
                        name="checkmark-circle-outline"
                        size={
                            18
                        }
                        color={
                            colors.primary
                        }
                    />

                    <Text
                        style={
                            styles.successText
                        }
                    >
                        {
                            success
                        }
                    </Text>
                </View>
            ) : null}

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Şifreyi değiştir"
                disabled={
                    !canSubmit
                }
                onPress={() => {
                    void handleSubmit();
                }}
                style={({
                    pressed,
                }) => [
                    styles.submitButton,

                    pressed &&
                    canSubmit
                        ? styles.submitButtonPressed
                        : null,

                    !canSubmit
                        ? styles.buttonDisabled
                        : null,
                ]}
            >
                {isPending ? (
                    <ActivityIndicator
                        size="small"
                        color={
                            colors.text
                        }
                    />
                ) : (
                    <Ionicons
                        name="key-outline"
                        size={
                            18
                        }
                        color={
                            colors.text
                        }
                    />
                )}

                <Text
                    style={
                        styles.submitButtonText
                    }
                >
                    {isPending
                        ? "Değiştiriliyor..."
                        : "Şifreyi Değiştir"}
                </Text>
            </Pressable>
        </View>
    );
}


const styles =
    StyleSheet.create({
        card: {
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

        header: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.md,
        },

        iconContainer: {
            width: 46,

            height: 46,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                radius.full,

            backgroundColor:
                colors.surfaceElevated,
        },

        headerContent: {
            flex: 1,
        },

        title: {
            ...typography.heading,

            color:
                colors.text,
        },

        description: {
            ...typography.caption,

            marginTop:
                spacing.xs,

            color:
                colors.textSecondary,
        },

        form: {
            gap:
                spacing.lg,

            marginTop:
                spacing.xl,
        },

        label: {
            ...typography.caption,

            marginBottom:
                spacing.sm,

            color:
                colors.textSecondary,

            fontWeight:
                "700",
        },

        passwordField: {
            minHeight: 48,

            flexDirection:
                "row",

            alignItems:
                "center",

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.background,
        },

        passwordInput: {
            flex: 1,

            minHeight: 48,

            paddingLeft:
                spacing.md,

            paddingRight:
                spacing.sm,

            color:
                colors.text,

            fontSize: 14,
        },

        visibilityButton: {
            width: 46,

            height: 46,

            alignItems:
                "center",

            justifyContent:
                "center",
        },

        requirementRow: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.xs,

            marginTop:
                spacing.sm,
        },

        requirementText: {
            fontSize: 11,

            color:
                colors.textMuted,
        },

        requirementTextValid: {
            color:
                colors.textSecondary,
        },

        requirementTextError: {
            color:
                colors.error,
        },

        feedbackCard: {
            flexDirection:
                "row",

            alignItems:
                "flex-start",

            gap:
                spacing.sm,

            marginTop:
                spacing.lg,

            padding:
                spacing.md,

            borderWidth: 1,

            borderColor:
                colors.primary,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.background,
        },

        errorCard: {
            borderColor:
                colors.error,
        },

        errorText: {
            ...typography.caption,

            flex: 1,

            color:
                colors.error,
        },

        successText: {
            ...typography.caption,

            flex: 1,

            color:
                colors.textSecondary,
        },

        submitButton: {
            minHeight: 48,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "center",

            gap:
                spacing.sm,

            marginTop:
                spacing.lg,

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

        submitButtonText: {
            ...typography.button,

            color:
                colors.text,
        },

        buttonDisabled: {
            opacity: 0.5,
        },
    });