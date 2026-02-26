import React, { useState, useEffect } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import { getIncomingServiceRequests } from "../../../Api/serviceRequest/serviceRequests.api";
import { FaChartLine, FaCheckCircle, FaClock, FaDollarSign } from "react-icons/fa";
import "./CraftsmanStatistics.css";

const CraftsmanStatistics: React.FC = () => {
    const [stats, setStats] = useState({
        loading: true,
        pieData: [] as any[],
        barData: [] as any[],
        totalEarnings: 0,
        completedCount: 0,
        pendingCount: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getIncomingServiceRequests();
                let requests: any[] = [];

                if (Array.isArray(response)) {
                    requests = response;
                } else if (response && typeof response === "object") {
                    const d = response as any;
                    requests = Array.isArray(d.data) ? d.data : [];
                    if (requests.length === 0 && d.data?.data && Array.isArray(d.data.data)) {
                        requests = d.data.data;
                    }
                }

                // --- Process Pie Data (Requests Status Distribution) ---
                const statusCounts: Record<string, number> = {};
                requests.forEach((r: any) => {
                    const status = (r.status || 'pending').toLowerCase().trim();
                    statusCounts[status] = (statusCounts[status] || 0) + 1;
                });

                // Mapping multiple possible status keys to our Arabic labels and colors
                const statusConfig = [
                    { keys: ['completed', 'finished', 'done'], label: 'مكتمل', color: 'var(--color-success)' },
                    { keys: ['accepted', 'approved', 'inprogress'], label: 'مقبول', color: 'var(--color-primary)' },
                    { keys: ['pending', 'new', 'waiting'], label: 'قيد الانتظار', color: 'var(--color-warning)' },
                    { keys: ['cancelled', 'canceled'], label: 'ملغي', color: 'var(--color-error)' },
                    { keys: ['rejected', 'refused'], label: 'مرفوض', color: '#64748b' }
                ];

                const pieData = statusConfig.map(config => {
                    const totalForStatus = config.keys.reduce((sum, key) => sum + (statusCounts[key] || 0), 0);
                    return {
                        id: config.label,
                        label: `${config.label} (${totalForStatus})`,
                        value: totalForStatus,
                        color: config.color
                    };
                });

                // --- Process Bar Data (Monthly Income Estimate) ---
                // We'll use created_at for the month and assume a 'price' or 'total_amount' field.
                // If missing, we'll count requests as a proxy for activity.
                const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
                const monthlyActivity = new Array(12).fill(0);
                let totalEarned = 0;
                let completed = 0;
                let pending = 0;

                requests.forEach((r: any) => {
                    const date = new Date(r.created_at);
                    const month = date.getMonth();

                    if (r.status === 'completed' || r.status === 'accepted') {
                        const amount = parseFloat(r.price || r.total_amount || r.cost || 0);
                        monthlyActivity[month] += amount > 0 ? amount : 1; // Fallback to 1 if no price (count activity)
                        if (r.status === 'completed') {
                            totalEarned += amount;
                            completed++;
                        }
                    } else if (r.status === 'pending') {
                        pending++;
                    }
                });

                const barData = monthNames.map((name, index) => ({
                    month: name,
                    value: monthlyActivity[index]
                }));

                setStats({
                    loading: false,
                    pieData,
                    barData,
                    totalEarnings: totalEarned,
                    completedCount: completed,
                    pendingCount: pending
                });

            } catch (error) {
                console.error("Error fetching craftsman stats:", error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, []);

    const theme = {
        text: {
            fontSize: 14,
            fontFamily: 'inherit',
            fill: 'var(--color-text-secondary)',
        },
        tooltip: {
            container: {
                background: '#ffffff',
                color: 'var(--color-text-main)',
                fontSize: 12,
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }
        }
    };

    return (
        <div className="craftsman-stats-page">
            <header className="stats-header">
                <div className="header-info">
                    <h1><FaChartLine style={{ marginLeft: '10px' }} /> إحصائيات عملك</h1>
                    <p>تابع أداءك الشهري وتوزيع طلباتك بشكل مبسط</p>
                </div>
            </header>

            <div className="quick-summary">
                <div className="summary-card">
                    <div className="icon-box earnings"><FaDollarSign /></div>
                    <div className="summary-info">
                        <span>إجمالي الأرباح</span>
                        <h3>{stats.totalEarnings > 0 ? `${stats.totalEarnings.toLocaleString()} ج.م` : "لا يوجد بيانات"}</h3>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="icon-box completed"><FaCheckCircle /></div>
                    <div className="summary-info">
                        <span>طلبات مكتملة</span>
                        <h3>{stats.completedCount}</h3>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="icon-box pending"><FaClock /></div>
                    <div className="summary-info">
                        <span>قيد الانتظار</span>
                        <h3>{stats.pendingCount}</h3>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                <div className="chart-item">
                    <h3>توزيع حالات الطلبات</h3>
                    <p className="chart-desc">تعرف على نسبة قبولك ورفضك للطلبات</p>
                    <div className="chart-container-wrapper">
                        <div className="chart-container">
                            {stats.loading ? (
                                <div className="chart-loading">جاري التحميل...</div>
                            ) : stats.pieData.length > 0 ? (
                                <ResponsivePie
                                    data={stats.pieData}
                                    theme={theme}
                                    margin={{ top: 20, right: 80, bottom: 40, left: 80 }}
                                    innerRadius={0.6}
                                    padAngle={2}
                                    cornerRadius={8}
                                    activeOuterRadiusOffset={10}
                                    colors={{ datum: 'data.color' }}
                                    borderWidth={0}
                                    arcLinkLabelsSkipAngle={10}
                                    arcLinkLabelsTextColor="var(--color-text-muted)"
                                    arcLinkLabelsThickness={2}
                                    arcLinkLabelsColor={{ from: 'color' }}
                                    arcLabelsSkipAngle={10}
                                    arcLabelsTextColor="#ffffff"
                                    legends={[]}
                                />
                            ) : (
                                <div className="chart-empty">لا توجد طلبات بعد</div>
                            )}
                        </div>
                        {!stats.loading && stats.pieData.length > 0 && (
                            <div className="custom-legend" style={{ gap: '2rem' }}>
                                {stats.pieData.map((item) => (
                                    <div key={item.id} className="legend-item">
                                        <span
                                            className="legend-dot"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="legend-label">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="chart-item">
                    <h3>أداء العمل الشهري</h3>
                    <p className="chart-desc">مستوى نشاطك وتطور أرباحك خلال العام</p>
                    <div className="chart-container">
                        {stats.loading ? (
                            <div className="chart-loading">جاري التحميل...</div>
                        ) : stats.barData.length > 0 ? (
                            <ResponsiveBar
                                data={stats.barData}
                                keys={['value']}
                                indexBy="month"
                                theme={{
                                    ...theme,
                                    axis: {
                                        legend: { text: { fontSize: 12, fontWeight: 700, fill: 'var(--color-text-accent)' } },
                                        ticks: { text: { fontSize: 10, fill: 'var(--color-text-muted)' } }
                                    }
                                }}
                                margin={{ top: 30, right: 30, bottom: 60, left: 50 }}
                                padding={0.4}
                                colors="var(--color-primary)"
                                borderRadius={6}
                                axisBottom={{
                                    tickSize: 5,
                                    tickPadding: 10,
                                    tickRotation: -45,
                                }}
                                axisLeft={{
                                    tickSize: 5,
                                    tickPadding: 5,
                                    tickRotation: 0,
                                }}
                                labelSkipWidth={12}
                                labelSkipHeight={12}
                                labelTextColor="#ffffff"
                            />
                        ) : (
                            <div className="chart-empty">لا توجد بيانات متاحة</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="stats-tips">
                <div className="tip-card">
                    <h4>نصيحة لتحسين دخلك:</h4>
                    <p>الرد السريع على الطلبات "قيد الانتظار" يزيد من ثقة العملاء بك ويجعل حسابك يظهر في نتائج البحث الأولى.</p>
                </div>
            </div>
        </div>
    );
};

export default CraftsmanStatistics;
