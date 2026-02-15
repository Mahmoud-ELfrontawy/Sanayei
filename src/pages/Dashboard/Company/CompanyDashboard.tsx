import React from "react";
import StatCard from "../../../components/dashboard/StatCard/StatCard";
import { FaUsers, FaBriefcase, FaChartLine } from "react-icons/fa";
import "../User/Dashboard.css";

const CompanyDashboard: React.FC = () => {
    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <h1>لوحة تحكم الشركة</h1>
                <p>إدارة فريق العمل والمشاريع الكبرى</p>
            </header>

            <div className="stats-grid">
                <StatCard
                    title="عدد الفنيين"
                    value="18"
                    icon={<FaUsers size={20} />}
                />
                <StatCard
                    title="المشاريع الجارية"
                    value="7"
                    icon={<FaBriefcase size={20} />}
                />
                <StatCard
                    title="نسبة النمو"
                    value="15%"
                    isPositive={true}
                    icon={<FaChartLine size={20} />}
                />
            </div>

            <div className="charts-grid">
                <div className="chart-container">
                    <h3>توزيع التخصصات</h3>
                    <div className="chart-placeholder pie-placeholder">
                        <div className="pie-circle" style={{ background: 'conic-gradient(var(--color-primary) 0% 40%, var(--color-success) 40% 70%, var(--color-warning) 70% 100%)' }}></div>
                    </div>
                </div>
                <div className="chart-container">
                    <h3>أداء الشركة السنوي</h3>
                    <div className="chart-placeholder bar-placeholder">
                        <div className="bar-set"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;