import {
    Link,
} from "react-router";


function LoginPage() {
    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <p className="eyebrow">
                        WELCOME BACK
                    </p>

                    <h1>
                        Sign in to MovieShelf
                    </h1>

                    <p>
                        Continue building your
                        personal movie collection.
                    </p>
                </div>

                <form className="auth-form">
                    <label
                        htmlFor="email"
                        className="form-field"
                    >
                        <span>
                            Email
                        </span>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                    </label>

                    <label
                        htmlFor="password"
                        className="form-field"
                    >
                        <span>
                            Password
                        </span>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </label>

                    <button
                        type="submit"
                        className="primary-button"
                    >
                        Sign In
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have an account?{" "}
                    <Link to="/register">
                        Create one
                    </Link>
                </p>
            </div>
        </section>
    );
}


export default LoginPage;