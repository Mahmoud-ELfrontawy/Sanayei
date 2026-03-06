import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTools, FaStore, FaClipboardList, FaUser } from 'react-icons/fa';
import './BottomNavbar.css';

const BottomNavbar: React.FC = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <FaHome />
        <span>الرئيسية</span>
      </NavLink>
      <NavLink to="/services" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <FaTools />
        <span>الخدمات</span>
      </NavLink>
      <NavLink to="/store" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <FaStore />
        <span>المتجر</span>
      </NavLink>
      <NavLink to="/orders" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <FaClipboardList />
        <span>الطلبات</span>
      </NavLink>
      <NavLink to="/user/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <FaUser />
        <span>حسابي</span>
      </NavLink>
    </nav>
  );
};

export default BottomNavbar;
