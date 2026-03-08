import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import "./PaymentResult.css";

const PaymentResult: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const status = searchParams.get("status");
    const success = searchParams.get("success") === "true" || status === "success";
    const type = searchParams.get("type") || "wallet"; // wallet or order

    useEffect(() => {
        // Redirect after a short delay
        const timer = setTimeout(() => {
            if (type === "order") {
                navigate("/dashboard/orders");
            } else {
                navigate("/dashboard/wallet?status=" + (success ? "success" : "failed"));
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [success, type, navigate]);

    return (
        <div className="payment-result-container">
            <div className={`payment-result-card ${success ? "success" : "failed"}`}>
                <div className="result-icon">
                    {success ? (
                        <FaCheckCircle className="icon-success" />
                    ) : (
                        <FaTimesCircle className="icon-failed" />
                    )}
                </div>

                <h2>{success ? "تمت العملية بنجاح" : "فشلت العملية"}</h2>
                <p>
                    {success
                        ? "شكراً لك! تم معالجة دفعتك بنجاح."
                        : "نعتذر، حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى."}
                </p>

                <div className="redirect-hint">
                    <FaSpinner className="spinner" />
                    <span>جاري تحويلك تلقائياً خلال لحظات...</span>
                </div>

                <button
                    className="btn-manual-redirect"
                    onClick={() => navigate(type === "order" ? "/dashboard/orders" : "/dashboard/wallet")}
                >
                    الذهاب الآن
                </button>
            </div>
        </div>
    );
};

export default PaymentResult;
