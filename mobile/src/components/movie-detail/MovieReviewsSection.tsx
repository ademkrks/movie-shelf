import {
    useState,
} from "react";

import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import type {
    MovieReviewItem,
} from "../../types/review";

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


const MAX_REVIEW_LENGTH =
    1000;


type MovieReviewsSectionProps = {
    isAuthenticated: boolean;

    isRestoring: boolean;

    currentUserId:
        | number
        | null;

    reviews:
        MovieReviewItem[];

    totalReviews: number;

    hasMoreReviews: boolean;

    isReviewsLoading: boolean;

    isReviewsLoadingMore: boolean;

    isReviewMutationPending: boolean;

    reviewError:
        | string
        | null;

    onReviewCreate:
        (
            content: string
        ) =>
            Promise<boolean>;

    onReviewUpdate:
        (
            reviewId: number,
            content: string
        ) =>
            Promise<boolean>;

    onReviewDelete:
        (
            reviewId: number
        ) =>
            Promise<boolean>;

    onLoadMore:
        () =>
            | void
            | Promise<void>;

    onLoginPress:
        () => void;
};


const formatReviewDate = (
    value: string
) => {
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
            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric",
        }
    );
};


export default function MovieReviewsSection({
    isAuthenticated,
    isRestoring,
    currentUserId,
    reviews,
    totalReviews,
    hasMoreReviews,
    isReviewsLoading,
    isReviewsLoadingMore,
    isReviewMutationPending,
    reviewError,
    onReviewCreate,
    onReviewUpdate,
    onReviewDelete,
    onLoadMore,
    onLoginPress,
}: MovieReviewsSectionProps) {
    const [
        reviewContent,
        setReviewContent,
    ] =
        useState(
            ""
        );


    const [
        editingReviewId,
        setEditingReviewId,
    ] =
        useState<
            number | null
        >(
            null
        );


    const [
        editingContent,
        setEditingContent,
    ] =
        useState(
            ""
        );


    const normalizedReviewContent =
        reviewContent.trim();


    const normalizedEditingContent =
        editingContent.trim();


    const canSubmitReview =
        normalizedReviewContent.length >
            0 &&
        normalizedReviewContent.length <=
            MAX_REVIEW_LENGTH &&
        !isReviewMutationPending;


    const canSubmitEdit =
        normalizedEditingContent.length >
            0 &&
        normalizedEditingContent.length <=
            MAX_REVIEW_LENGTH &&
        !isReviewMutationPending;


    const handleCreate =
        async () => {
            if (
                !canSubmitReview
            ) {
                return;
            }


            const success =
                await onReviewCreate(
                    normalizedReviewContent
                );


            if (
                success
            ) {
                setReviewContent(
                    ""
                );
            }
        };


    const handleStartEditing =
        (
            review:
                MovieReviewItem
        ) => {
            if (
                isReviewMutationPending
            ) {
                return;
            }


            setEditingReviewId(
                review.id
            );

            setEditingContent(
                review.content
            );
        };


    const handleCancelEditing =
        () => {
            if (
                isReviewMutationPending
            ) {
                return;
            }


            setEditingReviewId(
                null
            );

            setEditingContent(
                ""
            );
        };


    const handleSaveEditing =
        async () => {
            if (
                editingReviewId ===
                    null ||
                !canSubmitEdit
            ) {
                return;
            }


            const success =
                await onReviewUpdate(
                    editingReviewId,
                    normalizedEditingContent
                );


            if (
                success
            ) {
                setEditingReviewId(
                    null
                );

                setEditingContent(
                    ""
                );
            }
        };


    const handleDelete =
        (
            reviewId: number
        ) => {
            if (
                isReviewMutationPending
            ) {
                return;
            }


            Alert.alert(
                "Yorumu sil",
                "Bu yorumu silmek istediğine emin misin?",
                [
                    {
                        text:
                            "Vazgeç",

                        style:
                            "cancel",
                    },

                    {
                        text:
                            "Sil",

                        style:
                            "destructive",

                        onPress:
                            () => {
                                void onReviewDelete(
                                    reviewId
                                );
                            },
                    },
                ]
            );
        };


    return (
        <View
            style={
                styles.section
            }
        >
            <View
                style={
                    styles.sectionHeader
                }
            >
                <View
                    style={
                        styles.sectionTitleContainer
                    }
                >
                    <Text
                        style={
                            styles.sectionEyebrow
                        }
                    >
                        TOPLULUK
                    </Text>

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Yorumlar
                    </Text>
                </View>

                <View
                    style={
                        styles.reviewCountBadge
                    }
                >
                    <Text
                        style={
                            styles.reviewCountText
                        }
                    >
                        {
                            totalReviews
                        }
                    </Text>
                </View>
            </View>

            {!isAuthenticated &&
            !isRestoring ? (
                <View
                    style={
                        styles.loginCard
                    }
                >
                    <View
                        style={
                            styles.loginIcon
                        }
                    >
                        <Ionicons
                            name="chatbubble-ellipses-outline"
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
                            styles.loginContent
                        }
                    >
                        <Text
                            style={
                                styles.loginTitle
                            }
                        >
                            Yorumunu paylaş
                        </Text>

                        <Text
                            style={
                                styles.loginDescription
                            }
                        >
                            Filme yorum yapmak için giriş yap.
                        </Text>
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Giriş yap"
                        onPress={
                            onLoginPress
                        }
                        style={({
                            pressed,
                        }) => [
                            styles.loginButton,

                            pressed
                                ? styles.loginButtonPressed
                                : null,
                        ]}
                    >
                        <Text
                            style={
                                styles.loginButtonText
                            }
                        >
                            Giriş
                        </Text>
                    </Pressable>
                </View>
            ) : null}

            {isAuthenticated ? (
                <View
                    style={
                        styles.createCard
                    }
                >
                    <Text
                        style={
                            styles.createTitle
                        }
                    >
                        Yorum yaz
                    </Text>

                    <TextInput
                        value={
                            reviewContent
                        }
                        onChangeText={
                            setReviewContent
                        }
                        placeholder="Film hakkındaki düşüncelerini paylaş..."
                        placeholderTextColor={
                            colors.textMuted
                        }
                        multiline
                        maxLength={
                            MAX_REVIEW_LENGTH
                        }
                        editable={
                            !isReviewMutationPending
                        }
                        textAlignVertical="top"
                        style={
                            styles.reviewInput
                        }
                    />

                    <View
                        style={
                            styles.formFooter
                        }
                    >
                        <Text
                            style={[
                                styles.characterCount,

                                reviewContent.length >=
                                MAX_REVIEW_LENGTH
                                    ? styles.characterCountLimit
                                    : null,
                            ]}
                        >
                            {
                                reviewContent.length
                            }
                            /
                            {
                                MAX_REVIEW_LENGTH
                            }
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Yorumu gönder"
                            onPress={() => {
                                void handleCreate();
                            }}
                            disabled={
                                !canSubmitReview
                            }
                            style={({
                                pressed,
                            }) => [
                                styles.submitButton,

                                pressed &&
                                canSubmitReview
                                    ? styles.submitButtonPressed
                                    : null,

                                !canSubmitReview
                                    ? styles.buttonDisabled
                                    : null,
                            ]}
                        >
                            {isReviewMutationPending ? (
                                <ActivityIndicator
                                    size="small"
                                    color={
                                        colors.text
                                    }
                                />
                            ) : (
                                <Ionicons
                                    name="send"
                                    size={
                                        16
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
                                Gönder
                            </Text>
                        </Pressable>
                    </View>
                </View>
            ) : null}

            {reviewError ? (
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
                            reviewError
                        }
                    </Text>
                </View>
            ) : null}

            {isReviewsLoading ? (
                <View
                    style={
                        styles.loadingContainer
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
                            styles.loadingText
                        }
                    >
                        Yorumlar yükleniyor...
                    </Text>
                </View>
            ) : null}

            {!isReviewsLoading &&
            reviews.length ===
                0 ? (
                <View
                    style={
                        styles.emptyCard
                    }
                >
                    <View
                        style={
                            styles.emptyIcon
                        }
                    >
                        <Ionicons
                            name="chatbubbles-outline"
                            size={
                                28
                            }
                            color={
                                colors.textMuted
                            }
                        />
                    </View>

                    <Text
                        style={
                            styles.emptyTitle
                        }
                    >
                        Henüz yorum yok
                    </Text>

                    <Text
                        style={
                            styles.emptyDescription
                        }
                    >
                        Bu film hakkında ilk yorumu sen paylaşabilirsin.
                    </Text>
                </View>
            ) : null}

            {reviews.length >
            0 ? (
                <View
                    style={
                        styles.reviewList
                    }
                >
                    {reviews.map(
                        (
                            review
                        ) => {
                            const isOwnReview =
                                currentUserId !==
                                    null &&
                                review.user.id ===
                                    currentUserId;

                            const isEditing =
                                editingReviewId ===
                                review.id;


                            return (
                                <View
                                    key={
                                        review.id
                                    }
                                    style={
                                        styles.reviewCard
                                    }
                                >
                                    <View
                                        style={
                                            styles.reviewHeader
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
                                                {review.user.name
                                                    .trim()
                                                    .charAt(
                                                        0
                                                    )
                                                    .toUpperCase() ||
                                                    "?"}
                                            </Text>
                                        </View>

                                        <View
                                            style={
                                                styles.reviewAuthor
                                            }
                                        >
                                            <View
                                                style={
                                                    styles.authorRow
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.authorName
                                                    }
                                                    numberOfLines={
                                                        1
                                                    }
                                                >
                                                    {
                                                        review.user.name
                                                    }
                                                </Text>

                                                {isOwnReview ? (
                                                    <View
                                                        style={
                                                            styles.ownBadge
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.ownBadgeText
                                                            }
                                                        >
                                                            Sen
                                                        </Text>
                                                    </View>
                                                ) : null}
                                            </View>

                                            <Text
                                                style={
                                                    styles.reviewDate
                                                }
                                            >
                                                {
                                                    formatReviewDate(
                                                        review.updatedAt ||
                                                        review.createdAt
                                                    )
                                                }
                                            </Text>
                                        </View>
                                    </View>

                                    {isEditing ? (
                                        <View
                                            style={
                                                styles.editContainer
                                            }
                                        >
                                            <TextInput
                                                value={
                                                    editingContent
                                                }
                                                onChangeText={
                                                    setEditingContent
                                                }
                                                multiline
                                                maxLength={
                                                    MAX_REVIEW_LENGTH
                                                }
                                                editable={
                                                    !isReviewMutationPending
                                                }
                                                textAlignVertical="top"
                                                style={
                                                    styles.editInput
                                                }
                                            />

                                            <View
                                                style={
                                                    styles.editFooter
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.characterCount,

                                                        editingContent.length >=
                                                        MAX_REVIEW_LENGTH
                                                            ? styles.characterCountLimit
                                                            : null,
                                                    ]}
                                                >
                                                    {
                                                        editingContent.length
                                                    }
                                                    /
                                                    {
                                                        MAX_REVIEW_LENGTH
                                                    }
                                                </Text>

                                                <View
                                                    style={
                                                        styles.editActions
                                                    }
                                                >
                                                    <Pressable
                                                        accessibilityRole="button"
                                                        accessibilityLabel="Düzenlemeyi iptal et"
                                                        onPress={
                                                            handleCancelEditing
                                                        }
                                                        disabled={
                                                            isReviewMutationPending
                                                        }
                                                        style={({
                                                            pressed,
                                                        }) => [
                                                            styles.cancelButton,

                                                            pressed &&
                                                            !isReviewMutationPending
                                                                ? styles.cancelButtonPressed
                                                                : null,

                                                            isReviewMutationPending
                                                                ? styles.buttonDisabled
                                                                : null,
                                                        ]}
                                                    >
                                                        <Text
                                                            style={
                                                                styles.cancelButtonText
                                                            }
                                                        >
                                                            Vazgeç
                                                        </Text>
                                                    </Pressable>

                                                    <Pressable
                                                        accessibilityRole="button"
                                                        accessibilityLabel="Yorumu kaydet"
                                                        onPress={() => {
                                                            void handleSaveEditing();
                                                        }}
                                                        disabled={
                                                            !canSubmitEdit
                                                        }
                                                        style={({
                                                            pressed,
                                                        }) => [
                                                            styles.saveButton,

                                                            pressed &&
                                                            canSubmitEdit
                                                                ? styles.saveButtonPressed
                                                                : null,

                                                            !canSubmitEdit
                                                                ? styles.buttonDisabled
                                                                : null,
                                                        ]}
                                                    >
                                                        {isReviewMutationPending ? (
                                                            <ActivityIndicator
                                                                size="small"
                                                                color={
                                                                    colors.text
                                                                }
                                                            />
                                                        ) : (
                                                            <Ionicons
                                                                name="checkmark"
                                                                size={
                                                                    17
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
                                                            Kaydet
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                            </View>
                                        </View>
                                    ) : (
                                        <Text
                                            style={
                                                styles.reviewContent
                                            }
                                        >
                                            {
                                                review.content
                                            }
                                        </Text>
                                    )}

                                    {isOwnReview &&
                                    !isEditing ? (
                                        <View
                                            style={
                                                styles.ownerActions
                                            }
                                        >
                                            <Pressable
                                                accessibilityRole="button"
                                                accessibilityLabel="Yorumu düzenle"
                                                onPress={() =>
                                                    handleStartEditing(
                                                        review
                                                    )
                                                }
                                                disabled={
                                                    isReviewMutationPending
                                                }
                                                style={({
                                                    pressed,
                                                }) => [
                                                    styles.ownerButton,

                                                    pressed &&
                                                    !isReviewMutationPending
                                                        ? styles.ownerButtonPressed
                                                        : null,

                                                    isReviewMutationPending
                                                        ? styles.buttonDisabled
                                                        : null,
                                                ]}
                                            >
                                                <Ionicons
                                                    name="create-outline"
                                                    size={
                                                        16
                                                    }
                                                    color={
                                                        colors.textSecondary
                                                    }
                                                />

                                                <Text
                                                    style={
                                                        styles.ownerButtonText
                                                    }
                                                >
                                                    Düzenle
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                accessibilityRole="button"
                                                accessibilityLabel="Yorumu sil"
                                                onPress={() =>
                                                    handleDelete(
                                                        review.id
                                                    )
                                                }
                                                disabled={
                                                    isReviewMutationPending
                                                }
                                                style={({
                                                    pressed,
                                                }) => [
                                                    styles.ownerButton,

                                                    styles.deleteButton,

                                                    pressed &&
                                                    !isReviewMutationPending
                                                        ? styles.ownerButtonPressed
                                                        : null,

                                                    isReviewMutationPending
                                                        ? styles.buttonDisabled
                                                        : null,
                                                ]}
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={
                                                        16
                                                    }
                                                    color={
                                                        colors.error
                                                    }
                                                />

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
                                </View>
                            );
                        }
                    )}
                </View>
            ) : null}

            {hasMoreReviews ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Daha fazla yorum yükle"
                    onPress={() => {
                        void onLoadMore();
                    }}
                    disabled={
                        isReviewsLoadingMore ||
                        isReviewsLoading
                    }
                    style={({
                        pressed,
                    }) => [
                        styles.loadMoreButton,

                        pressed &&
                        !isReviewsLoadingMore
                            ? styles.loadMoreButtonPressed
                            : null,

                        isReviewsLoadingMore ||
                        isReviewsLoading
                            ? styles.buttonDisabled
                            : null,
                    ]}
                >
                    {isReviewsLoadingMore ? (
                        <ActivityIndicator
                            size="small"
                            color={
                                colors.primary
                            }
                        />
                    ) : (
                        <Ionicons
                            name="chevron-down"
                            size={
                                18
                            }
                            color={
                                colors.primary
                            }
                        />
                    )}

                    <Text
                        style={
                            styles.loadMoreText
                        }
                    >
                        {isReviewsLoadingMore
                            ? "Yükleniyor..."
                            : "Daha fazla yorum"}
                    </Text>
                </Pressable>
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

        sectionHeader: {
            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            gap:
                spacing.md,
        },

        sectionTitleContainer: {
            flex: 1,
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

        reviewCountBadge: {
            minWidth: 38,

            height: 38,

            alignItems:
                "center",

            justifyContent:
                "center",

            paddingHorizontal:
                spacing.sm,

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.full,

            backgroundColor:
                colors.surface,
        },

        reviewCountText: {
            ...typography.caption,

            color:
                colors.text,

            fontWeight:
                "800",
        },

        loginCard: {
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

        loginIcon: {
            width: 44,

            height: 44,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                radius.full,

            backgroundColor:
                colors.surfaceElevated,
        },

        loginContent: {
            flex: 1,
        },

        loginTitle: {
            ...typography.body,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        loginDescription: {
            ...typography.caption,

            marginTop:
                spacing.xs,

            color:
                colors.textSecondary,
        },

        loginButton: {
            minHeight: 38,

            alignItems:
                "center",

            justifyContent:
                "center",

            paddingHorizontal:
                spacing.md,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.primary,
        },

        loginButtonPressed: {
            backgroundColor:
                colors.primaryPressed,
        },

        loginButtonText: {
            ...typography.caption,

            color:
                colors.text,

            fontWeight:
                "800",
        },

        createCard: {
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

        createTitle: {
            ...typography.body,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        reviewInput: {
            minHeight: 110,

            marginTop:
                spacing.md,

            padding:
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

            lineHeight: 21,
        },

        formFooter: {
            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            gap:
                spacing.md,

            marginTop:
                spacing.md,
        },

        characterCount: {
            ...typography.caption,

            color:
                colors.textMuted,
        },

        characterCountLimit: {
            color:
                colors.error,
        },

        submitButton: {
            minHeight: 42,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "center",

            gap:
                spacing.sm,

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
            ...typography.caption,

            color:
                colors.text,

            fontWeight:
                "800",
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

        loadingContainer: {
            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "center",

            gap:
                spacing.sm,

            minHeight: 90,

            marginTop:
                spacing.lg,
        },

        loadingText: {
            ...typography.caption,

            color:
                colors.textSecondary,
        },

        emptyCard: {
            alignItems:
                "center",

            marginTop:
                spacing.lg,

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

        emptyIcon: {
            width: 54,

            height: 54,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                radius.full,

            backgroundColor:
                colors.surfaceElevated,
        },

        emptyTitle: {
            ...typography.body,

            marginTop:
                spacing.md,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        emptyDescription: {
            ...typography.caption,

            marginTop:
                spacing.xs,

            color:
                colors.textSecondary,

            textAlign:
                "center",
        },

        reviewList: {
            gap:
                spacing.md,

            marginTop:
                spacing.lg,
        },

        reviewCard: {
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

        reviewHeader: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.md,
        },

        avatar: {
            width: 42,

            height: 42,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                radius.full,

            backgroundColor:
                colors.surfaceElevated,
        },

        avatarText: {
            ...typography.body,

            color:
                colors.primary,

            fontWeight:
                "800",
        },

        reviewAuthor: {
            flex: 1,
        },

        authorRow: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.sm,
        },

        authorName: {
            ...typography.body,

            flexShrink: 1,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        ownBadge: {
            paddingHorizontal:
                spacing.sm,

            paddingVertical:
                3,

            borderRadius:
                radius.full,

            backgroundColor:
                colors.primary,
        },

        ownBadgeText: {
            fontSize: 10,

            color:
                colors.text,

            fontWeight:
                "800",
        },

        reviewDate: {
            ...typography.caption,

            marginTop:
                spacing.xs,

            color:
                colors.textMuted,
        },

        reviewContent: {
            ...typography.body,

            marginTop:
                spacing.md,

            color:
                colors.textSecondary,
        },

        ownerActions: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.sm,

            marginTop:
                spacing.md,
        },

        ownerButton: {
            minHeight: 38,

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
                colors.border,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surfaceElevated,
        },

        ownerButtonPressed: {
            opacity: 0.7,
        },

        ownerButtonText: {
            ...typography.caption,

            color:
                colors.textSecondary,

            fontWeight:
                "700",
        },

        deleteButton: {
            borderColor:
                colors.error,
        },

        deleteButtonText: {
            ...typography.caption,

            color:
                colors.error,

            fontWeight:
                "700",
        },

        editContainer: {
            marginTop:
                spacing.md,
        },

        editInput: {
            minHeight: 100,

            padding:
                spacing.md,

            borderWidth: 1,

            borderColor:
                colors.primary,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.background,

            color:
                colors.text,

            fontSize: 14,

            lineHeight: 21,
        },

        editFooter: {
            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            gap:
                spacing.md,

            marginTop:
                spacing.md,
        },

        editActions: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.sm,
        },

        cancelButton: {
            minHeight: 38,

            alignItems:
                "center",

            justifyContent:
                "center",

            paddingHorizontal:
                spacing.md,

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surfaceElevated,
        },

        cancelButtonPressed: {
            opacity: 0.7,
        },

        cancelButtonText: {
            ...typography.caption,

            color:
                colors.textSecondary,

            fontWeight:
                "700",
        },

        saveButton: {
            minHeight: 38,

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
            ...typography.caption,

            color:
                colors.text,

            fontWeight:
                "800",
        },

        loadMoreButton: {
            minHeight: 46,

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
                colors.border,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surface,
        },

        loadMoreButtonPressed: {
            backgroundColor:
                colors.surfaceElevated,
        },

        loadMoreText: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "800",
        },

        buttonDisabled: {
            opacity: 0.55,
        },
    });