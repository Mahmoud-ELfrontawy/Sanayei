import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import ServicesPage from "../pages/Services/ServicesPage";
<<<<<<< HEAD
import JoinPage from "../pages/Join/JoinPage";
=======
import ContactPage from "../pages/Contact/ContactPage";
>>>>>>> a44273d8f935d04f0c42e4a0f8f0bd0a7124ce10

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
