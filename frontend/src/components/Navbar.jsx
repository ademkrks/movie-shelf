import {
    useEffect,
    useState,
} from "react";

import {
    NavLink,
    useNavigate,
} from "react-router";

import useAuth from "../hooks/useAuth";


function Navbar() {
    const navigate =
        useNavigate();

    const [
        isMenuOpen,
        setIsMenuOpen,
    ] = useState(false);

    const {
        user,
        isAuthenticated,
        isLoading,
        logout,
    } = useAuth();


    const getNavLinkClass =
        ({
            isActive,
        }) =>
            isActive
                ? "nav-link active"
                : "nav-link";


    const closeMenu = () => {
        setIsMenuOpen(false);
    };


    const toggleMenu = () => {
        setIsMenuOpen(
            (current) =>
                !current
        );
    };


    const handleLogout = () => {
        closeMenu();

        logout();

        navigate("/");
    };


    useEffect(() => {
        if (!isMenuOpen) {
            return undefined;
        }


        const handleKeyDown = (
            event
        ) => {
            if (
                event.key ===
                "Escape"
            ) {
                setIsMenuOpen(
                    false
                );
            }
        };


        const handleResize = () => {
            if (
                window.innerWidth >
                860
            ) {
                setIsMenuOpen(
                    false
                );
            }
        };


        document.body.classList.add(
            "mobile-nav-open"
        );

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        window.addEventListener(
            "resize",
            handleResize
        );


        return () => {
            document.body.classList.remove(
                "mobile-nav-open"
            );

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

            window.removeEventListener(
                "resize",
                handleResize
            );
        };
    }, [isMenuOpen]);


    return (
        <header className="navbar">
            {isMenuOpen && (
                <button
                    type="button"
                    className="navbar-backdrop"
                    aria-label="Navigasyon menüsünü kapat"
                    onClick={
                        closeMenu
                    }
                />
            )}

            <div className="navbar-container">
                <NavLink
                    to="/"
                    className="brand"
                    aria-label="MovieShelf ana sayfa"
                    onClick={
                        closeMenu
                    }
                >
                    <span>
                        Movie
                    </span>

                    <span className="brand-accent">
                        Shelf
                    </span>
                </NavLink>

                <button
                    type="button"
                    className={
                        isMenuOpen
                            ? "nav-menu-button open"
                            : "nav-menu-button"
                    }
                    aria-label={
                        isMenuOpen
                            ? "Navigasyon menüsünü kapat"
                            : "Navigasyon menüsünü aç"
                    }
                    aria-expanded={
                        isMenuOpen
                    }
                    aria-controls="primary-navigation"
                    onClick={
                        toggleMenu
                    }
                >
                    <span />
                    <span />
                    <span />
                </button>

                <nav
                    id="primary-navigation"
                    className={
                        isMenuOpen
                            ? "nav-links open"
                            : "nav-links"
                    }
                    aria-label="Ana navigasyon"
                >
                    <NavLink
                        to="/"
                        end
                        className={
                            getNavLinkClass
                        }
                        onClick={
                            closeMenu
                        }
                    >
                        Ana Sayfa
                    </NavLink>

                    {!isLoading &&
                        isAuthenticated && (
                            <>
                                <NavLink
                                    to="/favorites"
                                    className={
                                        getNavLinkClass
                                    }
                                    onClick={
                                        closeMenu
                                    }
                                >
                                    Favoriler
                                </NavLink>

                                <NavLink
                                    to="/watchlist"
                                    className={
                                        getNavLinkClass
                                    }
                                    onClick={
                                        closeMenu
                                    }
                                >
                                    İzleme Listesi
                                </NavLink>

                                <NavLink
                                    to="/profile"
                                    className={( {
                                        isActive,
                                    } ) =>
                                        isActive
                                            ? "nav-link nav-user-link active"
                                            : "nav-link nav-user-link"
                                    }
                                    onClick={
                                        closeMenu
                                    }
                                    title={
                                        user?.name ||
                                        "Profil"
                                    }
                                >
                                    <span className="nav-profile-label">
                                        Profil
                                    </span>

                                    <span className="nav-profile-name">
                                        {user?.name ||
                                            "Profil"}
                                    </span>
                                </NavLink>

                                <div
                                    className="nav-divider"
                                    aria-hidden="true"
                                />

                                <button
                                    type="button"
                                    className="nav-link logout-button"
                                    onClick={
                                        handleLogout
                                    }
                                >
                                    Çıkış Yap
                                </button>
                            </>
                        )}

                    {!isLoading &&
                        !isAuthenticated && (
                            <>
                                <NavLink
                                    to="/login"
                                    className={
                                        getNavLinkClass
                                    }
                                    onClick={
                                        closeMenu
                                    }
                                >
                                    Giriş Yap
                                </NavLink>

                                <NavLink
                                    to="/register"
                                    className={( {
                                        isActive,
                                    } ) =>
                                        isActive
                                            ? "nav-link nav-link-primary active"
                                            : "nav-link nav-link-primary"
                                    }
                                    onClick={
                                        closeMenu
                                    }
                                >
                                    Kayıt Ol
                                </NavLink>
                            </>
                        )}
                </nav>
            </div>
        </header>
    );
}


export default Navbar;