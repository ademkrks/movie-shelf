import {
    Link,
} from "react-router";


function NotFoundPage() {
    return (
        <section className="not-found-page">
            <p className="error-code">
                404
            </p>

            <h1>
                Page not found
            </h1>

            <p>
                The page you are looking for
                does not exist.
            </p>

            <Link
                to="/"
                className="primary-button inline-button"
            >
                Back to Home
            </Link>
        </section>
    );
}


export default NotFoundPage;