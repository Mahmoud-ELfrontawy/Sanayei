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
        formState: { errors, isSubmitting },
    } = form;
    
    return (
        <>
            {/* الاسم */}
            {isSubmitting ? (
                <RequestServiceInputSkeleton />
            ) : (
                <>
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
                </>
            )}

            {/* البريد */}
            {isSubmitting ? (
                <RequestServiceInputSkeleton />
            ) : (
                <>
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
                </>
            )}

            {/* المحافظة + العنوان */}
            <div className="req-row">
                {isSubmitting ? (
                    <>
                        <RequestServiceInputSkeleton />
                        <RequestServiceInputSkeleton />
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </div>

            {/* اليوم + الوقت */}
            <div className="req-row">
                {isSubmitting ? (
                    <>
                        <RequestServiceInputSkeleton />
                        <RequestServiceInputSkeleton />
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </div>

            {/* الخدمات */}
            {isSubmitting ? (
                <RequestServiceInputSkeleton />
            ) : (
                <select
                    className="req-input"
                    {...register("service_type", {
                        required: "اختر الخدمة",
                    })}
                >
                    <option value="">اختر خدمتك</option>
                    {services.map((service) => (
                        <option key={service.id} value={service.slug}>
                            {service.name}
                        </option>
                    ))}
                </select>
            )}

            {/* الصنايعية */}
            {isSubmitting ? (
                <RequestServiceInputSkeleton />
            ) : (
                <select
                    className="req-input"
                    {...register("industrial_type", {
                        required: "اختر صنايعي",
                    })}
                >
                    <option value="">اختر صنايعي</option>
                    {sanaei.map((worker) => (
                        <option key={worker.id} value={worker.id}>
                            {worker.al_sanaei_name} -{" "}
                            {worker.al_sanaei_sanaeaa_type}
                        </option>
                    ))}
                </select>
            )}

            {/* زر الإرسال */}
            <RequestServiceSubmitSkeleton loading={isSubmitting} />
        </>
    );
};

export default RequestServiceForm;
