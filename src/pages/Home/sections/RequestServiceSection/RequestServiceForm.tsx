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
        Loading State
    ================================ */

    const isLoading =
        !services.length ||
        !governorates.length ||
        !sanaei.length;

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

        return sanaei.filter(
            (w) => String(w.service_id) === String(serviceId)
        );
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
        عند اختيار صنايعي يدوي
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
            {/* الاسم */}
            {showSkeleton ? (
                <RequestServiceInputSkeleton />
            ) : (
                <>
                    <input
                        className="req-input"
                        placeholder="الاسم بالكامل"
                        {...register("name", { required: "الاسم مطلوب" })}
                    />
                    {errors.name && (
                        <span className="form-error">
                            {errors.name.message}
                        </span>
                    )}
                </>
            )}

            {/* البريد */}
            {showSkeleton ? (
                <RequestServiceInputSkeleton />
            ) : (
                <input
                    className="req-input"
                    placeholder="البريد الإلكتروني"
                    {...register("email", { required: "البريد مطلوب" })}
                />
            )}

            {/* الهاتف */}
            {showSkeleton ? (
                <RequestServiceInputSkeleton />
            ) : (
                <input
                    className="req-input"
                    placeholder="رقم الهاتف"
                    {...register("phone", { required: "رقم الهاتف مطلوب" })}
                />
            )}

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
                    <input type="date" className="req-input" {...register("date")} />
                    <input type="time" className="req-input" {...register("time")} />
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

            <RequestServiceSubmitSkeleton loading={isSubmitting} />
        </>
    );
};

export default RequestServiceForm;
