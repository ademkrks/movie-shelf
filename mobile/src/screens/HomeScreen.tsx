import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
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
    useRouter,
} from "expo-router";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import MovieCard from "../components/movie/MovieCard";

import {
    ApiClientError,
} from "../api/client";

import {
    getPopularMovies,
    getTopRatedMovies,
    getTrendingMovies,
    getUpcomingMovies,
} from "../api/tmdb.api";

import useAuth from "../hooks/useAuth";

import type {
    TmdbMovie,
} from "../types/tmdb";

import {
    colors,
} from "../theme/colors";

import {
    radius,
} from "../theme/radius";

import {
    spacing,
} from "../theme/spacing";

import {
    typography,
} from "../theme/typography";


type DiscoveryState = {
    trending: TmdbMovie[];

    popular: TmdbMovie[];

    topRated: TmdbMovie[];

    upcoming: TmdbMovie[];
};


const EMPTY_DISCOVERY: DiscoveryState = {
    trending: [],

    popular: [],

    topRated: [],

    upcoming: [],
};


type MovieSectionProps = {
    eyebrow: string;

    title: string;

    description: string;

    movies: TmdbMovie[];
};


const getRequestErrorMessage =
    (
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

        return "Filmler yüklenirken bilinmeyen bir hata oluştu.";
    };


function MovieSection({
    eyebrow,
    title,
    description,
    movies,
}: MovieSectionProps) {
    if (
        movies.length ===
        0
    ) {
        return null;
    }

    return (
        <View
            style={
                styles.movieSection
            }
        >
            <View
                style={
                    styles.sectionHeading
                }
            >
                <Text
                    style={
                        styles.sectionEyebrow
                    }
                >
                    {
                        eyebrow
                    }
                </Text>

                <Text
                    style={
                        styles.sectionTitle
                    }
                >
                    {
                        title
                    }
                </Text>

                <Text
                    style={
                        styles.sectionDescription
                    }
                >
                    {
                        description
                    }
                </Text>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.movieRow
                }
            >
                {movies.map(
                    (
                        movie
                    ) => (
                        <MovieCard
                            variant="rail"
                            key={
                                movie.id
                            }
                            movie={
                                movie
                            }
                        />
                    )
                )}
            </ScrollView>
        </View>
    );
}


export default function HomeScreen() {
    const router =
        useRouter();

    const {
        user,
        sessionStatus,
        sessionError,
        isAuthenticated,
        isRestoring,
        logout,
        restoreSession,
    } =
        useAuth();


    const [
        discovery,
        setDiscovery,
    ] =
        useState<
            DiscoveryState
        >(
            EMPTY_DISCOVERY
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
        isLoggingOut,
        setIsLoggingOut,
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
        authActionError,
        setAuthActionError,
    ] =
        useState<
            string | null
        >(
            null
        );


    const loadDiscovery =
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


                const results =
                    await Promise.allSettled([
                        getTrendingMovies(),
                        getPopularMovies(),
                        getTopRatedMovies(),
                        getUpcomingMovies(),
                    ]);


                const [
                    trendingResult,
                    popularResult,
                    topRatedResult,
                    upcomingResult,
                ] =
                    results;


                const successfulRequests =
                    results.filter(
                        (
                            result
                        ) =>
                            result.status ===
                            "fulfilled"
                    );


                if (
                    successfulRequests.length ===
                    0
                ) {
                    const firstFailure =
                        results.find(
                            (
                                result
                            ) =>
                                result.status ===
                                "rejected"
                        );

                    setError(
                        firstFailure &&
                        firstFailure.status ===
                            "rejected"
                            ? getRequestErrorMessage(
                                firstFailure.reason
                            )
                            : "Film listeleri yüklenemedi."
                    );
                } else if (
                    successfulRequests.length <
                    results.length
                ) {
                    setError(
                        "Bazı film listeleri yüklenemedi. Gösterilebilen içerikler aşağıda yer alıyor."
                    );
                }


                setDiscovery(
                    (
                        current
                    ) => ({
                        trending:
                            trendingResult.status ===
                            "fulfilled"
                                ? trendingResult
                                    .value
                                    .data ??
                                    []
                                : current
                                    .trending,

                        popular:
                            popularResult.status ===
                            "fulfilled"
                                ? popularResult
                                    .value
                                    .data ??
                                    []
                                : current
                                    .popular,

                        topRated:
                            topRatedResult.status ===
                            "fulfilled"
                                ? topRatedResult
                                    .value
                                    .data ??
                                    []
                                : current
                                    .topRated,

                        upcoming:
                            upcomingResult.status ===
                            "fulfilled"
                                ? upcomingResult
                                    .value
                                    .data ??
                                    []
                                : current
                                    .upcoming,
                    })
                );


                setIsLoading(
                    false
                );

                setIsRefreshing(
                    false
                );
            },
            []
        );


    useEffect(
        () => {
            const timeoutId =
                setTimeout(
                    () => {
                        void loadDiscovery();
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
            loadDiscovery,
        ]
    );


    const handleRefresh =
        () => {
            void loadDiscovery(
                true
            );
        };


    const handleRetry =
        () => {
            void loadDiscovery();
        };


    const handleLogout =
        async () => {
            setAuthActionError(
                null
            );

            setIsLoggingOut(
                true
            );

            try {
                await logout();
            } catch (
                requestError
            ) {
                setAuthActionError(
                    requestError instanceof
                    Error
                        ? requestError.message
                        : "Çıkış yapılırken bilinmeyen bir hata oluştu."
                );
            } finally {
                setIsLoggingOut(
                    false
                );
            }
        };


    const handleRestoreSession =
        async () => {
            setAuthActionError(
                null
            );

            try {
                await restoreSession();
            } catch (
                requestError
            ) {
                setAuthActionError(
                    requestError instanceof
                    Error
                        ? requestError.message
                        : "Oturum yeniden kontrol edilemedi."
                );
            }
        };


    const hasDiscoveryContent =
        discovery.trending.length >
            0 ||
        discovery.popular.length >
            0 ||
        discovery.topRated.length >
            0 ||
        discovery.upcoming.length >
            0;


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
                        styles.header
                    }
                >
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
                                styles.tagline
                            }
                        >
                            Your movies. Your shelf.
                        </Text>
                    </View>

                    <Pressable
                        onPress={() =>
                            router.push(
                                "/search"
                            )
                        }
                        style={({
                            pressed,
                        }) => [
                            styles.searchShortcut,

                            pressed
                                ? styles.shortcutPressed
                                : null,
                        ]}
                    >
                        <Ionicons
                            name="search"
                            size={
                                20
                            }
                            color={
                                colors.text
                            }
                        />
                    </Pressable>
                </View>

                <View
                    style={
                        styles.sessionCard
                    }
                >
                    {isRestoring ? (
                        <View
                            style={
                                styles.sessionRow
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
                                    styles.sessionText
                                }
                            >
                                Oturum kontrol ediliyor...
                            </Text>
                        </View>
                    ) : isAuthenticated &&
                      user ? (
                        <View
                            style={
                                styles.accountContainer
                            }
                        >
                            <Pressable
                                onPress={() =>
                                    router.push(
                                        "/profile"
                                    )
                                }
                                style={
                                    styles.accountInfo
                                }
                            >
                                <View
                                    style={
                                        styles.avatar
                                    }
                                >
                                    <Ionicons
                                        name="person"
                                        size={
                                            18
                                        }
                                        color={
                                            colors.primary
                                        }
                                    />
                                </View>

                                <View
                                    style={
                                        styles.accountTextContainer
                                    }
                                >
                                    <Text
                                        style={
                                            styles.accountName
                                        }
                                        numberOfLines={
                                            1
                                        }
                                    >
                                        {
                                            user.name
                                        }
                                    </Text>

                                    <Text
                                        style={
                                            styles.accountEmail
                                        }
                                        numberOfLines={
                                            1
                                        }
                                    >
                                        {
                                            user.email
                                        }
                                    </Text>
                                </View>
                            </Pressable>

                            <Pressable
                                onPress={() => {
                                    void handleLogout();
                                }}
                                disabled={
                                    isLoggingOut
                                }
                                style={({
                                    pressed,
                                }) => [
                                    styles.logoutButton,

                                    pressed &&
                                    !isLoggingOut
                                        ? styles.shortcutPressed
                                        : null,

                                    isLoggingOut
                                        ? styles.buttonDisabled
                                        : null,
                                ]}
                            >
                                {isLoggingOut ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={
                                            colors.textSecondary
                                        }
                                    />
                                ) : (
                                    <Ionicons
                                        name="log-out-outline"
                                        size={
                                            20
                                        }
                                        color={
                                            colors.textSecondary
                                        }
                                    />
                                )}
                            </Pressable>
                        </View>
                    ) : sessionStatus ===
                      "unavailable" ? (
                        <View>
                            <View
                                style={
                                    styles.sessionRow
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
                                        styles.sessionText
                                    }
                                >
                                    Oturum doğrulanamadı
                                </Text>
                            </View>

                            {sessionError && (
                                <Text
                                    style={
                                        styles.sessionError
                                    }
                                >
                                    {
                                        sessionError
                                    }
                                </Text>
                            )}

                            <Pressable
                                onPress={() => {
                                    void handleRestoreSession();
                                }}
                                style={({
                                    pressed,
                                }) => [
                                    styles.sessionButton,

                                    pressed
                                        ? styles.sessionButtonPressed
                                        : null,
                                ]}
                            >
                                <Text
                                    style={
                                        styles.sessionButtonText
                                    }
                                >
                                    Oturumu Tekrar Kontrol Et
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        <View
                            style={
                                styles.guestContainer
                            }
                        >
                            <View
                                style={
                                    styles.sessionRow
                                }
                            >
                                <Ionicons
                                    name="person-outline"
                                    size={
                                        20
                                    }
                                    color={
                                        colors.textSecondary
                                    }
                                />

                                <View
                                    style={
                                        styles.guestTextContainer
                                    }
                                >
                                    <Text
                                        style={
                                            styles.guestTitle
                                        }
                                    >
                                        MovieShelf hesabına giriş yap
                                    </Text>

                                    <Text
                                        style={
                                            styles.guestDescription
                                        }
                                    >
                                        Listelerini ve profilini kullanmaya devam et.
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={() =>
                                    router.push(
                                        "/login"
                                    )
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
                                    Giriş Yap
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    {authActionError && (
                        <Text
                            style={
                                styles.sessionError
                            }
                        >
                            {
                                authActionError
                            }
                        </Text>
                    )}
                </View>

                <View
                    style={
                        styles.hero
                    }
                >
                    <Text
                        style={
                            styles.heroEyebrow
                        }
                    >
                        DISCOVER
                    </Text>

                    <Text
                        style={
                            styles.heroTitle
                        }
                    >
                        Sıradaki filmini keşfet.
                    </Text>

                    <Text
                        style={
                            styles.heroDescription
                        }
                    >
                        Trendlerden klasiklere, MovieShelf için seçilmiş güncel film listelerine göz at.
                    </Text>

                    <Pressable
                        onPress={() =>
                            router.push(
                                "/search"
                            )
                        }
                        style={({
                            pressed,
                        }) => [
                            styles.heroButton,

                            pressed
                                ? styles.heroButtonPressed
                                : null,
                        ]}
                    >
                        <Ionicons
                            name="search-outline"
                            size={
                                18
                            }
                            color={
                                colors.text
                            }
                        />

                        <Text
                            style={
                                styles.heroButtonText
                            }
                        >
                            Film Ara
                        </Text>
                    </Pressable>
                </View>

                {error && (
                    <View
                        style={
                            styles.errorCard
                        }
                    >
                        <Ionicons
                            name="alert-circle-outline"
                            size={
                                22
                            }
                            color={
                                colors.error
                            }
                        />

                        <View
                            style={
                                styles.errorContent
                            }
                        >
                            <Text
                                style={
                                    styles.errorTitle
                                }
                            >
                                Bazı içerikler yüklenemedi
                            </Text>

                            <Text
                                style={
                                    styles.errorDescription
                                }
                            >
                                {
                                    error
                                }
                            </Text>

                            <Pressable
                                onPress={
                                    handleRetry
                                }
                                style={({
                                    pressed,
                                }) => [
                                    styles.retryButton,

                                    pressed
                                        ? styles.retryButtonPressed
                                        : null,
                                ]}
                            >
                                <Text
                                    style={
                                        styles.retryButtonText
                                    }
                                >
                                    Tekrar Dene
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {isLoading &&
                !hasDiscoveryContent ? (
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
                            Filmler yükleniyor
                        </Text>

                        <Text
                            style={
                                styles.loadingDescription
                            }
                        >
                            MovieShelf keşif akışı hazırlanıyor.
                        </Text>
                    </View>
                ) : (
                    <>
                        <MovieSection
                            eyebrow="TRENDING"
                            title="Trend Filmler"
                            description="Bu hafta izleyicilerin en çok konuştuğu filmler."
                            movies={
                                discovery.trending
                            }
                        />

                        <MovieSection
                            eyebrow="POPULAR"
                            title="Popüler Filmler"
                            description="Şu anda dünya genelinde en çok ilgi gören yapımlar."
                            movies={
                                discovery.popular
                            }
                        />

                        <MovieSection
                            eyebrow="TOP RATED"
                            title="En Yüksek Puanlılar"
                            description="İzleyicilerden yüksek puan alan güçlü yapımlar."
                            movies={
                                discovery.topRated
                            }
                        />

                        <MovieSection
                            eyebrow="COMING SOON"
                            title="Yakında Vizyonda"
                            description="Yakında izleyiciyle buluşacak filmlere göz at."
                            movies={
                                discovery.upcoming
                            }
                        />
                    </>
                )}
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

        header: {
            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            paddingHorizontal:
                spacing.lg,

            paddingTop:
                spacing.md,

            paddingBottom:
                spacing.lg,
        },

        brandContainer: {
            flex: 1,
        },

        brand: {
            fontSize:
                28,

            lineHeight:
                34,

            fontWeight:
                "800",

            color:
                colors.text,

            letterSpacing:
                -1,
        },

        brandAccent: {
            color:
                colors.primary,
        },

        tagline: {
            ...typography.caption,

            marginTop:
                2,

            color:
                colors.textMuted,
        },

        searchShortcut: {
            width:
                44,

            height:
                44,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderWidth:
                1,

            borderColor:
                colors.border,

            borderRadius:
                radius.full,

            backgroundColor:
                colors.surface,
        },

        shortcutPressed: {
            opacity:
                0.7,
        },

        sessionCard: {
            marginHorizontal:
                spacing.lg,

            marginBottom:
                spacing.lg,

            padding:
                spacing.md,

            borderWidth:
                1,

            borderColor:
                colors.border,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        sessionRow: {
            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.md,
        },

        sessionText: {
            ...typography.caption,

            flex: 1,

            color:
                colors.textSecondary,
        },

        accountContainer: {
            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            gap:
                spacing.md,
        },

        accountInfo: {
            flex:
                1,

            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.md,
        },

        avatar: {
            width:
                42,

            height:
                42,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                radius.full,

            backgroundColor:
                colors.surfaceSoft,
        },

        accountTextContainer: {
            flex: 1,
        },

        accountName: {
            ...typography.body,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        accountEmail: {
            ...typography.caption,

            color:
                colors.textSecondary,
        },

        logoutButton: {
            width:
                42,

            height:
                42,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderWidth:
                1,

            borderColor:
                colors.border,

            borderRadius:
                radius.full,

            backgroundColor:
                colors.surfaceSoft,
        },

        buttonDisabled: {
            opacity:
                0.55,
        },

        sessionError: {
            ...typography.caption,

            marginTop:
                spacing.md,

            color:
                colors.error,
        },

        sessionButton: {
            minHeight:
                42,

            alignItems:
                "center",

            justifyContent:
                "center",

            marginTop:
                spacing.md,

            borderWidth:
                1,

            borderColor:
                colors.border,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surfaceSoft,
        },

        sessionButtonPressed: {
            backgroundColor:
                colors.surfaceElevated,
        },

        sessionButtonText: {
            ...typography.caption,

            color:
                colors.text,

            fontWeight:
                "600",
        },

        guestContainer: {
            gap:
                spacing.md,
        },

        guestTextContainer: {
            flex: 1,
        },

        guestTitle: {
            ...typography.caption,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        guestDescription: {
            fontSize:
                12,

            lineHeight:
                17,

            marginTop:
                spacing.xs,

            color:
                colors.textSecondary,
        },

        loginButton: {
            minHeight:
                42,

            alignItems:
                "center",

            justifyContent:
                "center",

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
                "700",
        },

        hero: {
            marginHorizontal:
                spacing.lg,

            padding:
                spacing.xl,

            overflow:
                "hidden",

            borderWidth:
                1,

            borderColor:
                colors.border,

            borderRadius:
                24,

            backgroundColor:
                colors.surfaceElevated,
        },

        heroEyebrow: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "800",

            letterSpacing:
                1.5,
        },

        heroTitle: {
            ...typography.title,

            marginTop:
                spacing.sm,

            color:
                colors.text,
        },

        heroDescription: {
            ...typography.body,

            marginTop:
                spacing.md,

            color:
                colors.textSecondary,
        },

        heroButton: {
            minHeight:
                48,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "center",

            alignSelf:
                "flex-start",

            gap:
                spacing.sm,

            marginTop:
                spacing.xl,

            paddingHorizontal:
                spacing.lg,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.primary,
        },

        heroButtonPressed: {
            backgroundColor:
                colors.primaryPressed,
        },

        heroButtonText: {
            ...typography.button,

            color:
                colors.text,
        },

        errorCard: {
            flexDirection:
                "row",

            alignItems:
                "flex-start",

            gap:
                spacing.md,

            marginHorizontal:
                spacing.lg,

            marginTop:
                spacing.lg,

            padding:
                spacing.lg,

            borderWidth:
                1,

            borderColor:
                colors.error,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        errorContent: {
            flex: 1,
        },

        errorTitle: {
            ...typography.body,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        errorDescription: {
            ...typography.caption,

            marginTop:
                spacing.xs,

            color:
                colors.textSecondary,
        },

        retryButton: {
            alignSelf:
                "flex-start",

            marginTop:
                spacing.md,

            paddingHorizontal:
                spacing.md,

            paddingVertical:
                spacing.sm,

            borderRadius:
                radius.md,

            backgroundColor:
                colors.surfaceSoft,
        },

        retryButtonPressed: {
            backgroundColor:
                colors.surfaceElevated,
        },

        retryButtonText: {
            ...typography.caption,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        loadingContainer: {
            alignItems:
                "center",

            justifyContent:
                "center",

            marginHorizontal:
                spacing.lg,

            marginTop:
                spacing.xxl,

            paddingVertical:
                spacing.xxxl,

            paddingHorizontal:
                spacing.xl,

            borderWidth:
                1,

            borderColor:
                colors.border,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
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

            textAlign:
                "center",
        },

        movieSection: {
            marginTop:
                spacing.xxxl,
        },

        sectionHeading: {
            paddingHorizontal:
                spacing.lg,

            marginBottom:
                spacing.lg,
        },

        sectionEyebrow: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "800",

            letterSpacing:
                1.4,
        },

        sectionTitle: {
            ...typography.heading,

            marginTop:
                spacing.xs,

            color:
                colors.text,
        },

        sectionDescription: {
            ...typography.caption,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,
        },

        movieRow: {
            gap:
                spacing.md,

            paddingHorizontal:
                spacing.lg,
        },

    });