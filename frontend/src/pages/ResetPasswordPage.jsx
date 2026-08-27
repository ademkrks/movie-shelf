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

    const [
        error,
        setError,
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


    const handleChange =
        (
            event
        ) => {
            const {
                name,
                value,
            } = event.target;


            setFormData(
                (
                    current
                ) => ({
                    ...current,

                    [name]:
                        value,
                })
            );
        };


    const handleSubmit =
        async (
            event
        ) => {
            event.preventDefault();


            setError("");


            if (!isValidToken) {
                setError(
                    "Bu şifre sıfırlama bağlantısı geçersiz."
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
                                "Şifren başarıyla güncellendi. Yeni şifrenle giriş yapabilirsin.",
                        },
                    }
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
                        ŞİFREYİ SIFIRLA
                    </p>

                    <h1>
                        Yeni bir şifre oluştur
                    </h1>

                    <p>
                        MovieShelf hesabın için
                        yeni bir şifre belirle.
                    </p>
                </div>

                {!isValidToken && (
                    <div
                        className="form-error"
                        role="alert"
                    >
                        Bu şifre sıfırlama
                        bağlantısı geçersiz.
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
                                Yeni Şifre
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
                                placeholder="En az 8 karakter"
                                autoComplete="new-password"
                                minLength={
                                    8
                                }
                                disabled={
                                    isSubmitting
                                }
                                required
                            />
                        </label>

                        <label
                            htmlFor="confirmPassword"
                            className="form-field"
                        >
                            <span>
                                Şifreyi Doğrula
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
                                placeholder="Şifreni tekrar gir"
                                autoComplete="new-password"
                                minLength={
                                    8
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
                                ? "Güncelleniyor..."
                                : "Şifreyi Güncelle"}
                        </button>
                    </form>
                )}

                <p className="auth-footer">
                    <Link to="/login">
                        Girişe dön
                    </Link>
                </p>
            </div>
        </section>
    );
}


export default ResetPasswordPage;