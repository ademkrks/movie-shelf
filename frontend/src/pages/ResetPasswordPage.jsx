import {
    useState,
} from "react";

import {
    Link,
    Navigate,
    useNavigate,
    useSearchParams,
} from "react-router";

import {
    resetPassword,
} from "../api/auth.api";

import useAuth from "../hooks/useAuth";


function ResetPasswordPage() {
    const navigate =
        useNavigate();

    const [
        searchParams,
    ] = useSearchParams();

    const {
        isAuthenticated,
    } = useAuth();


    const token =
        searchParams.get(
            "token"
        ) || "";

    const isValidToken =
        /^[a-fA-F0-9]{64}$/.test(
            token
        );


    const [
        formData,
        setFormData,
    ] = useState({
        password: "",
        confirmPassword: "",
    });

    const [error, setError] =
        useState("");

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


            if (!isValidToken) {
                setError(
                    "Şifre sıfırlama bağlantısı geçersiz."
                );

                return;
            }


            if (
                formData.password.length <
                8
            ) {
                setError(
                    "Yeni şifre en az 8 karakter olmalıdır."
                );

                return;
            }


            if (
                formData.password !==
                formData.confirmPassword
            ) {
                setError(
                    "Şifreler eşleşmiyor."
                );

                return;
            }


            setIsSubmitting(true);


            try {
                const response =
                    await resetPassword({
                        token,

                        password:
                            formData.password,
                    });


                navigate(
                    "/login",
                    {
                        replace: true,

                        state: {
                            message:
                                response.message ||
                                "Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.",
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
                        RESET PASSWORD
                    </p>

                    <h1>
                        Create a new password
                    </h1>

                    <p>
                        Choose a new password
                        for your MovieShelf
                        account.
                    </p>
                </div>

                {!isValidToken && (
                    <div className="form-error">
                        This password reset
                        link is invalid.
                    </div>
                )}

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                {isValidToken && (
                    <form
                        className="auth-form"
                        onSubmit={
                            handleSubmit
                        }
                    >
                        <label
                            htmlFor="password"
                            className="form-field"
                        >
                            <span>
                                New Password
                            </span>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={
                                    formData
                                        .password
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

                        <label
                            htmlFor="confirmPassword"
                            className="form-field"
                        >
                            <span>
                                Confirm Password
                            </span>

                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={
                                    formData
                                        .confirmPassword
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Repeat your password"
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
                                ? "Updating..."
                                : "Update Password"}
                        </button>
                    </form>
                )}

                <p className="auth-footer">
                    <Link to="/login">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </section>
    );
}


export default ResetPasswordPage;