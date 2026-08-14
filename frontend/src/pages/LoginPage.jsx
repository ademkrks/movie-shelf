import {
    useState,
} from "react";

import {
    Link,
    Navigate,
    useLocation,
    useNavigate,
} from "react-router";

import useAuth from "../hooks/useAuth";


function LoginPage() {
    const navigate =
        useNavigate();

    const location =
        useLocation();

    const {
        login,
        isAuthenticated,
    } = useAuth();


    const [formData, setFormData] =
        useState({
            email: "",
            password: "",
        });

    const [error, setError] =
        useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);


    if (isAuthenticated) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    const handleChange = (
        event
    ) => {
        const {
            name,
            value,
        } = event.target;


        setFormData(
            (current) => ({
                ...current,
                [name]: value,
            })
        );
    };


    const handleSubmit =
        async (event) => {
            event.preventDefault();

            setError("");
            setIsSubmitting(true);


            try {
                await login(
                    formData
                );


                const destination =
                    location.state
                        ?.from?.pathname ||
                    "/";


                navigate(
                    destination,
                    {
                        replace: true,
                    }
                );
            } catch (requestError) {
                setError(
                    requestError.message
                );
            } finally {
                setIsSubmitting(
                    false
                );
            }
        };


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

                {location.state?.message && (
                    <div className="form-success">
                        {
                            location.state
                                .message
                        }
                    </div>
                )}

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <form
                    className="auth-form"
                    onSubmit={
                        handleSubmit
                    }
                >
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
                            value={
                                formData.email
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="you@example.com"
                            autoComplete="email"
                            required
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
                            value={
                                formData.password
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </label>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            isSubmitting
                        }
                    >
                        {isSubmitting
                            ? "Signing In..."
                            : "Sign In"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have
                    an account?{" "}
                    <Link to="/register">
                        Create one
                    </Link>
                </p>
            </div>
        </section>
    );
}


export default LoginPage;