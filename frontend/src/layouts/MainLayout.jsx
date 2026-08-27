import {
    Outlet,
} from "react-router";

import Navbar from "../components/Navbar";


function MainLayout() {
    return (
        <div className="app-shell">
            <a
                href="#main-content"
                className="skip-link"
            >
                İçeriğe geç
            </a>

            <Navbar />

            <main
                id="main-content"
                className="main-content"
            >
                <Outlet />
            </main>
        </div>
    );
}


export default MainLayout;