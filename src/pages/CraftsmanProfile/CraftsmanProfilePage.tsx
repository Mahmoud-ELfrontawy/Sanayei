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

import ProfileSkeleton from "./components/ProfileSkeleton";

const CraftsmanProfilePage: React.FC = () => {
  const { craftsman, loading, error, activeTab, setActiveTab, isOwnProfile } =
    useCraftsmanProfile();

  if (loading) {
    return <ProfileSkeleton />;
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
      <div
        className="profile-cover"
        style={{
          backgroundColor: "var(--color-primary)",
          opacity: 0.8,
          background: "linear-gradient(45deg, #4A5D6E, #5FA8D3)"
        }}
      ></div>

      <div className="profile-container">
        {/* 2. الكارت الجانبي */}
        <aside className="profile-sidebar">
          <ProfileCard craftsman={craftsman} isOwnProfile={isOwnProfile} />
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
