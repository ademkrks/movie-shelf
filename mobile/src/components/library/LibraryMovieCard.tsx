import {
    ActivityIndicator,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import type {
    CollectionKind,
    CollectionMovie,
} from "../../types/library";

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


type LibraryMovieCardProps = {
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


export default function LibraryMovieCard({
    movie,
    collection,
    isRemoving,
    onOpen,
    onRemove,
}: LibraryMovieCardProps) {
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


const styles =
    StyleSheet.create({
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
    });