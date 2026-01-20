import { NavLink, Outlet } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const EditProfileLayout = () => {
  return (
    <div className="profile-content-container" dir="ltr">
      <h1 className="main-title">تعديل بيانات الملف الشخصي</h1>

      {/* Tabs */}
      <div className="tabs-wrapper">
        <div className="tabs-container">
          <NavLink
            end
            to="/profile"
            className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}
          >
            أنا
          </NavLink>

          <NavLink
            to="/profile/reviews"
            className={({ isActive }) => `tab-item ${isActive ? "active" : ""}`}
          >
            المراجعات <FaStar />
          </NavLink>
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default EditProfileLayout;
