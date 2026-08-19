import {
    useState,
} from "react";

import {
    Link,
    Navigate,
} from "react-router";

import {
    forgotPassword,
} from "../api/auth.api";

import useAuth from "../hooks/useAuth";


function ForgotPasswordPage() {
    const {
        isAuthenticated,
    } = useAuth();


    const [
        email,
        setEmail,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState("");

    const [
        successMessage,
        setSuccessMessage,
    ] = useState("");

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState(false);


    if (isAuthenticated) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();


            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();


            setError("");

            setSuccessMessage("");


            if (!normalizedEmail) {
                setError(
                    "Enter your email address."
                );

                return;
            }


            setIsSubmitting(true);


            try {
                const response =
                    await forgotPassword({
                        email:
                            normalizedEmail,
                    });


                setEmail(
                    normalizedEmail
                );


                setSuccessMessage(
                    response.message ||
                    "If an account exists for this email, a password reset link will be sent."
                );
            } catch (
                requestError
            ) {
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
                        PASSWORD RECOVERY
                    </p>

                    <h1>
                        Forgot your password?
                    </h1>

                    <p>
                        Enter your email address
                        and we&apos;ll send you a
                        password reset link.
                    </p>
                </div>

                {successMessage && (
                    <div
                        className="form-success"
                        role="status"
                    >
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div
                        className="form-error"
                        role="alert"
                    >
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
                                email
                            }
                            onChange={(
                                event
                            ) =>
                                setEmail(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="you@example.com"
                            autoComplete="email"
                            maxLength={
                                255
                            }
                            disabled={
                                isSubmitting
                            }
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
                            ? "Sending..."
                            : "Send Reset Link"}
                    </button>
                </form>

                <p className="auth-footer">
                    Remember your
                    password?{" "}
                    <Link to="/login">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </section>
    );
}


export default ForgotPasswordPage;