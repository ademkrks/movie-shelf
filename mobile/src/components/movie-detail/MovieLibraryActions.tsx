import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
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


type MovieLibraryActionsProps = {
    isAuthenticated: boolean;
    isRestoring: boolean;

    isFavorite: boolean;
    isWatchlisted: boolean;

    isLibraryStatusLoading: boolean;

    isFavoritePending: boolean;
    isWatchlistPending: boolean;

    libraryActionError:
        | string
        | null;

    onFavoriteToggle:
        () =>
            | void
            | Promise<void>;

    onWatchlistToggle:
        () =>
            | void
            | Promise<void>;
};


export default function MovieLibraryActions({
    isAuthenticated,
    isRestoring,
    isFavorite,
    isWatchlisted,
    isLibraryStatusLoading,
    isFavoritePending,
    isWatchlistPending,
    libraryActionError,
    onFavoriteToggle,
    onWatchlistToggle,
}: MovieLibraryActionsProps) {
    const isFavoriteDisabled =
        isRestoring ||
        isFavoritePending ||
        isLibraryStatusLoading;


    const isWatchlistDisabled =
        isRestoring ||
        isWatchlistPending ||
        isLibraryStatusLoading;


    const showFavoriteLoading =
        isFavoritePending ||
        (
            isLibraryStatusLoading &&
            isAuthenticated
        );


    const showWatchlistLoading =
        isWatchlistPending ||
        (
            isLibraryStatusLoading &&
            isAuthenticated
        );


    return (
        <View
            style={
                styles.actionsSection
            }
        >
            <Text
                style={
                    styles.sectionEyebrow
                }
            >
                FİLM RAFIN
            </Text>

            <Text
                style={
                    styles.sectionTitle
                }
            >
                Koleksiyonun
            </Text>

            {!isAuthenticated &&
            !isRestoring ? (
                <Text
                    style={
                        styles.actionHint
                    }
                >
                    Favori ve izleme listesi özelliklerini kullanmak için giriş yap.
                </Text>
            ) : null}

            <View
                style={
                    styles.actionButtons
                }
            >
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                        isFavorite
                            ? "Favorilerden kaldır"
                            : "Favorilere ekle"
                    }
                    onPress={() => {
                        void onFavoriteToggle();
                    }}
                    disabled={
                        isFavoriteDisabled
                    }
                    style={({
                        pressed,
                    }) => [
                        styles.collectionActionButton,

                        isFavorite
                            ? styles.collectionActionButtonActive
                            : null,

                        pressed &&
                        !isFavoritePending
                            ? styles.collectionActionButtonPressed
                            : null,

                        isFavoriteDisabled
                            ? styles.collectionActionButtonDisabled
                            : null,
                    ]}
                >
                    {showFavoriteLoading ? (
                        <ActivityIndicator
                            size="small"
                            color={
                                colors.text
                            }
                        />
                    ) : (
                        <Ionicons
                            name={
                                isFavorite
                                    ? "heart"
                                    : "heart-outline"
                            }
                            size={
                                20
                            }
                            color={
                                isFavorite
                                    ? colors.text
                                    : colors.textSecondary
                            }
                        />
                    )}

                    <Text
                        style={
                            styles.collectionActionText
                        }
                        numberOfLines={
                            1
                        }
                    >
                        {
                            isFavorite
                                ? "Favoride"
                                : "Favoriye Ekle"
                        }
                    </Text>
                </Pressable>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                        isWatchlisted
                            ? "İzleme listesinden kaldır"
                            : "İzleme listesine ekle"
                    }
                    onPress={() => {
                        void onWatchlistToggle();
                    }}
                    disabled={
                        isWatchlistDisabled
                    }
                    style={({
                        pressed,
                    }) => [
                        styles.collectionActionButton,

                        isWatchlisted
                            ? styles.collectionActionButtonActive
                            : null,

                        pressed &&
                        !isWatchlistPending
                            ? styles.collectionActionButtonPressed
                            : null,

                        isWatchlistDisabled
                            ? styles.collectionActionButtonDisabled
                            : null,
                    ]}
                >
                    {showWatchlistLoading ? (
                        <ActivityIndicator
                            size="small"
                            color={
                                colors.text
                            }
                        />
                    ) : (
                        <Ionicons
                            name={
                                isWatchlisted
                                    ? "bookmark"
                                    : "bookmark-outline"
                            }
                            size={
                                20
                            }
                            color={
                                isWatchlisted
                                    ? colors.text
                                    : colors.textSecondary
                            }
                        />
                    )}

                    <Text
                        style={
                            styles.collectionActionText
                        }
                        numberOfLines={
                            1
                        }
                    >
                        {
                            isWatchlisted
                                ? "Listemde"
                                : "Listeme Ekle"
                        }
                    </Text>
                </Pressable>
            </View>

            {libraryActionError ? (
                <View
                    style={
                        styles.actionError
                    }
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
                            styles.actionErrorText
                        }
                    >
                        {
                            libraryActionError
                        }
                    </Text>
                </View>
            ) : null}
        </View>
    );
}


const styles =
    StyleSheet.create({
        actionsSection: {
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

        sectionTitle: {
            ...typography.heading,

            marginTop:
                spacing.xs,

            color:
                colors.text,
        },

        actionHint: {
            ...typography.caption,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,
        },

        actionButtons: {
            flexDirection:
                "row",

            gap:
                spacing.md,

            marginTop:
                spacing.lg,
        },

        collectionActionButton: {
            flex: 1,

            minHeight: 54,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "center",

            gap:
                spacing.sm,

            paddingHorizontal:
                spacing.md,

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        collectionActionButtonActive: {
            borderColor:
                colors.primary,

            backgroundColor:
                colors.primary,
        },

        collectionActionButtonPressed: {
            opacity: 0.74,
        },

        collectionActionButtonDisabled: {
            opacity: 0.55,
        },

        collectionActionText: {
            ...typography.caption,

            flexShrink: 1,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        actionError: {
            flexDirection:
                "row",

            alignItems:
                "flex-start",

            gap:
                spacing.sm,

            marginTop:
                spacing.md,

            padding:
                spacing.md,

            borderWidth: 1,

            borderColor:
                colors.error,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surface,
        },

        actionErrorText: {
            ...typography.caption,

            flex: 1,

            color:
                colors.error,
        },
    });