import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import bg from "../../../../assets/images/bggg1.jpg";

import { createServiceRequest }
    from "../../../../Api/serviceRequest/serviceRequests.api";

import { getServices, type Service }
    from "../../../../Api/serviceRequest/service.api";

import {
    getGovernorates,
    type Governorate,
} from "../../../../Api/serviceRequest/governorates.api";

import {
    getSanaei,
    type Sanaei,
} from "../../../../Api/serviceRequest/sanaei.api";

import type { ServiceRequestPayload } from "../../../../constants/serviceRequest";

import { RequestServiceSkeleton } from "./RequestServiceSkeleton";

import "./RequestServiceSection.css";

const RequestServiceSection: React.FC = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ServiceRequestPayload>();

    const [governorates, setGovernorates] = useState<Governorate[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [sanaei, setSanaei] = useState<Sanaei[]>([]);

    useEffect(() => {
        const fetchGovernorates = async () => {
            try {
                const data = await getGovernorates();
                setGovernorates(Array.isArray(data) ? data : []);
            } catch {
                setGovernorates([]);
            }
        };

        const fetchServices = async () => {
            try {
                const data = await getServices();
                setServices(Array.isArray(data) ? data : []);
            } catch {
                setServices([]);
            }
        };

        const fetchSanaei = async () => {
            try {
                const data = await getSanaei();
                setSanaei(Array.isArray(data) ? data : []);
            } catch {
                setSanaei([]);
            }
        };

        fetchGovernorates();
        fetchServices();
        fetchSanaei();
    }, []);

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
                    <form
                        className="req-card"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        {/* الاسم */}
                        <input
                            className="req-input"
                            placeholder="الاسم بالكامل"
                            {...register("name", {
                                required: "الاسم مطلوب",
                                minLength: {
                                    value: 3,
                                    message: "الاسم قصير جدًا",
                                },
                            })}
                        />
                        {errors.name && (
                            <span className="form-error">
                                {errors.name.message}
                            </span>
                        )}

                        {/* البريد */}
                        <input
                            className="req-input"
                            placeholder="البريد الإلكتروني"
                            {...register("email", {
                                required: "البريد مطلوب",
                                pattern: {
                                    value: /^\S+@\S+$/i,
                                    message: "البريد غير صالح",
                                },
                            })}
                        />
                        {errors.email && (
                            <span className="form-error">
                                {errors.email.message}
                            </span>
                        )}

                        {/* المحافظة + العنوان */}
                        <div className="req-row">
                            <select
                                className="req-input"
                                {...register("province", {
                                    required: "اختر المحافظة",
                                })}
                            >
                                <option value="">المحافظة</option>
                                {governorates.map((g) => (
                                    <option key={g.id} value={g.name}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                className="req-input"
                                placeholder="العنوان"
                                {...register("address", {
                                    required: "العنوان مطلوب",
                                })}
                            />
                        </div>

                        {errors.province && (
                            <span className="form-error">
                                {errors.province.message}
                            </span>
                        )}
                        {errors.address && (
                            <span className="form-error">
                                {errors.address.message}
                            </span>
                        )}

                        {/* اليوم + الوقت */}
                        <div className="req-row">
                            <input
                                type="date"
                                className="req-input"
                                {...register("date", {
                                    required: "اختر التاريخ",
                                })}
                            />
                            <input
                                type="time"
                                className="req-input"
                                {...register("time", {
                                    required: "اختر الوقت",
                                })}
                            />
                        </div>

                        {errors.date && (
                            <span className="form-error">
                                {errors.date.message}
                            </span>
                        )}
                        {errors.time && (
                            <span className="form-error">
                                {errors.time.message}
                            </span>
                        )}

                        {/* الخدمات */}
                        <select
                            className="req-input"
                            {...register("service_type", {
                                required: "اختر الخدمة",
                            })}
                        >
                            <option value="">اختر خدمتك</option>
                            {services.map((service) => (
                                <option
                                    key={service.id}
                                    value={service.slug}
                                >
                                    {service.name}
                                </option>
                            ))}
                        </select>

                        {errors.service_type && (
                            <span className="form-error">
                                {errors.service_type.message}
                            </span>
                        )}

                        {/* الصنايعية */}
                        <select
                            className="req-input"
                            disabled={sanaei.length === 0}
                            {...register("industrial_type", {
                                required: "اختر صنايعي",
                            })}
                        >
                            <option value="">
                                {sanaei.length === 0
                                    ? "لا يوجد صنايعية حاليًا"
                                    : "اختر صنايعي"}
                            </option>

                            {sanaei.map((worker) => (
                                <option key={worker.id} value={worker.id}>
                                    {worker.al_sanaei_name} -{" "}
                                    {worker.al_sanaei_sanaeaa_type}
                                </option>
                            ))}
                        </select>

                        {errors.industrial_type && (
                            <span className="form-error">
                                {errors.industrial_type.message}
                            </span>
                        )}

                        {/* زر الإرسال */}
                        <RequestServiceSkeleton loading={isSubmitting} />
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
