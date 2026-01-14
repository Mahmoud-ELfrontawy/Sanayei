import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import ServicesPage from "../pages/Services/ServicesPage";
import JoinPage from "../pages/Join/JoinPage";
import ContactPage from "../pages/Contact/ContactPage";


const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/join" element={<JoinPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;
