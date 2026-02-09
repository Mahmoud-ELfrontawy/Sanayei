import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar/Sidebar";
import "./DashboardLayout.css";

function DashboardLayout() {
    return (
        <div className="dashboard-container">
            <Sidebar />
            <main className="dashboard-content">
                <div className="dashboard-inner-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;