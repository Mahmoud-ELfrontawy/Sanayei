import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import { verifyOtp, resendVerificationEmail } from "../../../Api/user/register.api";
import img1 from "../../../assets/images/cuate (3) 1.png";
import "../AuthShared.css";
import "../Register/Register.css";

const VerifyOtpPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleVerifyOtp = async () => {
        if (otp.length < 4) {
            toast.error("يرجى إدخال رمز التحقق كاملاً");
            return;
        }
        setIsVerifying(true);
        try {
            const res = await verifyOtp(email, otp);

            if (res?.token) {
                const { authStorage } = await import("../../../context/auth/auth.storage");
                authStorage.setToken(res.token);
                authStorage.setUserType("user");
                if (res.user) authStorage.setUser(res.user);

                const userName = res.user?.name || "صديقنا";
                toast.success(`مرحباً بك ${userName} تم تفعيل حسابك بنجاح 🎉`);
                window.location.replace("/");
            } else {
                toast.error(res?.message || "الرمز غير صحيح، يرجى المحاولة مرة أخرى");
            }
        } catch (error: any) {
            const message = error.response?.data?.message || "الرمز غير صحيح أو انتهت صلاحيته";
            toast.error(message);
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error("لم يتم تحديد البريد الإلكتروني");
            return;
        }
        setIsResending(true);
        try {
            await resendVerificationEmail(email);
            toast.success("تم إرسال رمز التحقق مرة أخرى 📧");
        } catch {
            toast.error("تعذر إعادة الإرسال، يرجى الانتظار قليلاً");
        } finally {
            setIsResending(false);
        }
    };

    // If no email provided, redirect to login
    if (!email) {
        return (
            <div className="auth-page-wrapper">
                <div className="auth-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
                    <h2 className="auth-title">رابط غير صالح</h2>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                        لم يتم تحديد البريد الإلكتروني. يرجى تسجيل الدخول مرة أخرى.
                    </p>
                    <Link to="/login" className="auth-btn" style={{ display: 'inline-block' }}>
                        العودة لتسجيل الدخول
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page-wrapper">
            <div className="auth-card auth-card--split">
                <div className="auth-form">
                    <div style={{ fontSize: "3rem", textAlign: "center", marginBottom: "0.5rem" }}>🔐</div>
                    <h2 className="auth-title" style={{ textAlign: "center" }}>تفعيل الحساب</h2>
                    <p style={{ color: "var(--text-secondary)", textAlign: "center", marginBottom: "1.5rem", lineHeight: 1.8 }}>
                        تم إرسال رمز التحقق إلى بريدك الإلكتروني
                        <br />
                        <strong style={{ color: "var(--primary)" }}>{email}</strong>
                        <br />
                        <span style={{ fontSize: "0.85rem" }}>(الرمز صالح لمدة 10 دقائق)</span>
                    </p>

                    <div className="otp-container">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <input
                                key={index}
                                id={`verify-otp-${index}`}
                                type="text"
                                maxLength={1}
                                inputMode="numeric"
                                placeholder=" "
                                className="otp-input-box"
                                value={otp[index] || ""}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, "").slice(-1);
                                    const newOtpArr = otp.split("");
                                    while (newOtpArr.length < 6) newOtpArr.push("");
                                    newOtpArr[index] = value;
                                    const finalOtp = newOtpArr.slice(0, 6).join("");
                                    setOtp(finalOtp);
                                    if (value && index < 5) {
                                        document.getElementById(`verify-otp-${index + 1}`)?.focus();
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Backspace" && !otp[index] && index > 0) {
                                        document.getElementById(`verify-otp-${index - 1}`)?.focus();
                                    }
                                }}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const pasteData = e.clipboardData.getData("text").trim().slice(0, 6).replace(/[^0-9]/g, "");
                                    setOtp(pasteData);
                                    const nextIndex = Math.min(pasteData.length, 5);
                                    document.getElementById(`verify-otp-${nextIndex}`)?.focus();
                                }}
                            />
                        ))}
                    </div>

                    <button
                        className="auth-btn"
                        disabled={isVerifying || otp.length < 4}
                        onClick={handleVerifyOtp}
                        style={{ marginBottom: "1rem" }}
                    >
                        {isVerifying ? "جاري التحقق..." : "تأكيد الرمز وتفعيل الحساب 🚀"}
                    </button>

                    <button
                        type="button"
                        className="auth-btn"
                        disabled={isResending}
                        onClick={handleResend}
                        style={{ background: "var(--surface-2)", color: "var(--text-primary)", border: "1px solid var(--border)", marginBottom: "1rem" }}
                    >
                        <FiRefreshCw style={{ marginLeft: "0.5rem" }} />
                        {isResending ? "جاري الإرسال..." : "إعادة إرسال الرمز"}
                    </button>

                    <div className="auth-footer-link" style={{ textAlign: "center" }}>
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", margin: "0 auto" }}
                        >
                            <FiArrowLeft /> العودة لتسجيل الدخول
                        </button>
                    </div>
                </div>

                <div className="auth-illustration">
                    <img src={img1} alt="OTP Verification" className="register-img-custom" />
                </div>
            </div>
        </div>
    );
};

export default VerifyOtpPage;
