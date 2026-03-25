import React, { useState, useEffect } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import {
    FaUsers, FaHardHat, FaBuilding,
    FaFileAlt, FaBoxOpen, FaStar, FaBell, FaCircle
} from "react-icons/fa";
import { adminApi } from "../../Api/admin/admin.api";
import { adminServiceRequestsApi } from "../../Api/admin/adminServiceRequests.api";
import { adminUsersApi } from "../../Api/admin/adminUsers.api";
import { adminCraftsmenApi } from "../../Api/admin/adminCraftsmen.api";
import { adminProductsApi } from "../../Api/admin/adminProducts.api";
import { adminCompaniesApi } from "../../Api/admin/adminCompanies.api";
import { adminReviewsApi } from "../../Api/admin/adminReviews.api";
import { useAdminNotifications } from "../../context/AdminNotificationContext";
import { formatTimeAgo } from "../../utils/timeAgo";
import "./AdminStatistics.css";

/* ───────── Helpers ───────── */
const PieChart: React.FC<{ data: any[]; loading: boolean }> = ({ data, loading }) => {
    const nivoTheme = {
        text: { fontSize: 13, fontFamily: "inherit", fill: "var(--color-text-secondary)" },
        tooltip: {
            container: {
                background: "#fff",
                color: "var(--color-text-main)",
                fontSize: 12,
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
        },
    };

    if (loading) return <div className="admin-chart-loading">جاري التحميل...</div>;
    if (!data || data.every(d => d.value === 0)) return <div className="admin-chart-empty">لا توجد بيانات حتى الآن</div>;

    return (
        <div className="admin-chart-container-wrapper">
            <div className="admin-chart-container">
                <ResponsivePie
                    data={data}
                    theme={nivoTheme}
                    margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    innerRadius={0.65}
                    padAngle={2}
                    cornerRadius={8}
                    colors={{ datum: "data.color" }}
                    borderWidth={0}
                    arcLinkLabelsSkipAngle={12}
                    arcLinkLabelsTextColor="var(--color-text-muted)"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: "color" }}
                    enableArcLabels={false}
                    legends={[]}
                />
            </div>
            <div className="admin-custom-legend">
                {data.map(item => (
                    <div key={item.id} className="admin-legend-item">
                        <span className="admin-legend-dot" style={{ backgroundColor: item.color }} />
                        <span className="admin-legend-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ───────── Main Component ───────── */
const AdminStatistics: React.FC = () => {
    const { notifications, unreadCount, markAllAsRead } = useAdminNotifications();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        // Overview
        totalUsers: 0,
        totalCraftsmen: 0,
        totalCompanies: 0,
        totalRequests: 0,
        totalProducts: 0,
        totalReviews: 0,
        // Charts
        requestsPie: [] as any[],
        companyPie: [] as any[],
        craftsmenPie: [] as any[],
        productsPie: [] as any[],
        reviewsBar: [] as any[],
        monthlyBar: [] as any[],
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Helper: extract array from any API response structure
                const extractArr = (res: PromiseSettledResult<any>): any[] => {
                    if (res.status !== "fulfilled") return [];
                    const val = res.value;
                    // Level 1: val itself is array
                    if (Array.isArray(val)) return val;
                    // Level 2: val.data is array
                    if (Array.isArray(val?.data)) return val.data;
                    // Level 3: val.data.data is array (standard Laravel paginated)
                    if (Array.isArray(val?.data?.data)) return val.data.data;
                    // Level 4: val.data.data.data is array (nested paginated e.g. { data: { data: [...] } })
                    if (Array.isArray(val?.data?.data?.data)) return val.data.data.data;
                    return [];
                };

                const extractTotal = (res: PromiseSettledResult<any>): number => {
                    if (res.status !== "fulfilled") return 0;
                    const val = res.value;
                    return val?.data?.total
                        || val?.data?.data?.total
                        || val?.total
                        || extractArr(res).length;
                };

                const [
                    overviewRes,
                    requestsRes,
                    usersRes,
                    craftsmenRes,
                    companiesRes,
                    productsRes,
                    reviewsRes,
                ] = await Promise.allSettled([
                    adminApi.getDashboardStatistics(),
                    adminServiceRequestsApi.getAllServiceRequests(),
                    adminUsersApi.getAllUsers({ page: 1, per_page: 100 }),
                    adminCraftsmenApi.getAllCraftsmen({ page: 1 }),
                    adminCompaniesApi.getAllCompanies(1, "", ""),
                    adminProductsApi.getAllProducts({}),
                    adminReviewsApi.getAllReviews(),
                ]);

                // Debug: log raw responses to console
                // (Remove in production)

                /* ── Overview from dashboard endpoint (fallback to counts) ── */
                const overviewData = overviewRes.status === "fulfilled"
                    ? (overviewRes.value?.data?.stats || overviewRes.value?.data || {})
                    : {};

                const requests = extractArr(requestsRes);
                const usersArr = extractArr(usersRes);
                const craftsmenArr = extractArr(craftsmenRes);
                const companiesArr = extractArr(companiesRes);

                // adminProductsApi returns response.data directly (not axios response object)
                const productsRaw = productsRes.status === "fulfilled" ? productsRes.value : null;
                const productsArr: any[] = Array.isArray(productsRaw)
                    ? productsRaw
                    : Array.isArray(productsRaw?.data) ? productsRaw.data : [];

                const reviewsArr = extractArr(reviewsRes);

                /* ── Totals ── */
                const totalUsers = overviewData.total_users || extractTotal(usersRes) || usersArr.length;
                const totalCraftsmen = overviewData.total_craftsmen || extractTotal(craftsmenRes) || craftsmenArr.length;
                const totalCompanies = overviewData.total_companies || extractTotal(companiesRes) || companiesArr.length;
                const totalRequests = overviewData.total_requests || extractTotal(requestsRes) || requests.length;
                const totalProducts = productsArr.length;
                const totalReviews = reviewsArr.length;

                /* ── 1. Service Requests Status Pie ── */
                const reqCounts: Record<string, number> = {};
                requests.forEach((r: any) => {
                    const s = String(r.status || "pending").toLowerCase().trim();
                    reqCounts[s] = (reqCounts[s] || 0) + 1;
                });
                const requestsPie = [
                    { id: "قيد المراجعة", label: `قيد المراجعة (${reqCounts["pending"] || 0})`, value: reqCounts["pending"] || 0, color: "var(--color-warning)" },
                    { id: "مقبول", label: `مقبول (${reqCounts["accepted"] || 0})`, value: reqCounts["accepted"] || 0, color: "var(--color-primary)" },
                    { id: "مكتمل", label: `مكتمل (${reqCounts["completed"] || 0})`, value: reqCounts["completed"] || 0, color: "var(--color-success)" },
                    { id: "مرفوض", label: `مرفوض (${reqCounts["rejected"] || 0})`, value: reqCounts["rejected"] || 0, color: "var(--color-error)" },
                ];

                /* ── 2. Companies Status Pie ── */
                const companyCounts: Record<string, number> = {};
                companiesArr.forEach((c: any) => {
                    const s = String(c.status || "pending").toLowerCase();
                    companyCounts[s] = (companyCounts[s] || 0) + 1;
                });
                const companyPie = [
                    { id: "موافق عليها", label: `موافق عليها (${companyCounts["approved"] || 0})`, value: companyCounts["approved"] || 0, color: "var(--color-success)" },
                    { id: "قيد المراجعة", label: `قيد المراجعة (${companyCounts["pending"] || 0})`, value: companyCounts["pending"] || 0, color: "var(--color-warning)" },
                    { id: "مرفوضة", label: `مرفوضة (${companyCounts["rejected"] || 0})`, value: companyCounts["rejected"] || 0, color: "var(--color-error)" },
                ];

                /* ── 3. Craftsmen Status Pie ── */
                // Handles: status string OR is_verified/verified_at boolean/date fields
                const craftsmenCounts = { approved: 0, pending: 0, rejected: 0 };
                craftsmenArr.forEach((c: any) => {
                    const rawStatus = String(c.status || "").toLowerCase().trim();
                    if (["approved", "verified", "active"].includes(rawStatus)) {
                        craftsmenCounts.approved++;
                    } else if (["rejected", "refused", "blocked"].includes(rawStatus)) {
                        craftsmenCounts.rejected++;
                    } else {
                        // Fallback: check boolean fields
                        if (c.is_verified === true || c.is_verified === 1 || c.verified_at) {
                            craftsmenCounts.approved++;
                        } else if (c.is_blocked === true || c.is_blocked === 1) {
                            craftsmenCounts.rejected++;
                        } else {
                            craftsmenCounts.pending++;
                        }
                    }
                });
                const craftsmenPie = [
                    { id: "معتمد", label: `معتمد (${craftsmenCounts.approved})`, value: craftsmenCounts.approved, color: "var(--color-success)" },
                    { id: "بانتظار الموافقة", label: `بانتظار الموافقة (${craftsmenCounts.pending})`, value: craftsmenCounts.pending, color: "var(--color-warning)" },
                    { id: "مرفوض", label: `مرفوض (${craftsmenCounts.rejected})`, value: craftsmenCounts.rejected, color: "var(--color-error)" },
                ];

                /* ── 4. Products Status Pie ── */
                const activeProd = productsArr.filter((p: any) => p.is_active === true || p.is_active === 1).length;
                const inactiveProd = productsArr.length - activeProd;
                const productsPie = [
                    { id: "نشط", label: `نشط (${activeProd})`, value: activeProd, color: "var(--color-success)" },
                    { id: "غير نشط", label: `غير نشط (${inactiveProd})`, value: inactiveProd, color: "var(--color-error)" },
                ];

                /* ── 5. Reviews Rating Bar ── */
                const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
                reviewsArr.forEach((r: any) => {
                    const rating = parseInt(String(r.rating));
                    if (rating >= 1 && rating <= 5) ratingCounts[rating]++;
                });
                const reviewsBar = [1, 2, 3, 4, 5].map(r => ({
                    rating: `${r} ⭐`,
                    count: ratingCounts[r],
                }));

                /* ── 6. Monthly Registration Growth ── */
                const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
                const monthlyUsersCount = new Array(12).fill(0);
                const monthlyCraftsmenCount = new Array(12).fill(0);
                usersArr.forEach((u: any) => {
                    // Try created_at, then registered_at, then join_date
                    const dateStr = u.created_at || u.registered_at || u.join_date;
                    if (!dateStr) return;
                    const d = new Date(dateStr);
                    if (!isNaN(d.getTime())) monthlyUsersCount[d.getMonth()]++;
                });
                craftsmenArr.forEach((c: any) => {
                    const dateStr = c.created_at || c.registered_at || c.join_date;
                    if (!dateStr) return;
                    const d = new Date(dateStr);
                    if (!isNaN(d.getTime())) monthlyCraftsmenCount[d.getMonth()]++;
                });
                const monthlyBar = months.map((name, i) => ({
                    month: name,
                    مستخدمين: monthlyUsersCount[i],
                    صنايعية: monthlyCraftsmenCount[i],
                }));

                setData({
                    totalUsers, totalCraftsmen, totalCompanies,
                    totalRequests, totalProducts, totalReviews,
                    requestsPie, companyPie, craftsmenPie,
                    productsPie, reviewsBar, monthlyBar,
                });
            } catch (err) {
                console.error("Admin statistics error:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const nivoBarTheme = {
        text: { fontSize: 12, fontFamily: "inherit", fill: "var(--color-text-secondary)" },
        tooltip: {
            container: {
                background: "#fff",
                color: "var(--color-text-main)",
                fontSize: 12,
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
        },
    };

    const overviewCards = [
        { icon: <FaUsers />, label: "المستخدمين", value: data.totalUsers, cls: "users" },
        { icon: <FaHardHat />, label: "الصنايعية", value: data.totalCraftsmen, cls: "craftsmen" },
        { icon: <FaBuilding />, label: "الشركات", value: data.totalCompanies, cls: "companies" },
        { icon: <FaFileAlt />, label: "طلبات الخدمات", value: data.totalRequests, cls: "orders" },
        { icon: <FaBoxOpen />, label: "المنتجات", value: data.totalProducts, cls: "products" },
        { icon: <FaStar />, label: "التقييمات", value: data.totalReviews, cls: "products" },
    ];

    // Map notification types to icons and colors
    const notifMeta: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
        new_registration: { icon: <FaUsers />, color: "#3b82f6", label: "تسجيل جديد" },
        new_review: { icon: <FaStar />, color: "var(--amber-500)", label: "تقييم جديد" },
        new_product: { icon: <FaBoxOpen />, color: "#8b5cf6", label: "منتج جديد" },
        new_request: { icon: <FaFileAlt />, color: "#10b981", label: "طلب خدمة" },
        profile_update: { icon: <FaUsers />, color: "#6366f1", label: "تحديث ملف" },
        account_status_audit: { icon: <FaBuilding />, color: "var(--color-error)", label: "تغيير حالة" },
        system_alert: { icon: <FaBell />, color: "#ec4899", label: "تنبيه نظام" },
    };

    return (
        <div className="admin-stats-page" dir="rtl">
            <header className="stats-header">
                <h1>📊 الإحصائيات العامة للمنصة</h1>
                <p>تحليل شامل لجميع البيانات الحقيقية — مستخدمين، صنايعية، شركات، طلبات، منتجات وتقييمات</p>
            </header>

            {/* ── Overview Cards ── */}
            <div className="admin-stats-grid-top">
                {overviewCards.map(card => (
                    <div key={card.label} className="admin-stat-card">
                        <div className={`stat-icon-box ${card.cls}`}>{card.icon}</div>
                        <div className="stat-info">
                            <span>{card.label}</span>
                            <h3>{loading ? "..." : card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Charts ── */}
            <div className="admin-charts-main-grid">

                {/* 1. Service Requests Pie */}
                <div className="admin-chart-item">
                    <h3>توزيع حالات طلبات الخدمات</h3>
                    <p>مدى إنجاز الطلبات المقدمة على المنصة</p>
                    <PieChart data={data.requestsPie} loading={loading} />
                </div>

                {/* 2. Companies Status Pie */}
                <div className="admin-chart-item">
                    <h3>حالة الشركات المسجلة</h3>
                    <p>نسبة الشركات الموافق عليها مقابل قيد المراجعة أو المرفوضة</p>
                    <PieChart data={data.companyPie} loading={loading} />
                </div>

                {/* 3. Craftsmen Status Pie */}
                <div className="admin-chart-item">
                    <h3>حالة الصنايعية المسجلين</h3>
                    <p>توزيع الصنايعية بين معتمد، قيد المراجعة، ومرفوض</p>
                    <PieChart data={data.craftsmenPie} loading={loading} />
                </div>

                {/* 4. Products Status Pie */}
                <div className="admin-chart-item">
                    <h3>حالة المنتجات في المتجر</h3>
                    <p>نسبة المنتجات النشطة مقابل المعطلة</p>
                    <PieChart data={data.productsPie} loading={loading} />
                </div>

                {/* 5. Monthly Registration Growth (full width) */}
                <div className="admin-chart-item full-width">
                    <h3>نمو التسجيلات الشهرية</h3>
                    <p>عدد المستخدمين والصنايعية المسجلين في كل شهر من السنة</p>
                    <div className="admin-chart-container">
                        {loading ? (
                            <div className="admin-chart-loading">جاري التحميل...</div>
                        ) : (
                            <ResponsiveBar
                                data={data.monthlyBar}
                                keys={["مستخدمين", "صنايعية"]}
                                indexBy="month"
                                margin={{ top: 30, right: 30, bottom: 65, left: 55 }}
                                padding={0.35}
                                groupMode="grouped"
                                theme={nivoBarTheme}
                                colors={["#3b82f6", "var(--amber-500)"]}
                                borderRadius={5}
                                axisBottom={{ tickSize: 5, tickPadding: 10, tickRotation: -40 }}
                                axisLeft={{
                                    tickSize: 5, tickPadding: 10, tickRotation: 0,
                                    legend: "عدد التسجيلات", legendPosition: "middle", legendOffset: -45
                                }}
                                labelSkipWidth={12}
                                labelSkipHeight={12}
                                labelTextColor="#fff"
                                legends={[{
                                    dataFrom: "keys",
                                    anchor: "top-right",
                                    direction: "row",
                                    justify: false,
                                    translateX: -10,
                                    translateY: -30,
                                    itemsSpacing: 12,
                                    itemWidth: 100,
                                    itemHeight: 20,
                                    itemDirection: "right-to-left",
                                    itemOpacity: 1,
                                    symbolSize: 12,
                                    symbolShape: "circle",
                                }]}
                            />
                        )}
                    </div>
                </div>

                {/* 6. Reviews Ratings Bar */}
                <div className="admin-chart-item full-width">
                    <h3>توزيع التقييمات على النجوم</h3>
                    <p>كم مرة حصل الصنايعية على كل تقييم — يساعد على فهم رضا العملاء</p>
                    <div className="admin-chart-container" style={{ height: 320 }}>
                        {loading ? (
                            <div className="admin-chart-loading">جاري التحميل...</div>
                        ) : data.totalReviews === 0 ? (
                            <div className="admin-chart-empty">لا توجد تقييمات حتى الآن</div>
                        ) : (
                            <ResponsiveBar
                                data={data.reviewsBar}
                                keys={["count"]}
                                indexBy="rating"
                                margin={{ top: 20, right: 30, bottom: 50, left: 55 }}
                                padding={0.45}
                                theme={nivoBarTheme}
                                colors={["var(--amber-500)"]}
                                borderRadius={6}
                                axisBottom={{ tickSize: 5, tickPadding: 10 }}
                                axisLeft={{
                                    tickSize: 5, tickPadding: 10,
                                    legend: "عدد التقييمات", legendPosition: "middle", legendOffset: -45
                                }}
                                labelSkipWidth={12}
                                labelSkipHeight={12}
                                labelTextColor="#fff"
                                legends={[]}
                            />
                        )}
                    </div>
                </div>

            </div>

            {/* ── Live Notifications Feed ── */}
            <div className="admin-chart-item full-width admin-live-feed">
                <div className="admin-live-feed-header">
                    <div className="admin-live-title">
                        <FaBell className="admin-live-bell" />
                        <h3>النشاطات الحية على المنصة</h3>
                        {unreadCount > 0 && (
                            <span className="admin-live-badge">{unreadCount} جديد</span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button className="admin-live-mark-read" onClick={markAllAsRead}>
                            تعيين الكل كمقروء
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="admin-chart-empty" style={{ height: 120 }}>
                        لا توجد نشاطات حديثة — انتظر الإشعارات الجديدة من المنصة
                    </div>
                ) : (
                    <ul className="admin-notifications-list">
                        {notifications.slice(0, 15).map(notif => {
                            const meta = notifMeta[notif.type] || notifMeta.system_alert;
                            return (
                                <li key={notif.id} className={`admin-notif-row ${notif.status === 'unread' ? 'unread' : ''}`}>
                                    <div className="admin-notif-row-icon" style={{ background: meta.color + "18", color: meta.color }}>
                                        {meta.icon}
                                    </div>
                                    <div className="admin-notif-row-body">
                                        <span className="admin-notif-row-title">{notif.title}</span>
                                        <span className="admin-notif-row-msg">{notif.message}</span>
                                    </div>
                                    <div className="admin-notif-row-meta">
                                        <span className="admin-notif-row-tag" style={{ background: meta.color + "18", color: meta.color }}>
                                            {meta.label}
                                        </span>
                                        <span className="admin-notif-row-time">{formatTimeAgo(notif.timestamp)}</span>
                                    </div>
                                    {notif.status === 'unread' && (
                                        <FaCircle className="admin-notif-unread-dot" style={{ color: meta.color }} />
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

        </div>
    );
};

export default AdminStatistics;

