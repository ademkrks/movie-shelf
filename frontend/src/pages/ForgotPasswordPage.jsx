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
                    "E-posta adresinizi girin."
                );

                return;
            }


            setIsSubmitting(true);


            try {
                await forgotPassword({
                    email:
                        normalizedEmail,
                });


                setEmail(
                    normalizedEmail
                );


                setSuccessMessage(
                    "Bu e-posta adresine ait bir hesap varsa şifre sıfırlama bağlantısı gönderilecektir."
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
                        ŞİFRE SIFIRLAMA
                    </p>

                    <h1>
                        Şifreni mi unuttun?
                    </h1>

                    <p>
                        E-posta adresini gir,
                        sana şifre sıfırlama
                        bağlantısı gönderelim.
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
                            E-posta
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
                            placeholder="ornek@eposta.com"
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
                            ? "Gönderiliyor..."
                            : "Sıfırlama Bağlantısı Gönder"}
                    </button>
                </form>

                <p className="auth-footer">
                    Şifreni hatırladın mı?{" "}
                    <Link to="/login">
                        Girişe dön
                    </Link>
                </p>
            </div>
        </section>
    );
}


export default ForgotPasswordPage;