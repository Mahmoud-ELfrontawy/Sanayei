import { useState, useEffect } from 'react';
import {
    Search,
    Trash2,
    Star,
    RefreshCcw,
    Quote
} from 'lucide-react';
import { toast } from 'react-toastify';
import { adminReviewsApi } from '../../../Api/admin/adminReviews.api';
import './ReviewsPage.css';

interface ReviewData {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user?: { id: number; name: string };
    craftsman?: { id: number; name: string };
    service_request?: { id: number; service?: { name: string } };
}

const ReviewsPage = () => {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await adminReviewsApi.getAllReviews();
            setReviews(response.data);
        } catch (err: any) {
            toast.error("فشل تحميل قائمة التقييمات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا التقييم؟")) return;
        try {
            await adminReviewsApi.deleteReview(id);
            toast.success("تم حذف التقييم بنجاح");
            fetchReviews();
        } catch (err) {
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                size={14}
                fill={i < rating ? "#f59e0b" : "transparent"}
                color={i < rating ? "#f59e0b" : "#d1d5db"}
            />
        ));
    };

    const filteredReviews = reviews.filter(r =>
        r.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.craftsman?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.comment?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="reviews-container">
            <header className="reviews-premium-header">
                <div className="header-glass-content">
                    <div className="title-area">
                        <h1>إدارة التقييمات</h1>
                        <p>مراقبة جودة الخدمة من خلال مراجعة آراء العملاء</p>
                    </div>
                </div>
            </header>

            <div className="reviews-controls">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="ابحث باسم العميل، الصنايعي، أو محتوى التقييم..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="action-btn" onClick={fetchReviews} title="تحديث">
                    <RefreshCcw size={18} />
                </button>
            </div>

            <div className="reviews-table-wrapper">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>جاري التحميل...</div>
                ) : (
                    <table className="reviews-table">
                        <thead>
                            <tr>
                                <th>العميل</th>
                                <th>الصنايعي</th>
                                <th>الخدمة</th>
                                <th>التقييم</th>
                                <th>التعليق</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReviews.length > 0 ? filteredReviews.map(review => (
                                <tr key={review.id}>
                                    <td>
                                        <div className="entity-info">
                                            <span className="entity-name">{review.user?.name}</span>
                                            <span className="entity-sub">ID: {review.user?.id}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="entity-info">
                                            <span className="entity-name">{review.craftsman?.name}</span>
                                            <span className="entity-sub">ID: {review.craftsman?.id}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                            {review.service_request?.service?.name || 'طلب خدمة'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="rating-stars">
                                            {renderStars(review.rating)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="review-comment">
                                            {review.comment ? (
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <Quote size={12} style={{ opacity: 0.3 }} />
                                                    <span>{review.comment}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>بدون تعليق</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <button className="action-btn delete" onClick={() => handleDelete(review.id)}>
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد تقييمات حالياً</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ReviewsPage;
