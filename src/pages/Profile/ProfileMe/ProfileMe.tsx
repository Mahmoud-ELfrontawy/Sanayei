import { useEffect, useState } from "react";
import { FaCamera, FaMapMarkerAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { toast } from "react-toastify";

import MapPicker from "../../../components/MapPicker";
import { getMyProfile, updateProfile } from "../../../Api/user/profile.api";

import defaultAvatar from "../../../assets/images/avatar1.jfif";
import "./ProfileMe.css";
import { setToastAfterReload } from "../../../utils/toastAfterReload";

interface UserState {
  name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: "male" | "female";
  latitude: number;
  longitude: number;
  profile_image_url?: string;
}

const ProfileMe = () => {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [user, setUser] = useState<UserState>({
    name: "",
    email: "",
    phone: "",
    birth_date: "",
    gender: "male",
    latitude: 30.0444,
    longitude: 31.2357,
  });

  /* ===== Fetch Profile ===== */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfile();
        setUser({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          birth_date: formatDate(data.birth_date),
          gender: data.gender || "male",
          latitude: Number(data.latitude) || 30.0444,
          longitude: Number(data.longitude) || 31.2357,
          profile_image_url: data.profile_image_url,
        });
      } catch {
        toast.error("فشل تحميل البيانات ❌");
      }
    };

    fetchProfile();
  }, []);

  /* ===== Save ===== */
  const handleSave = async () => {
    try {
      setLoading(true);

      await updateProfile({
        ...user,
        profile_image: imageFile,
      });

      setToastAfterReload("تم حفظ التعديلات بنجاح ✅");
      window.location.replace("/profile");

    } catch {
      setToastAfterReload("فشل حفظ التعديلات ❌", "error");
      window.location.replace("/profile");

    } finally {
      setLoading(false);
    }
  };


  const imageSrc = imageFile
    ? URL.createObjectURL(imageFile)
    : user.profile_image_url || defaultAvatar;

  return (
    <div dir="rtl">
      {/* Avatar */}
      <div className="avatar-section">
        <div className="avatar-wrapper">
          <img src={imageSrc} alt="Profile" className="profile-img" />

          <label className="camera-btn">
            <FaCamera size={14} />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) =>
                e.target.files && setImageFile(e.target.files[0])
              }
            />
          </label>
        </div>

        <h3 className="section-title">بيانات شخصية أساسية</h3>
      </div>

      {/* Form */}
      <div className="form-grid">
        {/* Name */}
        <InputField
          value={user.name}
          placeholder="الاسم بالكامل"
          onChange={(v) => setUser({ ...user, name: v })}
        />

        {/* Phone */}
        <InputField
          value={user.phone}
          ltr
          placeholder="رقم الهاتف"
          onChange={(v) => setUser({ ...user, phone: v })}
        />

        {/* Email (readonly) */}
        <div className="form-group">
          <div className="input-line">
            <input
              value={user.email}
              readOnly
              className="custom-input ltr-text"
            />
          </div>
        </div>

        {/* Birth Date */}
        <InputField
          value={user.birth_date}
          ltr
          placeholder="DD/MM/YYYY"
          maxLength={10}
          onChange={(v) => setUser({ ...user, birth_date: formatDateInput(v) })}
        />

        {/* Gender */}
        <div className="form-group full-width">
          <div className="gender-wrapper">
            <label>
              <input
                type="radio"
                checked={user.gender === "male"}
                onChange={() => setUser({ ...user, gender: "male" })}
              />
              ذكر
            </label>

            <label>
              <input
                type="radio"
                checked={user.gender === "female"}
                onChange={() => setUser({ ...user, gender: "female" })}
              />
              أنثى
            </label>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="location-section">
        <div className="location-header">
          <span>الموقع الحالي</span>
          <FaMapMarkerAlt className="pin-icon" />
        </div>

        <div className="map-container">
          <MapPicker
            latitude={user.latitude}
            longitude={user.longitude}
            onChange={(lat, lng) =>
              setUser({ ...user, latitude: lat, longitude: lng })
            }
          />
        </div>
      </div>

      {/* Save */}
      <div className="footer-action">
        <button className="save-btn" disabled={loading} onClick={handleSave}>
          {loading ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>
    </div>
  );
};

export default ProfileMe;

/* ===== Helpers ===== */
const formatDate = (date?: string) => {
  if (!date) return "";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatDateInput = (value: string) => {
  const v = value.replace(/\D/g, "");
  if (v.length <= 2) return v;
  if (v.length <= 4) return `${v.slice(0, 2)}/${v.slice(2)}`;
  return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4, 8)}`;
};

/* ===== Input Field ===== */
const InputField = ({
  value,
  onChange,
  placeholder,
  ltr,
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  ltr?: boolean;
  maxLength?: number;
}) => (
  <div className="form-group">
    <div className="input-line">
      <input
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={`custom-input ${ltr ? "ltr-text" : ""}`}
      />
      <span className="edit-icon">
        <MdEdit size={16} />
      </span>
    </div>
  </div>
);
