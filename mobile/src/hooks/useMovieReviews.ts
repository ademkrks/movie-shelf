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
    addMovieReview,
    deleteMovieReview,
    getMovieReviews,
    updateMovieReview,
} from "../api/reviews.api";

import type {
    MovieReviewItem,
    ReviewPaginationData,
} from "../types/review";


type UseMovieReviewsParams = {
    movieId: number;

    isValidMovieId: boolean;

    isAuthenticated: boolean;

    isRestoring: boolean;
};


const REVIEWS_PAGE_LIMIT =
    10;


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

    return "Film yorumları işlenirken bilinmeyen bir hata oluştu.";
};


export default function useMovieReviews({
    movieId,
    isValidMovieId,
    isAuthenticated,
    isRestoring,
}: UseMovieReviewsParams) {
    const router =
        useRouter();


    const loadRequestIdRef =
        useRef(
            0
        );


    const [
        reviews,
        setReviews,
    ] =
        useState<
            MovieReviewItem[]
        >(
            []
        );


    const [
        pagination,
        setPagination,
    ] =
        useState<
            ReviewPaginationData | null
        >(
            null
        );


    const [
        isReviewsLoading,
        setIsReviewsLoading,
    ] =
        useState(
            false
        );


    const [
        isReviewsLoadingMore,
        setIsReviewsLoadingMore,
    ] =
        useState(
            false
        );


    const [
        isReviewMutationPending,
        setIsReviewMutationPending,
    ] =
        useState(
            false
        );


    const [
        reviewError,
        setReviewError,
    ] =
        useState<
            string | null
        >(
            null
        );


    const resetReviewsState =
        useCallback(
            () => {
                ++loadRequestIdRef.current;

                setReviews(
                    []
                );

                setPagination(
                    null
                );

                setIsReviewsLoading(
                    false
                );

                setIsReviewsLoadingMore(
                    false
                );

                setIsReviewMutationPending(
                    false
                );

                setReviewError(
                    null
                );
            },
            []
        );


    const loadMovieReviews =
        useCallback(
            async () => {
                const requestId =
                    ++loadRequestIdRef.current;


                if (
                    isRestoring
                ) {
                    return false;
                }


                if (
                    !isValidMovieId
                ) {
                    resetReviewsState();

                    return false;
                }


                /*
                 * Film değiştiğinde önceki filme ait
                 * yorumların ekranda kalmasını engeller.
                 */
                setReviews(
                    []
                );

                setPagination(
                    null
                );

                setIsReviewsLoading(
                    true
                );

                setIsReviewsLoadingMore(
                    false
                );

                setReviewError(
                    null
                );


                try {
                    const response =
                        await getMovieReviews(
                            movieId,
                            1,
                            REVIEWS_PAGE_LIMIT
                        );


                    if (
                        requestId !==
                        loadRequestIdRef.current
                    ) {
                        return false;
                    }


                    setReviews(
                        response.data
                            .items
                    );

                    setPagination(
                        response.data
                            .pagination
                    );


                    return true;
                } catch (
                    requestError
                ) {
                    if (
                        requestId !==
                        loadRequestIdRef.current
                    ) {
                        return false;
                    }


                    setReviews(
                        []
                    );

                    setPagination(
                        null
                    );

                    setReviewError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );


                    return false;
                } finally {
                    if (
                        requestId ===
                        loadRequestIdRef.current
                    ) {
                        setIsReviewsLoading(
                            false
                        );
                    }
                }
            },
            [
                isRestoring,
                isValidMovieId,
                movieId,
                resetReviewsState,
            ]
        );


    const loadMoreReviews =
        useCallback(
            async () => {
                if (
                    !isValidMovieId ||
                    isReviewsLoading ||
                    isReviewsLoadingMore ||
                    !pagination ||
                    !pagination.hasNextPage
                ) {
                    return;
                }


                const requestId =
                    loadRequestIdRef.current;

                const nextPage =
                    pagination.page +
                    1;


                setIsReviewsLoadingMore(
                    true
                );

                setReviewError(
                    null
                );


                try {
                    const response =
                        await getMovieReviews(
                            movieId,
                            nextPage,
                            REVIEWS_PAGE_LIMIT
                        );


                    if (
                        requestId !==
                        loadRequestIdRef.current
                    ) {
                        return;
                    }


                    setReviews(
                        (
                            currentReviews
                        ) => {
                            const reviewsById =
                                new Map<
                                    number,
                                    MovieReviewItem
                                >();


                            currentReviews.forEach(
                                (
                                    review
                                ) => {
                                    reviewsById.set(
                                        review.id,
                                        review
                                    );
                                }
                            );


                            response.data
                                .items
                                .forEach(
                                    (
                                        review
                                    ) => {
                                        reviewsById.set(
                                            review.id,
                                            review
                                        );
                                    }
                                );


                            return Array.from(
                                reviewsById.values()
                            );
                        }
                    );


                    setPagination(
                        response.data
                            .pagination
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


                    setReviewError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );
                } finally {
                    if (
                        requestId ===
                        loadRequestIdRef.current
                    ) {
                        setIsReviewsLoadingMore(
                            false
                        );
                    }
                }
            },
            [
                isReviewsLoading,
                isReviewsLoadingMore,
                isValidMovieId,
                movieId,
                pagination,
            ]
        );


    const handleReviewCreate =
        useCallback(
            async (
                content: string
            ) => {
                setReviewError(
                    null
                );


                if (
                    !isAuthenticated
                ) {
                    router.push(
                        "/login"
                    );

                    return false;
                }


                if (
                    !isValidMovieId ||
                    isReviewMutationPending
                ) {
                    return false;
                }


                setIsReviewMutationPending(
                    true
                );


                try {
                    await addMovieReview(
                        movieId,
                        content
                    );


                    const didRefresh =
                        await loadMovieReviews();


                    if (
                        !didRefresh
                    ) {
                        setReviewError(
                            "Yorumun eklendi ancak yorum listesi yenilenemedi."
                        );
                    }


                    return true;
                } catch (
                    requestError
                ) {
                    setReviewError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );


                    return false;
                } finally {
                    setIsReviewMutationPending(
                        false
                    );
                }
            },
            [
                isAuthenticated,
                isReviewMutationPending,
                isValidMovieId,
                loadMovieReviews,
                movieId,
                router,
            ]
        );


    const handleReviewUpdate =
        useCallback(
            async (
                reviewId: number,
                content: string
            ) => {
                setReviewError(
                    null
                );


                if (
                    !isAuthenticated
                ) {
                    router.push(
                        "/login"
                    );

                    return false;
                }


                if (
                    !isValidMovieId ||
                    isReviewMutationPending
                ) {
                    return false;
                }


                setIsReviewMutationPending(
                    true
                );


                try {
                    await updateMovieReview(
                        reviewId,
                        content
                    );


                    const didRefresh =
                        await loadMovieReviews();


                    if (
                        !didRefresh
                    ) {
                        setReviewError(
                            "Yorumun güncellendi ancak yorum listesi yenilenemedi."
                        );
                    }


                    return true;
                } catch (
                    requestError
                ) {
                    setReviewError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );


                    return false;
                } finally {
                    setIsReviewMutationPending(
                        false
                    );
                }
            },
            [
                isAuthenticated,
                isReviewMutationPending,
                isValidMovieId,
                loadMovieReviews,
                router,
            ]
        );


    const handleReviewDelete =
        useCallback(
            async (
                reviewId: number
            ) => {
                setReviewError(
                    null
                );


                if (
                    !isAuthenticated
                ) {
                    router.push(
                        "/login"
                    );

                    return false;
                }


                if (
                    !isValidMovieId ||
                    isReviewMutationPending
                ) {
                    return false;
                }


                setIsReviewMutationPending(
                    true
                );


                try {
                    await deleteMovieReview(
                        reviewId
                    );


                    const didRefresh =
                        await loadMovieReviews();


                    if (
                        !didRefresh
                    ) {
                        setReviewError(
                            "Yorumun silindi ancak yorum listesi yenilenemedi."
                        );
                    }


                    return true;
                } catch (
                    requestError
                ) {
                    setReviewError(
                        getRequestErrorMessage(
                            requestError
                        )
                    );


                    return false;
                } finally {
                    setIsReviewMutationPending(
                        false
                    );
                }
            },
            [
                isAuthenticated,
                isReviewMutationPending,
                isValidMovieId,
                loadMovieReviews,
                router,
            ]
        );


    return {
        reviews,

        pagination,

        totalReviews:
            pagination?.totalItems ??
            0,

        hasMoreReviews:
            pagination?.hasNextPage ??
            false,

        isReviewsLoading,
        isReviewsLoadingMore,
        isReviewMutationPending,

        reviewError,

        loadMovieReviews,
        loadMoreReviews,

        handleReviewCreate,
        handleReviewUpdate,
        handleReviewDelete,
    };
}