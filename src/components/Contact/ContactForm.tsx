import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import type { ContactPayload } from "../../constants/contact";
import { sendContactMessage } from "../../Api/contact.api";
import { RequestServiceInputSkeleton } from
    "../../pages/Home/sections/RequestServiceSection/RequestServiceSkeleton";
import Button from "../ui/Button/Button";
import "./ContactForm.css";

const ContactForm: React.FC = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactPayload>();

    const onSubmit = async (data: ContactPayload) => {
        try {
            await sendContactMessage(data);
            toast.success("تم إرسال رسالتك بنجاح ✅");
            reset();
        } catch {
            toast.error("حدث خطأ أثناء الإرسال ❌");
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="contact-form card"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* الاسم */}
                <div>
                    {isSubmitting ? (
                        <RequestServiceInputSkeleton />
                    ) : (
                        <input
                            className="contact-input"
                            placeholder="اسمك *"
                            {...register("name", { required: "الاسم مطلوب" })}

                        />
                    )}
                    {errors.name && <p className="form-error">{errors.name.message}</p>}
                </div>

                {/* الهاتف */}
                <div>
                    {isSubmitting ? (
                        <RequestServiceInputSkeleton />
                    ) : (
                        <input
                            className="contact-input"
                            placeholder="رقم الهاتف *"
                            {...register("phone", {
                                required: "رقم الهاتف مطلوب",
                                minLength: {
                                    value: 10,
                                    message: "رقم الهاتف غير صحيح",
                                },
                            })}
                        />
                    )}
                    {errors.phone && (
                        <p className="form-error">{errors.phone.message}</p>
                    )}
                </div>
            </div>

            {/* الرسالة */}
            <div className="mt-6">
                {isSubmitting ? (
                    <RequestServiceInputSkeleton />
                ) : (
                    <textarea
                        className="contact-textarea"
                        rows={5}
                        placeholder="اكتب رسالتك *"
                        {...register("message", { required: "الرسالة مطلوبة" })}
                    />
                )}
                {errors.message && (
                    <p className="form-error">{errors.message.message}</p>
                )}
            </div>

            <div className="btn-Contact text-start">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "جارٍ الإرسال..." : "إرسال"}
                </Button>
            </div>
        </form>
    );
};

export default ContactForm;
