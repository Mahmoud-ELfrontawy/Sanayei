import React from "react";

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileTabs: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "about", label: "عن الصنايعي" },
    { id: "services", label: "الخدمات" },
    { id: "reviews", label: "أراء العملاء" },
    { id: "portfolio", label: "معرض الأعمال" },
  ];

  return (
    <div className="profile-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;