import {
    useCallback,
} from "react";

import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    Redirect,
    useFocusEffect,
    useRouter,
} from "expo-router";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import LibraryMovieCard from "../../components/library/LibraryMovieCard";

import useAuth from "../../hooks/useAuth";
import useLibraryCollection from "../../hooks/useLibraryCollection";

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


export default function LibraryScreen() {
    const router =
        useRouter();

    const {
        isAuthenticated,
        isRestoring,
    } =
        useAuth();


    const {
        activeCollection,

        movies,
        pagination,
        totalItems,

        isLoading,
        isRefreshing,
        isLoadingMore,

        removingMovieId,

        error,
        partialWarning,

        loadCollection,
        changeCollection,
        refreshCollection,
        loadMore,
        removeMovie,
    } =
        useLibraryCollection();


    useFocusEffect(
        useCallback(
            () => {
                if (
                    isRestoring ||
                    !isAuthenticated
                ) {
                    return;
                }


                const timeoutId =
                    setTimeout(
                        () => {
                            void loadCollection();
                        },
                        0
                    );


                return () => {
                    clearTimeout(
                        timeoutId
                    );
                };
            },
            [
                isAuthenticated,
                isRestoring,
                loadCollection,
            ]
        )
    );


    const handleOpenMovie =
        (
            movieId: number
        ) => {
            router.push({
                pathname:
                    "/movie/[id]",

                params: {
                    id:
                        String(
                            movieId
                        ),
                },
            });
        };


    const handleRefresh =
        () => {
            void refreshCollection();
        };


    const handleLoadMore =
        () => {
            void loadMore();
        };


    const handleRemoveMovie =
        (
            movieId: number
        ) => {
            void removeMovie(
                movieId
            );
        };

    if (
        !isRestoring &&
        !isAuthenticated
    ) {
        return (
            <Redirect
                href="/login"
            />
        );
    }


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
                        styles.authLoading
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
                            styles.authLoadingText
                        }
                    >
                        Oturum kontrol ediliyor
                    </Text>
                </View>
            </SafeAreaView>
        );
    }



    const emptyTitle =
        activeCollection ===
        "favorites"
            ? "Henüz favorin yok"
            : "İzleme listen boş";


    const emptyDescription =
        activeCollection ===
        "favorites"
            ? "Beğendiğin filmleri favorilerine eklediğinde burada görebilirsin."
            : "Daha sonra izlemek istediğin filmleri listene eklediğinde burada görünür.";


    return (
        <SafeAreaView
            style={
                styles.safeArea
            }
        >
            <View
                style={
                    styles.header
                }
            >
                <Text
                    style={
                        styles.eyebrow
                    }
                >
                    YOUR COLLECTION
                </Text>

                <View
                    style={
                        styles.titleRow
                    }
                >
                    <View
                        style={
                            styles.titleContent
                        }
                    >
                        <Text
                            style={
                                styles.title
                            }
                        >
                            Listem
                        </Text>

                        <Text
                            style={
                                styles.description
                            }
                        >
                            Favorilerin ve izleme listen tek yerde.
                        </Text>
                    </View>

                    {!isLoading ? (
                        <View
                            style={
                                styles.totalBadge
                            }
                        >
                            <Text
                                style={
                                    styles.totalBadgeText
                                }
                            >
                                {
                                    totalItems
                                }
                            </Text>
                        </View>
                    ) : null}
                </View>

                <View
                    style={
                        styles.segmentContainer
                    }
                >
                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{
                            selected:
                                activeCollection ===
                                "favorites",
                        }}
                        onPress={() =>
                            changeCollection(
                                "favorites"
                            )
                        }
                        style={({
                            pressed,
                        }) => [
                            styles.segmentButton,

                            activeCollection ===
                            "favorites"
                                ? styles.segmentButtonActive
                                : null,

                            pressed
                                ? styles.segmentButtonPressed
                                : null,
                        ]}
                    >
                        <Ionicons
                            name={
                                activeCollection ===
                                "favorites"
                                    ? "heart"
                                    : "heart-outline"
                            }
                            size={
                                18
                            }
                            color={
                                activeCollection ===
                                "favorites"
                                    ? colors.text
                                    : colors.textSecondary
                            }
                        />

                        <Text
                            style={[
                                styles.segmentText,

                                activeCollection ===
                                "favorites"
                                    ? styles.segmentTextActive
                                    : null,
                            ]}
                        >
                            Favoriler
                        </Text>
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        accessibilityState={{
                            selected:
                                activeCollection ===
                                "watchlist",
                        }}
                        onPress={() =>
                            changeCollection(
                                "watchlist"
                            )
                        }
                        style={({
                            pressed,
                        }) => [
                            styles.segmentButton,

                            activeCollection ===
                            "watchlist"
                                ? styles.segmentButtonActive
                                : null,

                            pressed
                                ? styles.segmentButtonPressed
                                : null,
                        ]}
                    >
                        <Ionicons
                            name={
                                activeCollection ===
                                "watchlist"
                                    ? "bookmark"
                                    : "bookmark-outline"
                            }
                            size={
                                18
                            }
                            color={
                                activeCollection ===
                                "watchlist"
                                    ? colors.text
                                    : colors.textSecondary
                            }
                        />

                        <Text
                            style={[
                                styles.segmentText,

                                activeCollection ===
                                "watchlist"
                                    ? styles.segmentTextActive
                                    : null,
                            ]}
                        >
                            İzleme Listesi
                        </Text>
                    </Pressable>
                </View>

                {partialWarning ? (
                    <View
                        style={
                            styles.warningCard
                        }
                    >
                        <Ionicons
                            name="warning-outline"
                            size={
                                18
                            }
                            color={
                                colors.warning
                            }
                        />

                        <Text
                            style={
                                styles.warningText
                            }
                        >
                            {
                                partialWarning
                            }
                        </Text>
                    </View>
                ) : null}

                {error &&
                movies.length >
                    0 ? (
                    <View
                        style={
                            styles.inlineError
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
                                styles.inlineErrorText
                            }
                        >
                            {
                                error
                            }
                        </Text>
                    </View>
                ) : null}
            </View>

            {isLoading ? (
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
                        Koleksiyon yükleniyor
                    </Text>

                    <Text
                        style={
                            styles.loadingDescription
                        }
                    >
                        Filmlerin hazırlanıyor.
                    </Text>
                </View>
            ) : error &&
            movies.length ===
                0 ? (
                <View
                    style={
                        styles.errorContainer
                    }
                >
                    <View
                        style={
                            styles.stateIcon
                        }
                    >
                        <Ionicons
                            name="alert-circle-outline"
                            size={
                                34
                            }
                            color={
                                colors.error
                            }
                        />
                    </View>

                    <Text
                        style={
                            styles.stateTitle
                        }
                    >
                        Koleksiyon yüklenemedi
                    </Text>

                    <Text
                        style={
                            styles.stateDescription
                        }
                    >
                        {
                            error
                        }
                    </Text>

                    <Pressable
                        onPress={() => {
                            void loadCollection();
                        }}
                        style={({
                            pressed,
                        }) => [
                            styles.retryButton,

                            pressed
                                ? styles.retryButtonPressed
                                : null,
                        ]}
                    >
                        <Ionicons
                            name="refresh"
                            size={
                                17
                            }
                            color={
                                colors.text
                            }
                        />

                        <Text
                            style={
                                styles.retryButtonText
                            }
                        >
                            Tekrar Dene
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={
                        movies
                    }
                    keyExtractor={(
                        movie
                    ) =>
                        String(
                            movie.id
                        )
                    }
                    renderItem={({
                        item,
                    }) => (
                        <LibraryMovieCard
                            movie={
                                item
                            }
                            collection={
                                activeCollection
                            }
                            isRemoving={
                                removingMovieId ===
                                item.id
                            }
                            onOpen={
                                handleOpenMovie
                            }
                            onRemove={(
                                movieId
                            ) => {
                                void handleRemoveMovie(
                                    movieId
                                );
                            }}
                        />
                    )}
                    contentContainerStyle={
                        movies.length ===
                        0
                            ? styles.emptyListContent
                            : styles.listContent
                    }
                    ItemSeparatorComponent={() => (
                        <View
                            style={
                                styles.separator
                            }
                        />
                    )}
                    showsVerticalScrollIndicator={
                        false
                    }
                    refreshing={
                        isRefreshing
                    }
                    onRefresh={
                        handleRefresh
                    }
                    ListEmptyComponent={
                        <View
                            style={
                                styles.emptyContainer
                            }
                        >
                            <View
                                style={
                                    styles.stateIcon
                                }
                            >
                                <Ionicons
                                    name={
                                        activeCollection ===
                                        "favorites"
                                            ? "heart-outline"
                                            : "bookmark-outline"
                                    }
                                    size={
                                        36
                                    }
                                    color={
                                        colors.primary
                                    }
                                />
                            </View>

                            <Text
                                style={
                                    styles.stateTitle
                                }
                            >
                                {
                                    emptyTitle
                                }
                            </Text>

                            <Text
                                style={
                                    styles.stateDescription
                                }
                            >
                                {
                                    emptyDescription
                                }
                            </Text>

                            <Pressable
                                onPress={() =>
                                    router.push(
                                        "/(tabs)"
                                    )
                                }
                                style={({
                                    pressed,
                                }) => [
                                    styles.discoverButton,

                                    pressed
                                        ? styles.discoverButtonPressed
                                        : null,
                                ]}
                            >
                                <Ionicons
                                    name="compass-outline"
                                    size={
                                        17
                                    }
                                    color={
                                        colors.text
                                    }
                                />

                                <Text
                                    style={
                                        styles.discoverButtonText
                                    }
                                >
                                    Film Keşfet
                                </Text>
                            </Pressable>
                        </View>
                    }
                    ListFooterComponent={
                        pagination
                            ?.hasNextPage ? (
                            <View
                                style={
                                    styles.footer
                                }
                            >
                                <Pressable
                                    disabled={
                                        isLoadingMore
                                    }
                                    onPress={
                                        handleLoadMore
                                    }
                                    style={({
                                        pressed,
                                    }) => [
                                        styles.loadMoreButton,

                                        pressed &&
                                        !isLoadingMore
                                            ? styles.loadMoreButtonPressed
                                            : null,

                                        isLoadingMore
                                            ? styles.loadMoreButtonDisabled
                                            : null,
                                    ]}
                                >
                                    {isLoadingMore ? (
                                        <ActivityIndicator
                                            size="small"
                                            color={
                                                colors.text
                                            }
                                        />
                                    ) : (
                                        <Ionicons
                                            name="add"
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
                                            styles.loadMoreButtonText
                                        }
                                    >
                                        {
                                            isLoadingMore
                                                ? "Yükleniyor"
                                                : "Daha Fazla Göster"
                                        }
                                    </Text>
                                </Pressable>

                                <Text
                                    style={
                                        styles.pageText
                                    }
                                >
                                    Sayfa{" "}
                                    {
                                        pagination.page
                                    }
                                    {" / "}
                                    {
                                        pagination.totalPages
                                    }
                                </Text>
                            </View>
                        ) : movies.length >
                            0 ? (
                            <View
                                style={
                                    styles.footerEnd
                                }
                            >
                                <Text
                                    style={
                                        styles.footerEndText
                                    }
                                >
                                    Koleksiyonun sonuna geldin.
                                </Text>
                            </View>
                        ) : null
                    }
                />
            )}
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

        authLoading: {
            flex: 1,

            alignItems:
                "center",

            justifyContent:
                "center",

            gap:
                spacing.md,

            paddingHorizontal:
                spacing.xl,
        },

        authLoadingText: {
            ...typography.body,

            color:
                colors.textSecondary,
        },

        header: {
            paddingHorizontal:
                spacing.lg,

            paddingTop:
                spacing.lg,

            paddingBottom:
                spacing.md,
        },

        eyebrow: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "800",

            letterSpacing:
                1.4,
        },

        titleRow: {
            flexDirection:
                "row",

            alignItems:
                "flex-start",

            justifyContent:
                "space-between",

            gap:
                spacing.md,

            marginTop:
                spacing.sm,
        },

        titleContent: {
            flex: 1,
        },

        title: {
            ...typography.title,

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

        totalBadge: {
            minWidth: 42,

            height: 42,

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

        totalBadgeText: {
            ...typography.caption,

            color:
                colors.text,

            fontWeight:
                "800",
        },

        segmentContainer: {
            flexDirection:
                "row",

            gap:
                spacing.sm,

            marginTop:
                spacing.xl,

            padding:
                spacing.xs,

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        segmentButton: {
            flex: 1,

            minHeight: 46,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "center",

            gap:
                spacing.sm,

            paddingHorizontal:
                spacing.sm,

            borderRadius:
                radius.md,
        },

        segmentButtonActive: {
            backgroundColor:
                colors.primary,
        },

        segmentButtonPressed: {
            opacity: 0.78,
        },

        segmentText: {
            ...typography.caption,

            flexShrink: 1,

            color:
                colors.textSecondary,

            fontWeight:
                "700",

            textAlign:
                "center",
        },

        segmentTextActive: {
            color:
                colors.text,
        },

        warningCard: {
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
                colors.warning,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surface,
        },

        warningText: {
            ...typography.caption,

            flex: 1,

            color:
                colors.textSecondary,
        },

        inlineError: {
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

        inlineErrorText: {
            ...typography.caption,

            flex: 1,

            color:
                colors.error,
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

        errorContainer: {
            flex: 1,

            alignItems:
                "center",

            justifyContent:
                "center",

            paddingHorizontal:
                spacing.xl,

            paddingBottom:
                spacing.xxxl,
        },

        emptyListContent: {
            flexGrow: 1,

            paddingHorizontal:
                spacing.lg,

            paddingBottom:
                spacing.xxxl,
        },

        listContent: {
            paddingHorizontal:
                spacing.lg,

            paddingTop:
                spacing.sm,

            paddingBottom:
                spacing.xxxl,
        },

        emptyContainer: {
            flex: 1,

            alignItems:
                "center",

            justifyContent:
                "center",

            paddingHorizontal:
                spacing.lg,

            paddingBottom:
                spacing.xxxl,
        },

        stateIcon: {
            width: 72,

            height: 72,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.full,

            backgroundColor:
                colors.surface,
        },

        stateTitle: {
            ...typography.heading,

            marginTop:
                spacing.lg,

            color:
                colors.text,

            textAlign:
                "center",
        },

        stateDescription: {
            ...typography.body,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,

            textAlign:
                "center",
        },

        retryButton: {
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
                spacing.xl,

            paddingHorizontal:
                spacing.xl,

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

        discoverButton: {
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
                spacing.xl,

            paddingHorizontal:
                spacing.xl,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.primary,
        },

        discoverButtonPressed: {
            backgroundColor:
                colors.primaryPressed,
        },

        discoverButtonText: {
            ...typography.button,

            color:
                colors.text,
        },

        separator: {
            height:
                spacing.md,
        },

        footer: {
            alignItems:
                "center",

            paddingTop:
                spacing.xl,

            paddingBottom:
                spacing.md,
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

            paddingHorizontal:
                spacing.xl,

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

        loadMoreButtonDisabled: {
            opacity: 0.55,
        },

        loadMoreButtonText: {
            ...typography.button,

            color:
                colors.text,
        },

        pageText: {
            ...typography.caption,

            marginTop:
                spacing.sm,

            color:
                colors.textMuted,
        },

        footerEnd: {
            alignItems:
                "center",

            paddingTop:
                spacing.xl,

            paddingBottom:
                spacing.md,
        },

        footerEndText: {
            ...typography.caption,

            color:
                colors.textMuted,

            textAlign:
                "center",
        },
    });