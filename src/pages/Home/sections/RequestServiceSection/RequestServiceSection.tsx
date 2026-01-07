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

import "./RequestServiceSection.css";

const RequestServiceSection: React.FC = () => {
    const { register, handleSubmit, reset } =
        useForm<ServiceRequestPayload>();

    const [governorates, setGovernorates] = useState<Governorate[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [sanaei, setSanaei] = useState<Sanaei[]>([]);

    useEffect(() => {
        /* المحافظات */
        const fetchGovernorates = async () => {
            try {
                const data = await getGovernorates();
                setGovernorates(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Governorates error", err);
                setGovernorates([]);
            }
        };

        /* الخدمات (من /api/services) */
        const fetchServices = async () => {
            try {
                const data = await getServices();
                setServices(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Services error", err);
                setServices([]);
            }
        };

        /* الصنايعية */
        const fetchSanaei = async () => {
            try {
                const data = await getSanaei();
                setSanaei(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Sanaei error", err);
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
                    <form className="req-card" onSubmit={handleSubmit(onSubmit)}>

                        {/* الاسم */}
                        <input
                            className="req-input"
                            placeholder="الاسم بالكامل"
                            {...register("name", { required: true })}
                        />

                        {/* البريد */}
                        <input
                            className="req-input"
                            placeholder="البريد الإلكتروني"
                            {...register("email", { required: true })}
                        />

                        {/* المحافظة + العنوان */}
                        <div className="req-row">
                            <select
                                className="req-input"
                                {...register("province", { required: true })}
                            >
                                <option value="">المحافظة</option>
                                {governorates.map(g => (
                                    <option key={g.id} value={g.name}>
                                        {g.name}
                                    </option>
                                ))}
                            </select>

                            <input
                                className="req-input"
                                placeholder="العنوان"
                                {...register("address", { required: true })}
                            />
                        </div>

                        {/* اليوم + الوقت */}
                        <div className="req-row">
                            <input
                                type="date"
                                className="req-input"
                                {...register("date", { required: true })}
                            />
                            <input
                                type="time"
                                className="req-input"
                                {...register("time", { required: true })}
                            />
                        </div>

                        {/* الخدمات (عربي + slug للباك) */}
                        <select
                            className="req-input"
                            {...register("service_type", { required: true })}
                        >
                            <option value="">اختر خدمتك</option>
                            {services.map(service => (
                                <option key={service.id} value={service.slug}>
                                    {service.name}
                                </option>
                            ))}
                        </select>

                        {/* الصنايعية */}
                        <select
                            className="req-input"
                            disabled={sanaei.length === 0}
                            {...register("industrial_type", { required: true })}
                        >
                            <option value="">
                                {sanaei.length === 0
                                    ? "لا يوجد صنايعية حاليًا"
                                    : "اختر صنايعي"}
                            </option>

                            {sanaei.map(worker => (
                                <option key={worker.id} value={worker.id}>
                                    {worker.al_sanaei_name} -{" "}
                                    {worker.al_sanaei_sanaeaa_type}
                                </option>
                            ))}
                        </select>

                        {/* زر الإرسال */}
                        <button type="submit" className="req-submit">
                            تأكيد الحجز
                        </button>
                    </form>

                    <aside className="req-side">
                        <h2 className="req-title">اطلب خدمتك الآن</h2>
                        <p className="req-text">
                            املأ البيانات المطلوبة، واحنا
                            <br />
                            هنتواصل معاك في أقرب وقت
                            <br />
                            علشان نحدد الميعاد ونبدأ الشغل
                        </p>
                    </aside>
                </div>
            </div>
        </section>
    );
};

export default RequestServiceSection;
