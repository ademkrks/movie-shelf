import { Outlet } from "react-router";

import Navbar from "../components/Navbar";


function MainLayout() {
    return (
        <div className="app-shell">
            <Navbar />

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}


export default MainLayout;