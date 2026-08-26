import {
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
    useRouter,
} from "expo-router";

import type {
    TmdbMovie,
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


type MovieCardVariant =
    | "rail"
    | "grid";


type MovieCardProps = {
    movie: TmdbMovie;

    variant?: MovieCardVariant;
};


const getMovieYear = (
    releaseDate: string | undefined,
    variant: MovieCardVariant
) => {
    const fallback =
        variant === "grid"
            ? "Yıl bilinmiyor"
            : "—";

    if (!releaseDate) {
        return fallback;
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
        : fallback;
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


export default function MovieCard({
    movie,
    variant = "rail",
}: MovieCardProps) {
    const router =
        useRouter();

    const isGrid =
        variant ===
        "grid";

    const hasPoster =
        Boolean(
            movie.poster_path
        );

    const movieTitle =
        movie.title ||
        movie.original_title ||
        "İsimsiz film";


    const handleOpenDetails =
        () => {
            router.push({
                pathname:
                    "/movie/[id]",

                params: {
                    id:
                        String(
                            movie.id
                        ),
                },
            });
        };


    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${movieTitle} detaylarını aç`}
            onPress={
                handleOpenDetails
            }
            style={({
                pressed,
            }) => [
                styles.movieCard,

                isGrid
                    ? styles.gridCard
                    : styles.railCard,

                pressed
                    ? styles.movieCardPressed
                    : null,
            ]}
        >
            <View
                style={
                    styles.posterContainer
                }
            >
                {hasPoster ? (
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
                                isGrid
                                    ? 32
                                    : 30
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
                    style={[
                        styles.ratingBadge,

                        isGrid
                            ? styles.gridRatingBadge
                            : styles.railRatingBadge,
                    ]}
                >
                    <Ionicons
                        name="star"
                        size={
                            isGrid
                                ? 13
                                : 12
                        }
                        color={
                            colors.warning
                        }
                    />

                    <Text
                        style={[
                            styles.ratingText,

                            isGrid
                                ? styles.gridRatingText
                                : styles.railRatingText,
                        ]}
                    >
                        {
                            getMovieRating(
                                movie.vote_average
                            )
                        }
                    </Text>
                </View>
            </View>

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

                <Text
                    style={
                        styles.movieYear
                    }
                >
                    {
                        getMovieYear(
                            movie.release_date,
                            variant
                        )
                    }
                </Text>
            </View>
        </Pressable>
    );
}


const styles =
    StyleSheet.create({
        movieCard: {
            overflow:
                "hidden",

            borderWidth:
                1,

            borderColor:
                colors.border,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        railCard: {
            width:
                142,
        },

        gridCard: {
            flex:
                1,

            marginBottom:
                spacing.lg,
        },

        movieCardPressed: {
            opacity:
                0.78,
        },

        posterContainer: {
            position:
                "relative",

            width:
                "100%",

            aspectRatio:
                2 / 3,

            overflow:
                "hidden",

            backgroundColor:
                colors.surfaceSoft,
        },

        poster: {
            width:
                "100%",

            height:
                "100%",
        },

        posterFallback: {
            flex:
                1,

            alignItems:
                "center",

            justifyContent:
                "center",

            gap:
                spacing.sm,

            padding:
                spacing.md,
        },

        posterFallbackText: {
            ...typography.caption,

            color:
                colors.textMuted,
        },

        ratingBadge: {
            position:
                "absolute",

            top:
                spacing.sm,

            right:
                spacing.sm,

            flexDirection:
                "row",

            alignItems:
                "center",

            gap:
                spacing.xs,

            paddingHorizontal:
                spacing.sm,

            paddingVertical:
                spacing.xs,

            backgroundColor:
                colors.overlay,
        },

        railRatingBadge: {
            borderRadius:
                radius.full,
        },

        gridRatingBadge: {
            borderRadius:
                radius.md,
        },

        ratingText: {
            fontSize:
                12,

            color:
                colors.text,
        },

        railRatingText: {
            fontWeight:
                "800",
        },

        gridRatingText: {
            fontWeight:
                "700",
        },

        movieInfo: {
            padding:
                spacing.md,
        },

        movieTitle: {
            ...typography.caption,

            minHeight:
                40,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        movieYear: {
            marginTop:
                spacing.xs,

            fontSize:
                12,

            color:
                colors.textSecondary,
        },
    });