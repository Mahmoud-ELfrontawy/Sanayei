import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import bg from "../../../../assets/images/bggg1.jpg";
import { createServiceRequest } from "../../../../Api/serviceRequest/serviceRequests.api";

import type { ServiceRequestPayload } from "../../../../constants/serviceRequest";
import { useRequestServiceData } from "./useRequestServiceData";
import RequestServiceForm from "./RequestServiceForm";

import "./RequestServiceSection.css";
import { useAuth } from "../../../../hooks/useAuth";
import { useNotifications } from "../../../../context/NotificationContext";

type PrefilledFormState = Partial<ServiceRequestPayload>;

const RequestServiceSection: React.FC = () => {
    /* ===============================
        Auth + Router
    ================================ */
    const { isAuthenticated, user } = useAuth();
    const { addNotification } = useNotifications();
    const navigate = useNavigate();

    const location = useLocation() as {
        state: PrefilledFormState | null;
    };

    /* ===============================
        Form
    ================================ */
    const form = useForm<ServiceRequestPayload>({
        defaultValues: {
            name: "",
            email: "",
            province: "",
            address: "",
            service_type: "",
            service_name: "",
            industrial_type: "",
            industrial_name: "",
            price: "",
            date: "",
            time: "",
        },
        mode: "onSubmit",
    });

    /* ===============================
        Data
    ================================ */
    const {
        services,
        governorates,
        sanaei,
        loading,
    } = useRequestServiceData();

    /* ===============================
        Prefill From Navigation
    ================================ */
    useEffect(() => {
        if (loading || !location.state) return;

        Object.entries(location.state).forEach(([key, value]) => {
            if (value !== undefined) {
                form.setValue(
                    key as keyof ServiceRequestPayload,
                    value as ServiceRequestPayload[keyof ServiceRequestPayload]
                );
            }
        });
    }, [loading, location.state, form]);

    /* ===============================
        Auto-fill User Data from Auth
    ================================ */
    useEffect(() => {
        if (!user) return;

        // ملء البيانات تلقائياً من المستخدم المسجل دخوله
        form.setValue("name", user.name || "");
        form.setValue("email", user.email || "");
    }, [user, form]);

    /* ===============================
        Submit
    ================================ */
    const onSubmit = async (data: ServiceRequestPayload) => {
        if (!isAuthenticated) {
            toast.info("من فضلك سجل دخولك أولًا 🔐");
            navigate("/login", { state: { from: "request-service" } });
            return;
        }

        try {
            // ✅ Send service request with user_id & full info
            const payload = {
                // 🔥 User Details
                user_id: user?.id ? Number(user.id) : null,
                name: data.name || user?.name || "زائر",
                email: data.email || user?.email || "guest@example.com",

                // Service Request Details
                province: data.province,
                address: data.address,
                date: data.date,
                time: data.time,

                // Service & Craftsman Selection
                service_type: Number(data.service_type),
                craftsman_id: Number(data.industrial_type),
                industrial_type: Number(data.industrial_type), // Fallback
            };

            // Remove undefined values
            Object.keys(payload).forEach(key => {
                if (payload[key as keyof typeof payload] === undefined) {
                    delete payload[key as keyof typeof payload];
                }
            });

            const response = await createServiceRequest(payload);

            const serverId = response.data?.id || response.id || Date.now();

            // 1. Notification for the Craftsman (New Request)
            addNotification({
                title: "طلب خدمة جديد 🛠️",
                message: `لديك طلب جديد لخدمة ${data.service_name} من ${payload.name}.`,
                recipientId: payload.craftsman_id,
                recipientType: "craftsman",
                type: "order_request",
                orderId: serverId,
            });

            // 2. Notification for the User (Confirmation)
            addNotification({
                title: "تم إرسال طلبك بنجاح ✅",
                message: `طلبك لخدمة ${data.service_name} هو الآن (قيد الانتظار). سيتواصل معك ${data.industrial_name} قريباً.`,
                recipientId: payload.user_id!,
                recipientType: "user",
                type: "order_status",
                orderId: serverId,
                variant: "success",
            });

            // Local fallback logic for persistence if refresh occurs
            const oldOrders = JSON.parse(localStorage.getItem("myOrders") || "[]");
            const newOrder = {
                ...data,
                id: serverId,
                status: "pending",
                createdAt: new Date().toISOString(),
            };
            localStorage.setItem("myOrders", JSON.stringify([newOrder, ...oldOrders]));


            form.reset();
            navigate("/orders");
        } catch (err: any) {
            toast.error("حدث خطأ أثناء إرسال الطلب ❌");
        }
    };

    /* ===============================
        Loading State
    ================================ */
    if (loading) {
        return null; // أو Skeleton
    }

    return (
        <section className="request-section">
            <div className="request-container">
                <div
                    className="request-wrap"
                    style={{ backgroundImage: `url(${bg})` }}
                >
                    {/* ===== Form ===== */}
                    <form
                        className="req-card"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <RequestServiceForm
                            form={form}
                            services={services}
                            governorates={governorates}
                            sanaei={sanaei}
                        />
                    </form>

                    {/* ===== Side ===== */}
                    <aside className="req-side">
                        <h2 className="req-title">
                            اطلب خدمتك الآن
                        </h2>
                        <p className="req-text">
                            املأ البيانات المطلوبة، وسنتواصل
                            معك في أقرب وقت.
                        </p>
                    </aside>
                </div>
            </div>
        </section>
    );
};

export default RequestServiceSection;
