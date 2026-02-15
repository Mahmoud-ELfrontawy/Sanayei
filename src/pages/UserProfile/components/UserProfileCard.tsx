import React from "react";
import { type UserProfile } from "../../../Api/user/profile.api";
import { FaUser, FaPhoneAlt, FaEnvelope, FaUserEdit } from "react-icons/fa";
import { getFullImageUrl } from "../../../utils/imageUrl";
import Button from "../../../components/ui/Button/Button";

interface Props {
    user: UserProfile;
    isOwnProfile?: boolean;
}

const UserProfileCard: React.FC<Props> = ({ user, isOwnProfile }) => {
    const avatarUrl = user.profile_image_url ? getFullImageUrl(user.profile_image_url) : null;

    return (
        <div className="craftsman-card">
            {/* Top link removed */}

            <div className="craftsman-img-wrapper">
                {avatarUrl ? (
                    <img src={avatarUrl} alt={user.name} className="craftsman-img" />
                ) : (
                    <div className="craftsman-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                        <FaUser size={60} color="#ccc" />
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
                    <FaPhoneAlt size={16} color="#5FA8D3" />
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
                    <FaEnvelope size={16} color="#5FA8D3" />
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
                <div className="card-actions" style={{ marginTop: '15px' }}>
                    <Button
                        to="/user/profile/edit"
                        variant="outline"
                        className="w-100 btn-sm"
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            <FaUserEdit size={18} />
                            تعديل بياناتي
                        </span>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UserProfileCard;