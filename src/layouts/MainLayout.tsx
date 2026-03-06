import { Outlet } from "react-router-dom";
import Header from "../components/common/Header/Header";
import Footer from "../components/common/Footer/Footer";
import BottomNavbar from "../components/common/BottomNavbar/BottomNavbar";

const MainLayout: React.FC = () => {
    return (
        <>
            <Header />
            <main>
                <Outlet />
            </main>
            <Footer />
            <BottomNavbar />
        </>
    );
};

export default MainLayout;