import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getMyProfile, getUserProfileById, type UserProfile } from "../../Api/user/profile.api";
import UserProfileCard from "./components/UserProfileCard";
import ProfileSkeleton from "../CraftsmanProfile/components/ProfileSkeleton";
import { useAuth } from "../../hooks/useAuth";
import "../CraftsmanProfile/CraftsmanProfile.css";
import { Info, MessageSquare } from "lucide-react";
import { toUiDate } from "../../utils/dateApiHelper";

const UserProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { user: authUser } = useAuth();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("about");

    // Helper to format date for display (DD/MM/YYYY)
    const formatDisplayDate = (dateStr?: string | null) => {
        if (!dateStr) return "";
        const uiDate = toUiDate(dateStr); // Returns YYYY-MM-DD
        if (!uiDate) return dateStr;
        const [y, m, d] = uiDate.split("-");
        return `${d}/${m}/${y}`;
    };

    // If no ID is provided, we assume it's the own profile
    const isOwnProfile = !id || (authUser && Number(id) === authUser.id);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                setLoading(true);
                let res;
                if (isOwnProfile) {
                    res = await getMyProfile();
                } else {
                    res = await getUserProfileById(id!);
                }

                setUser(res.data || res);
                setError(null);
            } catch (err) {
                console.error("Error fetching user profile:", err);
                setError("حدث خطأ أثناء تحميل بيانات المستخدم");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, isOwnProfile]);

    if (loading) return <ProfileSkeleton />;

    if (error || !user) {
        return (
            <div className="profile-page-wrapper" style={{ textAlign: "center", padding: "50px" }}>
                <p>{error || "لم يتم العثور على المستخدم"}</p>
            </div>
        );
    }

    return (
        <div className="profile-page-wrapper">
            {/* 1. صورة الغلاف */}
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
                    <UserProfileCard user={user} isOwnProfile={!!isOwnProfile} />
                </aside>

                {/* 3. منطقة المحتوى */}
                <main className="profile-content-area">
                    <div className="profile-tabs">
                        <button
                            className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
                            onClick={() => setActiveTab("about")}
                        >
                            عني
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "interactions" ? "active" : ""}`}
                            onClick={() => setActiveTab("interactions")}
                        >
                            النشاطات
                        </button>
                    </div>

                    <div className="tab-content-wrapper">
                        {activeTab === "about" ? (
                            <div className="fade-enter">
                                <div className="info-section">
                                    <h3 className="info-title">
                                        <Info size={22} />
                                        معلومات الحساب
                                    </h3>
                                    <div className="description-text">
                                        هذا المستخدم عضو في منصة صنايعي. تم التحقق من رقم الهاتف والبريد الإلكتروني لضمان أمان التعاملات.
                                    </div>
                                </div>

                                <div className="info-section">
                                    <h3 className="info-title">
                                        <Info size={22} />
                                        البيانات الإضافية
                                    </h3>
                                    <ul className="info-list">
                                        {user.birth_date && (
                                            <li>تاريخ الميلاد: {formatDisplayDate(user.birth_date)}</li>
                                        )}
                                        {user.gender && (
                                            <li>الجنس: {user.gender === 'male' ? 'ذكر' : 'أنثى'}</li>
                                        )}
                                        <li>عضو منذ: {new Date().getFullYear()}</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="fade-enter">
                                <div className="info-section" style={{ textAlign: 'center', padding: '40px' }}>
                                    <MessageSquare size={48} color="#ccc" style={{ marginBottom: '20px' }} />
                                    <p style={{ color: '#888', fontSize: '1.1rem' }}>لا توجد نشاطات عامة لعرضها حالياً</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserProfilePage;
