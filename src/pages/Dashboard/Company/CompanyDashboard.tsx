import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../../components/dashboard/StatCard/StatCard";
import { FaBox, FaShoppingCart, FaChartLine, FaStore } from "react-icons/fa";
import { getStoreProducts, getStoreOrders } from "../../../Api/auth/Company/storeManagement.api";
import { useAuth } from "../../../hooks/useAuth";
import { FiAlertCircle } from "react-icons/fi";
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveBar } from '@nivo/bar';
import "./CompanyDashboard.css";

const CompanyDashboard: React.FC = () => {
    const { user } = useAuth();
    const isApproved = user?.status === 'approved';
    const isBlocked = user?.status === 'rejected';

    const [stats, setStats] = useState({
        totalProducts: 0,
        newOrders: 0,
        totalSales: "0 ج.م",
        loading: true,
        pieData: [] as any[],
        barData: [] as any[]
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

                // Calculate orders data
                const ordersList = Array.isArray(orders) ? orders : (orders?.data || []);
                const newOrdersCount = ordersList.filter((o: any) => o.status === 'pending' || o.status === 'new').length;

                // Total sales calculation
                const deliveredOrders = ordersList.filter((o: any) => o.status === 'delivered' || o.status === 'completed');
                const totalAmount = deliveredOrders.reduce((sum: number, o: any) => sum + (parseFloat(o.total_amount || 0)), 0);

                // --- Process Pie Data (Order Status Distribution) ---
                const statusCounts: Record<string, number> = {};
                ordersList.forEach((o: any) => {
                    const status = o.status || 'unknown';
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });

                const statusTranslations: Record<string, string> = {
                    'pending': 'قيد الانتظار',
                    'new': 'جديد',
                    'processing': 'جاري التنفيذ',
                    'delivered': 'تم التوصيل',
                    'completed': 'مكتمل',
                    'cancelled': 'ملغي',
                    'rejected': 'مرفوض'
                };

                const pieData = Object.entries(statusCounts).map(([status, count]) => ({
                    id: statusTranslations[status] || status,
                    label: statusTranslations[status] || status,
                    value: count
                }));

                // --- Process Bar Data (Monthly Sales Performance) ---
                const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
                const monthlySales = new Array(12).fill(0);

                deliveredOrders.forEach((o: any) => {
                    const date = new Date(o.created_at);
                    const month = date.getMonth();
                    monthlySales[month] += parseFloat(o.total_amount || 0);
                });

                const barData = monthNames.map((name, index) => ({
                    month: name,
                    sales: monthlySales[index]
                }));

                setStats({
                    totalProducts: productCount,
                    newOrders: newOrdersCount,
                    totalSales: `${totalAmount.toLocaleString()} ج.م`,
                    loading: false,
                    pieData,
                    barData
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

            {isBlocked && (
                <div className="approval-warning-banner blocked" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiAlertCircle />
                    <span>حسابك محظور من قبل الإدارة. يرجى التواصل مع الدعم الفني لحل المشكلة.</span>
                </div>
            )}

            {!isApproved && !isBlocked && (
                <div className="approval-warning-banner" style={{ background: '#fffbeb', border: '1px solid #fef3c7', color: '#92400e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiAlertCircle />
                    <span>حسابك قيد المراجعة. لا يمكنك إدارة المنتجات أو معالجة الطلبات حتى يتم اعتماد الحساب من قبل الإدارة.</span>
                </div>
            )}

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
                    <h3>أداء المبيعات (توزيع الطلبات)</h3>
                    <div className="chart-container-wrapper">
                        <div className="chart-container">
                            {stats.loading ? (
                                <div className="chart-loading">جاري التحميل...</div>
                            ) : stats.pieData.length > 0 ? (
                                <ResponsivePie
                                    data={stats.pieData}
                                    theme={{
                                        text: {
                                            fontSize: 14,
                                            fontFamily: 'inherit',
                                            fill: 'var(--color-text-secondary)',
                                        },
                                        tooltip: {
                                            container: {
                                                background: 'var(--color-bg-section)',
                                                color: 'var(--color-text-main)',
                                                fontSize: 12,
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                                border: '1px solid var(--color-border)'
                                            }
                                        }
                                    }}
                                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                    innerRadius={0.6}
                                    padAngle={2}
                                    cornerRadius={8}
                                    activeOuterRadiusOffset={10}
                                    colors={['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-error)', '#A855F7']}
                                    borderWidth={2}
                                    borderColor="var(--color-bg-section)"
                                    enableArcLinkLabels={false}
                                    arcLabelsSkipAngle={10}
                                    arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 3]] }}
                                    legends={[]}
                                />
                            ) : (
                                <div className="chart-empty">لا توجد بيانات متاحة</div>
                            )}
                        </div>
                        {!stats.loading && stats.pieData.length > 0 && (
                            <div className="custom-legend">
                                {(() => {
                                    const total = stats.pieData.reduce((sum, item) => sum + item.value, 0);
                                    const colors = ['var(--color-primary)', 'var(--color-success)', 'var(--color-warning)', 'var(--color-error)', '#A855F7'];
                                    
                                    return stats.pieData.map((item, index) => {
                                        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                                        return (
                                            <div key={item.id} className="legend-item">
                                                <span
                                                    className="legend-dot"
                                                    style={{ backgroundColor: colors[index % colors.length] }}
                                                />
                                                <span className="legend-label">
                                                    {item.label} ({percentage}%)
                                                </span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        )}
                    </div>
                </div>
                <div className="chart-item">
                    <h3>الإحصائيات السنوية (المبيعات الشهرية)</h3>
                    <div className="chart-container">
                        {stats.loading ? (
                            <div className="chart-loading">جاري التحميل...</div>
                        ) : stats.barData.length > 0 ? (
                            <ResponsiveBar
                                data={stats.barData}
                                keys={['sales']}
                                indexBy="month"
                                theme={{
                                    text: {
                                        fontSize: 12,
                                        fontFamily: 'inherit',
                                        fill: 'var(--color-text-secondary)',
                                    },
                                    axis: {
                                        legend: {
                                            text: {
                                                fontSize: 14,
                                                fontWeight: 800,
                                                fill: 'var(--color-text-accent)'
                                            }
                                        },
                                        ticks: {
                                            text: {
                                                fontSize: 11,
                                                fill: 'var(--color-text-muted)'
                                            }
                                        }
                                    },
                                    tooltip: {
                                        container: {
                                            background: 'var(--color-bg-section)',
                                            color: 'var(--color-text-main)',
                                            fontSize: 12,
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                            border: '1px solid var(--color-border)'
                                        }
                                    }
                                }}
                                margin={{ top: 30, right: 30, bottom: 60, left: 80 }}
                                padding={0.4}
                                valueScale={{ type: 'linear' }}
                                indexScale={{ type: 'band', round: true }}
                                colors="var(--color-primary)"
                                borderRadius={6}
                                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                                axisTop={null}
                                axisRight={null}
                                axisBottom={{
                                    tickSize: 5,
                                    tickPadding: 10,
                                    tickRotation: -30,
                                    legend: 'الشهر في السنة',
                                    legendPosition: 'middle',
                                    legendOffset: 50
                                }}
                                axisLeft={{
                                    tickSize: 5,
                                    tickPadding: 10,
                                    tickRotation: 0,
                                    legend: 'المبيعات (ج.م)',
                                    legendPosition: 'middle',
                                    legendOffset: -70
                                }}
                                labelSkipWidth={12}
                                labelSkipHeight={12}
                                labelTextColor="#ffffff"
                                role="application"
                                ariaLabel="Monthly sales statistics"
                                barAriaLabel={e => `${e.id}: ${e.formattedValue} in month: ${e.indexValue}`}
                            />
                        ) : (
                            <div className="chart-empty">لا توجد بيانات متاحة</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;
