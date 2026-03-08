import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaTools, FaStore, FaClipboardList } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import { useUI } from '../../../context/UIContext';
import './BottomNavbar.css';

const BottomNavbar: React.FC = () => {
  const { toggleMobileMenu, isMobileMenuOpen } = useUI();

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

      <button 
        type="button" 
        className={`bottom-nav-item ${isMobileMenuOpen ? 'active-btn' : ''}`}
        onClick={toggleMobileMenu}
      >
        <FiMenu />
        <span>القائمة</span>
      </button>
    </nav>
  );
};

export default BottomNavbar;
