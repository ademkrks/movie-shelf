import {
    Navigate,
    useLocation,
} from "react-router";

import useAuth from "../hooks/useAuth";

import "../styles/route-loading.css";


function ProtectedRoute({
    children,
}) {
    const {
        isAuthenticated,
        isLoading,
    } = useAuth();

    const location =
        useLocation();


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


    if (!isAuthenticated) {
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