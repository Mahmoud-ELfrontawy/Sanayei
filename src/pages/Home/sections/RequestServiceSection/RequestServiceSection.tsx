import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import bg from "../../../../assets/images/bggg1.jpg";
import { createServiceRequest } from "../../../../Api/serviceRequests.api";
import type { ServiceRequestPayload } from "../../../../constants/serviceRequest";

import "./RequestServiceSection.css";

const RequestServiceSection: React.FC = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ServiceRequestPayload>();

    const onSubmit = async (data: ServiceRequestPayload) => {
        try {
            await createServiceRequest(data);
            toast.success("تم إرسال الطلب بنجاح ✅");
            reset();
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
                    <form className="req-card" onSubmit={handleSubmit(onSubmit)}>
                        <h3 className="req-card-title">اطلب خدمتك الآن</h3>

                        {/* الاسم */}
                        <input
                            className={`req-input ${isSubmitting ? "loading" : ""}`}
                            placeholder="الاسم بالكامل"
                            disabled={isSubmitting}
                            {...register("name", { required: "الاسم مطلوب" })}
                        />
                        {errors.name && (
                            <span className="form-error">{errors.name.message}</span>
                        )}

                        {/* البريد */}
                        <input
                            className={`req-input ${isSubmitting ? "loading" : ""}`}
                            placeholder="البريد الإلكتروني"
                            disabled={isSubmitting}
                            {...register("email", {
                                required: "البريد مطلوب",
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: "بريد غير صالح",
                                },
                            })}
                        />
                        {errors.email && (
                            <span className="form-error">{errors.email.message}</span>
                        )}

                        {/* المحافظة + العنوان */}
                        <div className="req-row">
                            <select
                                className={`req-input ${isSubmitting ? "loading" : ""}`}
                                disabled={isSubmitting}
                                {...register("province", {
                                    required: "اختر المحافظة",
                                })}
                            >
                                <option value="">المحافظة</option>
                                <option value="cairo">القاهرة</option>
                                <option value="giza">الجيزة</option>
                            </select>

                            <input
                                className={`req-input ${isSubmitting ? "loading" : ""}`}
                                placeholder="العنوان بالتفصيل"
                                disabled={isSubmitting}
                                {...register("address", {
                                    required: "العنوان مطلوب",
                                })}
                            />
                        </div>

                        {/* اليوم + الوقت */}
                        <div className="req-row">
                            <input
                                type="date"
                                className={`req-input ${isSubmitting ? "loading" : ""}`}
                                disabled={isSubmitting}
                                {...register("date", { required: true })}
                            />

                            <input
                                type="time"
                                className={`req-input ${isSubmitting ? "loading" : ""}`}
                                disabled={isSubmitting}
                                {...register("time", { required: true })}
                            />
                        </div>

                        {/* نوع الخدمة */}
                        <select
                            className={`req-input ${isSubmitting ? "loading" : ""}`}
                            disabled={isSubmitting}
                            {...register("service_type", { required: true })}
                        >
                            <option value="">اختر خدمتك</option>
                            <option value="electric">كهرباء</option>
                            <option value="plumbing">سباكة</option>
                            <option value="carpentry">نجارة</option>
                        </select>

                        {/* الصنايعي */}
                        <select
                            className={`req-input ${isSubmitting ? "loading" : ""}`}
                            disabled={isSubmitting}
                            {...register("industrial_type", { required: true })}
                        >
                            <option value="">اختر صنايعي</option>
                            <option value="1">صنايعي 1</option>
                            <option value="2">صنايعي 2</option>
                        </select>

                        {/* زر الإرسال */}
                        <button
                            type="submit"
                            className="req-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "جارِ مراجعة الطلب..."
                                : "تأكيد الحجز"}
                        </button>
                    </form>

                    <aside className="req-side">
                        <h2 className="req-title">اطلب خدمتك الآن</h2>
                        <p className="req-text">
                            املأ البيانات المطلوبة، واحنا
                            <br />
                            هنتواصل معاك في أقرب وقت
                            <br />
                            لتأكيد الميعاد وبدء الشغل
                        </p>
                    </aside>
                </div>
            </div>
        </section>
    );
};

export default RequestServiceSection;