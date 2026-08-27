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
    getMyRating,
    updateRating,
} from "../api/rating.api";

import useAuth from "../hooks/useAuth";


const fetchRatingState = async (
    movieId,
    isAuthenticated
) => {
    const [
        ratingsResult,
        myRatingResult,
    ] =
        await Promise.allSettled([
            getMovieRatings(
                movieId,
                1,
                1
            ),

            isAuthenticated
                ? getMyRating(
                    movieId
                )
                : Promise.resolve(
                    null
                ),
        ]);


    const ratingsData =
        ratingsResult.status ===
        "fulfilled"
            ? ratingsResult.value
                ?.data
            : null;


    return {
        averageRatings:
            ratingsResult.status ===
            "fulfilled"
                ? Number(
                    ratingsData
                        ?.averageRatings ??
                    0
                )
                : null,

        totalRatings:
            ratingsResult.status ===
            "fulfilled"
                ? Number(
                    ratingsData
                        ?.totalRatings ??
                    0
                )
                : null,

        ratingsError:
            ratingsResult.status ===
            "rejected"
                ? ratingsResult.reason
                : null,

        userRating:
            myRatingResult.status ===
            "fulfilled"
                ? myRatingResult.value
                    ?.data ??
                null
                : null,

        userRatingError:
            isAuthenticated &&
            myRatingResult.status ===
                "rejected"
                ? myRatingResult.reason
                : null,
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
        isAuthenticated,
        logout,
    } = useAuth();


    const [
        averageRatings,
        setAverageRatings,
    ] = useState(null);

    const [
        totalRatings,
        setTotalRatings,
    ] = useState(null);

    const [
        userRating,
        setUserRating,
    ] = useState(null);

    const [
        selectedRating,
        setSelectedRating,
    ] = useState(0);

    const [
        loadedRequestKey,
        setLoadedRequestKey,
    ] = useState(null);

    const [
        isSaving,
        setIsSaving,
    ] = useState(false);

    const [
        isDeleting,
        setIsDeleting,
    ] = useState(false);

    const [
        communityError,
        setCommunityError,
    ] = useState("");

    const [
        userRatingError,
        setUserRatingError,
    ] = useState("");

    const [
        actionError,
        setActionError,
    ] = useState("");

    const [
        feedback,
        setFeedback,
    ] = useState("");


    const requestKey =
        `${movieId}:${isAuthenticated}`;


    const isLoading =
        loadedRequestKey !==
        requestKey;


    useEffect(() => {
        let cancelled =
            false;

        const currentRequestKey =
            `${movieId}:${isAuthenticated}`;


        fetchRatingState(
            movieId,
            isAuthenticated
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

                    setCommunityError(
                        result
                            .ratingsError
                            ?.message ||
                        ""
                    );


                    if (
                        result
                            .userRatingError
                            ?.status ===
                        401
                    ) {
                        setUserRating(
                            null
                        );

                        setSelectedRating(
                            0
                        );

                        setUserRatingError(
                            ""
                        );

                        setLoadedRequestKey(
                            currentRequestKey
                        );

                        logout();

                        return;
                    }


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

                    setUserRatingError(
                        result
                            .userRatingError
                            ?.message ||
                        ""
                    );

                    setActionError("");

                    setLoadedRequestKey(
                        currentRequestKey
                    );
                }
            )
            .catch(
                (
                    requestError
                ) => {
                    if (cancelled) {
                        return;
                    }


                    setAverageRatings(
                        null
                    );

                    setTotalRatings(
                        null
                    );

                    setUserRating(
                        null
                    );

                    setSelectedRating(
                        0
                    );

                    setCommunityError(
                        requestError
                            .message
                    );

                    setUserRatingError(
                        isAuthenticated
                            ? requestError
                                .message
                            : ""
                    );

                    setLoadedRequestKey(
                        currentRequestKey
                    );
                }
            );


        return () => {
            cancelled =
                true;
        };
    }, [
        movieId,
        isAuthenticated,
        logout,
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
                    isAuthenticated
                );


            setAverageRatings(
                result.averageRatings
            );

            setTotalRatings(
                result.totalRatings
            );

            setCommunityError(
                result.ratingsError
                    ?.message ||
                ""
            );


            if (
                result
                    .userRatingError
                    ?.status ===
                401
            ) {
                handleUnauthorized();

                return false;
            }


            setUserRating(
                result.userRating
            );

            setSelectedRating(
                result.userRating
                    ?.rating ??
                0
            );

            setUserRatingError(
                result
                    .userRatingError
                    ?.message ||
                ""
            );


            return true;
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
                userRatingError
            ) {
                return;
            }


            if (
                selectedRating < 1 ||
                selectedRating > 10
            ) {
                setActionError(
                    "1 ile 10 arasında bir puan seçin."
                );

                return;
            }


            setIsSaving(true);

            setActionError("");

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


                setActionError(
                    requestError.message
                );
            } finally {
                setIsSaving(false);
            }
        };


    const handleDelete =
        async () => {
            if (
                !userRating ||
                userRatingError
            ) {
                return;
            }


            setIsDeleting(true);

            setActionError("");

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


                setActionError(
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
                    MOVIESHELF PUANI
                </p>

                <div className="community-rating-value">
                    <span className="community-rating-star">
                        ★
                    </span>

                    <strong>
                        {averageRatings ===
                        null
                            ? "—"
                            : averageRatings.toFixed(
                                1
                            )}
                    </strong>

                    <span>
                        / 10
                    </span>
                </div>

                {communityError ? (
                    <>
                        <p>
                            Puan bilgisi kullanılamıyor.
                        </p>

                        <p className="review-error">
                            {
                                communityError
                            }
                        </p>
                    </>
                ) : (
                    <p>
                        {totalRatings ??
                            0}{" "}
                        puan
                    </p>
                )}
            </div>

            <div className="your-rating">
                <div className="rating-heading">
                    <div>
                        <h2>
                            Puanın
                        </h2>

                        <p>
                            {userRating
                                ? `Bu filme ${userRating.rating}/10 puan verdin.`
                                : "Bu filme 1 ile 10 arasında puan ver."}
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="rating-loading">
                        Puan yükleniyor...
                    </div>
                ) : !isAuthenticated ? (
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={
                            redirectToLogin
                        }
                    >
                        Puan vermek için giriş yap
                    </button>
                ) : userRatingError ? (
                    <div>
                        <p className="review-error">
                            {
                                userRatingError
                            }
                        </p>

                        <p>
                            Mevcut puanın
                            doğrulanamadı.
                        </p>
                    </div>
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
                                        disabled={
                                            isSaving ||
                                            isDeleting
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
                                    ? "Kaydediliyor..."
                                    : userRating
                                        ? "Puanı Güncelle"
                                        : "Puanı Kaydet"}
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
                                        ? "Kaldırılıyor..."
                                        : "Puanı Kaldır"}
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

                {actionError && (
                    <p className="review-error">
                        {actionError}
                    </p>
                )}
            </div>
        </section>
    );
}


export default RatingSection;