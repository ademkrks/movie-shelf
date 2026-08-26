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


const MAX_NAME_LENGTH =
    100;

const MAX_EMAIL_LENGTH =
    255;


type ProfileEditCardProps = {
    name: string;

    email: string;

    isPending: boolean;

    error:
        | string
        | null;

    success:
        | string
        | null;

    onSubmit:
        (
            name: string,
            email: string
        ) =>
            Promise<boolean>;
};


export default function ProfileEditCard({
    name,
    email,
    isPending,
    error,
    success,
    onSubmit,
}: ProfileEditCardProps) {
    const [
        nameInput,
        setNameInput,
    ] =
        useState(
            name
        );


    const [
        emailInput,
        setEmailInput,
    ] =
        useState(
            email
        );


    const normalizedName =
        nameInput.trim();

    const normalizedEmail =
        emailInput
            .trim()
            .toLowerCase();


    const originalName =
        name.trim();

    const originalEmail =
        email
            .trim()
            .toLowerCase();


    const hasChanges =
        normalizedName !==
            originalName ||
        normalizedEmail !==
            originalEmail;


    const canSubmit =
        !isPending &&
        hasChanges &&
        normalizedName.length >
            0 &&
        normalizedEmail.length >
            0;


    const handleSubmit =
        async () => {
            if (
                !canSubmit
            ) {
                return;
            }


            const success =
                await onSubmit(
                    nameInput,
                    emailInput
                );


            if (
                success
            ) {
                /*
                 * Backend ile aynı normalize edilmiş
                 * değerleri form state'inde tutar.
                 */
                setNameInput(
                    normalizedName
                );

                setEmailInput(
                    normalizedEmail
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
                        name="person-outline"
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
                        Profil Bilgileri
                    </Text>

                    <Text
                        style={
                            styles.description
                        }
                    >
                        Adını ve e-posta adresini güncelle.
                    </Text>
                </View>
            </View>

            <View
                style={
                    styles.form
                }
            >
                <View>
                    <View
                        style={
                            styles.labelRow
                        }
                    >
                        <Text
                            style={
                                styles.label
                            }
                        >
                            Ad
                        </Text>

                        <Text
                            style={
                                styles.characterCount
                            }
                        >
                            {
                                nameInput.length
                            }
                            /
                            {
                                MAX_NAME_LENGTH
                            }
                        </Text>
                    </View>

                    <TextInput
                        value={
                            nameInput
                        }
                        onChangeText={
                            setNameInput
                        }
                        editable={
                            !isPending
                        }
                        maxLength={
                            MAX_NAME_LENGTH
                        }
                        autoCapitalize="words"
                        autoCorrect={
                            false
                        }
                        placeholder="Adın"
                        placeholderTextColor={
                            colors.textMuted
                        }
                        style={
                            styles.input
                        }
                    />
                </View>

                <View>
                    <View
                        style={
                            styles.labelRow
                        }
                    >
                        <Text
                            style={
                                styles.label
                            }
                        >
                            E-posta
                        </Text>

                        <Text
                            style={
                                styles.characterCount
                            }
                        >
                            {
                                emailInput.length
                            }
                            /
                            {
                                MAX_EMAIL_LENGTH
                            }
                        </Text>
                    </View>

                    <TextInput
                        value={
                            emailInput
                        }
                        onChangeText={
                            setEmailInput
                        }
                        editable={
                            !isPending
                        }
                        maxLength={
                            MAX_EMAIL_LENGTH
                        }
                        autoCapitalize="none"
                        autoCorrect={
                            false
                        }
                        keyboardType="email-address"
                        autoComplete="email"
                        placeholder="ornek@eposta.com"
                        placeholderTextColor={
                            colors.textMuted
                        }
                        style={
                            styles.input
                        }
                    />
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
                accessibilityLabel="Profil bilgilerini kaydet"
                disabled={
                    !canSubmit
                }
                onPress={() => {
                    void handleSubmit();
                }}
                style={({
                    pressed,
                }) => [
                    styles.saveButton,

                    pressed &&
                    canSubmit
                        ? styles.saveButtonPressed
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
                        name="save-outline"
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
                        styles.saveButtonText
                    }
                >
                    {isPending
                        ? "Kaydediliyor..."
                        : "Değişiklikleri Kaydet"}
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

        labelRow: {
            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            gap:
                spacing.md,

            marginBottom:
                spacing.sm,
        },

        label: {
            ...typography.caption,

            color:
                colors.textSecondary,

            fontWeight:
                "700",
        },

        characterCount: {
            fontSize: 11,

            color:
                colors.textMuted,
        },

        input: {
            minHeight: 48,

            paddingHorizontal:
                spacing.md,

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.background,

            color:
                colors.text,

            fontSize: 14,
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

        saveButton: {
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

        saveButtonPressed: {
            backgroundColor:
                colors.primaryPressed,
        },

        saveButtonText: {
            ...typography.button,

            color:
                colors.text,
        },

        buttonDisabled: {
            opacity: 0.5,
        },
    });