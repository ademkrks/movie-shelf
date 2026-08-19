import {
    Link,
} from "react-router";

import "../styles/not-found.css";


function NotFoundPage() {
    return (
        <section className="not-found-page">
            <div
                className="not-found-glow not-found-glow-one"
                aria-hidden="true"
            />

            <div
                className="not-found-glow not-found-glow-two"
                aria-hidden="true"
            />

            <div className="not-found-content">
                <div
                    className="not-found-symbol"
                    aria-hidden="true"
                >
                    <span>
                        404
                    </span>
                </div>

                <p className="eyebrow">
                    LOST IN THE CATALOG
                </p>

                <h1>
                    This page didn&apos;t
                    make the final cut.
                </h1>

                <p className="not-found-description">
                    The page you&apos;re
                    looking for doesn&apos;t
                    exist, may have moved or
                    is no longer available.
                </p>

                <div className="not-found-actions">
                    <Link
                        to="/"
                        className="primary-button not-found-primary"
                    >
                        <span aria-hidden="true">
                            ←
                        </span>

                        Back to Discover
                    </Link>
                </div>

                <div
                    className="not-found-meta"
                    aria-hidden="true"
                >
                    <span>
                        MovieShelf
                    </span>

                    <span className="not-found-meta-dot" />

                    <span>
                        Error 404
                    </span>
                </div>
            </div>
        </section>
    );
}


export default NotFoundPage;