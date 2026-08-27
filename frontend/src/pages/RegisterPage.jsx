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


    const [
        formData,
        setFormData,
    ] = useState({
        name: "",
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


            setError("");


            const normalizedName =
                formData.name.trim();

            const normalizedEmail =
                formData.email
                    .trim()
                    .toLowerCase();


            if (!normalizedName) {
                setError(
                    "Ad alanı boş bırakılamaz."
                );

                return;
            }


            if (
                normalizedName.length >
                100
            ) {
                setError(
                    "Ad en fazla 100 karakter olabilir."
                );

                return;
            }


            if (!normalizedEmail) {
                setError(
                    "E-posta adresinizi girin."
                );

                return;
            }


            if (
                normalizedEmail.length >
                255
            ) {
                setError(
                    "E-posta adresi çok uzun."
                );

                return;
            }


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
                await register({
                    name:
                        normalizedName,

                    email:
                        normalizedEmail,

                    password:
                        formData.password,
                });


                navigate(
                    "/login",
                    {
                        replace: true,

                        state: {
                            message:
                                "Hesabın oluşturuldu. Şimdi giriş yapabilirsin.",
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
                        MOVIESHELF&apos;E KATIL
                    </p>

                    <h1>
                        Hesabını oluştur
                    </h1>

                    <p>
                        Kendi film arşivini
                        oluşturmaya başla.
                    </p>
                </div>

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
                        htmlFor="name"
                        className="form-field"
                    >
                        <span>
                            Ad
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
                            placeholder="Adınız"
                            autoComplete="name"
                            maxLength={
                                100
                            }
                            disabled={
                                isSubmitting
                            }
                            required
                        />
                    </label>

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

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={
                            isSubmitting
                        }
                    >
                        {isSubmitting
                            ? "Hesap oluşturuluyor..."
                            : "Hesap Oluştur"}
                    </button>
                </form>

                <p className="auth-footer">
                    Zaten hesabın var mı?{" "}
                    <Link to="/login">
                        Giriş yap
                    </Link>
                </p>
            </div>
        </section>
    );
}


export default RegisterPage;