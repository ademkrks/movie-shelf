import {
    useState,
} from "react";

import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    Redirect,
} from "expo-router";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import PasswordChangeCard from "../../components/profile/PasswordChangeCard";
import ProfileEditCard from "../../components/profile/ProfileEditCard";

import useAuth from "../../hooks/useAuth";
import useProfileSettings from "../../hooks/useProfileSettings";

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


const formatMemberSince = (
    value?: string
) => {
    if (
        !value
    ) {
        return "—";
    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }


    return date.toLocaleDateString(
        "tr-TR",
        {
            month:
                "long",

            year:
                "numeric",
        }
    );
};


export default function ProfileScreen() {
    const {
        user,
        isAuthenticated,
        isRestoring,
        logout,
    } =
        useAuth();


    const {
        isProfilePending,
        isPasswordPending,

        profileError,
        passwordError,

        profileSuccess,
        passwordSuccess,

        handleProfileUpdate,
        handlePasswordChange,
    } =
        useProfileSettings();


    const [
        isLogoutPending,
        setIsLogoutPending,
    ] =
        useState(
            false
        );


    const handleLogout =
        async () => {
            if (
                isLogoutPending
            ) {
                return;
            }


            setIsLogoutPending(
                true
            );


            try {
                await logout();
            } catch (
                logoutError
            ) {
                console.warn(
                    "Logout cleanup failed:",
                    logoutError
                );
            } finally {
                setIsLogoutPending(
                    false
                );
            }
        };


    const confirmLogout =
        () => {
            if (
                isLogoutPending
            ) {
                return;
            }


            Alert.alert(
                "Çıkış yap",
                "MovieShelf hesabından çıkış yapmak istediğine emin misin?",
                [
                    {
                        text:
                            "Vazgeç",

                        style:
                            "cancel",
                    },

                    {
                        text:
                            "Çıkış Yap",

                        style:
                            "destructive",

                        onPress:
                            () => {
                                void handleLogout();
                            },
                    },
                ]
            );
        };


    if (
        isRestoring
    ) {
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
                            styles.loadingTitle
                        }
                    >
                        Profil yükleniyor
                    </Text>

                    <Text
                        style={
                            styles.loadingDescription
                        }
                    >
                        Hesap bilgilerin hazırlanıyor.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }


    if (
        !isAuthenticated ||
        !user
    ) {
        return (
            <Redirect
                href="/login"
            />
        );
    }


    const displayName =
        user.name.trim() ||
        "MovieShelf kullanıcısı";


    const avatarLetter =
        displayName
            .charAt(
                0
            )
            .toUpperCase() ||
        "?";


    return (
        <SafeAreaView
            style={
                styles.safeArea
            }
            edges={[
                "top",
                "left",
                "right",
            ]}
        >
            <ScrollView
                style={
                    styles.scrollView
                }
                contentContainerStyle={
                    styles.contentContainer
                }
                showsVerticalScrollIndicator={
                    false
                }
                keyboardShouldPersistTaps="handled"
            >
                <View>
                    <Text
                        style={
                            styles.eyebrow
                        }
                    >
                        ACCOUNT
                    </Text>

                    <Text
                        style={
                            styles.title
                        }
                    >
                        Profil & Ayarlar
                    </Text>

                    <Text
                        style={
                            styles.description
                        }
                    >
                        Hesap bilgilerini ve güvenlik ayarlarını yönet.
                    </Text>
                </View>

                <View
                    style={
                        styles.profileCard
                    }
                >
                    <View
                        style={
                            styles.avatar
                        }
                    >
                        <Text
                            style={
                                styles.avatarText
                            }
                        >
                            {
                                avatarLetter
                            }
                        </Text>
                    </View>

                    <View
                        style={
                            styles.profileInfo
                        }
                    >
                        <Text
                            style={
                                styles.profileName
                            }
                            numberOfLines={
                                1
                            }
                        >
                            {
                                displayName
                            }
                        </Text>

                        <Text
                            style={
                                styles.profileEmail
                            }
                            numberOfLines={
                                1
                            }
                        >
                            {
                                user.email
                            }
                        </Text>

                        <View
                            style={
                                styles.memberRow
                            }
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={
                                    14
                                }
                                color={
                                    colors.textMuted
                                }
                            />

                            <Text
                                style={
                                    styles.memberText
                                }
                            >
                                Üyelik:{" "}
                                {
                                    formatMemberSince(
                                        user.createdAt
                                    )
                                }
                            </Text>
                        </View>
                    </View>
                </View>

                <View
                    style={
                        styles.section
                    }
                >
                    <Text
                        style={
                            styles.sectionEyebrow
                        }
                    >
                        PROFILE
                    </Text>

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Hesap Bilgileri
                    </Text>

                    <View
                        style={
                            styles.sectionContent
                        }
                    >
                        <ProfileEditCard
                            key={`${user.id}:${user.name}:${user.email}`}
                            name={
                                user.name
                            }
                            email={
                                user.email
                            }
                            isPending={
                                isProfilePending
                            }
                            error={
                                profileError
                            }
                            success={
                                profileSuccess
                            }
                            onSubmit={
                                handleProfileUpdate
                            }
                        />
                    </View>
                </View>

                <View
                    style={
                        styles.section
                    }
                >
                    <Text
                        style={
                            styles.sectionEyebrow
                        }
                    >
                        SECURITY
                    </Text>

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Güvenlik
                    </Text>

                    <View
                        style={
                            styles.sectionContent
                        }
                    >
                        <PasswordChangeCard
                            isPending={
                                isPasswordPending
                            }
                            error={
                                passwordError
                            }
                            success={
                                passwordSuccess
                            }
                            onSubmit={
                                handlePasswordChange
                            }
                        />
                    </View>
                </View>

                <View
                    style={
                        styles.section
                    }
                >
                    <Text
                        style={[
                            styles.sectionEyebrow,
                            styles.dangerEyebrow,
                        ]}
                    >
                        SESSION
                    </Text>

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Oturum
                    </Text>

                    <View
                        style={
                            styles.logoutCard
                        }
                    >
                        <View
                            style={
                                styles.logoutHeader
                            }
                        >
                            <View
                                style={
                                    styles.logoutIcon
                                }
                            >
                                <Ionicons
                                    name="log-out-outline"
                                    size={
                                        22
                                    }
                                    color={
                                        colors.error
                                    }
                                />
                            </View>

                            <View
                                style={
                                    styles.logoutContent
                                }
                            >
                                <Text
                                    style={
                                        styles.logoutTitle
                                    }
                                >
                                    Çıkış Yap
                                </Text>

                                <Text
                                    style={
                                        styles.logoutDescription
                                    }
                                >
                                    Bu cihazdaki MovieShelf oturumunu kapat.
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="MovieShelf hesabından çıkış yap"
                            disabled={
                                isLogoutPending
                            }
                            onPress={
                                confirmLogout
                            }
                            style={({
                                pressed,
                            }) => [
                                styles.logoutButton,

                                pressed &&
                                !isLogoutPending
                                    ? styles.logoutButtonPressed
                                    : null,

                                isLogoutPending
                                    ? styles.buttonDisabled
                                    : null,
                            ]}
                        >
                            {isLogoutPending ? (
                                <ActivityIndicator
                                    size="small"
                                    color={
                                        colors.error
                                    }
                                />
                            ) : (
                                <Ionicons
                                    name="log-out-outline"
                                    size={
                                        18
                                    }
                                    color={
                                        colors.error
                                    }
                                />
                            )}

                            <Text
                                style={
                                    styles.logoutButtonText
                                }
                            >
                                {isLogoutPending
                                    ? "Çıkış yapılıyor..."
                                    : "Çıkış Yap"}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
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

        scrollView: {
            flex: 1,

            backgroundColor:
                colors.background,
        },

        contentContainer: {
            paddingHorizontal:
                spacing.xl,

            paddingTop:
                spacing.xxl,

            paddingBottom:
                spacing.xxxl,
        },

        loadingContainer: {
            flex: 1,

            alignItems:
                "center",

            justifyContent:
                "center",

            paddingHorizontal:
                spacing.xl,
        },

        loadingTitle: {
            ...typography.heading,

            marginTop:
                spacing.lg,

            color:
                colors.text,
        },

        loadingDescription: {
            ...typography.caption,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,
        },

        eyebrow: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "800",

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

        profileCard: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.lg,

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

        avatar: {
            width: 66,

            height: 66,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                radius.full,

            backgroundColor:
                colors.primary,
        },

        avatarText: {
            fontSize: 27,

            lineHeight: 32,

            color:
                colors.text,

            fontWeight:
                "800",
        },

        profileInfo: {
            flex: 1,
        },

        profileName: {
            ...typography.heading,

            color:
                colors.text,
        },

        profileEmail: {
            ...typography.caption,

            marginTop:
                spacing.xs,

            color:
                colors.textSecondary,
        },

        memberRow: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.xs,

            marginTop:
                spacing.sm,
        },

        memberText: {
            fontSize: 11,

            color:
                colors.textMuted,
        },

        section: {
            marginTop:
                spacing.xxxl,
        },

        sectionEyebrow: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "800",

            letterSpacing:
                1.3,
        },

        dangerEyebrow: {
            color:
                colors.error,
        },

        sectionTitle: {
            ...typography.heading,

            marginTop:
                spacing.xs,

            color:
                colors.text,
        },

        sectionContent: {
            marginTop:
                spacing.lg,
        },

        logoutCard: {
            marginTop:
                spacing.lg,

            padding:
                spacing.lg,

            borderWidth: 1,

            borderColor:
                colors.error,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        logoutHeader: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.md,
        },

        logoutIcon: {
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

        logoutContent: {
            flex: 1,
        },

        logoutTitle: {
            ...typography.heading,

            color:
                colors.text,
        },

        logoutDescription: {
            ...typography.caption,

            marginTop:
                spacing.xs,

            color:
                colors.textSecondary,
        },

        logoutButton: {
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

            borderWidth: 1,

            borderColor:
                colors.error,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.background,
        },

        logoutButtonPressed: {
            backgroundColor:
                colors.surfaceElevated,
        },

        logoutButtonText: {
            ...typography.button,

            color:
                colors.error,
        },

        buttonDisabled: {
            opacity: 0.5,
        },
    });