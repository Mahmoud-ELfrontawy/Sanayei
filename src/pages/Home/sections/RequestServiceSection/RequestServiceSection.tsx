
// (Container – submit + layout فقط)

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import bg from "../../../../assets/images/bggg1.jpg";

import { createServiceRequest } from "../../../../Api/serviceRequest/serviceRequests.api";
import type { ServiceRequestPayload } from "../../../../constants/serviceRequest";

import { useRequestServiceData } from "./useRequestServiceData";
import RequestServiceForm from "./RequestServiceForm";


import "./RequestServiceSection.css";
import { useAuth } from "../../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const RequestServiceSection: React.FC = () => {
    const form = useForm<ServiceRequestPayload>();
    const { services, governorates, sanaei } = useRequestServiceData();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

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
            // 🔥 تخزين مؤقت
            const old = JSON.parse(localStorage.getItem("myOrders") || "[]");
            const newRequest = {
                id: crypto.getRandomValues(new Uint32Array(1))[0],
                ...data,
                status: "pending",
            };

            localStorage.setItem(
                "myOrders",
                JSON.stringify([newRequest, ...old])
            );

            toast.success("تم إرسال الطلب بنجاح ✅");

            form.reset();

            // ✅ نروح صفحة الطلبات
            navigate("/orders");

        } catch {
            toast.error("حدث خطأ أثناء إرسال الطلب ❌");
        }
    };

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
                        <h2 className="req-title">اطلب خدمتك الآن</h2>
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