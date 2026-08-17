import {
    useEffect,
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router";

import {
    addRating,
    deleteRating,
    getMovieRatings,
    updateRating,
} from "../api/rating.api";

import useAuth from "../hooks/useAuth";


const fetchRatingState = async (
    movieId,
    userId
) => {
    const firstResponse =
        await getMovieRatings(
            movieId,
            1,
            100
        );


    const firstData =
        firstResponse.data;


    let userRating =
        firstData?.items?.find(
            (item) =>
                item.user?.id ===
                userId
        ) || null;


    if (
        userId &&
        !userRating &&
        firstData?.pagination
            ?.hasNextPage
    ) {
        const totalPages =
            firstData.pagination
                .totalPages;


        for (
            let page = 2;
            page <= totalPages;
            page += 1
        ) {
            const response =
                await getMovieRatings(
                    movieId,
                    page,
                    100
                );


            userRating =
                response.data
                    ?.items
                    ?.find(
                        (item) =>
                            item.user
                                ?.id ===
                            userId
                    ) ||
                null;


            if (userRating) {
                break;
            }
        }
    }


    return {
        averageRatings:
            firstData
                ?.averageRatings ??
            0,

        totalRatings:
            firstData
                ?.totalRatings ??
            0,

        userRating,
    };
};


function RatingSection({
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
        averageRatings,
        setAverageRatings,
    ] = useState(0);

    const [
        totalRatings,
        setTotalRatings,
    ] = useState(0);

    const [
        userRating,
        setUserRating,
    ] = useState(null);

    const [
        selectedRating,
        setSelectedRating,
    ] = useState(0);

    const [
        isLoading,
        setIsLoading,
    ] = useState(true);

    const [
        isSaving,
        setIsSaving,
    ] = useState(false);

    const [
        isDeleting,
        setIsDeleting,
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


        fetchRatingState(
            movieId,
            user?.id
        )
            .then(
                (result) => {
                    if (cancelled) {
                        return;
                    }


                    setAverageRatings(
                        result
                            .averageRatings
                    );

                    setTotalRatings(
                        result
                            .totalRatings
                    );

                    setUserRating(
                        result
                            .userRating
                    );

                    setSelectedRating(
                        result
                            .userRating
                            ?.rating ??
                        0
                    );
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
        user?.id,
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


    const reloadRating =
        async () => {
            const result =
                await fetchRatingState(
                    movieId,
                    user?.id
                );


            setAverageRatings(
                result.averageRatings
            );

            setTotalRatings(
                result.totalRatings
            );

            setUserRating(
                result.userRating
            );

            setSelectedRating(
                result.userRating
                    ?.rating ??
                0
            );
        };


    const handleSave =
        async () => {
            if (
                !isAuthenticated
            ) {
                redirectToLogin();

                return;
            }


            if (
                selectedRating < 1 ||
                selectedRating > 10
            ) {
                setError(
                    "1 ile 10 arasında bir puan seçin."
                );

                return;
            }


            setIsSaving(true);
            setError("");
            setFeedback("");


            try {
                if (userRating) {
                    await updateRating(
                        userRating.id,
                        selectedRating
                    );

                    setFeedback(
                        "Puanınız güncellendi."
                    );
                } else {
                    await addRating(
                        movieId,
                        selectedRating
                    );

                    setFeedback(
                        "Puanınız kaydedildi."
                    );
                }


                await reloadRating();
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
                setIsSaving(false);
            }
        };


    const handleDelete =
        async () => {
            if (!userRating) {
                return;
            }


            setIsDeleting(true);
            setError("");
            setFeedback("");


            try {
                await deleteRating(
                    userRating.id
                );


                setFeedback(
                    "Puanınız kaldırıldı."
                );


                await reloadRating();
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
                setIsDeleting(false);
            }
        };


    return (
        <section className="rating-section">
            <div className="rating-community">
                <p className="eyebrow">
                    MOVIESHELF RATING
                </p>

                <div className="community-rating-value">
                    <span className="community-rating-star">
                        ★
                    </span>

                    <strong>
                        {averageRatings.toFixed(
                            1
                        )}
                    </strong>

                    <span>
                        / 10
                    </span>
                </div>

                <p>
                    {totalRatings}{" "}
                    {totalRatings === 1
                        ? "rating"
                        : "ratings"}
                </p>
            </div>

            <div className="your-rating">
                <div className="rating-heading">
                    <div>
                        <h2>
                            Your Rating
                        </h2>

                        <p>
                            {userRating
                                ? `You rated this ${userRating.rating}/10.`
                                : "Rate this movie from 1 to 10."}
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="rating-loading">
                        Loading rating...
                    </div>
                ) : !isAuthenticated ? (
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={
                            redirectToLogin
                        }
                    >
                        Sign in to rate
                    </button>
                ) : (
                    <>
                        <div className="rating-buttons">
                            {Array.from(
                                {
                                    length: 10,
                                },
                                (
                                    _,
                                    index
                                ) =>
                                    index +
                                    1
                            ).map(
                                (value) => (
                                    <button
                                        key={
                                            value
                                        }
                                        type="button"
                                        className={
                                            selectedRating ===
                                            value
                                                ? "rating-number active"
                                                : "rating-number"
                                        }
                                        onClick={() =>
                                            setSelectedRating(
                                                value
                                            )
                                        }
                                        aria-pressed={
                                            selectedRating ===
                                            value
                                        }
                                    >
                                        {
                                            value
                                        }
                                    </button>
                                )
                            )}
                        </div>

                        <div className="rating-actions">
                            <button
                                type="button"
                                className="primary-button"
                                onClick={
                                    handleSave
                                }
                                disabled={
                                    isSaving ||
                                    isDeleting ||
                                    selectedRating ===
                                    0
                                }
                            >
                                {isSaving
                                    ? "Saving..."
                                    : userRating
                                        ? "Update Rating"
                                        : "Save Rating"}
                            </button>

                            {userRating && (
                                <button
                                    type="button"
                                    className="danger-button"
                                    onClick={
                                        handleDelete
                                    }
                                    disabled={
                                        isDeleting ||
                                        isSaving
                                    }
                                >
                                    {isDeleting
                                        ? "Removing..."
                                        : "Remove Rating"}
                                </button>
                            )}
                        </div>
                    </>
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
            </div>
        </section>
    );
}


export default RatingSection;