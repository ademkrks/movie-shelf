import {
    useState,
} from "react";

import {
    Link,
    Navigate,
    useNavigate,
} from "react-router";

import {
    register,
} from "../api/auth.api";

import useAuth from "../hooks/useAuth";


function RegisterPage() {
    const navigate =
        useNavigate();

    const {
        isAuthenticated,
    } = useAuth();


    const [formData, setFormData] =
        useState({
            name: "",
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


            if (
                formData.password.length <
                8
            ) {
                setError(
                    "Şifre en az 8 karakter olmalıdır."
                );

                return;
            }


            setIsSubmitting(true);


            try {
                await register(
                    formData
                );


                navigate(
                    "/login",
                    {
                        replace: true,

                        state: {
                            message:
                                "Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.",
                        },
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
                            value={
                                formData.name
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Your name"
                            autoComplete="name"
                            maxLength="100"
                            required
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
                            value={
                                formData.email
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="you@example.com"
                            autoComplete="email"
                            maxLength="255"
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
                            placeholder="Minimum 8 characters"
                            autoComplete="new-password"
                            minLength="8"
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
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an
                    account?{" "}
                    <Link to="/login">
                        Sign in
                    </Link>
                </p>
            </div>
        </section>
    );
}


export default RegisterPage;