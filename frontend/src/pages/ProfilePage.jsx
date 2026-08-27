import {
    useState,
} from "react";

import {
    useLocation,
    useNavigate,
} from "react-router";

import useAuth from "../hooks/useAuth";

import "../styles/profile.css";


function ProfilePage() {
    const navigate =
        useNavigate();

    const location =
        useLocation();


    const {
        user,
        updateProfile,
        changePassword,
        logout,
    } = useAuth();


    const [
        profileForm,
        setProfileForm,
    ] = useState(() => ({
        name:
            user?.name || "",
        email:
            user?.email || "",
    }));


    const [
        passwordForm,
        setPasswordForm,
    ] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });


    const [
        profileError,
        setProfileError,
    ] = useState("");

    const [
        profileSuccess,
        setProfileSuccess,
    ] = useState("");

    const [
        passwordError,
        setPasswordError,
    ] = useState("");


    const [
        isProfileSubmitting,
        setIsProfileSubmitting,
    ] = useState(false);

    const [
        isPasswordSubmitting,
        setIsPasswordSubmitting,
    ] = useState(false);


    const handleUnauthorized =
        () => {
            logout();


            navigate(
                "/login",
                {
                    replace: true,

                    state: {
                        from:
                            location,

                        message:
                            "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
                    },
                }
            );
        };


    const handleProfileChange =
        (
            event
        ) => {
            const {
                name,
                value,
            } = event.target;


            setProfileForm(
                (
                    current
                ) => ({
                    ...current,

                    [name]:
                        value,
                })
            );
        };


    const handlePasswordChange =
        (
            event
        ) => {
            const {
                name,
                value,
            } = event.target;


            setPasswordForm(
                (
                    current
                ) => ({
                    ...current,

                    [name]:
                        value,
                })
            );
        };


    const handleProfileSubmit =
        async (
            event
        ) => {
            event.preventDefault();


            setProfileError("");

            setProfileSuccess("");


            const name =
                profileForm.name.trim();

            const email =
                profileForm.email
                    .trim()
                    .toLowerCase();


            if (!name) {
                setProfileError(
                    "Ad alanı boş bırakılamaz."
                );

                return;
            }


            if (
                name.length >
                100
            ) {
                setProfileError(
                    "Ad en fazla 100 karakter olabilir."
                );

                return;
            }


            if (!email) {
                setProfileError(
                    "E-posta alanı boş bırakılamaz."
                );

                return;
            }


            if (
                email.length >
                255
            ) {
                setProfileError(
                    "E-posta adresi çok uzun."
                );

                return;
            }


            setIsProfileSubmitting(
                true
            );


            try {
                const result =
                    await updateProfile({
                        name,
                        email,
                    });


                setProfileForm({
                    name:
                        result.data.name,

                    email:
                        result.data.email,
                });


                setProfileSuccess(
                    "Profilin başarıyla güncellendi."
                );
            } catch (
                requestError
            ) {
                if (
                    requestError.status ===
                    401
                ) {
                    handleUnauthorized();

                    return;
                }


                setProfileError(
                    requestError.message
                );
            } finally {
                setIsProfileSubmitting(
                    false
                );
            }
        };


    const handlePasswordSubmit =
        async (
            event
        ) => {
            event.preventDefault();


            setPasswordError("");


            const {
                currentPassword,
                newPassword,
                confirmPassword,
            } = passwordForm;


            if (!currentPassword) {
                setPasswordError(
                    "Mevcut şifreni gir."
                );

                return;
            }


            if (
                newPassword.length <
                8
            ) {
                setPasswordError(
                    "Yeni şifre en az 8 karakter olmalıdır."
                );

                return;
            }


            if (
                newPassword !==
                confirmPassword
            ) {
                setPasswordError(
                    "Yeni şifreler eşleşmiyor."
                );

                return;
            }


            if (
                currentPassword ===
                newPassword
            ) {
                setPasswordError(
                    "Yeni şifre mevcut şifrenden farklı olmalıdır."
                );

                return;
            }


            setIsPasswordSubmitting(
                true
            );


            try {
                await changePassword({
                    currentPassword,
                    newPassword,
                });


                navigate(
                    "/login",
                    {
                        replace: true,

                        state: {
                            message:
                                "Şifren başarıyla değiştirildi. Lütfen yeni şifrenle tekrar giriş yap.",
                        },
                    }
                );
            } catch (
                requestError
            ) {
                if (
                    requestError.status ===
                    401
                ) {
                    handleUnauthorized();

                    return;
                }


                setPasswordError(
                    requestError.message
                );

                setIsPasswordSubmitting(
                    false
                );
            }
        };


    return (
        <section className="account-page">
            <div className="account-header">
                <div>
                    <p className="eyebrow">
                        HESAP
                    </p>

                    <h1>
                        Profil ve Güvenlik
                    </h1>

                    <p>
                        Kişisel bilgilerini ve
                        hesap güvenliğini yönet.
                    </p>
                </div>

                <div className="account-identity">
                    <div className="account-avatar">
                        {user?.name
                            ?.charAt(
                                0
                            )
                            .toUpperCase() ||
                            "K"}
                    </div>

                    <div>
                        <strong>
                            {user?.name}
                        </strong>

                        <span>
                            {user?.email}
                        </span>
                    </div>
                </div>
            </div>


            <div className="account-summary">
                <div>
                    <span>
                        Kullanıcı ID
                    </span>

                    <strong>
                        #{user?.id}
                    </strong>
                </div>

                <div>
                    <span>
                        Üyelik Tarihi
                    </span>

                    <strong>
                        {user?.createdAt
                            ? new Date(
                                user.createdAt
                            ).toLocaleDateString(
                                "tr-TR"
                            )
                            : "-"}
                    </strong>
                </div>
            </div>


            <div className="account-grid">
                <article className="account-card">
                    <div className="account-card-header">
                        <div>
                            <p className="eyebrow">
                                PROFİL
                            </p>

                            <h2>
                                Kişisel Bilgiler
                            </h2>
                        </div>

                        <p>
                            MovieShelf hesabınla
                            ilişkili ad ve e-posta
                            bilgilerini güncelle.
                        </p>
                    </div>


                    {profileSuccess && (
                        <div
                            className="form-success"
                            role="status"
                        >
                            {
                                profileSuccess
                            }
                        </div>
                    )}


                    {profileError && (
                        <div
                            className="form-error"
                            role="alert"
                        >
                            {
                                profileError
                            }
                        </div>
                    )}


                    <form
                        className="account-form"
                        onSubmit={
                            handleProfileSubmit
                        }
                    >
                        <label
                            className="form-field"
                            htmlFor="profile-name"
                        >
                            <span>
                                Ad
                            </span>

                            <input
                                id="profile-name"
                                name="name"
                                type="text"
                                value={
                                    profileForm.name
                                }
                                onChange={
                                    handleProfileChange
                                }
                                maxLength={
                                    100
                                }
                                autoComplete="name"
                                disabled={
                                    isProfileSubmitting
                                }
                                required
                            />
                        </label>


                        <label
                            className="form-field"
                            htmlFor="profile-email"
                        >
                            <span>
                                E-posta
                            </span>

                            <input
                                id="profile-email"
                                name="email"
                                type="email"
                                value={
                                    profileForm.email
                                }
                                onChange={
                                    handleProfileChange
                                }
                                maxLength={
                                    255
                                }
                                autoComplete="email"
                                disabled={
                                    isProfileSubmitting
                                }
                                required
                            />
                        </label>


                        <button
                            type="submit"
                            className="primary-button account-submit-button"
                            disabled={
                                isProfileSubmitting
                            }
                        >
                            {isProfileSubmitting
                                ? "Kaydediliyor..."
                                : "Değişiklikleri Kaydet"}
                        </button>
                    </form>
                </article>


                <article className="account-card account-security-card">
                    <div className="account-card-header">
                        <div>
                            <p className="eyebrow">
                                GÜVENLİK
                            </p>

                            <h2>
                                Şifreyi Değiştir
                            </h2>
                        </div>

                        <p>
                            Şifreni değiştirdiğinde
                            daha önce açılmış tüm
                            oturumlar kapatılır.
                        </p>
                    </div>


                    {passwordError && (
                        <div
                            className="form-error"
                            role="alert"
                        >
                            {
                                passwordError
                            }
                        </div>
                    )}


                    <form
                        className="account-form"
                        onSubmit={
                            handlePasswordSubmit
                        }
                    >
                        <label
                            className="form-field"
                            htmlFor="current-password"
                        >
                            <span>
                                Mevcut Şifre
                            </span>

                            <input
                                id="current-password"
                                name="currentPassword"
                                type="password"
                                value={
                                    passwordForm
                                        .currentPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                autoComplete="current-password"
                                disabled={
                                    isPasswordSubmitting
                                }
                                required
                            />
                        </label>


                        <label
                            className="form-field"
                            htmlFor="new-password"
                        >
                            <span>
                                Yeni Şifre
                            </span>

                            <input
                                id="new-password"
                                name="newPassword"
                                type="password"
                                value={
                                    passwordForm
                                        .newPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                minLength={
                                    8
                                }
                                autoComplete="new-password"
                                disabled={
                                    isPasswordSubmitting
                                }
                                required
                            />

                            <small>
                                En az 8 karakter.
                            </small>
                        </label>


                        <label
                            className="form-field"
                            htmlFor="confirm-password"
                        >
                            <span>
                                Yeni Şifreyi Doğrula
                            </span>

                            <input
                                id="confirm-password"
                                name="confirmPassword"
                                type="password"
                                value={
                                    passwordForm
                                        .confirmPassword
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                minLength={
                                    8
                                }
                                autoComplete="new-password"
                                disabled={
                                    isPasswordSubmitting
                                }
                                required
                            />
                        </label>


                        <button
                            type="submit"
                            className="primary-button account-submit-button"
                            disabled={
                                isPasswordSubmitting
                            }
                        >
                            {isPasswordSubmitting
                                ? "Şifre değiştiriliyor..."
                                : "Şifreyi Değiştir"}
                        </button>
                    </form>
                </article>
            </div>


            <article className="account-card account-tmdb-card">
                <div className="account-tmdb-brand">
                    <a
                        href="https://www.themoviedb.org"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="The Movie Database sitesini aç"
                    >
                        <img
                            className="account-tmdb-logo"
                            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                            alt="TMDB"
                        />
                    </a>

                    <div>
                        <p className="eyebrow">
                            HAKKINDA
                        </p>

                        <h2>
                            Veri Kaynağı
                        </h2>
                    </div>
                </div>

                <div className="account-tmdb-copy">
                    <p>
                        MovieShelf, film verileri ve
                        görselleri için TMDB
                        (The Movie Database) API'sini
                        kullanır.
                    </p>

                    <p className="account-tmdb-notice">
                        This product uses the TMDB API but is not endorsed or certified by TMDB.
                    </p>

                    <a
                        className="account-tmdb-link"
                        href="https://www.themoviedb.org"
                        target="_blank"
                        rel="noreferrer"
                    >
                        The Movie Database'i ziyaret et
                    </a>
                </div>
            </article>
        </section>
    );
}


export default ProfilePage;