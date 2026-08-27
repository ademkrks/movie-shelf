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


    const [
        formData,
        setFormData,
    ] = useState({
        email: "",
        password: "",
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


            const normalizedEmail =
                formData.email
                    .trim()
                    .toLowerCase();


            setError("");


            if (
                !normalizedEmail ||
                !formData.password
            ) {
                setError(
                    "E-posta adresinizi ve şifrenizi girin."
                );

                return;
            }


            setIsSubmitting(true);


            try {
                await login({
                    email:
                        normalizedEmail,

                    password:
                        formData.password,
                });


                const from =
                    location.state
                        ?.from;


                const destination =
                    from?.pathname
                        ? `${from.pathname}${from.search || ""}${from.hash || ""}`
                        : "/";


                navigate(
                    destination,
                    {
                        replace: true,
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
                        TEKRAR HOŞ GELDİN
                    </p>

                    <h1>
                        MovieShelf&apos;e Giriş Yap
                    </h1>

                    <p>
                        Kişisel film koleksiyonunu
                        oluşturmaya devam et.
                    </p>
                </div>

                {location.state?.message && (
                    <div
                        className="form-success"
                        role="status"
                    >
                        {
                            location.state
                                .message
                        }
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
                                formData.email
                            }
                            onChange={
                                handleChange
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

                    <label
                        htmlFor="password"
                        className="form-field"
                    >
                        <span>
                            Şifre
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
                            disabled={
                                isSubmitting
                            }
                            required
                        />
                    </label>

                    <div className="forgot-password-link">
                        <Link
                            to="/forgot-password"
                        >
                            Şifreni mi unuttun?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            isSubmitting
                        }
                    >
                        {isSubmitting
                            ? "Giriş yapılıyor..."
                            : "Giriş Yap"}
                    </button>
                </form>

                <p className="auth-footer">
                    Hesabın yok mu?{" "}
                    <Link to="/register">
                        Kayıt ol
                    </Link>
                </p>
            </div>
        </section>
    );
}


export default LoginPage;