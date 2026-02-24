import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../../components/dashboard/StatCard/StatCard";
import { FaBox, FaList, FaShoppingCart, FaChartLine, FaStore } from "react-icons/fa";
import { getStoreProducts, getStoreOrders } from "../../../Api/auth/Company/storeManagement.api";
import "./CompanyDashboard.css";

const CompanyDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        newOrders: 0,
        totalSales: "0 ج.م",
        loading: true
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [products, orders] = await Promise.all([
                    getStoreProducts(),
                    getStoreOrders()
                ]);

                // Calculate product count
                const productCount = Array.isArray(products) ? products.length : (products?.data?.length || 0);

                // Calculate "New" orders (assuming status is 'pending' or 'new')
                const ordersList = Array.isArray(orders) ? orders : (orders?.data || []);
                const newOrdersCount = ordersList.filter((o: any) => o.status === 'pending' || o.status === 'new').length;

                // Total sales calculation (based on backend StoreOrder model/logic)
                const totalAmount = ordersList
                    .filter((o: any) => o.status === 'delivered')
                    .reduce((sum: number, o: any) => sum + (parseFloat(o.total_amount || 0)), 0);

                setStats({
                    totalProducts: productCount,
                    newOrders: newOrdersCount,
                    totalSales: `${totalAmount.toLocaleString()} ج.م`,
                    loading: false
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="dashboard-page">
            <header className="dashboard-header-premium">
                <div className="header-content">
                    <h1>لوحة تحكم المتجر</h1>
                    <p>أهلاً بك مجدداً، تابع أداء معرضك ومنتجاتك بكل سهولة</p>
                </div>
                <div className="header-actions">
                    <Link to="/dashboard/company/profile" className="manage-btn">
                        <FaStore style={{ marginLeft: '8px' }} />
                        إدارة بيانات المتجر
                    </Link>
                </div>
            </header>

            <div className="stats-grid">
                <StatCard
                    title="إجمالي المنتجات"
                    value={stats.loading ? "..." : stats.totalProducts.toString()}
                    icon={<FaBox size={20} />}
                />
                <StatCard
                    title="طلبات جديدة"
                    value={stats.loading ? "..." : stats.newOrders.toString()}
                    icon={<FaShoppingCart size={20} />}
                    isPositive={stats.newOrders > 0}
                />
                <StatCard
                    title="إجمالي المبيعات"
                    value={stats.loading ? "..." : stats.totalSales}
                    isPositive={true}
                    icon={<FaChartLine size={20} />}
                />
            </div>

            <div className="quick-actions-grid">
                <Link to="/dashboard/company/products" className="action-card">
                    <div className="action-card-inner">
                        <div className="action-icon">
                            <FaBox />
                        </div>
                        <div className="action-info">
                            <h4>إدارة المنتجات</h4>
                            <p>أضف وعدل منتجاتك المعروضة في المتجر</p>
                        </div>
                    </div>
                </Link>
                <Link to="/dashboard/company/orders" className="action-card">
                    <div className="action-card-inner">
                        <div className="action-icon">
                            <FaShoppingCart />
                        </div>
                        <div className="action-info">
                            <h4>متابعة الطلبات</h4>
                            <p>تتبع حالة طلبات العملاء وتسيير الشحن</p>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="charts-grid">
                <div className="chart-item">
                    <h3>أداء المبيعات</h3>
                    <div className="chart-placeholder">
                        <div className="pie-circle" style={{ background: 'conic-gradient(var(--color-primary) 0% 40%, var(--color-success) 40% 70%, var(--color-warning) 70% 100%)' }}></div>
                    </div>
                </div>
                <div className="chart-item">
                    <h3>الإحصائيات السنوية</h3>
                    <div className="chart-placeholder">
                        <div className="bar-set"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;
