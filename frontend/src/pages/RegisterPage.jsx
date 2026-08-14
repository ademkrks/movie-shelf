import {
    Link,
} from "react-router";


function RegisterPage() {
    return (
        <section className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <p className="eyebrow">
                        JOIN MOVIESHELF
                    </p>

                    <h1>
                        Create your account
                    </h1>

                    <p>
                        Start building your own
                        movie library.
                    </p>
                </div>

                <form className="auth-form">
                    <label
                        htmlFor="name"
                        className="form-field"
                    >
                        <span>
                            Name
                        </span>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Your name"
                            autoComplete="name"
                        />
                    </label>

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
                            autoComplete="new-password"
                        />
                    </label>

                    <button
                        type="submit"
                        className="primary-button"
                    >
                        Create Account
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account?{" "}
                    <Link to="/login">
                        Sign in
                    </Link>
                </p>
            </div>
        </section>
    );
}


export default RegisterPage;