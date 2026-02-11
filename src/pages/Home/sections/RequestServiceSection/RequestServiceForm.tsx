import { useEffect, useMemo, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { ServiceRequestPayload } from "../../../../constants/serviceRequest";
import type { Service } from "../../../../constants/service";
import type { Governorate } from "../../../../Api/serviceRequest/governorates.api";
import type { Sanaei } from "../../../../Api/serviceRequest/sanaei.api";

import {
    RequestServiceInputSkeleton,
    RequestServiceSubmitSkeleton,
} from "./RequestServiceSkeleton";

interface Props {
    form: UseFormReturn<ServiceRequestPayload>;
    services: Service[];
    governorates: Governorate[];
    sanaei: Sanaei[];
}

const RequestServiceForm: React.FC<Props> = ({
    form,
    services,
    governorates,
    sanaei,
}) => {
    const {
        register,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = form;

    const serviceId = watch("service_type");
    const workerId = watch("industrial_type");

    const autoSelectedRef = useRef(false);


    /* ===============================
        Loading (صح)
    ================================ */

    const isLoading =
        !Array.isArray(services) ||
        !Array.isArray(governorates) ||
        !Array.isArray(sanaei);

    const showSkeleton = isLoading || isSubmitting;

    /* ===============================
        حفظ اسم الخدمة
    ================================ */

    useEffect(() => {
        if (!serviceId) return;

        const service = services.find(
            (s) => String(s.id) === String(serviceId)
        );

        if (!service) return;

        setValue("service_name", service.name);
    }, [serviceId, services, setValue]);

    /* ===============================
        فلترة الصنايعية
    ================================ */

    const filteredSanaei = useMemo(() => {
        if (!serviceId) return sanaei;

        return sanaei.filter((w) => {
            const workerServiceId =
                w.service_id ??
                w.service?.id;

            return String(workerServiceId) === String(serviceId);
        });
    }, [serviceId, sanaei]);


    /* ===============================
        Auto select لو واحد فقط
    ================================ */

    useEffect(() => {
        if (!serviceId) return;

        if (filteredSanaei.length === 1) {
            const worker = filteredSanaei[0];

            autoSelectedRef.current = true;

            setValue("industrial_type", String(worker.id));
            setValue("industrial_name", worker.name);

            if (worker.price_range) {
                setValue("price", worker.price_range);
            } else if (worker.price) {
                setValue("price", String(worker.price));
            } else {
                setValue("price", "غير محدد");
            }
        }
    }, [serviceId, filteredSanaei, setValue]);

    /* ===============================
        Reset عند تغيير الخدمة
    ================================ */

    useEffect(() => {
        if (autoSelectedRef.current) {
            autoSelectedRef.current = false;
            return;
        }

        setValue("industrial_type", "");
        setValue("industrial_name", "");
        setValue("price", "");
    }, [serviceId, setValue]);

    /* ===============================
        اختيار صنايعي يدوي
    ================================ */

    useEffect(() => {
        if (!workerId) return;

        const worker = sanaei.find(
            (w) => String(w.id) === String(workerId)
        );

        if (!worker) return;

        setValue("industrial_name", worker.name);

        if (worker.price_range) {
            setValue("price", worker.price_range);
        } else if (worker.price) {
            setValue("price", String(worker.price));
        } else {
            setValue("price", "غير محدد");
        }
    }, [workerId, sanaei, setValue]);

    return (
        <>
            {/* المستخدم (معطل - يعرض اليوزر المسجل دخوله) */}
            {showSkeleton ? (
                <RequestServiceInputSkeleton />
            ) : (
                <select
                    className="req-input"
                    disabled
                    style={{
                        backgroundColor: '#f5f5f5',
                        cursor: 'not-allowed',
                        color: '#666'
                    }}
                >
                    <option>
                        {watch("name") || "جاري التحميل..."}
                    </option>
                </select>
            )}

            {/* حقول name, email, phone تم إزالتها - تُملأ تلقائياً من بيانات المستخدم */}


            {/* المحافظة + العنوان */}
            {showSkeleton ? (
                <RequestServiceInputSkeleton />
            ) : (
                <div className="req-row">
                    <select
                        className="req-input"
                        {...register("province", { required: true })}
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
                        {...register("address", { required: true })}
                    />
                </div>
            )}

            {/* التاريخ والوقت */}
            {showSkeleton ? (
                <>
                    <RequestServiceInputSkeleton />
                    <RequestServiceInputSkeleton />
                </>
            ) : (
                <div className="req-row">
                    <input
                        type="text"
                        className="req-input"
                        placeholder="تاريخ الخدمة المطلوب"
                        onFocus={(e) => (e.target.type = "date")}
                        {...register("date", {
                            onBlur: (e) => {
                                if (!e.target.value) e.target.type = "text";
                            },
                        })}
                    />
                    <input
                        type="text"
                        className="req-input"
                        placeholder="وقت الخدمة المطلوب"
                        onFocus={(e) => (e.target.type = "time")}
                        {...register("time", {
                            onBlur: (e) => {
                                if (!e.target.value) e.target.type = "text";
                            },
                        })}
                    />
                </div>
            )}

            {/* الخدمة */}
            {showSkeleton ? (
                <RequestServiceInputSkeleton />
            ) : (
                <select
                    className="req-input"
                    {...register("service_type", {
                        required: "اختر الخدمة",
                    })}
                >
                    <option value="">اختر خدمتك</option>
                    {services.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            )}

            {/* الصنايعي */}
            {showSkeleton ? (
                <RequestServiceInputSkeleton />
            ) : (
                <>
                    <select
                        className="req-input"
                        disabled={!serviceId}
                        {...register("industrial_type", {
                            required: "من فضلك اختر صنايعي",
                        })}
                    >
                        <option value="">
                            {serviceId
                                ? "اختر صنايعي"
                                : "اختر الخدمة أولًا"}
                        </option>

                        {filteredSanaei.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.name}
                            </option>
                        ))}
                    </select>

                    {errors.industrial_type && (
                        <span className="form-error">
                            {errors.industrial_type.message}
                        </span>
                    )}
                </>
            )}

            {/* السعر */}
            {!showSkeleton && watch("price") && (
                <div className="req-price-box">
                    <label className="req-price-label">
                        السعر المتوقع
                    </label>
                    <input
                        className="req-input"
                        readOnly
                        value={`${watch("price")} جنيه`}
                    />
                </div>
            )}

            <RequestServiceSubmitSkeleton isloading={isSubmitting} />
        </>
    );
};

export default RequestServiceForm;
