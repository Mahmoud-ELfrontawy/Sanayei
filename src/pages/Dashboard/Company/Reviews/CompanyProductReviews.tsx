import React, { useState, useEffect } from "react";
import { FiStar, FiMessageSquare, FiPackage, FiClock } from "react-icons/fi";
import { getCompanyReviews, getStoreProducts, getProductReviews } from "../../../../Api/auth/Company/storeManagement.api";
import { formatArabicDate } from "../../../../utils/dateFormatter";
import { getFullImageUrl } from "../../../../utils/imageUrl";
import { useNotifications } from "../../../../context/NotificationContext";
import "./CompanyProductReviews.css";

const CompanyProductReviews: React.FC = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { userNotifications } = useNotifications();
    const lastNotifIdRef = React.useRef<string | null>(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);

            try {
                // 🚀 Try the new direct endpoint first
                const res = await getCompanyReviews();
                let reviewList = Array.isArray(res) ? res : (res?.data ?? []);
                setReviews(reviewList);
            } catch (error: any) {
                // 🔄 Fallback if endpoint doesn't exist (404)
                if (error.response?.status === 404 || error.message?.includes('not be found')) {
                    console.log("Direct endpoint 404. Switching to manual crawl fallback...");
                    
                    const productsRes = await getStoreProducts();
                    const productsList = Array.isArray(productsRes) ? productsRes : (productsRes?.data ?? []);

                    const allReviews: any[] = [];
                    for (const prod of productsList) {
                        try {
                            const revRes = await getProductReviews(prod.id);
                            const revList = Array.isArray(revRes) ? revRes : (revRes?.data ?? []);
                            revList.forEach((r: any) => {
                                allReviews.push({
                                    ...r,
                                    product: prod,
                                    user_name: r.user_name || r.reviewable?.name || "مستخدم",
                                    user_type: r.user_type || (r.reviewable_type?.includes('Craftsman') ? 'صنايعي' : 'عميل'),
                                    user_avatar: r.user_avatar || r.reviewable?.avatar || null
                                });
                            });
                        } catch (e) { /* ignore per-product errors */ }
                    }
                    setReviews(allReviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.error("Critical error in fetchReviews:", error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // 🔔 Live Refresh: Fetch again if a new review notification arrives
    useEffect(() => {
        const latestReviewNotif = userNotifications.find(n => n.type === 'product_review');
        if (latestReviewNotif && latestReviewNotif.id !== lastNotifIdRef.current) {
            lastNotifIdRef.current = latestReviewNotif.id;
            fetchReviews();
        }
    }, [userNotifications]);

    if (loading) {
        return (
            <div className="crv-loading">
                <div className="crv-spinner"></div>
                <p>جاري تحميل مراجعات المنتجات...</p>
            </div>
        );
    }

    return (
        <div className="crv-container">
            <div className="crv-header">
                <div>
                    <h1>إدارة مراجعات العملاء</h1>
                    <p>تابع تقييمات وتعليقات المشترين على منتجاتك</p>
                </div>
                <div className="crv-stats-mini">
                    <div className="crv-stat-card">
                        <strong>{reviews.length}</strong>
                        <span>إجمالي التقييمات</span>
                    </div>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="crv-empty">
                    <FiMessageSquare size={64} />
                    <h2>لا توجد مراجعات بعد</h2>
                    <p>سيتم عرض التقييمات هنا بمجرد أن يترك العملاء تعليقاتهم على منتجاتك.</p>
                </div>
            ) : (
                <div className="crv-grid">
                    {reviews.map((rev) => {
                        // Normalize the data (Handles raw eloquent objects or formatted JSON)
                        const reviewer = rev.reviewable || rev.user || {};
                        const name = rev.user_name || reviewer.name || reviewer.company_name || "مستخدم";
                        const type = rev.user_type || (rev.reviewable_type?.includes('Craftsman') ? 'صنايعي' : 'عميل');

                        // Handle Avatar
                        let avatar = rev.user_avatar || reviewer.avatar || reviewer.profile_photo || reviewer.company_logo || null;
                        if (avatar && !avatar.startsWith('http')) {
                            avatar = getFullImageUrl(avatar);
                        }

                        const productName = rev.product?.name || rev.productName || "منتج غير معروف";

                        return (
                            <div key={rev.id} className="crv-card">
                                <div className="crv-card-header">
                                    <div className="crv-user">
                                        <div className="crv-avatar">
                                            {avatar ? (
                                                <img src={avatar} alt={name} />
                                            ) : (
                                                (name || "م").charAt(0)
                                            )}
                                        </div>
                                        <div className="crv-user-info">
                                            <strong>{name}</strong>
                                            <span className={`crv-type-badge ${type === 'صنايعي' ? 'craftsman' : 'user'}`}>
                                                {type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="crv-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar
                                                key={i}
                                                className={i < rev.rating ? "filled" : "empty"}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="crv-product-info">
                                    <FiPackage />
                                    <span>المنتج: <strong>{productName}</strong></span>
                                </div>

                                <div className="crv-comment-box">
                                    <p>{rev.comment || "لا يوجد تعليق نصي"}</p>
                                </div>

                                <div className="crv-card-footer">
                                    <div className="crv-date">
                                        <FiClock />
                                        <span>{formatArabicDate(rev.created_at)}</span>
                                    </div>
                                    <div className="crv-order-ref">
                                        رقم الطلب: #{rev.order_id}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CompanyProductReviews;
