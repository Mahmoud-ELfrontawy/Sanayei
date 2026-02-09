import { useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import defaultAvatar from "../../../assets/images/avatar1.jfif";
import MapPicker from "../../../components/MapPicker";
import "./Profile.css";
import { FaCamera } from "react-icons/fa6";

export interface BaseProfileData {
    name: string;
    email: string;
    phone: string;
    birth_date?: string;
    gender?: "male" | "female";
    identity_number?: string;
    latitude?: number;
    longitude?: number;
    avatar?: string;
}

export interface CraftsmanExtraData {
    description?: string;
    experience_years?: string | number;
    price_range?: string;
    work_days?: string[];
    work_hours?: string;
}

interface Props<T extends BaseProfileData> {
    data: T & Partial<CraftsmanExtraData>;
    setData: React.Dispatch<React.SetStateAction<T & Partial<CraftsmanExtraData>>>;
    imageFile: File | null;
    setImageFile: (file: File | null) => void;
    onSave: () => void;
    onDelete: () => void;
    loading?: boolean;
    isCraftsman?: boolean;
}

const ProfileFormBase = <T extends BaseProfileData>({
    data, setData, imageFile, setImageFile, onSave, onDelete, loading, isCraftsman = false
}: Props<T>) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const avatarSrc = imageFile ? URL.createObjectURL(imageFile) : data.avatar || defaultAvatar;

    const toggleWorkDay = (day: string) => {
        const days = data.work_days || [];
        setData({ ...data, work_days: days.includes(day) ? days.filter(d => d !== day) : [...days, day] });
    };

    return (
        <div>
            {/* Profile Image Section - Styled like the snippet */}
            <div
                style={{
                    backgroundColor: "#f9fafb",
                    padding: "1.5rem",
                    borderRadius: "0.75rem",
                    marginBottom: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                }}
            >


                {/* الحاوي بتاع الصورة */}
                <div style={{ position: "relative", cursor: "pointer" }}>
                    {/* input مخفي */}
                    <input
                        type="file"
                        id="profile-upload"
                        hidden
                        accept="image/*"
                        onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                    />

                    {/* الصورة نفسها تبقى label */}
                    {avatarSrc && (
                        <label htmlFor="profile-upload" style={{ display: "block" }}>
                            <img
                                src={avatarSrc}
                                alt="Profile"
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "3px solid #e5e7eb",
                                    transition: "0.2s",
                                }}
                            />
                        </label>
                    )}

                    {/* أيقونة الكاميرا */}
                    <label
                        htmlFor="profile-upload"
                        style={{
                            position: "absolute",
                            bottom: "0",
                            left: "0",
                            transform: "translate(-10%, 10%)",
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "#5FA8D3",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            cursor: "pointer",
                        }}
                    >
                        <FaCamera size={14} />
                    </label>
                </div>
            </div>

            <div className="section-header">
                <h3 className="section-title text-center">البيانات الأساسية</h3>
            </div>

            <div className="form-grid">
                <Input value={data.name} placeholder="الاسم بالكامل" onChange={v => setData({ ...data, name: v })} />
                <Input value={data.phone} placeholder="رقم الهاتف" ltr onChange={v => setData({ ...data, phone: v })} />
                <ReadOnlyInput value={data.email} />
                <Input value={data.birth_date || ""} placeholder="تاريخ الميلاد" type="date" onChange={v => setData({ ...data, birth_date: v })} />
                {!isCraftsman && (
                    <div className="form-group">
                        <div className="gender-group">
                            <button type="button" className={`gender-btn ${data.gender === "male" ? "active" : ""}`} onClick={() => setData({ ...data, gender: "male" })}>ذكر</button>
                            <button type="button" className={`gender-btn ${data.gender === "female" ? "active" : ""}`} onClick={() => setData({ ...data, gender: "female" })}>أنثى</button>
                        </div>
                    </div>
                )}
                {/* <Input value={data.identity_number || ""} placeholder="رقم الهوية" onChange={v => setData({ ...data, identity_number: v })} /> */}
            </div>

            {isCraftsman && (
                <>
                    <h3 className="section-title2">بيانات الشغل</h3>
                    <div className="form-grid">
                        <Input value={data.identity_number || ""} placeholder="رقم الهوية" onChange={v => setData({ ...data, identity_number: v })} />
                        <Input value={data.description || ""} placeholder="نبذة عنك" onChange={v => setData({ ...data, description: v })} />
                        <Input value={String(data.experience_years || "")} placeholder="سنوات الخبرة" onChange={v => setData({ ...data, experience_years: v })} />
                        <Input value={data.price_range || ""} placeholder="نطاق الأسعار" onChange={v => setData({ ...data, price_range: v })} />
                        <div className="work-days-section">
                            <h4 className="work-days-title">أيام العمل</h4>

                            <div className="work-days">
                                {["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map(day => (
                                    <label key={day} className="work-day-item">
                                        <input
                                            type="checkbox"
                                            checked={data.work_days?.includes(day) || false}
                                            onChange={() => toggleWorkDay(day)}
                                        />
                                        {day}
                                    </label>
                                ))}
                            </div>
                        </div>

                    </div>
                </>
            )}

            <div className="location-section">
                <div className="location-header"><span>الموقع الحالي</span><FaMapMarkerAlt /></div>
                <div className="map-container">
                    <MapPicker latitude={data.latitude || 30.0444} longitude={data.longitude || 31.2357} onChange={(lat, lng) => setData({ ...data, latitude: lat, longitude: lng })} />
                </div>
            </div>

            <div className="footer-action footer-action--danger">
                <button className="save-btn" disabled={loading} onClick={onSave}>{loading ? "جاري الحفظ..." : "حفظ التعديلات"}</button>
                <button className="delete-btn" onClick={() => setShowDeleteConfirm(true)}>حذف الحساب</button>
            </div>

            {showDeleteConfirm && (
                <div className="confirm-overlay">
                    <div className="confirm-modal">
                        <h3>⚠️ تأكيد حذف الحساب</h3>
                        <p>هذا الإجراء لا يمكن التراجع عنه</p>
                        <div className="confirm-actions">
                            <button onClick={() => setShowDeleteConfirm(false)}>إلغاء</button>
                            <button className="confirm-delete" onClick={onDelete}>نعم، احذف</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileFormBase;

const Input = ({ value, onChange, placeholder, ltr, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; ltr?: boolean; type?: string }) => (
    <div className="form-group">
        <div className="input-line">
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                className={`custom-input ${ltr ? "ltr-text" : ""}`}
            />
            <MdEdit size={16} />
        </div>
    </div>
);

const ReadOnlyInput = ({ value }: { value?: string }) => (
    <div className="form-group">
        <input value={value} readOnly className="custom-input ltr-text" />
    </div>
);
