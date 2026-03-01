import React, { useState, useRef, useEffect } from "react";
import { FaTimes, FaCheck } from "react-icons/fa";
import "./TermsModal.css";

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAgree: () => void;
    title?: string;
}

const TermsModal: React.FC<TermsModalProps> = ({
    isOpen,
    onClose,
    onAgree,
    title = "الشروط والأحكام وتعليمات الاستخدام"
}) => {
    const [canAgree, setCanAgree] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCanAgree(false);
        }
    }, [isOpen]);

    const handleScroll = () => {
        if (contentRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
            // If scrolled to 90% of the content
            if (scrollTop + clientHeight >= scrollHeight - 20) {
                setCanAgree(true);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="terms-modal-overlay" onClick={onClose}>
            <div className="terms-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="terms-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="terms-modal-header">
                    <h3>{title}</h3>
                    <p>يرجى قراءة التعليمات التالية بعناية للمتابعة</p>
                </div>

                <div
                    className="terms-modal-body"
                    ref={contentRef}
                    onScroll={handleScroll}
                >
                    <div className="terms-text-section">
                        <h4>1. شروط الاستخدام</h4>
                        <p>باستخدامك لمنصة "صنايعي "، فإنك توافق على الالتزام بكافة الشروط والأحكام المعمول بها. المنصة هي وسيط يربط بين مقدمي الخدمات (الصنايعية والشركات) وبين طالبي الخدمات (المستخدمين).</p>

                        <h4>2. التعهد بصحة البيانات</h4>
                        <p>يتعهد المستخدم (سواء كان فنياً، شركة، أو مستخدماً عادياً) بأن كافة البيانات المدخلة في نظام التسجيل هي بيانات صحيحة وتخصه شخصياً. أي تلاعب في البيانات يعرض الحساب للحظر القانوني والملاحقة إذا لزم الأمر.</p>

                        <h4>3. سياسة الخصوصية</h4>
                        <p>نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. لن يتم مشاركة بياناتك مع أي طرف ثالث دون موافقتك الصريحة، إلا في الحالات التي يقتضيها القانون لتسيير طلبات الخدمة (مثل مشاركة رقم هاتفك مع الفني الذي قبل طلبك).</p>

                        <h4>4. جودة الخدمة والتعامل</h4>
                        <p>المنصة غير مسؤولة عن جودة العمل المنفذ بشكل مباشر، ولكنها توفر نظام تقييم شفاف. يُنصح دائماً بالتعامل باحترام متبادل وتوثيق الاتفاقات المالية بوضوح قبل البدء في العمل.</p>

                        <h4>5. العمولات والمدفوعات</h4>
                        <p>في حالة وجود عمولات للمنصة، سيتم توضيحها مسبقاً. استخدام المحفظة الرقمية لشحن الرصيد يخضع لشروط مزودي خدمة الدفع (مثل Paymob).</p>

                        <h4>6. المحتوى المحظور</h4>
                        <p>يمنع منعاً باتاً استخدام المنصة لأي غرض غير قانوني أو نشر محتوى مسيء أو صور غير لائقة. سيتم حذف أي حساب ينتهك هذه القواعد بشكل فوري.</p>

                        <div className="scroll-indicator-hint">
                            {!canAgree && "👇 يرجى القراءة حتى النهاية لتفعيل زر الموافقة"}
                        </div>
                    </div>
                </div>

                <div className="terms-modal-actions">
                    <button
                        className={`agree-btn ${canAgree ? "active" : "disabled"}`}
                        onClick={() => {
                            if (canAgree) {
                                onAgree();
                                onClose();
                            }
                        }}
                        disabled={!canAgree}
                    >
                        <FaCheck /> قرأت الشروط وأوافق عليها
                    </button>
                    <button className="cancel-terms-btn" onClick={onClose}>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
