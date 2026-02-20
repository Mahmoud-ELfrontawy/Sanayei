import { useEffect, useMemo, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { ServiceRequestPayload } from "../../../../constants/serviceRequest";
import type { Service } from "../../../../constants/service";
import type { Governorate } from "../../../../Api/serviceRequest/governorates.api";
import type { Sanaei } from "../../../../Api/serviceRequest/sanaei.api";

import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { getTechnicianById } from "../../../../Api/technicians.api";
import { getAvatarUrl } from "../../../../utils/imageUrl";
// @ts-ignore
import defaultAvatar from "../../../../assets/images/image5.png";
import { formatTimeAgo } from "../../../../utils/timeAgo";

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

    const [selectedCraftsmanDetails, setSelectedCraftsmanDetails] = useState<any>(null);

    const serviceId = watch("service_type");
    const workerId = watch("industrial_type");

    const autoSelectedRef = useRef(false);

    // Fetch craftsman details on selection
    useEffect(() => {
        if (!workerId) {
            setSelectedCraftsmanDetails(null);
            return;
        }

        const fetchDetails = async () => {
            try {
                const data = await getTechnicianById(workerId);
                setSelectedCraftsmanDetails(data);
            } catch (error) {
                console.error("Failed to fetch craftsman details", error);
                // Fallback to basic info from list if fetch fails
                const basicInfo = sanaei.find((w) => String(w.id) === String(workerId));
                if (basicInfo) setSelectedCraftsmanDetails(basicInfo);
            }
        };

        fetchDetails();
    }, [workerId, sanaei]);

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
                        type={watch("date") ? "date" : "text"}
                        className="req-input"
                        placeholder="تاريخ الخدمة المطلوب"
                        dir="ltr"
                        onFocus={(e) => (e.target.type = "date")}
                        {...register("date", {
                            required: true,
                            onBlur: (e) => {
                                if (!e.target.value) e.target.type = "text";
                            }
                        })}
                        title="تاريخ الزيارة"
                    />
                    <input
                        type={watch("time") ? "time" : "text"}
                        className="req-input"
                        placeholder="وقت الخدمة المطلوب"
                        dir="ltr"
                        onFocus={(e) => (e.target.type = "time")}
                        {...register("time", {
                            required: true,
                            onBlur: (e) => {
                                if (!e.target.value) e.target.type = "text";
                            }
                        })}
                        title="وقت الزيارة"
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

                    {selectedCraftsmanDetails && (
                        <div className="selected-craftsman-card">
                            <div className="craftsman-main-group">
                                <img
                                    src={
                                        getAvatarUrl(
                                            selectedCraftsmanDetails.profile_photo ||
                                            selectedCraftsmanDetails.avatar ||
                                            selectedCraftsmanDetails.avatarUrl ||
                                            selectedCraftsmanDetails.image ||
                                            selectedCraftsmanDetails.profile_image ||
                                            selectedCraftsmanDetails.profile_image_url ||
                                            selectedCraftsmanDetails.photo,
                                            selectedCraftsmanDetails.name
                                        )
                                    }
                                    alt={selectedCraftsmanDetails.name}
                                    className="selected-craftsman-avatar"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = defaultAvatar;
                                    }}
                                />
                                <div className="selected-craftsman-details">
                                    <h4 className="selected-craftsman-name">
                                        {selectedCraftsmanDetails.name}
                                    </h4>
                                    <div className="craftsman-meta-row">
                                        <div className="meta-item-badge rating">
                                            <span>⭐</span>
                                            <span>{selectedCraftsmanDetails.rating || "5.0"}</span>
                                            {selectedCraftsmanDetails.reviews_count && (
                                                <span style={{ fontSize: '11px', opacity: 0.7, marginInlineStart: '2px' }}>
                                                    ({selectedCraftsmanDetails.reviews_count})
                                                </span>
                                            )}
                                        </div>

                                        <div className={`meta-item-badge status ${selectedCraftsmanDetails.is_online || formatTimeAgo(selectedCraftsmanDetails.last_seen) === "الآن" ? 'online' : ''}`}>
                                            <span className="status-dot"></span>
                                            <span>
                                                {selectedCraftsmanDetails.is_online ? "متصل الآن" : (
                                                    selectedCraftsmanDetails.last_seen
                                                        ? (formatTimeAgo(selectedCraftsmanDetails.last_seen) === "الآن"
                                                            ? "متصل الآن"
                                                            : `آخر ظهور ${formatTimeAgo(selectedCraftsmanDetails.last_seen)}`)
                                                        : "غير متصل"
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link
                                to={`/craftsman/${selectedCraftsmanDetails.id}`}
                                target="_blank"
                                className="btn-view-profile-modern"
                                title="عرض الملف الشخصي للصنايعي"
                            >
                                <FaUser size={16} />
                            </Link>
                        </div>
                    )}


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
