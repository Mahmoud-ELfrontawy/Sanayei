import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatCardComp from "../../../components/dashboard/StatCard/StatCard";
import {
    FaDollarSign,
    FaCheckCircle,
    FaUsers,
    FaClock,
    FaCheck,
    FaTimes,
    FaArrowLeft,
    FaEnvelope,
} from "react-icons/fa";

import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../context/NotificationContext";
import { useCraftsmanChat } from "../../../context/CraftsmanChatProvider"; // ✅ بدل ChatContext
import { toast } from "react-toastify";

import {
    getIncomingServiceRequests,
    updateServiceRequestStatus,
} from "../../../Api/serviceRequest/serviceRequests.api";

import "../User/Dashboard.css";
import "./CraftsmanDashboard.css";

const CraftsmanDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // ✅ الشات الخاص بالصنايعي
    const { setActiveChat } = useCraftsmanChat();

    const { addNotification, markAllAsRead } = useNotifications();

    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    /* ================= LOAD DATA ================= */

    useEffect(() => {
        markAllAsRead();

        const loadRequests = async () => {
            try {
                setLoading(true);
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

                // أول 5 طلبات فقط
                setIncomingRequests(requests.slice(0, 5));
            } catch (err) {
                console.error("Failed to load incoming requests", err);
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, [markAllAsRead]);

    /* ================= ACTIONS ================= */

    const handleAction = async (orderId: number, status: "accepted" | "rejected") => {
        try {
            await updateServiceRequestStatus(orderId, status);

            setIncomingRequests((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status } : o))
            );

            toast.success(status === "accepted" ? "تم قبول الطلب ✅" : "تم رفض الطلب ❌");

            addNotification({
                title: status === "accepted" ? "تم قبول طلبك ✅" : "تم رفض الطلب ❌",
                message:
                    status === "accepted"
                        ? `لقد وافق الصنايعي ${user?.name || ""} على طلب الخدمة`
                        : "نعتذر، تم رفض الطلب حالياً",
                type: "order_status",
                orderId: orderId,
                recipientId: 0,
                recipientType: "user",
            });
        } catch (err) {
            console.error("Failed to perform order action", err);
            toast.error("حدث خطأ أثناء تحديث حالة الطلب");
        }
    };

    const handleStartChat = (order: any) => {
        setActiveChat({
            id: order.user_id,
            name: order.name || "عميل",
            unread_count: 0,
            avatar: order.avatar,
        });

        navigate("/dashboard/messages");
    };

    /* ================= UI ================= */

    return (
        <div className="dashboard-page bg-[#F8FAFC]">
            {/* Header */}
            <header className="dashboard-header from-indigo-900 via-blue-900 to-slate-900 pt-12 pb-20 px-8 rounded-[40px] mb-8 relative overflow-hidden text-right" dir="rtl">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[80%] bg-blue-400 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[30%] h-[60%] bg-orange-400 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10 text-white">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-blue-200 text-sm font-bold mb-4 border border-white/10">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        لوحة إدارة أعمالك
                    </div>

                    <h1 className="text-3xl font-black mb-2">لوحة تحكم الصنايعي</h1>
                    <p className="text-blue-100/80 font-medium">
                        أهلاً بك، {user?.name || "صنايعي"}! تابع إحصائيات عملك وطلباتك الجديدة.
                    </p>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">

                {/* Stats */}
                <div className="stats-grid mb-12">
                    <StatCardComp title="إجمالي الأرباح" value="$8,670" change="24%" isPositive icon={<FaDollarSign size={20} />} />
                    <StatCardComp title="الطلبات المكتملة" value="45" icon={<FaCheckCircle size={20} />} />
                    <StatCardComp title="العملاء الجدد" value="12" change="5%" isPositive icon={<FaUsers size={20} />} />
                </div>

                {/* Requests */}
                <section className="incoming-requests-section">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-gray-800">طلباتي الأخيرة</h3>
                        <button
                            onClick={() => navigate("/orders")}
                            className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all"
                        >
                            عرض الكل <FaArrowLeft size={14} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="empty-requests py-12 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                            <div className="animate-pulse space-y-4 w-full px-6">
                                <div className="h-20 bg-gray-50 rounded-2xl w-full"></div>
                                <div className="h-20 bg-gray-50 rounded-2xl w-full"></div>
                            </div>
                        </div>
                    ) : incomingRequests.length > 0 ? (
                        <div className="requests-list space-y-4">
                            {incomingRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-center gap-6"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <FaClock size={20} />
                                        </div>

                                        <div className="text-right">
                                            <h4 className="font-bold text-gray-800">
                                                {req.service?.name || req.service_name || req.service_type || "خدمة"}
                                            </h4>
                                            <p className="text-sm text-gray-400">
                                                العميل: {req.name || "مجهول"} | {req.province || "غير محدد"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {req.status === "pending" ? (
                                            <>
                                                <button
                                                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2"
                                                    onClick={() => handleAction(req.id, "accepted")}
                                                >
                                                    <FaCheck size={14} /> قبول
                                                </button>

                                                <button
                                                    className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2 rounded-xl font-bold flex items-center gap-2"
                                                    onClick={() => handleAction(req.id, "rejected")}
                                                >
                                                    <FaTimes size={14} /> رفض
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-4">
                                                <span
                                                    className={`px-4 py-1.5 rounded-full text-xs font-bold ${req.status === "accepted"
                                                        ? "bg-green-50 text-green-600"
                                                        : "bg-red-50 text-red-600"
                                                        }`}
                                                >
                                                    {req.status === "accepted" ? "مقبول ✅" : "مرفوض ❌"}
                                                </span>

                                                {req.status === "accepted" && (
                                                    <button
                                                        onClick={() => handleStartChat(req)}
                                                        className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center hover:scale-110 transition-all"
                                                    >
                                                        <FaEnvelope />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[40px] p-12 text-center shadow-sm border border-gray-100">
                            <p className="text-gray-400 text-lg">لا توجد طلبات جديدة حالياً</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default CraftsmanDashboard;
