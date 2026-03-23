import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaFilter, FaPlus, FaSpinner, FaBriefcase, FaChevronDown } from "react-icons/fa";
import { useCommunity } from "../../context/CommunityContext";
import { useAuth } from "../../hooks/useAuth";
import PostCard from "./PostCard";
import "./CommunityPage.css";

const CATEGORIES = [
    { value: "", label: "كل التخصصات" },
    { value: "electrical", label: "⚡ كهرباء" },
    { value: "plumbing", label: "🔧 سباكة" },
    { value: "masonry", label: "🧱 بناء" },
    { value: "carpentry", label: "🪚 نجارة" },
    { value: "painting", label: "🎨 دهانات" },
    { value: "ac", label: "❄️ تكييف" },
    { value: "other", label: "🔨 أخرى" },
];

const STATUS_OPTIONS = [
    { value: "", label: "كل الحالات" },
    { value: "open", label: "مفتوح للعروض" },
    { value: "in_progress", label: "قيد التنفيذ" },
    { value: "completed", label: "مكتمل" },
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
        <section className="mkt-page">
            {/* Hero Header */}
            <div className="mkt-hero">
                <div className="mkt-hero-content">
                    <div className="mkt-hero-text">
                        <h1>
                            <FaBriefcase className="mkt-hero-icon" />
                            سوق الطلبات
                        </h1>
                        <p>انشر طلبك واحصل على أفضل العروض من الصنايعية المحترفين</p>
                    </div>
                    {canCreateRequest && (
                        <button className="mkt-create-btn" onClick={() => navigate("/community/new")}>
                            <FaPlus />
                            <span>انشر طلب جديد</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="mkt-filters-wrapper">
                <div className="mkt-filters-bar">
                    <div className="mkt-search-box">
                        <FaSearch className="mkt-search-icon" />
                        <input
                            type="text"
                            placeholder="ابحث عن طلبات..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <button
                        className={`mkt-filter-toggle ${showFilters ? "active" : ""}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FaFilter />
                        <span>تصفية</span>
                        {activeFiltersCount > 0 && (
                            <span className="mkt-filter-badge">{activeFiltersCount}</span>
                        )}
                        <FaChevronDown className={`mkt-chevron ${showFilters ? "rotated" : ""}`} />
                    </button>
                </div>

                {showFilters && (
                    <div className="mkt-filters-panel">
                        <div className="mkt-filter-group">
                            <label>التخصص</label>
                            <div className="mkt-pills">
                                {CATEGORIES.map((c) => (
                                    <button
                                        key={c.value}
                                        className={`mkt-pill ${categoryFilter === c.value ? "active" : ""}`}
                                        onClick={() => setCategoryFilter(c.value)}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mkt-filter-group">
                            <label>الحالة</label>
                            <div className="mkt-pills">
                                {STATUS_OPTIONS.map((s) => (
                                    <button
                                        key={s.value}
                                        className={`mkt-pill ${statusFilter === s.value ? "active" : ""}`}
                                        onClick={() => setStatusFilter(s.value)}
                                    >
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="mkt-apply-btn" onClick={applyFilters}>
                            تطبيق التصفية
                        </button>
                    </div>
                )}
            </div>

            {/* Posts Grid */}
            <div className="mkt-content">
                <div className="mkt-posts-grid">
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
                    <div className="mkt-empty">
                        <span className="mkt-empty-icon">📋</span>
                        <h3>لا توجد طلبات حالياً</h3>
                        <p>كن أول من ينشر طلب خدمة واحصل على عروض من الصنايعية!</p>
                        {canCreateRequest && (
                            <button className="mkt-create-btn" onClick={() => navigate("/community/new")}>
                                <FaPlus /> انشر طلب جديد
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
