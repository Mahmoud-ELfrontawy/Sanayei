import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { verifyEmail } from "../../../Api/auth/verification.api";
import { FaCheckCircle, FaExclamationTriangle, FaEnvelopeOpenText } from "react-icons/fa";
import "../AuthShared.css";

const VerifyEmailPage: React.FC = () => {
    const { id, hash } = useParams<{ id: string; hash: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("جاري التحقق من بريدك الإلكتروني...");

    useEffect(() => {
        const handleVerification = async () => {
            if (!id || !hash) {
                setStatus("error");
                setMessage("رابط التحقق غير صالح.");
                return;
            }

            try {
                // Laravel signed URLs include expires and signature in the query string
                const response = await verifyEmail(id, hash, location.search);

                if (response.status) {
                    setStatus("success");
                    setMessage(response.message || "تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل الدخول.");

                    // Auto redirect to login after 3 seconds
                    setTimeout(() => {
                        navigate("/login");
                    }, 4000);
                } else {
                    setStatus("error");
                    setMessage(response.message || "حدث خطأ أثناء تفعيل الحساب.");
                }
            } catch (error: any) {
                setStatus("error");
                const errorMsg = error.response?.data?.message || "انتهت صلاحية الرابط أو تم استخدامه مسبقاً.";
                setMessage(errorMsg);
            }
        };

        handleVerification();
    }, [id, hash, location.search, navigate]);

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px 20px' }}>
                <div className="auth-form" style={{ alignItems: 'center' }}>

                    {status === "loading" && (
                        <>
                            <div className="verification-icon loading">
                                <FaEnvelopeOpenText size={60} color="var(--color-primary)" />
                            </div>
                            <h2 className="auth-title">جاري التحقق...</h2>
                            <p style={{ color: 'var(--color-text-secondary)' }}>{message}</p>
                            <div className="spinner-modern"></div>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="verification-icon success animate-bounce-in">
                                <FaCheckCircle size={80} color="#10b981" />
                            </div>
                            <h2 className="auth-title" style={{ color: '#10b981' }}>تبريكاتنا!</h2>
                            <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{message}</p>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                سيتم تحويلك لصفحة تسجيل الدخول تلقائياً...
                            </p>
                            <Link to="/login" className="auth-btn" style={{ marginTop: '20px' }}>
                                اذهب لتسجيل الدخول الآن
                            </Link>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="verification-icon error animate-shake">
                                <FaExclamationTriangle size={80} color="var(--color-error)" />
                            </div>
                            <h2 className="auth-title" style={{ color: 'var(--color-error)'}}>فشل التحقق</h2>
                            <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>{message}</p>
                            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                <Link to="/register" className="auth-btn" style={{ flex: 1, background: 'var(--color-bg-dark)', color: 'var(--color-text-main)' }}>
                                    إعادة التسجيل
                                </Link>
                                <Link to="/login" className="auth-btn" style={{ flex: 1 }}>
                                    تسجيل الدخول
                                </Link>
                            </div>
                        </>
                    )}

                </div>
            </div>

            <style>{`
                .verification-icon { margin-bottom: 25px; }
                .spinner-modern {
                    width: 40px;
                    height: 40px;
                    border: 4px solid rgba(0,0,0,0.1);
                    border-top-color: var(--color-primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-top: 20px;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .animate-bounce-in { animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
                @keyframes bounceIn {
                    0% { transform: scale(0); opacity: 0; }
                    60% { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-shake { animation: shake 0.5s ease-in-out; }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }
            `}</style>
        </div>
    );
};

export default VerifyEmailPage;

