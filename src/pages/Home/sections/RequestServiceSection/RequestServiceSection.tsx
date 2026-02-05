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

type PrefilledFormState = Partial<ServiceRequestPayload>;

const RequestServiceSection: React.FC = () => {
    /* ===============================
        Auth + Router
    ================================ */
    const { isAuthenticated } = useAuth();
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
            phone: "",
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
        Submit
    ================================ */
    const onSubmit = async (data: ServiceRequestPayload) => {
        if (!isAuthenticated) {
            toast.info("من فضلك سجل دخولك أولًا 🔐");
            navigate("/login", {
                state: { from: "request-service" },
            });
            return;
        }

        try {
            await createServiceRequest(data);

            const oldOrders = JSON.parse(
                localStorage.getItem("myOrders") || "[]"
            );

            const newOrder = {
                ...data,
                id: crypto.getRandomValues(new Uint32Array(1))[0],
                status: "pending",
                createdAt: new Date().toISOString(),
            };

            localStorage.setItem(
                "myOrders",
                JSON.stringify([newOrder, ...oldOrders])
            );

            toast.success(
                "تم إرسال طلب الخدمة بنجاح ✅ سيتم التواصل معك قريبًا"
            );

            form.reset();
            navigate("/orders");
        } catch {
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
