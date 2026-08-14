import {
    NavLink,
} from "react-router";


function Navbar() {
    return (
        <header className="navbar">
            <div className="navbar-container">
                <NavLink
                    to="/"
                    className="brand"
                >
                    MovieShelf
                </NavLink>

                <nav className="nav-links">
                    <NavLink
                        to="/"
                        className={({
                            isActive,
                        }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        Home
                    </NavLink>

                    <NavLink
                        to="/login"
                        className={({
                            isActive,
                        }) =>
                            isActive
                                ? "nav-link active"
                                : "nav-link"
                        }
                    >
                        Login
                    </NavLink>

                    <NavLink
                        to="/register"
                        className={({
                            isActive,
                        }) =>
                            isActive
                                ? "nav-link nav-link-primary active"
                                : "nav-link nav-link-primary"
                        }
                    >
                        Register
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}


export default Navbar;