import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSpinner, FaChevronDown } from "react-icons/fa";
import { FiSearch, FiFilter, FiBox, FiZap, FiDroplet, FiLayers, FiScissors, FiWind, FiPlusCircle, FiCheckCircle, FiInfo, FiPlus } from "react-icons/fi";
import { useCommunity } from "../../context/CommunityContext";
import { useAuth } from "../../hooks/useAuth";
import PostCard from "./PostCard";
import "./CommunityPage.css";

const CATEGORIES = [
    { value: "", label: "كل التخصصات", icon: <FiLayers /> },
    { value: "electrical", label: "كهرباء", icon: <FiZap /> },
    { value: "plumbing", label: "سباكة", icon: <FiDroplet /> },
    { value: "masonry", label: "بناء", icon: <FiBox /> },
    { value: "carpentry", label: "نجارة", icon: <FiScissors /> },
    { value: "painting", label: "دهانات", icon: <FiPlusCircle /> },
    { value: "ac", label: "تكييف", icon: <FiWind /> },
    { value: "other", label: "أخرى", icon: <FiPlus /> },
];

const STATUS_OPTIONS = [
    { value: "", label: "كل الحالات", icon: <FiLayers /> },
    { value: "open", label: "مفتوح للعروض", icon: <FiInfo /> },
    { value: "in_progress", label: "قيد التنفيذ", icon: <FaSpinner /> },
    { value: "completed", label: "مكتمل", icon: <FiCheckCircle /> },
];

const CommunityPage: React.FC = () => {
    const { userType, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const {
        posts, isLoading, hasMore, filters,
        setFilters, fetchPosts,
    } = useCommunity();

    const [searchInput, setSearchInput] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    const canCreateRequest = isAuthenticated && userType !== "craftsman";

    useEffect(() => {
        fetchPosts(true);
    }, [filters]);

    // Infinite scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastPostRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) fetchPosts();
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    const applyFilters = () => {
        setFilters({ category: categoryFilter, status: statusFilter, search: searchInput });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") applyFilters();
    };

    const activeFiltersCount = [categoryFilter, statusFilter, searchInput].filter(Boolean).length;

    return (
        <section className="mkt-page-v2">
            {/* 🌌 Hero Section */}
            <div className="mkt-hero-v2">
                <div className="mkt-hero-particles"></div>
                <div className="mkt-hero-content-v2">
                    <div className="mkt-hero-text-v2">
                        <span className="mkt-subheading">استكشف الفرص المتاحة</span>
                        <h1>
                           مجتمع خدمات <span className="mkt-gradient-text">صنايعي</span>
                        </h1>
                        <p>تصفح أحدث طلبات الخدمات في مجتمعك وقدم عروضك الآن لتكسب ثقة العملاء</p>
                    </div>
                    {canCreateRequest && (
                        <button className="mkt-btn-primary" onClick={() => navigate("/community/new")}>
                            <FiPlusCircle />
                            <span>نشر طلب خدمة</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 🔍 Search & Filters Bar */}
            <div className="mkt-search-nav">
                <div className="mkt-search-bar-v2">
                    <div className="mkt-search-v2">
                        <FiSearch className="mkt-search-icon-v2" />
                        <input
                            type="text"
                            placeholder="ابحث بتفاصيل الطلب..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <button
                        className={`mkt-filter-btn-v2 ${showFilters ? "active" : ""}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FiFilter />
                        <span>الفلاتر</span>
                        {activeFiltersCount > 0 && (
                            <div className="mkt-badge-v2">{activeFiltersCount}</div>
                        )}
                        <FaChevronDown className={`mkt-chevron ${showFilters ? "rotated" : ""}`} />
                    </button>
                    
                    <button className="mkt-apply-search-btn" onClick={applyFilters}>
                        بحث
                    </button>
                </div>

                {showFilters && (
                    <div className="mkt-filters-panel-v2">
                        <div className="mkt-filter-section">
                            <label><FiLayers /> حسب التخصص</label>
                            <div className="mkt-pills-v2">
                                {CATEGORIES.map((c) => (
                                    <button
                                        key={c.value}
                                        className={`mkt-pill-v2 ${categoryFilter === c.value ? "active" : ""}`}
                                        onClick={() => setCategoryFilter(c.value)}
                                    >
                                        {c.icon}
                                        <span>{c.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mkt-filter-section">
                            <label><FiInfo /> حالة الطلب</label>
                            <div className="mkt-pills-v2">
                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s.value}
                                        className={`mkt-pill-v2 ${statusFilter === s.value ? "active" : ""}`}
                                        onClick={() => setStatusFilter(s.value)}
                                    >
                                        {s.icon}
                                        <span>{s.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 📋 Results Grid */}
            <div className="mkt-main-container">
                <div className="mkt-results-grid">
                    {posts.map((post, idx) => {
                        const isLast = idx === posts.length - 1;
                        return (
                            <div key={post.id} ref={isLast ? lastPostRef : undefined}>
                                <PostCard
                                    post={post}
                                    onClick={() => navigate(`/community/${post.id}`)}
                                />
                            </div>
                        );
                    })}
                </div>

                {isLoading && (
                    <div className="mkt-loading">
                        <FaSpinner className="mkt-spinner" />
                        <span>جاري التحميل...</span>
                    </div>
                )}

                {!isLoading && posts.length === 0 && (
                    <div className="mkt-empty-v2">
                        <FiBox className="mkt-empty-icon-v2" />
                        <h3>لا توجد طلبات متوفرة</h3>
                        <p>لم نتمكن من العثور على أي طلبات تطابق بحثك حالياً</p>
                        {canCreateRequest && (
                            <button className="mkt-btn-primary" onClick={() => navigate("/community/new")}>
                                <FiPlusCircle /> انشر طلبك الآن
                            </button>
                        )}
                    </div>
                )}

                {!hasMore && posts.length > 0 && (
                    <p className="mkt-end-msg">لقد شاهدت جميع الطلبات 🏁</p>
                )}
            </div>
        </section>
    );
};

export default CommunityPage;
