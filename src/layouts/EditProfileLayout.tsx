import { NavLink, Outlet } from "react-router-dom";
import { FaStar } from "react-icons/fa";

const EditProfileLayout = () => {
  const userType = localStorage.getItem("userType");

  const basePath =
    userType === "craftsman"
      ? "/craftsman/profile"
      : "/user/profile";

  return (
    <div className="profile-content-container" dir="ltr">
      <h1 className="main-title">تعديل بيانات الملف الشخصي</h1>

      <div className="tabs-wrapper">
        <div className="tabs-container">
          {/* أنا */}
          <NavLink
            end
            to={basePath}
            className={({ isActive }) =>
              `tab-item ${isActive ? "active" : ""}`
            }
          >
            أنا
          </NavLink>

          {/* المراجعات */}
          <NavLink
            to={`${basePath}/reviews`}
            className={({ isActive }) =>
              `tab-item ${isActive ? "active" : ""}`
            }
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
