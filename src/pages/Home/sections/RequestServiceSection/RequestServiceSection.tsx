
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

        // 🚫 مش مسجل دخول
        if (!isAuthenticated) {
            toast.info("من فضلك سجل دخولك أولًا لإرسال الطلب 🔐");

            navigate("/login", {
                state: {
                    from: "request-service",
                },
            });

            return;
        }

        // ✅ مسجل دخول
        try {
            await createServiceRequest(data);

            toast.success("تم إرسال الطلب بنجاح ✅");
            form.reset();

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
                            واحنا هنتواصل معاك في أقرب وقت علشان نحدد الميعاد ونبدأ الشغل.
                        </p>
                    </aside>
                </div>
            </div>
        </section>
    );
};

export default RequestServiceSection;
