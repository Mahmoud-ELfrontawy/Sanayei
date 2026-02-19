import React, { useState, useEffect } from "react";
import { FiGrid, FiArrowLeft, FiPackage } from "react-icons/fi";
import { getPublicCategories } from "../../Api/store/publicStore.api";
import "./DepartmentsPage.css";

interface DepartmentsPageProps {
    onSelectCategory: (categoryId: number | null) => void;
}

const DepartmentsPage: React.FC<DepartmentsPageProps> = ({ onSelectCategory }) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCats = async () => {
            try {
                setLoading(true);
                const data = await getPublicCategories();
                setCategories(data || []);
            } catch (error) {
                console.error("Fetch Categories Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCats();
    }, []);

    if (loading) return <div className="dept-loading">جاري تحميل الأقسام...</div>;

    return (
        <div className="departments-page-premium">
            <div className="dept-header-info">
                <h1>تصفح حسب القسم</h1>
                <p>اختر القسم الذي تبحث عنه للوصول السريع للمعدات المطلوبة</p>
            </div>

            <div className="depts-grid-container">
                {/* Fixed "All" Category */}
                <div className="dept-card-premium" onClick={() => onSelectCategory(null)}>
                    <div className="dept-icon-wrapper all-depts">
                        <FiGrid />
                    </div>
                    <div className="dept-details">
                        <h3>جميع المنتجات</h3>
                        <span>استكشف كل شيء</span>
                    </div>
                    <FiArrowLeft className="arrow-go" />
                </div>

                {categories.map(cat => (
                    <div key={cat.id} className="dept-card-premium" onClick={() => onSelectCategory(cat.id)}>
                        <div className="dept-icon-wrapper">
                            {cat.icon ? (
                                <span className="cat-icon-text">{cat.icon}</span>
                            ) : (
                                <FiPackage />
                            )}
                        </div>
                        <div className="dept-details">
                            <h3>{cat.name}</h3>
                            <p>{cat.description || "تصفح منتجات هذا القسم"}</p>
                        </div>
                        <FiArrowLeft className="arrow-go" />
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="empty-depts">
                    <FiPackage size={48} />
                    <h3>لا تتوفر أقسام حالياً</h3>
                    <p>سيتم إضافة أقسام جديدة قريباً</p>
                </div>
            )}
        </div>
    );
};

export default DepartmentsPage;
