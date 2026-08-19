import {
    Navigate,
    useLocation,
} from "react-router";

import useAuth from "../hooks/useAuth";

import "../styles/route-loading.css";


function ProtectedRoute({
    children,
}) {
    const location =
        useLocation();

    const {
        isAuthenticated,
        isLoading,
        sessionError,
        retrySession,
    } = useAuth();


    if (isLoading) {
        return (
            <section
                className="route-loading"
                role="status"
                aria-live="polite"
                aria-busy="true"
            >
                <div className="route-loading-content">
                    <div
                        className="route-loading-mark"
                        aria-hidden="true"
                    >
                        <span className="route-loading-ring" />

                        <span className="route-loading-brand">
                            M
                        </span>
                    </div>

                    <p className="eyebrow">
                        MOVIESHELF
                    </p>

                    <h1>
                        Checking your session
                    </h1>

                    <p className="route-loading-description">
                        Preparing your personal
                        MovieShelf experience.
                    </p>

                    <div
                        className="route-loading-dots"
                        aria-hidden="true"
                    >
                        <span />
                        <span />
                        <span />
                    </div>
                </div>
            </section>
        );
    }


    if (
        sessionError
    ) {
        return (
            <section
                className="route-loading"
                role="alert"
            >
                <div className="route-loading-content">
                    <div
                        className="route-loading-mark"
                        aria-hidden="true"
                    >
                        <span className="route-loading-brand">
                            !
                        </span>
                    </div>

                    <p className="eyebrow">
                        CONNECTION ISSUE
                    </p>

                    <h1>
                        We couldn&apos;t verify
                        your session
                    </h1>

                    <p className="route-loading-description">
                        {sessionError}
                    </p>

                    <button
                        type="button"
                        className="primary-button"
                        onClick={
                            retrySession
                        }
                    >
                        Try Again
                    </button>
                </div>
            </section>
        );
    }


    if (
        !isAuthenticated
    ) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from:
                        location,
                }}
            />
        );
    }


    return children;
}


export default ProtectedRoute;