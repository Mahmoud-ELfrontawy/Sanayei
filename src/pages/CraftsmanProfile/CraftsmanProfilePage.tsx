import React from "react";
import { useCraftsmanProfile } from "./useCraftsmanProfile";

// Components
import ProfileCard from "./components/ProfileCard";
import ProfileTabs from "./components/ProfileTabs";
import AboutTab from "./components/tabs/AboutTab";
import ServicesTab from "./components/tabs/ServicesTab";
import ReviewsTab from "./components/tabs/ReviewsTab";
import PortfolioTab from "./components/tabs/PortfolioTab";

// Styles
import "./CraftsmanProfile.css";

const CraftsmanProfilePage: React.FC = () => {
  const { craftsman, loading, error, activeTab, setActiveTab } =
    useCraftsmanProfile();

  if (loading) {
    return (
      <div
        className="profile-page-wrapper"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        جاري التحميل...
      </div>
    );
  }

  if (error || !craftsman) {
    return (
      <div
        className="profile-page-wrapper"
        style={{ textAlign: "center", padding: "50px" }}
      >
        {error || "لم يتم العثور على الصنايعي"}
      </div>
    );
  }

  // دالة لتحديد المحتوى بناءً على التبويب
  const renderContent = () => {
    switch (activeTab) {
      case "about":
        return <AboutTab data={craftsman} />;
      case "services":
        return <ServicesTab services={craftsman.services} />;
      case "reviews":
        return <ReviewsTab reviews={craftsman.reviews} />;
      case "portfolio":
        return <PortfolioTab portfolio={craftsman.portfolio} />;
      default:
        return <AboutTab data={craftsman} />;
    }
  };

  return (
    <div className="profile-page-wrapper">
      {/* 1. صورة الغلاف */}
      <div
        className="profile-cover"
        style={{
          backgroundImage: `url(${craftsman.coverUrl})`,
        }}
      ></div>

      <div className="profile-container">
        {/* 2. الكارت الجانبي */}
        <aside className="profile-sidebar">
          <ProfileCard craftsman={craftsman} />
        </aside>

        {/* 3. منطقة المحتوى */}
        <main className="profile-content-area">
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="tab-content-wrapper">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default CraftsmanProfilePage;
