import React from "react";
import { type UserProfile } from "../../../Api/user/profile.api";
import { User, Phone, Mail } from "lucide-react";
import { getFullImageUrl } from "../../../utils/imageUrl";
import { Link } from "react-router-dom";
import Button from "../../../components/ui/Button/Button";

interface Props {
    user: UserProfile;
    isOwnProfile?: boolean;
}

const UserProfileCard: React.FC<Props> = ({ user, isOwnProfile }) => {
    const avatarUrl = user.profile_image_url ? getFullImageUrl(user.profile_image_url) : null;

    return (
        <div className="craftsman-card">
            {isOwnProfile && (
                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                    <Link
                        to="/user/profile/edit"
                        style={{
                            color: "#5FA8D3",
                            textDecoration: "none",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                        }}
                    >
                        تعديل بيانات الملف الشخصي
                    </Link>
                </div>
            )}

            <div className="craftsman-img-wrapper">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={user.name} className="craftsman-img" />
                ) : (
                    <div className="craftsman-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                        <User size={60} color="#ccc" />
                    </div>
                )}
            </div>

            <h2 className="craftsman-name">{user.name}</h2>
            <p className="craftsman-job">عميل منصة صنايعي</p>

            <div className="card-actions" style={{ marginTop: '20px' }}>
                <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'center',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.95rem',
                    marginBottom: '8px'
                }}>
                    <Phone size={16} color="#5FA8D3" />
                    <span>{user.phone}</span>
                </div>
                <div className="info-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    justifyContent: 'center',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.95rem'
                }}>
                    <Mail size={16} color="#5FA8D3" />
                    <span>{user.email}</span>
                </div>
            </div>

            {!isOwnProfile ? (
                <div className="card-actions" style={{ marginTop: '25px' }}>
                    <Button
                        to="/dashboard/messages"
                        variant="primary"
                        state={{
                            contact: {
                                id: user.id,
                                name: user.name,
                                avatar: user.profile_image_url,
                                type: "user",
                            },
                        }}
                    >
                        إرسال رسالة
                    </Button>
                </div>
            ) : (
                <div
                    className="own-profile-badge"
                    style={{ color: "#777", fontSize: "0.9rem", marginTop: '20px' }}
                >
                    مرحباً بك في ملفك الشخصي
                </div>
            )}
        </div>
    );
};

export default UserProfileCard;
