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

import type {
    MyMovieRating,
} from "../../types/rating";

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


type MovieRatingSectionProps = {
    isAuthenticated: boolean;

    isRestoring: boolean;

    myRating:
        | MyMovieRating
        | null;

    averageRating: number;

    totalRatings: number;

    isRatingLoading: boolean;

    isRatingPending: boolean;

    ratingError:
        | string
        | null;

    onRatingSubmit:
        (
            rating: number
        ) =>
            | void
            | Promise<void>;

    onRatingDelete:
        () =>
            | void
            | Promise<void>;
};


const RATING_VALUES =
    Array.from(
        {
            length: 10,
        },
        (
            _,
            index
        ) =>
            index + 1
    );


const getAverageRatingText = (
    averageRating: number,
    totalRatings: number
) => {
    if (
        totalRatings <= 0 ||
        !Number.isFinite(
            averageRating
        )
    ) {
        return "Henüz puan yok";
    }

    return `${averageRating.toFixed(1)} / 10`;
};


export default function MovieRatingSection({
    isAuthenticated,
    isRestoring,
    myRating,
    averageRating,
    totalRatings,
    isRatingLoading,
    isRatingPending,
    ratingError,
    onRatingSubmit,
    onRatingDelete,
}: MovieRatingSectionProps) {
    const isInteractionDisabled =
        isRestoring ||
        isRatingLoading ||
        isRatingPending;


    return (
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
                MOVIESHELF RATING
            </Text>

            <Text
                style={
                    styles.sectionTitle
                }
            >
                Puanla
            </Text>

            <View
                style={
                    styles.summaryCard
                }
            >
                <View
                    style={
                        styles.summaryIcon
                    }
                >
                    <Ionicons
                        name="star"
                        size={
                            22
                        }
                        color={
                            colors.warning
                        }
                    />
                </View>

                <View
                    style={
                        styles.summaryContent
                    }
                >
                    <Text
                        style={
                            styles.summaryValue
                        }
                    >
                        {
                            getAverageRatingText(
                                averageRating,
                                totalRatings
                            )
                        }
                    </Text>

                    <Text
                        style={
                            styles.summaryLabel
                        }
                    >
                        {totalRatings > 0
                            ? `${totalRatings} MovieShelf puanı`
                            : "Bu filme henüz MovieShelf puanı verilmedi."}
                    </Text>
                </View>

                {isRatingLoading ? (
                    <ActivityIndicator
                        size="small"
                        color={
                            colors.primary
                        }
                    />
                ) : null}
            </View>

            {!isAuthenticated &&
            !isRestoring ? (
                <Text
                    style={
                        styles.loginHint
                    }
                >
                    Bu filme puan vermek için giriş yap.
                </Text>
            ) : null}

            {myRating ? (
                <View
                    style={
                        styles.myRatingCard
                    }
                >
                    <View>
                        <Text
                            style={
                                styles.myRatingLabel
                            }
                        >
                            Senin puanın
                        </Text>

                        <Text
                            style={
                                styles.myRatingValue
                            }
                        >
                            {
                                myRating.rating
                            }
                            /10
                        </Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Puanımı sil"
                        onPress={() => {
                            void onRatingDelete();
                        }}
                        disabled={
                            isInteractionDisabled
                        }
                        style={({
                            pressed,
                        }) => [
                            styles.deleteButton,

                            pressed &&
                            !isInteractionDisabled
                                ? styles.deleteButtonPressed
                                : null,

                            isInteractionDisabled
                                ? styles.buttonDisabled
                                : null,
                        ]}
                    >
                        {isRatingPending ? (
                            <ActivityIndicator
                                size="small"
                                color={
                                    colors.error
                                }
                            />
                        ) : (
                            <Ionicons
                                name="trash-outline"
                                size={
                                    17
                                }
                                color={
                                    colors.error
                                }
                            />
                        )}

                        <Text
                            style={
                                styles.deleteButtonText
                            }
                        >
                            Sil
                        </Text>
                    </Pressable>
                </View>
            ) : null}

            <Text
                style={
                    styles.selectLabel
                }
            >
                {myRating
                    ? "Puanını değiştirmek için yeni bir değer seç."
                    : "1 ile 10 arasında bir puan seç."}
            </Text>

            <View
                style={
                    styles.ratingGrid
                }
            >
                {RATING_VALUES.map(
                    (
                        rating
                    ) => {
                        const isSelected =
                            myRating?.rating ===
                            rating;

                        return (
                            <Pressable
                                key={
                                    rating
                                }
                                accessibilityRole="button"
                                accessibilityLabel={`${rating} puan ver`}
                                accessibilityState={{
                                    selected:
                                        isSelected,

                                    disabled:
                                        isInteractionDisabled,
                                }}
                                onPress={() => {
                                    void onRatingSubmit(
                                        rating
                                    );
                                }}
                                disabled={
                                    isInteractionDisabled
                                }
                                style={({
                                    pressed,
                                }) => [
                                    styles.ratingButton,

                                    isSelected
                                        ? styles.ratingButtonSelected
                                        : null,

                                    pressed &&
                                    !isInteractionDisabled
                                        ? styles.ratingButtonPressed
                                        : null,

                                    isInteractionDisabled
                                        ? styles.buttonDisabled
                                        : null,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.ratingButtonText,

                                        isSelected
                                            ? styles.ratingButtonTextSelected
                                            : null,
                                    ]}
                                >
                                    {
                                        rating
                                    }
                                </Text>
                            </Pressable>
                        );
                    }
                )}
            </View>

            {isRatingPending ? (
                <View
                    style={
                        styles.pendingRow
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
                            styles.pendingText
                        }
                    >
                        Puanın kaydediliyor...
                    </Text>
                </View>
            ) : null}

            {ratingError ? (
                <View
                    style={
                        styles.errorCard
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
                            styles.errorText
                        }
                    >
                        {
                            ratingError
                        }
                    </Text>
                </View>
            ) : null}
        </View>
    );
}


const styles =
    StyleSheet.create({
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

        sectionTitle: {
            ...typography.heading,

            marginTop:
                spacing.xs,

            color:
                colors.text,
        },

        summaryCard: {
            minHeight: 74,

            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.md,

            marginTop:
                spacing.lg,

            padding:
                spacing.md,

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        summaryIcon: {
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

        summaryContent: {
            flex: 1,
        },

        summaryValue: {
            ...typography.heading,

            color:
                colors.text,
        },

        summaryLabel: {
            ...typography.caption,

            marginTop:
                spacing.xs,

            color:
                colors.textSecondary,
        },

        loginHint: {
            ...typography.caption,

            marginTop:
                spacing.md,

            color:
                colors.textSecondary,
        },

        myRatingCard: {
            minHeight: 72,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            gap:
                spacing.md,

            marginTop:
                spacing.lg,

            padding:
                spacing.md,

            borderWidth: 1,

            borderColor:
                colors.primary,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        myRatingLabel: {
            ...typography.caption,

            color:
                colors.textSecondary,
        },

        myRatingValue: {
            fontSize: 22,

            lineHeight: 28,

            marginTop:
                spacing.xs,

            color:
                colors.text,

            fontWeight:
                "800",
        },

        deleteButton: {
            minHeight: 40,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "center",

            gap:
                spacing.xs,

            paddingHorizontal:
                spacing.md,

            borderWidth: 1,

            borderColor:
                colors.error,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surface,
        },

        deleteButtonPressed: {
            opacity: 0.7,
        },

        deleteButtonText: {
            ...typography.caption,

            color:
                colors.error,

            fontWeight:
                "700",
        },

        selectLabel: {
            ...typography.caption,

            marginTop:
                spacing.lg,

            color:
                colors.textSecondary,
        },

        ratingGrid: {
            flexDirection:
                "row",

            flexWrap:
                "wrap",

            gap:
                spacing.sm,

            marginTop:
                spacing.md,
        },

        ratingButton: {
            width: 50,

            height: 48,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surface,
        },

        ratingButtonSelected: {
            borderColor:
                colors.primary,

            backgroundColor:
                colors.primary,
        },

        ratingButtonPressed: {
            backgroundColor:
                colors.surfaceElevated,
        },

        ratingButtonText: {
            fontSize: 15,

            color:
                colors.textSecondary,

            fontWeight:
                "700",
        },

        ratingButtonTextSelected: {
            color:
                colors.text,
        },

        buttonDisabled: {
            opacity: 0.55,
        },

        pendingRow: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.sm,

            marginTop:
                spacing.md,
        },

        pendingText: {
            ...typography.caption,

            color:
                colors.textSecondary,
        },

        errorCard: {
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

        errorText: {
            ...typography.caption,

            flex: 1,

            color:
                colors.error,
        },
    });