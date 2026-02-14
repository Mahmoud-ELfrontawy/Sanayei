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
import EditProfilePagee from "../pages/Profile/ProfileUser/ProfileMe";
import ProfileMe from "../pages/Profile/ProfileUser/ProfileMe";
import ProfileWorker from "../pages/Profile/ProfileWorker/Dashboard/ProfileWorker";
import ProfileReviews from "../pages/Profile/Reviews/ProfileReviews";
import EditProfileLayout from "../layouts/EditProfileLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ChooseSanayPage from "../pages/Technicians/ChooseSanayPage";
import MyOrdersPage from "../pages/Orders/MyOrdersPage";
import RequestServiceSection from "../pages/Home/sections/RequestServiceSection/RequestServiceSection";
import RegisterWorkerPage from "../pages/Auth/Worker/Register/RegisterWorkerPage";

// Dashboards
import CraftsmanDashboardReviews from "../pages/Dashboard/Craftsman/CraftsmanDashboardReviews";
// import UserDashboard from "../pages/Dashboard/User/UserDashboard";
import CraftsmanDashboard from "../pages/Dashboard/Craftsman/CraftsmanDashboard";
import CompanyDashboard from "../pages/Dashboard/Company/CompanyDashboard";
import DashboardIndex from "../pages/Dashboard/DashboardIndex";
import MessagesPage from "../pages/Dashboard/Messages/MessagesPage";
import NotificationsPage from "../pages/Dashboard/Notifications/NotificationsPage";
import CraftsmanProfilePage from "../pages/CraftsmanProfile/CraftsmanProfilePage";
import UserProfilePage from "../pages/UserProfile/UserProfilePage";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import UsersPage from "../pages/Admin/Users/UsersPage";
import CraftsmenPage from "../pages/Admin/Craftsmen/CraftsmenPage";
import AdminServicesPage from "../pages/Admin/Services/ServicesPage";
import GovernoratesPage from "../pages/Admin/Governorates/GovernoratesPage";
import ServiceRequestsPage from "../pages/Admin/ServiceRequests/ServiceRequestsPage";
import ReviewsPage from "../pages/Admin/Reviews/ReviewsPage";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* صفحة استقبال Google Token */}
        <Route path="/google-callback" element={<GoogleCallback />} />

        {/* ===== Admin Routes ===== */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="craftsmen" element={<CraftsmenPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="governorates" element={<GovernoratesPage />} />
          <Route path="requests" element={<ServiceRequestsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          {/* Add more admin routes here later */}
        </Route>

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
          <Route path="/craftsman/:id" element={<CraftsmanProfilePage />} />
          <Route path="/user/:id" element={<UserProfilePage />} />

          {/* ===== Auth Pages ===== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-worker" element={<RegisterWorkerPage />} />

          {/* ===== User Profile ===== */}
          <Route path="/user/profile">
            <Route index element={<UserProfilePage />} />
            <Route element={<EditProfileLayout />}>
              <Route path="edit" element={<ProfileMe />} />
              <Route path="reviews" element={<ProfileReviews />} />
            </Route>
          </Route>

          {/* ===== Craftsman Profile ===== */}
          <Route path="/craftsman/profile">
            <Route index element={<CraftsmanProfilePage />} />
            <Route element={<EditProfileLayout />}>
              <Route path="edit" element={<ProfileWorker />} />
              <Route path="reviews" element={<CraftsmanDashboardReviews />} />
            </Route>
          </Route>

          {/* ===== Dashboards ===== */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardIndex />} />
            <Route path="craftsman" element={<CraftsmanDashboard />} />
            <Route path="company" element={<CompanyDashboard />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
