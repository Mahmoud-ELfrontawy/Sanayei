import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import { AdminNotificationProvider } from "../context/AdminNotificationContext";

// Lazy load pages for better performance
const ServicesPage = lazy(() => import("../pages/Services/ServicesPage"));
const JoinPage = lazy(() => import("../pages/Join/JoinPage"));
const ContactPage = lazy(() => import("../pages/Contact/ContactPage"));
const AboutUs = lazy(() => import("../pages/AboutUs/AboutUs"));
const HowItWorks = lazy(() => import("../pages/HowItWorks/HowItWorks"));
const JoinUs = lazy(() => import("../pages/JoinUs/JoinUs"));
const PrivacyPolicy = lazy(() => import("../pages/Legal/PrivacyPolicy"));
const TermsOfUse = lazy(() => import("../pages/Legal/TermsOfUse"));

const LoginPage = lazy(() => import("../pages/Auth/Login/LoginPage"));
const ForgotPasswordPage = lazy(() => import("../pages/Auth/ForgotPassword/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../pages/Auth/ResetPassword/ResetPasswordPage"));
const RegisterPage = lazy(() => import("../pages/Auth/Register/RegisterPage"));
const GoogleCallback = lazy(() => import("../pages/Auth/google-callback/GoogleCallback"));
const ProfileMe = lazy(() => import("../pages/Profile/ProfileUser/ProfileMe"));
const ProfileWorker = lazy(() => import("../pages/Profile/ProfileWorker/Dashboard/ProfileWorker"));
const ProfileReviews = lazy(() => import("../pages/Profile/Reviews/ProfileReviews"));
const EditProfileLayout = lazy(() => import("../layouts/EditProfileLayout"));
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const Store = lazy(() => import("../pages/Store/Store"));
const MyOrdersPage = lazy(() => import("../pages/Orders/MyOrdersPage"));
const RequestServiceSection = lazy(() => import("../pages/Home/sections/RequestServiceSection/RequestServiceSection"));
const RegisterWorkerPage = lazy(() => import("../pages/Auth/Worker/Register/RegisterWorkerPage"));
const RegisterCompanyPage = lazy(() => import("../pages/Auth/Company/Register/RegisterCompanyPage"));

const CraftsmanDashboardReviews = lazy(() => import("../pages/Dashboard/Craftsman/CraftsmanDashboardReviews"));
const CraftsmanDashboard = lazy(() => import("../pages/Dashboard/Craftsman/CraftsmanDashboard"));
const CraftsmanStatistics = lazy(() => import("../pages/Dashboard/Craftsman/CraftsmanStatistics"));
const CompanyDashboard = lazy(() => import("../pages/Dashboard/Company/CompanyDashboard"));
const CompanyProfilePage = lazy(() => import("../pages/Dashboard/Company/Profile/CompanyProfilePage"));
const ProductsManager = lazy(() => import("../pages/Dashboard/Company/Products/ProductsManager"));
const OrdersTracking = lazy(() => import("../pages/Dashboard/Company/Orders/OrdersTracking"));
const StoreGalleryPage = lazy(() => import("../pages/Store/StoreGalleryPage"));
const StoreOrdersPage = lazy(() => import("../pages/Store/StoreOrdersPage"));
const DashboardIndex = lazy(() => import("../pages/Dashboard/DashboardIndex"));
const MessagesPage = lazy(() => import("../pages/Dashboard/Messages/MessagesPage"));
const NotificationsPage = lazy(() => import("../pages/Dashboard/Notifications/NotificationsPage"));
const WalletPage = lazy(() => import("../pages/Dashboard/Wallet/WalletPage"));
const CraftsmanProfilePage = lazy(() => import("../pages/CraftsmanProfile/CraftsmanProfilePage"));
const UserProfilePage = lazy(() => import("../pages/UserProfile/UserProfilePage"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const AdminStatistics = lazy(() => import("../pages/Admin/AdminStatistics"));
const UsersPage = lazy(() => import("../pages/Admin/Users/UsersPage"));
const CraftsmenPage = lazy(() => import("../pages/Admin/Craftsmen/CraftsmenPage"));
const AdminServicesPage = lazy(() => import("../pages/Admin/Services/ServicesPage"));
const GovernoratesPage = lazy(() => import("../pages/Admin/Governorates/GovernoratesPage"));
const AdminCategoriesPage = lazy(() => import("../pages/Admin/Categories/CategoriesPage"));
const ServiceRequestsPage = lazy(() => import("../pages/Admin/ServiceRequests/ServiceRequestsPage"));
const ReviewsPage = lazy(() => import("../pages/Admin/Reviews/ReviewsPage"));
const AdminCompaniesPage = lazy(() => import("../pages/Admin/Companies/CompaniesPage"));
const ProductsPage = lazy(() => import("../pages/Admin/Products/ProductsPage"));

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.25rem',
    color: '#3498db',
    background: '#f8f9fa'
  }}>
    <div className="animate-pulse">جاري التحميل...</div>
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/auth/callback" element={<GoogleCallback />} />

          {/* ===== Admin Routes ===== */}
          <Route
            path="/admin"
            element={
              <AdminNotificationProvider>
                <AdminLayout />
              </AdminNotificationProvider>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="statistics" element={<AdminStatistics />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="craftsmen" element={<CraftsmenPage />} />
            <Route path="companies" element={<AdminCompaniesPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="governorates" element={<GovernoratesPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="requests" element={<ServiceRequestsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="products" element={<ProductsPage />} />
          </Route>

          {/* ===== Main Layout ===== */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/store" element={<Store />} />
            <Route path="/store-orders" element={<StoreOrdersPage />} />
            <Route path="/orders" element={<MyOrdersPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/join-us" element={<JoinUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/profile" element={<ProfileMe />} />
            <Route path="/request-service" element={<RequestServiceSection />} />
            <Route path="/craftsman/:id" element={<CraftsmanProfilePage />} />
            <Route path="/user/:id" element={<UserProfilePage />} />

            {/* ===== Auth Pages ===== */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-worker" element={<RegisterWorkerPage />} />
            <Route path="/register-company" element={<RegisterCompanyPage />} />

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
              <Route path="craftsman">
                <Route index element={<CraftsmanDashboard />} />
                <Route path="statistics" element={<CraftsmanStatistics />} />
              </Route>
              <Route path="company">
                <Route index element={<CompanyDashboard />} />
                <Route path="profile" element={<CompanyProfilePage />} />
                <Route path="products" element={<ProductsManager />} />
                <Route path="orders" element={<OrdersTracking />} />
              </Route>
              <Route path="messages" element={<MessagesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="store" element={<StoreGalleryPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
