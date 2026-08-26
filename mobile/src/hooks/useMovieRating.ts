import {
    useCallback,
    useRef,
    useState,
} from "react";

import {
    useRouter,
} from "expo-router";

import {
    ApiClientError,
} from "../api/client";

import {
    addMovieRating,
    deleteMovieRating,
    getMovieRatings,
    getMyMovieRating,
    updateMovieRating,
} from "../api/ratings.api";

import type {
    MovieRatingsData,
    MyMovieRating,
    RatingRecord,
} from "../types/rating";


type UseMovieRatingParams = {
    movieId: number;

    isValidMovieId: boolean;

    isAuthenticated: boolean;

    isRestoring: boolean;
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

    return "Film puanı işlenirken bilinmeyen bir hata oluştu.";
};


const toMyMovieRating = (
    rating: RatingRecord
): MyMovieRating => {
    return {
        id:
            rating.id,

        tmdbMovieId:
            rating.tmdbMovieId,

        rating:
            rating.rating,
    };
};


export default function useMovieRating({
    movieId,
    isValidMovieId,
    isAuthenticated,
    isRestoring,
}: UseMovieRatingParams) {
    const router =
        useRouter();


    const loadRequestIdRef =
        useRef(
            0
        );


    const [
        myRating,
        setMyRating,
    ] =
        useState<
            MyMovieRating | null
        >(
            null
        );


    const [
        averageRating,
        setAverageRating,
    ] =
        useState(
            0
        );


    const [
        totalRatings,
        setTotalRatings,
    ] =
        useState(
            0
        );


    const [
        isRatingLoading,
        setIsRatingLoading,
    ] =
        useState(
            false
        );


    const [
        isRatingPending,
        setIsRatingPending,
    ] =
        useState(
            false
        );


    const [
        ratingError,
        setRatingError,
    ] =
        useState<
            string | null
        >(
            null
        );


    const applyRatingSummary =
        useCallback(
            (
                data:
                    MovieRatingsData
            ) => {
                setAverageRating(
                    data.averageRatings
                );

                setTotalRatings(
                    data.totalRatings
                );
            },
            []
        );


    const resetRatingState =
        useCallback(
            () => {
                setMyRating(
                    null
                );

                setAverageRating(
                    0
                );

                setTotalRatings(
                    0
                );

                setIsRatingLoading(
                    false
                );

                setIsRatingPending(
                    false
                );

                setRatingError(
                    null
                );
            },
            []
        );


    const refreshRatingSummary =
        useCallback(
            async () => {
                const response =
                    await getMovieRatings(
                        movieId,
                        1,
                        1
                    );


                applyRatingSummary(
                    response.data
                );
            },
            [
                applyRatingSummary,
                movieId,
            ]
        );


    const loadMovieRating =
        useCallback(
            async () => {
                const requestId =
                    ++loadRequestIdRef.current;


                if (
                    isRestoring
                ) {
                    return;
                }


                if (
                    !isValidMovieId
                ) {
                    resetRatingState();

                    return;
                }


                /*
                 * Yeni bir filme geçildiğinde eski filmin
                 * puan bilgileri ekranda kalmasın.
                 */
                setMyRating(
                    null
                );

                setAverageRating(
                    0
                );

                setTotalRatings(
                    0
                );

                setIsRatingLoading(
                    true
                );

                setRatingError(
                    null
                );


                if (
                    !isAuthenticated
                ) {
                    try {
                        const response =
                            await getMovieRatings(
                                movieId,
                                1,
                                1
                            );


                        if (
                            requestId !==
                            loadRequestIdRef.current
                        ) {
                            return;
                        }


                        applyRatingSummary(
                            response.data
                        );
                    } catch (
                        requestError
                    ) {
                        if (
                            requestId !==
                            loadRequestIdRef.current
                        ) {
                            return;
                        }


                        setRatingError(
                            getRequestErrorMessage(
                                requestError
                            )
                        );
                    } finally {
                        if (
                            requestId ===
                            loadRequestIdRef.current
                        ) {
                            setIsRatingLoading(
                                false
                            );
                        }
                    }


                    return;
                }


                const results =
                    await Promise.allSettled([
                        getMovieRatings(
                            movieId,
                            1,
                            1
                        ),

                        getMyMovieRating(
                            movieId
                        ),
                    ]);


                if (
                    requestId !==
                    loadRequestIdRef.current
                ) {
                    return;
                }


                const [
                    ratingSummaryResult,
                    myRatingResult,
                ] =
                    results;


                if (
                    ratingSummaryResult.status ===
                    "fulfilled"
                ) {
                    applyRatingSummary(
                        ratingSummaryResult.value
                            .data
                    );
                }


                if (
                    myRatingResult.status ===
                    "fulfilled"
                ) {
                    setMyRating(
                        myRatingResult.value
                            .data
                    );
                }


                if (
                    ratingSummaryResult.status ===
                        "rejected" ||
                    myRatingResult.status ===
                        "rejected"
                ) {
                    const failedResult =
                        ratingSummaryResult.status ===
                        "rejected"
                            ? ratingSummaryResult
                            : myRatingResult;


                    setRatingError(
                        failedResult.status ===
                            "rejected"
                            ? getRequestErrorMessage(
                                failedResult.reason
                            )
                            : "Film puanı yüklenemedi."
                    );
                }


                setIsRatingLoading(
                    false
                );
            },
            [
                applyRatingSummary,
                isAuthenticated,
                isRestoring,
                isValidMovieId,
                movieId,
                resetRatingState,
            ]
        );


    const handleRatingSubmit =
        useCallback(
            async (
                rating: number
            ) => {
                setRatingError(
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
                    !isValidMovieId ||
                    isRatingPending ||
                    isRatingLoading
                ) {
                    return;
                }


                setIsRatingPending(
                    true
                );


                try {
                    const response =
                        myRating
                            ? await updateMovieRating(
                                myRating.id,
                                rating
                            )
                            : await addMovieRating(
                                movieId,
                                rating
                            );


                    setMyRating(
                        toMyMovieRating(
                            response.data
                        )
                    );


                    try {
                        await refreshRatingSummary();
                    } catch {
                        setRatingError(
                            "Puanın kaydedildi ancak güncel puan özeti getirilemedi."
                        );
                    }
                } catch (
                    requestError
                ) {
                    setRatingError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );
                } finally {
                    setIsRatingPending(
                        false
                    );
                }
            },
            [
                isAuthenticated,
                isRatingLoading,
                isRatingPending,
                isValidMovieId,
                movieId,
                myRating,
                refreshRatingSummary,
                router,
            ]
        );


    const handleRatingDelete =
        useCallback(
            async () => {
                setRatingError(
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
                    !myRating ||
                    !isValidMovieId ||
                    isRatingPending ||
                    isRatingLoading
                ) {
                    return;
                }


                setIsRatingPending(
                    true
                );


                try {
                    await deleteMovieRating(
                        myRating.id
                    );


                    setMyRating(
                        null
                    );


                    try {
                        await refreshRatingSummary();
                    } catch {
                        setRatingError(
                            "Puanın silindi ancak güncel puan özeti getirilemedi."
                        );
                    }
                } catch (
                    requestError
                ) {
                    setRatingError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );
                } finally {
                    setIsRatingPending(
                        false
                    );
                }
            },
            [
                isAuthenticated,
                isRatingLoading,
                isRatingPending,
                isValidMovieId,
                myRating,
                refreshRatingSummary,
                router,
            ]
        );


    return {
        myRating,

        averageRating,
        totalRatings,

        isRatingLoading,
        isRatingPending,

        ratingError,

        loadMovieRating,

        handleRatingSubmit,
        handleRatingDelete,
    };
}