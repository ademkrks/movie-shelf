import {
    useEffect,
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
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);

    const [
        isSavingEdit,
        setIsSavingEdit,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        feedback,
        setFeedback,
    ] = useState("");


    useEffect(() => {
        let cancelled =
            false;


        fetchReviewPage(
            movieId,
            page
        )
            .then(
                (result) => {
                    if (cancelled) {
                        return;
                    }


                    setReviews(
                        result.reviews
                    );

                    setPagination(
                        result.pagination
                    );

                    setError("");
                }
            )
            .catch(
                (
                    requestError
                ) => {
                    if (!cancelled) {
                        setError(
                            requestError
                                .message
                        );
                    }
                }
            )
            .finally(
                () => {
                    if (!cancelled) {
                        setIsLoading(
                            false
                        );
                    }
                }
            );


        return () => {
            cancelled =
                true;
        };
    }, [
        movieId,
        page,
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
            setIsLoading(true);


            try {
                const result =
                    await fetchReviewPage(
                        movieId,
                        requestedPage
                    );


                setReviews(
                    result.reviews
                );

                setPagination(
                    result.pagination
                );
            } catch (
                requestError
            ) {
                setError(
                    requestError.message
                );
            } finally {
                setIsLoading(false);
            }
        };


    const handleSubmit =
        async (event) => {
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
                setError(
                    "Yorum boş bırakılamaz."
                );

                return;
            }


            if (
                trimmedContent.length >
                1000
            ) {
                setError(
                    "Yorum en fazla 1000 karakter olabilir."
                );

                return;
            }


            setIsSubmitting(true);
            setError("");
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


                if (page !== 1) {
                    setIsLoading(true);
                    setPage(1);
                } else {
                    await reloadReviews(
                        1
                    );
                }
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


                setError(
                    requestError.message
                );
            } finally {
                setIsSubmitting(
                    false
                );
            }
        };


    const startEditing =
        (review) => {
            setEditingReviewId(
                review.id
            );

            setEditContent(
                review.content
            );

            setError("");
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
                setError(
                    "Yorum boş bırakılamaz."
                );

                return;
            }


            if (
                trimmedContent.length >
                1000
            ) {
                setError(
                    "Yorum en fazla 1000 karakter olabilir."
                );

                return;
            }


            setIsSavingEdit(true);
            setError("");
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


                setError(
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

            setError("");
            setFeedback("");


            try {
                await deleteReview(
                    reviewId
                );


                setFeedback(
                    "Yorumunuz silindi."
                );


                if (
                    reviews.length ===
                        1 &&
                    page > 1
                ) {
                    setIsLoading(true);

                    setPage(
                        (current) =>
                            current - 1
                    );
                } else {
                    await reloadReviews(
                        page
                    );
                }
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


                setError(
                    requestError.message
                );
            } finally {
                setActionReviewId(
                    null
                );
            }
        };


    const goPrevious =
        () => {
            if (
                !pagination
                    ?.hasPreviousPage
            ) {
                return;
            }


            setIsLoading(true);

            setPage(
                (current) =>
                    current - 1
            );
        };


    const goNext =
        () => {
            if (
                !pagination
                    ?.hasNextPage
            ) {
                return;
            }


            setIsLoading(true);

            setPage(
                (current) =>
                    current + 1
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

            {error && (
                <p className="review-error">
                    {error}
                </p>
            )}

            {isLoading ? (
                <div className="reviews-loading">
                    Loading reviews...
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
                            (review) => (
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
                                            .hasPreviousPage
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
                                            .hasNextPage
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