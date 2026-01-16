import { Outlet } from "react-router-dom";
import "./AuthLayout.css";

const AuthLayout: React.FC = () => {
  return (
    <div className="auth-page">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
