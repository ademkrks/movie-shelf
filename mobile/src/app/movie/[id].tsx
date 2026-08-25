import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    Image,
    Linking,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    useLocalSearchParams,
    useRouter,
} from "expo-router";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    ApiClientError,
} from "../../api/client";

import {
    addFavorite,
    getFavoriteStatus,
    removeFavorite,
} from "../../api/favorites.api";

import {
    getMovieCast,
    getMovieDetails,
    getMovieTrailers,
} from "../../api/tmdb.api";

import {
    addToWatchlist,
    getWatchlistStatus,
    removeFromWatchlist,
} from "../../api/watchlist.api";

import useAuth from "../../hooks/useAuth";

import type {
    TmdbCastMember,
    TmdbMovieDetail,
    TmdbTrailer,
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

const BACKDROP_BASE_URL =
    "https://image.tmdb.org/t/p/w780";

const PROFILE_BASE_URL =
    "https://image.tmdb.org/t/p/w185";


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

    return "Film bilgileri yüklenirken bilinmeyen bir hata oluştu.";
};


const getMovieYear = (
    releaseDate?: string
) => {
    if (!releaseDate) {
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


const getRuntime = (
    runtime?: number | null
) => {
    if (
        typeof runtime !==
            "number" ||
        runtime <= 0
    ) {
        return "—";
    }

    const hours =
        Math.floor(
            runtime / 60
        );

    const minutes =
        runtime % 60;

    if (hours === 0) {
        return `${minutes} dk`;
    }

    if (minutes === 0) {
        return `${hours} sa`;
    }

    return `${hours} sa ${minutes} dk`;
};


type CastCardProps = {
    person: TmdbCastMember;
};


function CastCard({
    person,
}: CastCardProps) {
    return (
        <View
            style={
                styles.castCard
            }
        >
            {person.profile_path ? (
                <Image
                    source={{
                        uri:
                            PROFILE_BASE_URL +
                            person.profile_path,
                    }}
                    style={
                        styles.castImage
                    }
                    resizeMode="cover"
                />
            ) : (
                <View
                    style={
                        styles.castImageFallback
                    }
                >
                    <Ionicons
                        name="person-outline"
                        size={
                            30
                        }
                        color={
                            colors.textMuted
                        }
                    />
                </View>
            )}

            <Text
                style={
                    styles.castName
                }
                numberOfLines={
                    2
                }
            >
                {
                    person.name
                }
            </Text>

            <Text
                style={
                    styles.castCharacter
                }
                numberOfLines={
                    2
                }
            >
                {
                    person.character ||
                    "—"
                }
            </Text>
        </View>
    );
}


export default function MovieDetailScreen() {
    const router =
        useRouter();

    const {
        isAuthenticated,
        isRestoring,
    } =
        useAuth();

    const {
        id,
    } =
        useLocalSearchParams<{
            id?:
                | string
                | string[];
        }>();


    const rawMovieId =
        Array.isArray(
            id
        )
            ? id[0]
            : id;


    const movieId =
        Number(
            rawMovieId
        );


    const isValidMovieId =
        Number.isInteger(
            movieId
        ) &&
        movieId > 0;


    const [
        movie,
        setMovie,
    ] =
        useState<
            TmdbMovieDetail | null
        >(
            null
        );


    const [
        cast,
        setCast,
    ] =
        useState<
            TmdbCastMember[]
        >(
            []
        );


    const [
        trailers,
        setTrailers,
    ] =
        useState<
            TmdbTrailer[]
        >(
            []
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
        error,
        setError,
    ] =
        useState<
            string | null
        >(
            null
        );


    const [
        secondaryError,
        setSecondaryError,
    ] =
        useState<
            string | null
        >(
            null
        );


    const [
        trailerError,
        setTrailerError,
    ] =
        useState<
            string | null
        >(
            null
        );


    const [
        isFavorite,
        setIsFavorite,
    ] =
        useState(
            false
        );


    const [
        isWatchlisted,
        setIsWatchlisted,
    ] =
        useState(
            false
        );


    const [
        isLibraryStatusLoading,
        setIsLibraryStatusLoading,
    ] =
        useState(
            false
        );


    const [
        isFavoritePending,
        setIsFavoritePending,
    ] =
        useState(
            false
        );


    const [
        isWatchlistPending,
        setIsWatchlistPending,
    ] =
        useState(
            false
        );


    const [
        libraryActionError,
        setLibraryActionError,
    ] =
        useState<
            string | null
        >(
            null
        );


    const loadMovie =
        useCallback(
            async (
                refreshing =
                    false
            ) => {
                if (
                    refreshing
                ) {
                    setIsRefreshing(
                        true
                    );
                } else {
                    setIsLoading(
                        true
                    );
                }

                setError(
                    null
                );

                setSecondaryError(
                    null
                );

                setTrailerError(
                    null
                );


                if (
                    !isValidMovieId
                ) {
                    setMovie(
                        null
                    );

                    setCast(
                        []
                    );

                    setTrailers(
                        []
                    );

                    setError(
                        "Geçersiz film ID."
                    );

                    setIsLoading(
                        false
                    );

                    setIsRefreshing(
                        false
                    );

                    return;
                }


                const results =
                    await Promise.allSettled([
                        getMovieDetails(
                            movieId
                        ),

                        getMovieCast(
                            movieId
                        ),

                        getMovieTrailers(
                            movieId
                        ),
                    ]);


                const [
                    movieResult,
                    castResult,
                    trailerResult,
                ] =
                    results;


                if (
                    movieResult.status ===
                    "rejected"
                ) {
                    setMovie(
                        null
                    );

                    setCast(
                        []
                    );

                    setTrailers(
                        []
                    );

                    setError(
                        getRequestErrorMessage(
                            movieResult.reason
                        )
                    );

                    setIsLoading(
                        false
                    );

                    setIsRefreshing(
                        false
                    );

                    return;
                }


                setMovie(
                    movieResult.value
                        .data
                );


                if (
                    castResult.status ===
                    "fulfilled"
                ) {
                    setCast(
                        castResult.value
                            .data ??
                            []
                    );
                } else {
                    setCast(
                        []
                    );
                }


                if (
                    trailerResult.status ===
                    "fulfilled"
                ) {
                    setTrailers(
                        trailerResult.value
                            .data ??
                            []
                    );
                } else {
                    setTrailers(
                        []
                    );
                }


                if (
                    castResult.status ===
                        "rejected" ||
                    trailerResult.status ===
                        "rejected"
                ) {
                    setSecondaryError(
                        "Film yüklendi ancak bazı ek bilgiler şu anda getirilemedi."
                    );
                }


                setIsLoading(
                    false
                );

                setIsRefreshing(
                    false
                );
            },
            [
                isValidMovieId,
                movieId,
            ]
        );


    const loadLibraryStatus =
        useCallback(
            async () => {
                if (
                    isRestoring
                ) {
                    return;
                }


                if (
                    !isValidMovieId
                ) {
                    setIsFavorite(
                        false
                    );

                    setIsWatchlisted(
                        false
                    );

                    setIsLibraryStatusLoading(
                        false
                    );

                    setLibraryActionError(
                        null
                    );

                    return;
                }


                if (
                    !isAuthenticated
                ) {
                    setIsFavorite(
                        false
                    );

                    setIsWatchlisted(
                        false
                    );

                    setIsLibraryStatusLoading(
                        false
                    );

                    setLibraryActionError(
                        null
                    );

                    return;
                }


                setIsFavorite(
                    false
                );

                setIsWatchlisted(
                    false
                );

                setIsLibraryStatusLoading(
                    true
                );

                setLibraryActionError(
                    null
                );


                const results =
                    await Promise.allSettled([
                        getFavoriteStatus(
                            movieId
                        ),

                        getWatchlistStatus(
                            movieId
                        ),
                    ]);


                const [
                    favoriteResult,
                    watchlistResult,
                ] =
                    results;


                if (
                    favoriteResult.status ===
                    "fulfilled"
                ) {
                    setIsFavorite(
                        favoriteResult.value
                            .data
                            ?.isFavorite ??
                            false
                    );
                }


                if (
                    watchlistResult.status ===
                    "fulfilled"
                ) {
                    setIsWatchlisted(
                        watchlistResult.value
                            .data
                            ?.isWatchlisted ??
                            false
                    );
                }


                if (
                    favoriteResult.status ===
                        "rejected" ||
                    watchlistResult.status ===
                        "rejected"
                ) {
                    const failedResult =
                        favoriteResult.status ===
                        "rejected"
                            ? favoriteResult
                            : watchlistResult;

                    setLibraryActionError(
                        failedResult.status ===
                            "rejected"
                            ? getRequestErrorMessage(
                                failedResult.reason
                            )
                            : "Koleksiyon durumu yüklenemedi."
                    );
                }


                setIsLibraryStatusLoading(
                    false
                );
            },
            [
                isAuthenticated,
                isRestoring,
                isValidMovieId,
                movieId,
            ]
        );


    useEffect(
        () => {
            const timeoutId =
                setTimeout(
                    () => {
                        void loadMovie();
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
            loadMovie,
        ]
    );


    useEffect(
        () => {
            const timeoutId =
                setTimeout(
                    () => {
                        void loadLibraryStatus();
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
            loadLibraryStatus,
        ]
    );


    const handleRetry =
        () => {
            void Promise.all([
                loadMovie(),
                loadLibraryStatus(),
            ]);
        };


    const handleRefresh =
        () => {
            void Promise.all([
                loadMovie(
                    true
                ),
                loadLibraryStatus(),
            ]);
        };


    const handleFavoriteToggle =
        async () => {
            setLibraryActionError(
                null
            );


            if (
                !isAuthenticated
            ) {
                router.push(
                    "/login"
                );

                return;
            }


            if (
                isFavoritePending ||
                isLibraryStatusLoading
            ) {
                return;
            }


            setIsFavoritePending(
                true
            );


            try {
                if (
                    isFavorite
                ) {
                    await removeFavorite(
                        movieId
                    );

                    setIsFavorite(
                        false
                    );
                } else {
                    await addFavorite(
                        movieId
                    );

                    setIsFavorite(
                        true
                    );
                }
            } catch (
                requestError
            ) {
                setLibraryActionError(
                    getRequestErrorMessage(
                        requestError
                    )
                );
            } finally {
                setIsFavoritePending(
                    false
                );
            }
        };


    const handleWatchlistToggle =
        async () => {
            setLibraryActionError(
                null
            );


            if (
                !isAuthenticated
            ) {
                router.push(
                    "/login"
                );

                return;
            }


            if (
                isWatchlistPending ||
                isLibraryStatusLoading
            ) {
                return;
            }


            setIsWatchlistPending(
                true
            );


            try {
                if (
                    isWatchlisted
                ) {
                    await removeFromWatchlist(
                        movieId
                    );

                    setIsWatchlisted(
                        false
                    );
                } else {
                    await addToWatchlist(
                        movieId
                    );

                    setIsWatchlisted(
                        true
                    );
                }
            } catch (
                requestError
            ) {
                setLibraryActionError(
                    getRequestErrorMessage(
                        requestError
                    )
                );
            } finally {
                setIsWatchlistPending(
                    false
                );
            }
        };


    const handleOpenTrailer =
        async (
            trailer: TmdbTrailer
        ) => {
            setTrailerError(
                null
            );

            if (
                trailer.site
                    .toLowerCase() !==
                "youtube"
            ) {
                setTrailerError(
                    "Bu fragman için desteklenen bir bağlantı bulunamadı."
                );

                return;
            }


            const trailerUrl =
                `https://www.youtube.com/watch?v=${encodeURIComponent(
                    trailer.key
                )}`;


            try {
                await Linking.openURL(
                    trailerUrl
                );
            } catch (
                requestError
            ) {
                setTrailerError(
                    requestError instanceof
                    Error
                        ? requestError.message
                        : "Fragman açılamadı."
                );
            }
        };


    if (
        isLoading
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
                        Film yükleniyor
                    </Text>

                    <Text
                        style={
                            styles.loadingDescription
                        }
                    >
                        Film bilgileri hazırlanıyor.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }


    if (
        error ||
        !movie
    ) {
        return (
            <SafeAreaView
                style={
                    styles.safeArea
                }
            >
                <View
                    style={
                        styles.errorScreen
                    }
                >
                    <View
                        style={
                            styles.errorIcon
                        }
                    >
                        <Ionicons
                            name="alert-circle-outline"
                            size={
                                38
                            }
                            color={
                                colors.error
                            }
                        />
                    </View>

                    <Text
                        style={
                            styles.errorEyebrow
                        }
                    >
                        MOVIE DETAILS
                    </Text>

                    <Text
                        style={
                            styles.errorScreenTitle
                        }
                    >
                        Film yüklenemedi
                    </Text>

                    <Text
                        style={
                            styles.errorScreenDescription
                        }
                    >
                        {
                            error ||
                            "Film bulunamadı."
                        }
                    </Text>

                    <Pressable
                        onPress={
                            handleRetry
                        }
                        style={({
                            pressed,
                        }) => [
                            styles.primaryButton,

                            pressed
                                ? styles.primaryButtonPressed
                                : null,
                        ]}
                    >
                        <Ionicons
                            name="refresh"
                            size={
                                18
                            }
                            color={
                                colors.text
                            }
                        />

                        <Text
                            style={
                                styles.primaryButtonText
                            }
                        >
                            Tekrar Dene
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() =>
                            router.back()
                        }
                        style={({
                            pressed,
                        }) => [
                            styles.secondaryButton,

                            pressed
                                ? styles.secondaryButtonPressed
                                : null,
                        ]}
                    >
                        <Text
                            style={
                                styles.secondaryButtonText
                            }
                        >
                            Geri Dön
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }


    const mainTrailer =
        trailers[0];


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
                refreshControl={
                    <RefreshControl
                        refreshing={
                            isRefreshing
                        }
                        onRefresh={
                            handleRefresh
                        }
                        tintColor={
                            colors.primary
                        }
                        colors={[
                            colors.primary,
                        ]}
                        progressBackgroundColor={
                            colors.surface
                        }
                    />
                }
            >
                <View
                    style={
                        styles.backdropContainer
                    }
                >
                    {movie.backdrop_path ? (
                        <Image
                            source={{
                                uri:
                                    BACKDROP_BASE_URL +
                                    movie.backdrop_path,
                            }}
                            style={
                                styles.backdrop
                            }
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={
                                styles.backdropFallback
                            }
                        >
                            <Ionicons
                                name="film-outline"
                                size={
                                    46
                                }
                                color={
                                    colors.textMuted
                                }
                            />
                        </View>
                    )}

                    <View
                        style={
                            styles.backdropOverlay
                        }
                    />

                    <Pressable
                        onPress={() =>
                            router.back()
                        }
                        style={({
                            pressed,
                        }) => [
                            styles.backButton,

                            pressed
                                ? styles.backButtonPressed
                                : null,
                        ]}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={
                                24
                            }
                            color={
                                colors.text
                            }
                        />
                    </Pressable>
                </View>

                <View
                    style={
                        styles.detailContainer
                    }
                >
                    <View
                        style={
                            styles.primaryInfo
                        }
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
                                        34
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
                                styles.titleContainer
                            }
                        >
                            <Text
                                style={
                                    styles.eyebrow
                                }
                            >
                                MOVIE DETAILS
                            </Text>

                            <Text
                                style={
                                    styles.title
                                }
                            >
                                {
                                    movie.title
                                }
                            </Text>

                            {movie.tagline ? (
                                <Text
                                    style={
                                        styles.tagline
                                    }
                                >
                                    {
                                        movie.tagline
                                    }
                                </Text>
                            ) : null}

                            <View
                                style={
                                    styles.metadata
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
                                            15
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
                                        name="time-outline"
                                        size={
                                            15
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
                                            getRuntime(
                                                movie.runtime
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
                                            15
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
                        </View>
                    </View>

                    {movie.genres &&
                    movie.genres.length >
                        0 ? (
                        <View
                            style={
                                styles.genreContainer
                            }
                        >
                            {movie.genres.map(
                                (
                                    genre
                                ) => (
                                    <View
                                        key={
                                            genre.id
                                        }
                                        style={
                                            styles.genreBadge
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.genreText
                                            }
                                        >
                                            {
                                                genre.name
                                            }
                                        </Text>
                                    </View>
                                )
                            )}
                        </View>
                    ) : null}

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
                            YOUR SHELF
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
                                    void handleFavoriteToggle();
                                }}
                                disabled={
                                    isRestoring ||
                                    isFavoritePending ||
                                    isLibraryStatusLoading
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

                                    isRestoring ||
                                    isFavoritePending ||
                                    isLibraryStatusLoading
                                        ? styles.collectionActionButtonDisabled
                                        : null,
                                ]}
                            >
                                {isFavoritePending ||
                                (
                                    isLibraryStatusLoading &&
                                    isAuthenticated
                                ) ? (
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
                                    void handleWatchlistToggle();
                                }}
                                disabled={
                                    isRestoring ||
                                    isWatchlistPending ||
                                    isLibraryStatusLoading
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

                                    isRestoring ||
                                    isWatchlistPending ||
                                    isLibraryStatusLoading
                                        ? styles.collectionActionButtonDisabled
                                        : null,
                                ]}
                            >
                                {isWatchlistPending ||
                                (
                                    isLibraryStatusLoading &&
                                    isAuthenticated
                                ) ? (
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
                            STORY
                        </Text>

                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Konu
                        </Text>

                        <Text
                            style={
                                styles.overview
                            }
                        >
                            {
                                movie.overview ||
                                "Bu film için konu bilgisi bulunmuyor."
                            }
                        </Text>
                    </View>

                    {mainTrailer ? (
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
                                TRAILER
                            </Text>

                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Fragman
                            </Text>

                            <Pressable
                                onPress={() => {
                                    void handleOpenTrailer(
                                        mainTrailer
                                    );
                                }}
                                style={({
                                    pressed,
                                }) => [
                                    styles.trailerButton,

                                    pressed
                                        ? styles.trailerButtonPressed
                                        : null,
                                ]}
                            >
                                <View
                                    style={
                                        styles.trailerIcon
                                    }
                                >
                                    <Ionicons
                                        name="play"
                                        size={
                                            20
                                        }
                                        color={
                                            colors.text
                                        }
                                    />
                                </View>

                                <View
                                    style={
                                        styles.trailerInfo
                                    }
                                >
                                    <Text
                                        style={
                                            styles.trailerTitle
                                        }
                                        numberOfLines={
                                            2
                                        }
                                    >
                                        {
                                            mainTrailer.name ||
                                            "Resmi Fragman"
                                        }
                                    </Text>

                                    <Text
                                        style={
                                            styles.trailerSubtitle
                                        }
                                    >
                                        YouTube&apos;da aç
                                    </Text>
                                </View>

                                <Ionicons
                                    name="open-outline"
                                    size={
                                        18
                                    }
                                    color={
                                        colors.textSecondary
                                    }
                                />
                            </Pressable>

                            {trailerError ? (
                                <Text
                                    style={
                                        styles.inlineError
                                    }
                                >
                                    {
                                        trailerError
                                    }
                                </Text>
                            ) : null}
                        </View>
                    ) : null}

                    {cast.length >
                    0 ? (
                        <View
                            style={
                                styles.castSection
                            }
                        >
                            <View
                                style={
                                    styles.sectionHeader
                                }
                            >
                                <View>
                                    <Text
                                        style={
                                            styles.sectionEyebrow
                                        }
                                    >
                                        CAST
                                    </Text>

                                    <Text
                                        style={
                                            styles.sectionTitle
                                        }
                                    >
                                        Oyuncular
                                    </Text>
                                </View>

                                <Text
                                    style={
                                        styles.castCount
                                    }
                                >
                                    İlk{" "}
                                    {
                                        Math.min(
                                            cast.length,
                                            12
                                        )
                                    }
                                </Text>
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={
                                    false
                                }
                                contentContainerStyle={
                                    styles.castRow
                                }
                            >
                                {cast
                                    .slice(
                                        0,
                                        12
                                    )
                                    .map(
                                        (
                                            person
                                        ) => (
                                            <CastCard
                                                key={
                                                    person.credit_id ||
                                                    person.cast_id ||
                                                    person.id
                                                }
                                                person={
                                                    person
                                                }
                                            />
                                        )
                                    )}
                            </ScrollView>
                        </View>
                    ) : null}

                    {secondaryError ? (
                        <View
                            style={
                                styles.warningCard
                            }
                        >
                            <Ionicons
                                name="warning-outline"
                                size={
                                    20
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
                                    secondaryError
                                }
                            </Text>
                        </View>
                    ) : null}
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

        errorScreen: {
            flex: 1,

            alignItems:
                "center",

            justifyContent:
                "center",

            paddingHorizontal:
                spacing.xl,
        },

        errorIcon: {
            width: 72,

            height: 72,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                radius.full,

            backgroundColor:
                colors.surface,
        },

        errorEyebrow: {
            ...typography.caption,

            marginTop:
                spacing.xl,

            color:
                colors.primary,

            fontWeight:
                "800",

            letterSpacing:
                1.4,
        },

        errorScreenTitle: {
            ...typography.title,

            marginTop:
                spacing.sm,

            color:
                colors.text,

            textAlign:
                "center",
        },

        errorScreenDescription: {
            ...typography.body,

            marginTop:
                spacing.md,

            color:
                colors.textSecondary,

            textAlign:
                "center",
        },

        primaryButton: {
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
                spacing.xl,

            paddingHorizontal:
                spacing.xl,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.primary,
        },

        primaryButtonPressed: {
            backgroundColor:
                colors.primaryPressed,
        },

        primaryButtonText: {
            ...typography.button,

            color:
                colors.text,
        },

        secondaryButton: {
            minHeight: 46,

            alignItems:
                "center",

            justifyContent:
                "center",

            marginTop:
                spacing.md,

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

        secondaryButtonPressed: {
            backgroundColor:
                colors.surfaceElevated,
        },

        secondaryButtonText: {
            ...typography.button,

            color:
                colors.text,
        },

        backdropContainer: {
            position:
                "relative",

            height: 235,

            overflow:
                "hidden",

            backgroundColor:
                colors.surface,
        },

        backdrop: {
            width:
                "100%",

            height:
                "100%",
        },

        backdropFallback: {
            flex: 1,

            alignItems:
                "center",

            justifyContent:
                "center",

            backgroundColor:
                colors.surfaceSoft,
        },

        backdropOverlay: {
            ...StyleSheet.absoluteFill,

            backgroundColor:
                "rgba(15, 17, 21, 0.38)",
        },

        backButton: {
            position:
                "absolute",

            top:
                spacing.md,

            left:
                spacing.lg,

            width: 44,

            height: 44,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderWidth: 1,

            borderColor:
                "rgba(255, 255, 255, 0.16)",

            borderRadius:
                radius.full,

            backgroundColor:
                colors.overlay,
        },

        backButtonPressed: {
            opacity: 0.7,
        },

        detailContainer: {
            paddingHorizontal:
                spacing.lg,
        },

        primaryInfo: {
            flexDirection:
                "row",

            alignItems:
                "flex-start",

            gap:
                spacing.lg,

            marginTop:
                -46,
        },

        poster: {
            width: 126,

            height: 189,

            borderWidth: 2,

            borderColor:
                colors.background,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        posterFallback: {
            width: 126,

            height: 189,

            alignItems:
                "center",

            justifyContent:
                "center",

            gap:
                spacing.sm,

            borderWidth: 2,

            borderColor:
                colors.background,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        posterFallbackText: {
            ...typography.caption,

            color:
                colors.textMuted,
        },

        titleContainer: {
            flex: 1,

            paddingTop: 56,
        },

        eyebrow: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "800",

            letterSpacing:
                1.2,
        },

        title: {
            fontSize: 27,

            lineHeight: 32,

            marginTop:
                spacing.xs,

            color:
                colors.text,

            fontWeight:
                "800",
        },

        tagline: {
            ...typography.caption,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,

            fontStyle:
                "italic",
        },

        metadata: {
            flexDirection:
                "row",

            flexWrap:
                "wrap",

            gap:
                spacing.md,

            marginTop:
                spacing.md,
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

        genreContainer: {
            flexDirection:
                "row",

            flexWrap:
                "wrap",

            gap:
                spacing.sm,

            marginTop:
                spacing.xl,
        },

        genreBadge: {
            paddingHorizontal:
                spacing.md,

            paddingVertical:
                spacing.sm,

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.full,

            backgroundColor:
                colors.surface,
        },

        genreText: {
            fontSize: 12,

            color:
                colors.textSecondary,

            fontWeight:
                "600",
        },

        actionsSection: {
            marginTop:
                spacing.xxxl,
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

        section: {
            marginTop:
                spacing.xxxl,
        },

        sectionHeader: {
            flexDirection:
                "row",

            alignItems:
                "flex-end",

            justifyContent:
                "space-between",
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

        overview: {
            ...typography.body,

            marginTop:
                spacing.md,

            color:
                colors.textSecondary,
        },

        trailerButton: {
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

        trailerButtonPressed: {
            backgroundColor:
                colors.surfaceElevated,
        },

        trailerIcon: {
            width: 46,

            height: 46,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                radius.full,

            backgroundColor:
                colors.primary,
        },

        trailerInfo: {
            flex: 1,
        },

        trailerTitle: {
            ...typography.body,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        trailerSubtitle: {
            ...typography.caption,

            marginTop:
                spacing.xs,

            color:
                colors.textSecondary,
        },

        inlineError: {
            ...typography.caption,

            marginTop:
                spacing.md,

            color:
                colors.error,
        },

        castSection: {
            marginTop:
                spacing.xxxl,
        },

        castCount: {
            ...typography.caption,

            color:
                colors.textMuted,
        },

        castRow: {
            gap:
                spacing.md,

            marginTop:
                spacing.lg,

            paddingRight:
                spacing.lg,
        },

        castCard: {
            width: 108,
        },

        castImage: {
            width: 108,

            height: 145,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        castImageFallback: {
            width: 108,

            height: 145,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        castName: {
            ...typography.caption,

            marginTop:
                spacing.sm,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        castCharacter: {
            fontSize: 12,

            lineHeight: 16,

            marginTop:
                spacing.xs,

            color:
                colors.textSecondary,
        },

        warningCard: {
            flexDirection:
                "row",

            alignItems:
                "flex-start",

            gap:
                spacing.md,

            marginTop:
                spacing.xl,

            padding:
                spacing.md,

            borderWidth: 1,

            borderColor:
                colors.warning,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        warningText: {
            ...typography.caption,

            flex: 1,

            color:
                colors.textSecondary,
        },
    });