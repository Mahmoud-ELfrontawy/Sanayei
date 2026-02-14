import { useState } from "react";
import { getFullImageUrl } from "../../../utils/imageUrl";
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
    address?: string;
    governorate_id?: string | number;
    description?: string;
    experience_years?: string | number;
    price_range?: string;
    work_days?: string[];
    work_hours?: string;
    work_photos?: (string | File)[];
    new_work_photos?: File[];
    delete_work_photos?: string[];
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
    governorates?: { id: number; name: string }[];
}

const ProfileFormBase = <T extends BaseProfileData>({
    data, setData, imageFile, setImageFile, onSave, onDelete, loading, isCraftsman = false, governorates
}: Props<T>) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const avatarSrc = imageFile ? URL.createObjectURL(imageFile) : data.avatar || defaultAvatar;

    const toggleWorkDay = (day: string) => {
        const days = data.work_days || [];
        setData({ ...data, work_days: days.includes(day) ? days.filter(d => d !== day) : [...days, day] });
    };

    return (
        <div className="profile-form-container">
            {/* Profile Image Card */}
            <div className="profile-card avatar-card">
                <div className="avatar-upload-wrapper">
                    <input
                        type="file"
                        id="profile-upload"
                        hidden
                        accept="image/*"
                        onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
                    />

                    <label htmlFor="profile-upload" className="avatar-label">
                        <img
                            src={avatarSrc}
                            alt="Profile"
                            className="profile-preview-img"
                        />
                        <div className="camera-icon-badge">
                            <FaCamera size={16} />
                        </div>
                    </label>
                </div>
                <div className="avatar-info">
                    <h3>{data.name || "مستخدم جديد"}</h3>
                    <p>{data.email}</p>
                </div>
            </div>

            {/* Basic Info Card */}
            <div className="profile-card">
                <div className="card-header">
                    <h3 className="card-title">البيانات الأساسية</h3>
                </div>
                <div className="form-grid">
                    <Input value={data.name} placeholder="الاسم بالكامل" onChange={v => setData({ ...data, name: v })} />
                    <Input value={data.phone} placeholder="رقم الهاتف" ltr onChange={v => setData({ ...data, phone: v })} />
                    <ReadOnlyInput value={data.email} />
                    <Input value={data.birth_date || ""} placeholder="تاريخ الميلاد" type="date" onChange={v => setData({ ...data, birth_date: v })} />
                    {!isCraftsman && (
                        <div className="form-group">
                            <label className="input-label">الجنس</label>
                            <div className="gender-group">
                                <button type="button" className={`gender-btn ${data.gender === "male" ? "active" : ""}`} onClick={() => setData({ ...data, gender: "male" })}>ذكر</button>
                                <button type="button" className={`gender-btn ${data.gender === "female" ? "active" : ""}`} onClick={() => setData({ ...data, gender: "female" })}>أنثى</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isCraftsman && (
                <div className="profile-card">
                    <div className="card-header">
                        <h3 className="card-title">بيانات الشغل والموقع</h3>
                    </div>
                    <div className="form-grid">
                        <Input value={data.identity_number || ""} placeholder="رقم الهوية" onChange={v => setData({ ...data, identity_number: v })} />

                        {/* اختيار المحافظة */}
                        {governorates && (
                            <div className="form-group">
                                
                                <div className="input-line">
                                    <select
                                        value={data.governorate_id || ""}
                                        onChange={(e) => setData({ ...data, governorate_id: e.target.value })}
                                        className="custom-input select-input"
                                    >
                                        <option value="">اختر المحافظة</option>
                                        {governorates.map(gov => (
                                            <option key={gov.id} value={gov.id}>{gov.name}</option>
                                        ))}
                                    </select>
                                    <FaMapMarkerAlt size={16} />
                                </div>
                            </div>
                        )}

                        <Input value={data.address || ""} placeholder="العنوان بالتفصيل" onChange={v => setData({ ...data, address: v })} />
                        <Input value={data.description || ""} placeholder="نبذة عنك" onChange={v => setData({ ...data, description: v })} />
                        <Input value={String(data.experience_years || "")} placeholder="سنوات الخبرة" type="number" onChange={v => setData({ ...data, experience_years: v })} />
                        <Input value={data.price_range || ""} placeholder="نطاق الأسعار" onChange={v => setData({ ...data, price_range: v })} />

                        <div className="form-group full-width">
                            <h4 className="sub-title">أيام العمل</h4>
                            <div className="work-days-grid">
                                {["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map(day => (
                                    <label key={day} className="work-day-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={data.work_days?.includes(day) || false}
                                            onChange={() => toggleWorkDay(day)}
                                        />
                                        <span>{day}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* الصور */}
                        <div className="form-group full-width">
                            <h4 className="sub-title">معرض صور أعمالك</h4>
                            <div className="photos-manager-grid">
                                {data.work_photos?.map((photo, index) => (
                                    <div key={`existing-${index}`} className="photo-square">
                                        <img src={getFullImageUrl(String(photo))} alt="Work" />
                                        <button
                                            type="button"
                                            className="photo-remove-btn"
                                            onClick={() => {
                                                const existing = data.work_photos || [];
                                                const deleted = data.delete_work_photos || [];
                                                setData({
                                                    ...data,
                                                    work_photos: existing.filter((_, i) => i !== index),
                                                    delete_work_photos: [...deleted, String(photo)]
                                                });
                                            }}
                                        >
                                            حذف
                                        </button>
                                    </div>
                                ))}

                                {data.new_work_photos?.map((file, index) => (
                                    <div key={`new-${index}`} className="photo-square is-new">
                                        <img src={URL.createObjectURL(file)} alt="New Work" />
                                        <button
                                            type="button"
                                            className="photo-remove-btn"
                                            onClick={() => {
                                                const newPhotos = data.new_work_photos || [];
                                                setData({
                                                    ...data,
                                                    new_work_photos: newPhotos.filter((_, i) => i !== index)
                                                });
                                            }}
                                        >
                                            إزالة
                                        </button>
                                    </div>
                                ))}

                                <label className="photo-add-square">
                                    <input
                                        type="file"
                                        multiple
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                const files = Array.from(e.target.files);
                                                const current = data.new_work_photos || [];
                                                setData({ ...data, new_work_photos: [...current, ...files] });
                                            }
                                        }}
                                    />
                                    <FaCamera size={24} />
                                    <span>أضف صور</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Location Card */}
            <div className="profile-card">
                <div className="card-header">
                    <h3 className="card-title">الموقع الجغرافي</h3>
                </div>
                <div className="map-wrapper">
                    <MapPicker
                        latitude={data.latitude || 30.0444}
                        longitude={data.longitude || 31.2357}
                        onChange={(lat, lng) => setData({ ...data, latitude: lat, longitude: lng })}
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="form-actions-bar">
                <button className="btn-save-profile" disabled={loading} onClick={onSave}>
                    {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
                <button className="btn-delete-profile" onClick={() => setShowDeleteConfirm(true)}>
                    حذف الحساب
                </button>
            </div>

            {showDeleteConfirm && (
                <div className="confirm-overlay">
                    <div className="confirm-modal">
                        <h3>⚠️ تأكيد حذف الحساب</h3>
                        <p>هل أنت متأكد من رغبتك في حذف حسابك؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.</p>
                        <div className="confirm-actions">
                            <button className="btn-confirm-cancel" onClick={() => setShowDeleteConfirm(false)}>إلغاء</button>
                            <button className="btn-confirm-delete" onClick={onDelete}>نعم، احذف الحساب</button>
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
