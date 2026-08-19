import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router";

import ReviewCard from "./ReviewCard";

import {
    addReview,
    deleteReview,
    getMovieReviews,
    updateReview,
} from "../api/review.api";

import useAuth from "../hooks/useAuth";


const fetchReviewPage = async (
    movieId,
    page
) => {
    const response =
        await getMovieReviews(
            movieId,
            page,
            10
        );


    return {
        reviews:
            response.data
                ?.items ||
            [],

        pagination:
            response.data
                ?.pagination ||
            null,
    };
};


function ReviewSection({
    movieId,
}) {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth();


    const [
        reviews,
        setReviews,
    ] = useState([]);

    const [
        pagination,
        setPagination,
    ] = useState(null);

    const [
        page,
        setPage,
    ] = useState(1);

    const [
        loadedMovieId,
        setLoadedMovieId,
    ] = useState(null);

    const [
        isReloading,
        setIsReloading,
    ] = useState(false);

    const [
        content,
        setContent,
    ] = useState("");

    const [
        editingReviewId,
        setEditingReviewId,
    ] = useState(null);

    const [
        editContent,
        setEditContent,
    ] = useState("");

    const [
        actionReviewId,
        setActionReviewId,
    ] = useState(null);

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [
        isSavingEdit,
        setIsSavingEdit,
    ] = useState(false);

    const [
        loadError,
        setLoadError,
    ] = useState("");

    const [
        actionError,
        setActionError,
    ] = useState("");

    const [
        feedback,
        setFeedback,
    ] = useState("");


    const loadRequestIdRef =
        useRef(0);

    const isMountedRef =
        useRef(true);


    const isLoading =
        loadedMovieId !==
            movieId ||
        isReloading;


    useEffect(() => {
        isMountedRef.current =
            true;


        return () => {
            isMountedRef.current =
                false;
        };
    }, []);


    useEffect(() => {
        const currentMovieId =
            movieId;

        const requestId =
            loadRequestIdRef
                .current +
            1;


        loadRequestIdRef.current =
            requestId;


        let cancelled =
            false;


        fetchReviewPage(
            currentMovieId,
            1
        )
            .then(
                (result) => {
                    if (
                        cancelled ||
                        requestId !==
                            loadRequestIdRef
                                .current
                    ) {
                        return;
                    }


                    setReviews(
                        result.reviews
                    );

                    setPagination(
                        result.pagination
                    );

                    setPage(1);

                    setLoadError("");

                    setLoadedMovieId(
                        currentMovieId
                    );
                }
            )
            .catch(
                (
                    requestError
                ) => {
                    if (
                        cancelled ||
                        requestId !==
                            loadRequestIdRef
                                .current
                    ) {
                        return;
                    }


                    setReviews([]);

                    setPagination(null);

                    setPage(1);

                    setLoadError(
                        requestError
                            .message ||
                            "Yorumlar yüklenemedi."
                    );

                    setLoadedMovieId(
                        currentMovieId
                    );
                }
            );


        return () => {
            cancelled =
                true;


            if (
                loadRequestIdRef
                    .current ===
                requestId
            ) {
                loadRequestIdRef
                    .current +=
                    1;
            }
        };
    }, [
        movieId,
    ]);


    const redirectToLogin =
        () => {
            navigate(
                "/login",
                {
                    state: {
                        from:
                            location,
                    },
                }
            );
        };


    const handleUnauthorized =
        () => {
            logout();

            navigate(
                "/login",
                {
                    replace: true,

                    state: {
                        from:
                            location,

                        message:
                            "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
                    },
                }
            );
        };


    const reloadReviews =
        async (
            requestedPage
        ) => {
            const requestId =
                loadRequestIdRef
                    .current +
                1;


            loadRequestIdRef.current =
                requestId;


            setIsReloading(true);

            setLoadError("");


            try {
                const result =
                    await fetchReviewPage(
                        movieId,
                        requestedPage
                    );


                if (
                    !isMountedRef
                        .current ||
                    requestId !==
                        loadRequestIdRef
                            .current
                ) {
                    return false;
                }


                setReviews(
                    result.reviews
                );

                setPagination(
                    result.pagination
                );

                setPage(
                    requestedPage
                );

                setLoadedMovieId(
                    movieId
                );

                setLoadError("");


                return true;
            } catch (
                requestError
            ) {
                if (
                    !isMountedRef
                        .current ||
                    requestId !==
                        loadRequestIdRef
                            .current
                ) {
                    return false;
                }


                /*
                 * Mevcut yorumlar korunur.
                 *
                 * Böylece sayfa yenileme veya pagination
                 * isteği başarısız olduğunda kullanıcı
                 * çalışan son veriyi kaybetmez.
                 */
                setLoadError(
                    requestError
                        .message ||
                        "Yorumlar yenilenemedi."
                );


                return false;
            } finally {
                if (
                    isMountedRef
                        .current &&
                    requestId ===
                        loadRequestIdRef
                            .current
                ) {
                    setIsReloading(
                        false
                    );
                }
            }
        };


    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();


            if (
                !isAuthenticated
            ) {
                redirectToLogin();

                return;
            }


            const trimmedContent =
                content.trim();


            if (!trimmedContent) {
                setActionError(
                    "Yorum boş bırakılamaz."
                );

                return;
            }


            if (
                trimmedContent.length >
                1000
            ) {
                setActionError(
                    "Yorum en fazla 1000 karakter olabilir."
                );

                return;
            }


            setIsSubmitting(true);

            setActionError("");

            setFeedback("");


            try {
                await addReview(
                    movieId,
                    trimmedContent
                );


                setContent("");

                setFeedback(
                    "Yorumunuz yayınlandı."
                );


                await reloadReviews(
                    page === 1
                        ? 1
                        : 1
                );
            } catch (
                requestError
            ) {
                if (
                    requestError.status ===
                    401
                ) {
                    handleUnauthorized();

                    return;
                }


                setActionError(
                    requestError.message
                );
            } finally {
                setIsSubmitting(
                    false
                );
            }
        };


    const startEditing =
        (
            review
        ) => {
            setEditingReviewId(
                review.id
            );

            setEditContent(
                review.content
            );

            setActionError("");

            setFeedback("");
        };


    const cancelEditing =
        () => {
            setEditingReviewId(
                null
            );

            setEditContent("");
        };


    const saveEdit =
        async (
            reviewId
        ) => {
            const trimmedContent =
                editContent.trim();


            if (!trimmedContent) {
                setActionError(
                    "Yorum boş bırakılamaz."
                );

                return;
            }


            if (
                trimmedContent.length >
                1000
            ) {
                setActionError(
                    "Yorum en fazla 1000 karakter olabilir."
                );

                return;
            }


            setIsSavingEdit(true);

            setActionError("");

            setFeedback("");


            try {
                await updateReview(
                    reviewId,
                    trimmedContent
                );


                setEditingReviewId(
                    null
                );

                setEditContent("");

                setFeedback(
                    "Yorumunuz güncellendi."
                );


                await reloadReviews(
                    page
                );
            } catch (
                requestError
            ) {
                if (
                    requestError.status ===
                    401
                ) {
                    handleUnauthorized();

                    return;
                }


                setActionError(
                    requestError.message
                );
            } finally {
                setIsSavingEdit(
                    false
                );
            }
        };


    const handleDelete =
        async (
            reviewId
        ) => {
            setActionReviewId(
                reviewId
            );

            setActionError("");

            setFeedback("");


            try {
                await deleteReview(
                    reviewId
                );


                setFeedback(
                    "Yorumunuz silindi."
                );


                const isLastItem =
                    reviews.length ===
                    1;


                const targetPage =
                    isLastItem &&
                    page > 1
                        ? page - 1
                        : page;


                await reloadReviews(
                    targetPage
                );
            } catch (
                requestError
            ) {
                if (
                    requestError.status ===
                    401
                ) {
                    handleUnauthorized();

                    return;
                }


                setActionError(
                    requestError.message
                );
            } finally {
                setActionReviewId(
                    null
                );
            }
        };


    const goPrevious =
        async () => {
            if (
                !pagination
                    ?.hasPreviousPage ||
                isLoading
            ) {
                return;
            }


            await reloadReviews(
                page - 1
            );
        };


    const goNext =
        async () => {
            if (
                !pagination
                    ?.hasNextPage ||
                isLoading
            ) {
                return;
            }


            await reloadReviews(
                page + 1
            );
        };


    const retryReviews =
        async () => {
            await reloadReviews(
                page
            );
        };


    return (
        <section className="reviews-section">
            <div className="reviews-header">
                <div>
                    <p className="eyebrow">
                        COMMUNITY REVIEWS
                    </p>

                    <h2>
                        Reviews
                    </h2>

                    <p>
                        {pagination
                            ?.totalItems ??
                            0}{" "}
                        reviews
                    </p>
                </div>
            </div>

            {isAuthenticated ? (
                <form
                    className="review-form"
                    onSubmit={
                        handleSubmit
                    }
                >
                    <textarea
                        value={
                            content
                        }
                        onChange={(
                            event
                        ) =>
                            setContent(
                                event.target
                                    .value
                            )
                        }
                        placeholder="What did you think about this movie?"
                        maxLength="1000"
                        rows="5"
                    />

                    <div className="review-form-footer">
                        <span>
                            {content.length}
                            /1000
                        </span>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={
                                isSubmitting
                            }
                        >
                            {isSubmitting
                                ? "Publishing..."
                                : "Publish Review"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="review-login-prompt">
                    <p>
                        Sign in to share
                        your thoughts about
                        this movie.
                    </p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={
                            redirectToLogin
                        }
                    >
                        Sign in to review
                    </button>
                </div>
            )}

            {feedback && (
                <p className="review-feedback">
                    {feedback}
                </p>
            )}

            {actionError && (
                <p className="review-error">
                    {actionError}
                </p>
            )}

            {loadError &&
                reviews.length >
                    0 && (
                    <div>
                        <p className="review-error">
                            {loadError}
                        </p>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={
                                retryReviews
                            }
                            disabled={
                                isLoading
                            }
                        >
                            {isLoading
                                ? "Retrying..."
                                : "Try Again"}
                        </button>
                    </div>
                )}

            {isLoading &&
            reviews.length === 0 ? (
                <div className="reviews-loading">
                    Loading reviews...
                </div>
            ) : loadError &&
              reviews.length === 0 ? (
                <div className="reviews-empty">
                    <p>
                        Reviews could not be
                        loaded.
                    </p>

                    <p className="review-error">
                        {loadError}
                    </p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={
                            retryReviews
                        }
                        disabled={
                            isLoading
                        }
                    >
                        Try Again
                    </button>
                </div>
            ) : reviews.length ===
              0 ? (
                <div className="reviews-empty">
                    <p>
                        No reviews yet.
                        Be the first to
                        share your thoughts.
                    </p>
                </div>
            ) : (
                <>
                    <div className="review-list">
                        {reviews.map(
                            (
                                review
                            ) => (
                                <ReviewCard
                                    key={
                                        review.id
                                    }
                                    review={
                                        review
                                    }
                                    currentUserId={
                                        user?.id
                                    }
                                    isEditing={
                                        editingReviewId ===
                                        review.id
                                    }
                                    editContent={
                                        editContent
                                    }
                                    isSaving={
                                        isSavingEdit &&
                                        editingReviewId ===
                                            review.id
                                    }
                                    isDeleting={
                                        actionReviewId ===
                                        review.id
                                    }
                                    onStartEdit={() =>
                                        startEditing(
                                            review
                                        )
                                    }
                                    onCancelEdit={
                                        cancelEditing
                                    }
                                    onEditContentChange={
                                        setEditContent
                                    }
                                    onSaveEdit={() =>
                                        saveEdit(
                                            review.id
                                        )
                                    }
                                    onDelete={() =>
                                        handleDelete(
                                            review.id
                                        )
                                    }
                                />
                            )
                        )}
                    </div>

                    {pagination &&
                        pagination.totalPages >
                            1 && (
                            <div className="review-pagination">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        goPrevious
                                    }
                                    disabled={
                                        !pagination
                                            .hasPreviousPage ||
                                        isLoading
                                    }
                                >
                                    Previous
                                </button>

                                <span>
                                    Page{" "}
                                    {
                                        pagination.page
                                    }{" "}
                                    of{" "}
                                    {
                                        pagination.totalPages
                                    }
                                </span>

                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        goNext
                                    }
                                    disabled={
                                        !pagination
                                            .hasNextPage ||
                                        isLoading
                                    }
                                >
                                    Next
                                </button>
                            </div>
                        )}
                </>
            )}
        </section>
    );
}


export default ReviewSection;