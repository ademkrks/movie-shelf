import {
    useRef,
    useState,
} from "react";

import {
    ActivityIndicator,
    FlatList,
    Keyboard,
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
    SafeAreaView,
} from "react-native-safe-area-context";

import MovieCard from "../../components/movie/MovieCard";

import {
    searchMovies,
} from "../../api/tmdb.api";

import {
    ApiClientError,
} from "../../api/client";

import type {
    TmdbMovie,
    TmdbPagination,
} from "../../types/tmdb";

import {
    colors,
} from "../../theme/colors";

import {
    spacing,
} from "../../theme/spacing";

import {
    typography,
} from "../../theme/typography";


const EMPTY_PAGINATION: TmdbPagination = {
    page: 1,

    totalPages: 0,

    totalItems: 0,

    hasNextPage: false,

    hasPreviousPage: false,
};


export default function SearchScreen() {
    const listRef =
        useRef<
            FlatList<TmdbMovie>
        >(
            null
        );


    const [
        searchQuery,
        setSearchQuery,
    ] =
        useState(
            ""
        );


    const [
        activeQuery,
        setActiveQuery,
    ] =
        useState(
            ""
        );


    const [
        movies,
        setMovies,
    ] =
        useState<
            TmdbMovie[]
        >(
            []
        );


    const [
        pagination,
        setPagination,
    ] =
        useState<
            TmdbPagination
        >(
            EMPTY_PAGINATION
        );


    const [
        isSearching,
        setIsSearching,
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
        hasSearched,
        setHasSearched,
    ] =
        useState(
            false
        );


    const performSearch =
        async (
            query: string,
            page: number
        ) => {
            const normalizedQuery =
                query.trim();

            setError(
                null
            );


            if (
                normalizedQuery.length <
                2
            ) {
                setError(
                    "Arama sorgusu en az 2 karakter olmalıdır."
                );

                return;
            }


            if (
                normalizedQuery.length >
                100
            ) {
                setError(
                    "Arama sorgusu en fazla 100 karakter olabilir."
                );

                return;
            }


            setIsSearching(
                true
            );

            Keyboard.dismiss();


            try {
                const response =
                    await searchMovies(
                        normalizedQuery,
                        page
                    );

                setMovies(
                    response.data
                        ?.items ??
                        []
                );

                setPagination(
                    response.data
                        ?.pagination ??
                        EMPTY_PAGINATION
                );

                setActiveQuery(
                    normalizedQuery
                );

                setHasSearched(
                    true
                );


                requestAnimationFrame(
                    () => {
                        listRef.current
                            ?.scrollToOffset({
                                offset:
                                    0,

                                animated:
                                    true,
                            });
                    }
                );
            } catch (
                requestError
            ) {
                setMovies(
                    []
                );

                setPagination(
                    EMPTY_PAGINATION
                );

                setHasSearched(
                    true
                );


                if (
                    requestError instanceof
                    ApiClientError
                ) {
                    setError(
                        requestError
                            .errors[0] ??
                        requestError
                            .message
                    );
                } else if (
                    requestError instanceof
                    Error
                ) {
                    setError(
                        requestError
                            .message
                    );
                } else {
                    setError(
                        "Film araması sırasında bilinmeyen bir hata oluştu."
                    );
                }
            } finally {
                setIsSearching(
                    false
                );
            }
        };


    const handleSearch =
        () => {
            void performSearch(
                searchQuery,
                1
            );
        };


    const handleClear =
        () => {
            setSearchQuery(
                ""
            );

            setActiveQuery(
                ""
            );

            setMovies(
                []
            );

            setPagination(
                EMPTY_PAGINATION
            );

            setError(
                null
            );

            setHasSearched(
                false
            );

            Keyboard.dismiss();
        };


    const handlePreviousPage =
        () => {
            if (
                isSearching ||
                !activeQuery ||
                !pagination
                    .hasPreviousPage
            ) {
                return;
            }

            void performSearch(
                activeQuery,
                pagination.page -
                    1
            );
        };


    const handleNextPage =
        () => {
            if (
                isSearching ||
                !activeQuery ||
                !pagination
                    .hasNextPage
            ) {
                return;
            }

            void performSearch(
                activeQuery,
                pagination.page +
                    1
            );
        };


    const renderMovie =
        ({
            item,
        }: {
            item: TmdbMovie;
        }) => {
            return (
                <MovieCard
                    variant="grid"
                    movie={
                        item
                    }
                />
            );
        };


    const renderHeader =
        () => {
            return (
                <View>
                    <Text
                        style={
                            styles.eyebrow
                        }
                    >
                        DISCOVER
                    </Text>

                    <Text
                        style={
                            styles.title
                        }
                    >
                        Film Ara
                    </Text>

                    <Text
                        style={
                            styles.description
                        }
                    >
                        MovieShelf kataloğunda filmleri bul ve keşfet.
                    </Text>

                    <View
                        style={
                            styles.searchContainer
                        }
                    >
                        <View
                            style={
                                styles.inputContainer
                            }
                        >
                            <Ionicons
                                name="search-outline"
                                size={
                                    20
                                }
                                color={
                                    colors.textMuted
                                }
                            />

                            <TextInput
                                value={
                                    searchQuery
                                }
                                onChangeText={
                                    setSearchQuery
                                }
                                placeholder="Film adı ara"
                                placeholderTextColor={
                                    colors.textMuted
                                }
                                style={
                                    styles.input
                                }
                                returnKeyType="search"
                                autoCapitalize="none"
                                autoCorrect={
                                    false
                                }
                                maxLength={
                                    100
                                }
                                onSubmitEditing={
                                    handleSearch
                                }
                                editable={
                                    !isSearching
                                }
                            />

                            {searchQuery.length >
                                0 && (
                                <Pressable
                                    onPress={
                                        handleClear
                                    }
                                    hitSlop={
                                        10
                                    }
                                    disabled={
                                        isSearching
                                    }
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={
                                            20
                                        }
                                        color={
                                            colors.textMuted
                                        }
                                    />
                                </Pressable>
                            )}
                        </View>

                        <Pressable
                            onPress={
                                handleSearch
                            }
                            disabled={
                                isSearching
                            }
                            style={({
                                pressed,
                            }) => [
                                styles.searchButton,

                                pressed &&
                                !isSearching
                                    ? styles.searchButtonPressed
                                    : null,

                                isSearching
                                    ? styles.searchButtonDisabled
                                    : null,
                            ]}
                        >
                            {isSearching ? (
                                <ActivityIndicator
                                    size="small"
                                    color={
                                        colors.text
                                    }
                                />
                            ) : (
                                <Text
                                    style={
                                        styles.searchButtonText
                                    }
                                >
                                    Ara
                                </Text>
                            )}
                        </Pressable>
                    </View>

                    {error && (
                        <View
                            style={
                                styles.errorBox
                            }
                        >
                            <Ionicons
                                name="alert-circle-outline"
                                size={
                                    20
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
                    )}

                    {!hasSearched &&
                        !error && (
                        <View
                            style={
                                styles.initialState
                            }
                        >
                            <View
                                style={
                                    styles.initialIcon
                                }
                            >
                                <Ionicons
                                    name="film-outline"
                                    size={
                                        34
                                    }
                                    color={
                                        colors.primary
                                    }
                                />
                            </View>

                            <Text
                                style={
                                    styles.initialTitle
                                }
                            >
                                Bir film ara
                            </Text>

                            <Text
                                style={
                                    styles.initialDescription
                                }
                            >
                                Aramak istediğin filmin adını yukarıdaki alana yaz.
                            </Text>
                        </View>
                    )}

                    {hasSearched &&
                        !isSearching &&
                        movies.length ===
                            0 &&
                        !error && (
                        <View
                            style={
                                styles.emptyState
                            }
                        >
                            <Ionicons
                                name="search-outline"
                                size={
                                    34
                                }
                                color={
                                    colors.textMuted
                                }
                            />

                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                Sonuç bulunamadı
                            </Text>

                            <Text
                                style={
                                    styles.emptyDescription
                                }
                            >
                                Farklı bir film adıyla tekrar aramayı dene.
                            </Text>
                        </View>
                    )}

                    {movies.length >
                        0 && (
                        <View
                            style={
                                styles.resultHeader
                            }
                        >
                            <View>
                                <Text
                                    style={
                                        styles.resultEyebrow
                                    }
                                >
                                    SONUÇLAR
                                </Text>

                                <Text
                                    style={
                                        styles.resultTitle
                                    }
                                    numberOfLines={
                                        1
                                    }
                                >
                                    {
                                        activeQuery
                                    }
                                </Text>
                            </View>

                            <Text
                                style={
                                    styles.resultCount
                                }
                            >
                                {
                                    pagination.totalItems
                                }{" "}
                                film
                            </Text>
                        </View>
                    )}
                </View>
            );
        };


    const renderFooter =
        () => {
            if (
                movies.length ===
                0
            ) {
                return null;
            }

            return (
                <View
                    style={
                        styles.paginationContainer
                    }
                >
                    <Pressable
                        onPress={
                            handlePreviousPage
                        }
                        disabled={
                            isSearching ||
                            !pagination
                                .hasPreviousPage
                        }
                        style={({
                            pressed,
                        }) => [
                            styles.pageButton,

                            pressed &&
                            pagination
                                .hasPreviousPage
                                ? styles.pageButtonPressed
                                : null,

                            !pagination
                                .hasPreviousPage
                                ? styles.pageButtonDisabled
                                : null,
                        ]}
                    >
                        <Ionicons
                            name="chevron-back"
                            size={
                                18
                            }
                            color={
                                pagination
                                    .hasPreviousPage
                                    ? colors.text
                                    : colors.textMuted
                            }
                        />

                        <Text
                            style={[
                                styles.pageButtonText,

                                !pagination
                                    .hasPreviousPage
                                    ? styles.pageButtonTextDisabled
                                    : null,
                            ]}
                        >
                            Önceki
                        </Text>
                    </Pressable>

                    <View
                        style={
                            styles.pageInfo
                        }
                    >
                        <Text
                            style={
                                styles.pageNumber
                            }
                        >
                            {
                                pagination.page
                            }
                        </Text>

                        <Text
                            style={
                                styles.pageTotal
                            }
                        >
                            /{" "}
                            {
                                pagination.totalPages
                            }
                        </Text>
                    </View>

                    <Pressable
                        onPress={
                            handleNextPage
                        }
                        disabled={
                            isSearching ||
                            !pagination
                                .hasNextPage
                        }
                        style={({
                            pressed,
                        }) => [
                            styles.pageButton,

                            pressed &&
                            pagination
                                .hasNextPage
                                ? styles.pageButtonPressed
                                : null,

                            !pagination
                                .hasNextPage
                                ? styles.pageButtonDisabled
                                : null,
                        ]}
                    >
                        <Text
                            style={[
                                styles.pageButtonText,

                                !pagination
                                    .hasNextPage
                                    ? styles.pageButtonTextDisabled
                                    : null,
                            ]}
                        >
                            Sonraki
                        </Text>

                        <Ionicons
                            name="chevron-forward"
                            size={
                                18
                            }
                            color={
                                pagination
                                    .hasNextPage
                                    ? colors.text
                                    : colors.textMuted
                            }
                        />
                    </Pressable>
                </View>
            );
        };


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
            <FlatList
                ref={
                    listRef
                }
                data={
                    movies
                }
                keyExtractor={(
                    item
                ) =>
                    String(
                        item.id
                    )
                }
                renderItem={
                    renderMovie
                }
                numColumns={
                    2
                }
                columnWrapperStyle={
                    styles.columnWrapper
                }
                ListHeaderComponent={
                    renderHeader
                }
                ListFooterComponent={
                    renderFooter
                }
                contentContainerStyle={
                    styles.contentContainer
                }
                showsVerticalScrollIndicator={
                    false
                }
                keyboardShouldPersistTaps="handled"
            />
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

        contentContainer: {
            paddingHorizontal:
                spacing.lg,

            paddingTop:
                spacing.xl,

            paddingBottom:
                spacing.xxxl,
        },

        eyebrow: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "700",

            letterSpacing:
                1.5,
        },

        title: {
            ...typography.title,

            marginTop:
                spacing.xs,

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

        searchContainer: {
            marginTop:
                spacing.xl,

            gap:
                spacing.md,
        },

        inputContainer: {
            minHeight:
                54,

            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.sm,

            paddingHorizontal:
                spacing.lg,

            borderWidth:
                1,

            borderColor:
                colors.border,

            borderRadius:
                16,

            backgroundColor:
                colors.surface,
        },

        input: {
            flex: 1,

            paddingVertical:
                spacing.md,

            color:
                colors.text,

            fontSize:
                16,
        },

        searchButton: {
            minHeight:
                50,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                14,

            backgroundColor:
                colors.primary,
        },

        searchButtonPressed: {
            backgroundColor:
                colors.primaryPressed,
        },

        searchButtonDisabled: {
            opacity:
                0.7,
        },

        searchButtonText: {
            ...typography.button,

            color:
                colors.text,
        },

        errorBox: {
            marginTop:
                spacing.lg,

            flexDirection:
                "row",

            alignItems:
                "flex-start",

            gap:
                spacing.sm,

            padding:
                spacing.md,

            borderWidth:
                1,

            borderColor:
                colors.error,

            borderRadius:
                14,

            backgroundColor:
                colors.surface,
        },

        errorText: {
            ...typography.caption,

            flex: 1,

            color:
                colors.error,
        },

        initialState: {
            marginTop:
                spacing.xxxl,

            alignItems:
                "center",

            padding:
                spacing.xl,

            borderWidth:
                1,

            borderColor:
                colors.border,

            borderRadius:
                20,

            backgroundColor:
                colors.surface,
        },

        initialIcon: {
            width:
                64,

            height:
                64,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                32,

            backgroundColor:
                colors.surfaceSoft,
        },

        initialTitle: {
            ...typography.heading,

            marginTop:
                spacing.lg,

            color:
                colors.text,

            textAlign:
                "center",
        },

        initialDescription: {
            ...typography.caption,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,

            textAlign:
                "center",
        },

        emptyState: {
            marginTop:
                spacing.xxxl,

            alignItems:
                "center",

            padding:
                spacing.xl,

            borderWidth:
                1,

            borderColor:
                colors.border,

            borderRadius:
                20,

            backgroundColor:
                colors.surface,
        },

        emptyTitle: {
            ...typography.heading,

            marginTop:
                spacing.md,

            color:
                colors.text,

            textAlign:
                "center",
        },

        emptyDescription: {
            ...typography.caption,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,

            textAlign:
                "center",
        },

        resultHeader: {
            marginTop:
                spacing.xxxl,

            marginBottom:
                spacing.lg,

            flexDirection:
                "row",

            alignItems:
                "flex-end",

            justifyContent:
                "space-between",

            gap:
                spacing.lg,
        },

        resultEyebrow: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "700",

            letterSpacing:
                1.2,
        },

        resultTitle: {
            ...typography.heading,

            maxWidth:
                220,

            marginTop:
                spacing.xs,

            color:
                colors.text,
        },

        resultCount: {
            ...typography.caption,

            color:
                colors.textSecondary,
        },

        columnWrapper: {
            gap:
                spacing.md,
        },

        paginationContainer: {
            marginTop:
                spacing.md,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            gap:
                spacing.sm,
        },

        pageButton: {
            minHeight:
                44,

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

            borderWidth:
                1,

            borderColor:
                colors.border,

            borderRadius:
                12,

            backgroundColor:
                colors.surface,
        },

        pageButtonPressed: {
            backgroundColor:
                colors.surfaceElevated,
        },

        pageButtonDisabled: {
            opacity:
                0.45,
        },

        pageButtonText: {
            ...typography.caption,

            color:
                colors.text,

            fontWeight:
                "600",
        },

        pageButtonTextDisabled: {
            color:
                colors.textMuted,
        },

        pageInfo: {
            flexDirection:
                "row",

            alignItems:
                "baseline",
        },

        pageNumber: {
            ...typography.heading,

            color:
                colors.primary,
        },

        pageTotal: {
            ...typography.caption,

            color:
                colors.textSecondary,
        },
    });