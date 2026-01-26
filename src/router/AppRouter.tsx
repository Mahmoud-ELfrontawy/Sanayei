import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { useEffect } from "react";

import MainLayout from "../layouts/MainLayout";

import Home from "../pages/Home";
import ServicesPage from "../pages/Services/ServicesPage";
import JoinPage from "../pages/Join/JoinPage";
import ContactPage from "../pages/Contact/ContactPage";

import LoginPage from "../pages/Auth/Login/LoginPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPassword/ForgotPasswordPage";
import ResetPasswordPage from "../pages/Auth/ResetPassword/ResetPasswordPage";
import RegisterPage from "../pages/Auth/Register/RegisterPage";
import GoogleCallback from "../pages/Auth/google-callback/GoogleCallback";
import EditProfilePagee from "../pages/Profile/ProfileMe/ProfileMe";
import ProfileMe from "../pages/Profile/ProfileMe/ProfileMe";
import ProfileReviews from "../pages/Profile/Reviews/ProfileReviews";
import EditProfileLayout from "../layouts/EditProfileLayout";
import ChooseSanayPage from "../pages/Technicians/ChooseSanayPage";
import MyOrdersPage from "../pages/Orders/MyOrdersPage";
import RequestServiceSection from "../pages/Home/sections/RequestServiceSection/RequestServiceSection";
import RegisterWorkerPage from "../pages/Auth/Worker/Register/RegisterWorkerPage";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* صفحة استقبال Google Token */}
        <Route path="/google-callback" element={<GoogleCallback />} />

        {/* ===== Main Layout ===== */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/choose" element={<ChooseSanayPage />} />
          <Route path="/orders" element={<MyOrdersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/profile" element={<EditProfilePagee />} />
          <Route path="/request-service" element={<RequestServiceSection />} />

          {/* ===== Auth Pages ===== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-worker" element={<RegisterWorkerPage />} />

          {/* ===== Profile Pages ===== */}
          <Route path="/profile" element={<EditProfileLayout />}>
            <Route index element={<ProfileMe />} />
            <Route path="reviews" element={<ProfileReviews />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
