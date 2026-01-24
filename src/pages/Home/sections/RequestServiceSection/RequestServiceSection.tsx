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
    // ✅ الفورم دايمًا موجود
    const form = useForm<ServiceRequestPayload>();

    const {
        services,
        governorates,
        sanaei,
        loading,
    } = useRequestServiceData();

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const location = useLocation() as {
        state: PrefilledFormState | null;
    };

    // ✅ تعبئة تلقائية بعد تحميل الداتا
    useEffect(() => {
        if (loading || !location.state) return;

        Object.entries(location.state).forEach(
            ([key, value]) => {
                if (value !== undefined) {
                    form.setValue(
                        key as keyof ServiceRequestPayload,
                        value as ServiceRequestPayload[keyof ServiceRequestPayload]
                    );
                }
            }
        );
    }, [loading, location.state, form]);

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

            const old = JSON.parse(
                localStorage.getItem("myOrders") || "[]"
            );

            const newRequest = {
                ...data,
                id: crypto.getRandomValues(new Uint32Array(1))[0],
                status: "pending",
            };

            localStorage.setItem(
                "myOrders",
                JSON.stringify([newRequest, ...old])
            );

            toast.info("تم إرسال طلب الخدمة بنجاح جاري مراجعته الآن وسيتم التواصل معك قريبًا");
            form.reset();
            navigate("/orders");
        } catch {
            toast.error("حدث خطأ أثناء إرسال الطلب ❌");
        }
    };

    // ⛔ لا ترندر الفورم إلا بعد تحميل الداتا
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

                    <aside className="req-side">
                        <h2 className="req-title">
                            اطلب خدمتك الآن
                        </h2>
                        <p className="req-text">
                            املأ البيانات المطلوبة،
                            وسنتواصل معك في أقرب وقت.
                        </p>
                    </aside>
                </div>
            </div>
        </section>
    );
};

export default RequestServiceSection;
