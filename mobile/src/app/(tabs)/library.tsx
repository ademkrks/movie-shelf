import {
    useCallback,
    useState,
} from "react";

import {
    ActivityIndicator,
    FlatList,
    Image,
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

import {
    ApiClientError,
} from "../../api/client";

import {
    getFavorites,
    removeFavorite,
} from "../../api/favorites.api";

import {
    getMovieDetailsBatch,
} from "../../api/tmdb.api";

import {
    getWatchlist,
    removeFromWatchlist,
} from "../../api/watchlist.api";

import useAuth from "../../hooks/useAuth";

import type {
    CollectionPagination,
    CollectionRecord,
} from "../../types/library";

import type {
    TmdbMovieDetail,
} from "../../types/tmdb";

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


const POSTER_BASE_URL =
    "https://image.tmdb.org/t/p/w500";

const COLLECTION_PAGE_SIZE =
    20;


type CollectionKind =
    | "favorites"
    | "watchlist";


type CollectionMovie =
    TmdbMovieDetail & {
        collectionCreatedAt:
            string;
    };


type LoadCollectionOptions = {
    refreshing?: boolean;

    append?: boolean;
};


const getRequestErrorMessage = (
    error: unknown
) => {
    if (
        error instanceof
        ApiClientError
    ) {
        return (
            error.errors[0] ??
            error.message
        );
    }

    if (
        error instanceof
        Error
    ) {
        return error.message;
    }

    return "Koleksiyon yüklenirken bilinmeyen bir hata oluştu.";
};


const getMovieYear = (
    releaseDate?: string
) => {
    if (
        !releaseDate
    ) {
        return "—";
    }

    const year =
        releaseDate.slice(
            0,
            4
        );

    return /^\d{4}$/.test(
        year
    )
        ? year
        : "—";
};


const getMovieRating = (
    rating?: number
) => {
    if (
        typeof rating !==
            "number" ||
        !Number.isFinite(
            rating
        )
    ) {
        return "—";
    }

    return rating.toFixed(
        1
    );
};


type MovieCardProps = {
    movie:
        CollectionMovie;

    collection:
        CollectionKind;

    isRemoving:
        boolean;

    onOpen:
        (
            movieId: number
        ) => void;

    onRemove:
        (
            movieId: number
        ) => void;
};


function MovieCard({
    movie,
    collection,
    isRemoving,
    onOpen,
    onRemove,
}: MovieCardProps) {
    const movieTitle =
        movie.title ||
        movie.original_title ||
        "İsimsiz film";


    return (
        <View
            style={
                styles.movieCard
            }
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${movieTitle} detaylarını aç`}
                onPress={() =>
                    onOpen(
                        movie.id
                    )
                }
                style={({
                    pressed,
                }) => [
                    styles.movieMain,

                    pressed
                        ? styles.movieMainPressed
                        : null,
                ]}
            >
                {movie.poster_path ? (
                    <Image
                        source={{
                            uri:
                                POSTER_BASE_URL +
                                movie.poster_path,
                        }}
                        style={
                            styles.poster
                        }
                        resizeMode="cover"
                    />
                ) : (
                    <View
                        style={
                            styles.posterFallback
                        }
                    >
                        <Ionicons
                            name="film-outline"
                            size={
                                30
                            }
                            color={
                                colors.textMuted
                            }
                        />

                        <Text
                            style={
                                styles.posterFallbackText
                            }
                        >
                            Afiş yok
                        </Text>
                    </View>
                )}

                <View
                    style={
                        styles.movieInfo
                    }
                >
                    <Text
                        style={
                            styles.movieTitle
                        }
                        numberOfLines={
                            2
                        }
                    >
                        {
                            movieTitle
                        }
                    </Text>

                    <View
                        style={
                            styles.movieMeta
                        }
                    >
                        <View
                            style={
                                styles.metaItem
                            }
                        >
                            <Ionicons
                                name="calendar-outline"
                                size={
                                    14
                                }
                                color={
                                    colors.textSecondary
                                }
                            />

                            <Text
                                style={
                                    styles.metaText
                                }
                            >
                                {
                                    getMovieYear(
                                        movie.release_date
                                    )
                                }
                            </Text>
                        </View>

                        <View
                            style={
                                styles.metaItem
                            }
                        >
                            <Ionicons
                                name="star"
                                size={
                                    14
                                }
                                color={
                                    colors.warning
                                }
                            />

                            <Text
                                style={
                                    styles.metaText
                                }
                            >
                                {
                                    getMovieRating(
                                        movie.vote_average
                                    )
                                }
                            </Text>
                        </View>
                    </View>

                    <Text
                        style={
                            styles.movieOverview
                        }
                        numberOfLines={
                            3
                        }
                    >
                        {
                            movie.overview ||
                            "Bu film için konu bilgisi bulunmuyor."
                        }
                    </Text>

                    <View
                        style={
                            styles.detailsHint
                        }
                    >
                        <Text
                            style={
                                styles.detailsHintText
                            }
                        >
                            Detayları Gör
                        </Text>

                        <Ionicons
                            name="chevron-forward"
                            size={
                                15
                            }
                            color={
                                colors.primary
                            }
                        />
                    </View>
                </View>
            </Pressable>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                    collection ===
                    "favorites"
                        ? `${movieTitle} filmini favorilerden kaldır`
                        : `${movieTitle} filmini izleme listesinden kaldır`
                }
                disabled={
                    isRemoving
                }
                onPress={() =>
                    onRemove(
                        movie.id
                    )
                }
                style={({
                    pressed,
                }) => [
                    styles.removeButton,

                    pressed &&
                    !isRemoving
                        ? styles.removeButtonPressed
                        : null,

                    isRemoving
                        ? styles.removeButtonDisabled
                        : null,
                ]}
            >
                {isRemoving ? (
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
                        styles.removeButtonText
                    }
                >
                    {
                        collection ===
                        "favorites"
                            ? "Favoriden Kaldır"
                            : "Listeden Kaldır"
                    }
                </Text>
            </Pressable>
        </View>
    );
}


export default function LibraryScreen() {
    const router =
        useRouter();

    const {
        isAuthenticated,
        isRestoring,
    } =
        useAuth();


    const [
        activeCollection,
        setActiveCollection,
    ] =
        useState<
            CollectionKind
        >(
            "favorites"
        );


    const [
        movies,
        setMovies,
    ] =
        useState<
            CollectionMovie[]
        >(
            []
        );


    const [
        pagination,
        setPagination,
    ] =
        useState<
            CollectionPagination | null
        >(
            null
        );


    const [
        isLoading,
        setIsLoading,
    ] =
        useState(
            true
        );


    const [
        isRefreshing,
        setIsRefreshing,
    ] =
        useState(
            false
        );


    const [
        isLoadingMore,
        setIsLoadingMore,
    ] =
        useState(
            false
        );


    const [
        removingMovieId,
        setRemovingMovieId,
    ] =
        useState<
            number | null
        >(
            null
        );


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
        partialWarning,
        setPartialWarning,
    ] =
        useState<
            string | null
        >(
            null
        );


    const loadCollectionPage =
        useCallback(
            async (
                collection:
                    CollectionKind,

                page:
                    number,

                options:
                    LoadCollectionOptions =
                        {}
            ) => {
                const {
                    refreshing =
                        false,

                    append =
                        false,
                } =
                    options;


                if (
                    refreshing
                ) {
                    setIsRefreshing(
                        true
                    );
                } else if (
                    append
                ) {
                    setIsLoadingMore(
                        true
                    );
                } else {
                    setIsLoading(
                        true
                    );

                    setMovies(
                        []
                    );

                    setPagination(
                        null
                    );
                }


                setError(
                    null
                );


                if (
                    !append
                ) {
                    setPartialWarning(
                        null
                    );
                }


                try {
                    const collectionResponse =
                        collection ===
                        "favorites"
                            ? await getFavorites(
                                page,
                                COLLECTION_PAGE_SIZE
                            )
                            : await getWatchlist(
                                page,
                                COLLECTION_PAGE_SIZE
                            );


                    const collectionData =
                        collectionResponse
                            .data;


                    if (
                        !collectionData
                    ) {
                        throw new Error(
                            "Koleksiyon verisi alınamadı."
                        );
                    }


                    const records:
                        CollectionRecord[] =
                            collectionData
                                .items ??
                            [];


                    let enrichedMovies:
                        CollectionMovie[] =
                            [];


                    let failedMovieIds:
                        number[] =
                            [];


                    if (
                        records.length >
                        0
                    ) {
                        const movieIds =
                            records.map(
                                (
                                    record
                                ) =>
                                    Number(
                                        record.tmdbMovieId
                                    )
                            );


                        const movieResponse =
                            await getMovieDetailsBatch(
                                movieIds
                            );


                        const movieDetails =
                            movieResponse
                                .data
                                ?.items ??
                            [];


                        failedMovieIds =
                            movieResponse
                                .data
                                ?.failedMovieIds ??
                            [];


                        const moviesById =
                            new Map<
                                number,
                                TmdbMovieDetail
                            >(
                                movieDetails.map(
                                    (
                                        movie
                                    ) => [
                                        Number(
                                            movie.id
                                        ),
                                        movie,
                                    ]
                                )
                            );


                        enrichedMovies =
                            records
                                .map(
                                    (
                                        record
                                    ) => {
                                        const movie =
                                            moviesById.get(
                                                Number(
                                                    record.tmdbMovieId
                                                )
                                            );


                                        if (
                                            !movie
                                        ) {
                                            return null;
                                        }


                                        return {
                                            ...movie,

                                            collectionCreatedAt:
                                                record.createdAt,
                                        };
                                    }
                                )
                                .filter(
                                    (
                                        movie
                                    ):
                                        movie is
                                            CollectionMovie =>
                                        movie !==
                                        null
                                );
                    }


                    if (
                        append
                    ) {
                        setMovies(
                            (
                                currentMovies
                            ) => {
                                const existingIds =
                                    new Set(
                                        currentMovies.map(
                                            (
                                                movie
                                            ) =>
                                                movie.id
                                        )
                                    );


                                const newMovies =
                                    enrichedMovies.filter(
                                        (
                                            movie
                                        ) =>
                                            !existingIds.has(
                                                movie.id
                                            )
                                    );


                                return [
                                    ...currentMovies,
                                    ...newMovies,
                                ];
                            }
                        );
                    } else {
                        setMovies(
                            enrichedMovies
                        );
                    }


                    setPagination(
                        collectionData
                            .pagination
                    );


                    if (
                        failedMovieIds.length >
                        0
                    ) {
                        setPartialWarning(
                            `${failedMovieIds.length} filmin detayları şu anda getirilemedi.`
                        );
                    }
                } catch (
                    requestError
                ) {
                    setError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );


                    if (
                        !append &&
                        !refreshing
                    ) {
                        setMovies(
                            []
                        );

                        setPagination(
                            null
                        );
                    }
                } finally {
                    setIsLoading(
                        false
                    );

                    setIsRefreshing(
                        false
                    );

                    setIsLoadingMore(
                        false
                    );
                }
            },
            []
        );


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
                            void loadCollectionPage(
                                activeCollection,
                                1
                            );
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
                activeCollection,
                isAuthenticated,
                isRestoring,
                loadCollectionPage,
            ]
        )
    );


    const handleChangeCollection =
        (
            collection:
                CollectionKind
        ) => {
            if (
                collection ===
                activeCollection
            ) {
                return;
            }


            setActiveCollection(
                collection
            );
        };


    const handleRefresh =
        () => {
            void loadCollectionPage(
                activeCollection,
                1,
                {
                    refreshing:
                        true,
                }
            );
        };


    const handleLoadMore =
        () => {
            if (
                !pagination ||
                !pagination.hasNextPage ||
                isLoadingMore ||
                isLoading ||
                isRefreshing
            ) {
                return;
            }


            void loadCollectionPage(
                activeCollection,
                pagination.page +
                    1,
                {
                    append:
                        true,
                }
            );
        };


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


    const handleRemoveMovie =
        async (
            movieId: number
        ) => {
            if (
                removingMovieId !==
                null
            ) {
                return;
            }


            setRemovingMovieId(
                movieId
            );

            setError(
                null
            );


            try {
                if (
                    activeCollection ===
                    "favorites"
                ) {
                    await removeFavorite(
                        movieId
                    );
                } else {
                    await removeFromWatchlist(
                        movieId
                    );
                }


                setMovies(
                    (
                        currentMovies
                    ) =>
                        currentMovies.filter(
                            (
                                movie
                            ) =>
                                movie.id !==
                                movieId
                        )
                );


                setPagination(
                    (
                        currentPagination
                    ) => {
                        if (
                            !currentPagination
                        ) {
                            return null;
                        }


                        const nextTotalItems =
                            Math.max(
                                0,
                                currentPagination
                                    .totalItems -
                                    1
                            );


                        const nextTotalPages =
                            Math.ceil(
                                nextTotalItems /
                                currentPagination
                                    .limit
                            );


                        return {
                            ...currentPagination,

                            totalItems:
                                nextTotalItems,

                            totalPages:
                                nextTotalPages,

                            hasNextPage:
                                currentPagination
                                    .page <
                                nextTotalPages,
                        };
                    }
                );
            } catch (
                requestError
            ) {
                setError(
                    getRequestErrorMessage(
                        requestError
                    )
                );
            } finally {
                setRemovingMovieId(
                    null
                );
            }
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


    const totalItems =
        pagination
            ?.totalItems ??
        movies.length;


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
                            handleChangeCollection(
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
                            handleChangeCollection(
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
                            void loadCollectionPage(
                                activeCollection,
                                1
                            );
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
                        <MovieCard
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

        movieCard: {
            overflow:
                "hidden",

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        movieMain: {
            flexDirection:
                "row",

            gap:
                spacing.md,

            padding:
                spacing.md,
        },

        movieMainPressed: {
            backgroundColor:
                colors.surfaceElevated,
        },

        poster: {
            width: 94,

            height: 141,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surfaceSoft,
        },

        posterFallback: {
            width: 94,

            height: 141,

            alignItems:
                "center",

            justifyContent:
                "center",

            gap:
                spacing.sm,

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surfaceSoft,
        },

        posterFallbackText: {
            fontSize: 11,

            color:
                colors.textMuted,
        },

        movieInfo: {
            flex: 1,

            minHeight: 141,
        },

        movieTitle: {
            ...typography.body,

            color:
                colors.text,

            fontWeight:
                "800",
        },

        movieMeta: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.md,

            marginTop:
                spacing.sm,
        },

        metaItem: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.xs,
        },

        metaText: {
            fontSize: 12,

            color:
                colors.textSecondary,

            fontWeight:
                "600",
        },

        movieOverview: {
            fontSize: 12,

            lineHeight: 17,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,
        },

        detailsHint: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.xs,

            marginTop:
                "auto",

            paddingTop:
                spacing.sm,
        },

        detailsHintText: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "700",
        },

        removeButton: {
            minHeight: 44,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "center",

            gap:
                spacing.sm,

            borderTopWidth: 1,

            borderTopColor:
                colors.border,

            backgroundColor:
                colors.background,
        },

        removeButtonPressed: {
            backgroundColor:
                colors.surfaceElevated,
        },

        removeButtonDisabled: {
            opacity: 0.55,
        },

        removeButtonText: {
            ...typography.caption,

            color:
                colors.error,

            fontWeight:
                "700",
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