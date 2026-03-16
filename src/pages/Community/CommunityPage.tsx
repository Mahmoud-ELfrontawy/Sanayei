import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaImage, FaMapMarkerAlt, FaSpinner, FaTrophy, FaSearch, FaFilter } from "react-icons/fa";
import { useCommunity } from "../../context/CommunityContext";
import { useAuth } from "../../hooks/useAuth";
import PostCard from "./PostCard";
import PointsBadge from "./PointsBadge";
import { getAvatarUrl } from "../../utils/imageUrl";
import "./CommunityPage.css";

const CATEGORIES = [
    { value: "", label: "الكل" },
    { value: "electrical", label: "كهرباء" },
    { value: "plumbing", label: "سباكة" },
    { value: "masonry", label: "بناء" },
    { value: "carpentry", label: "نجارة" },
    { value: "painting", label: "دهانات" },
    { value: "ac", label: "تكييف" },
    { value: "other", label: "أخرى" },
];

const CommunityPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const {
        posts, leaderboard, myPoints, isLoading, hasMore, filters,
        setFilters, fetchPosts, fetchLeaderboard, fetchMyPoints,
    } = useCommunity();

    const [searchInput, setSearchInput] = useState("");
    const [urgencyFilter, setUrgencyFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");

    // Initial load
    useEffect(() => {
        fetchPosts(true);
        fetchLeaderboard();
        if (isAuthenticated) fetchMyPoints();
    }, [filters]);

    // Infinite scroll observer
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
        setFilters({ category: categoryFilter, urgency: urgencyFilter, search: searchInput });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") applyFilters();
    };

    return (
        <section className="fb-community-page">
            <div className="fb-community-layout">
                {/* ── LEFT SIDEBAR (Profile & Filters) ── */}
                <aside className="fb-sidebar fb-left-sidebar desktop-only">
                    <div className="fb-filters-card">
                        <h4 className="fb-card-title"><FaFilter /> تصفية البلاغات</h4>
                        
                        <div className="fb-search-box">
                            <FaSearch className="fb-search-icon" />
                            <input
                                type="text"
                                placeholder="ابحث..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="fb-filter-select"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>

                        <select
                            value={urgencyFilter}
                            onChange={(e) => setUrgencyFilter(e.target.value)}
                            className="fb-filter-select"
                        >
                            <option value="">كل الأولويات</option>
                            <option value="urgent">طارئ فقط</option>
                            <option value="normal">عادي فقط</option>
                        </select>

                        <button className="fb-btn-primary full-width" onClick={applyFilters}>
                            تطبيق التصفية
                        </button>
                    </div>

                    {isAuthenticated && user && (
                        <div className="fb-profile-card">
                            <img 
                                src={getAvatarUrl(user.avatar, user.name)} 
                                alt={user.name} 
                                className="fb-profile-avatar-large" 
                            />
                            <h3 className="fb-profile-name">{user.name}</h3>
                            {myPoints ? (
                                <div className="fb-profile-stats">
                                    <PointsBadge badge={myPoints.badge} points={myPoints.total_points} />
                                    <div className="fb-profile-stat-row">
                                        <span>إنجازات:</span>
                                        <strong>{myPoints.verified_jobs} خدمة مجتمعية</strong>
                                    </div>
                                    <div className="fb-profile-stat-row">
                                        <span>قسائم السحب:</span>
                                        <strong>{myPoints.draw_entries} 🎁</strong>
                                    </div>
                                </div>
                            ) : (
                                <div className="community-loading"><FaSpinner className="community-spinner" /></div>
                            )}
                        </div>
                    )}
                </aside>

                {/* ── CENTER COLUMN (Feed) ── */}
                <main className="fb-feed-column">
                    {/* Create Post Box */}
                    {isAuthenticated && user && (
                        <div className="fb-create-post-box">
                            <div className="fb-create-top">
                                <img 
                                    src={getAvatarUrl(user.avatar, user.name)} 
                                    alt={user.name} 
                                    className="fb-create-avatar" 
                                />
                                <button className="fb-create-input-btn" onClick={() => navigate("/community/new")}>
                                    شارك بلاغ جديد في مجتمعك يا {user.name.split(" ")[0]}...
                                </button>
                            </div>
                            <div className="fb-create-bottom">
                                <button className="fb-create-action" onClick={() => navigate("/community/new")}>
                                    <FaImage className="text-green" /> صورة المشكلة
                                </button>
                                <button className="fb-create-action" onClick={() => navigate("/community/new")}>
                                    <FaMapMarkerAlt className="text-red" /> الموقع
                                </button>
                                <button className="fb-create-action" onClick={() => navigate("/community/new")}>
                                    <FaEdit className="text-blue" /> التفاصيل
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Posts List */}
                    <div className="fb-posts-list">
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

                        {isLoading && (
                            <div className="community-loading fb-card">
                                <FaSpinner className="community-spinner" />
                                <span>جاري التحميل...</span>
                            </div>
                        )}

                        {!isLoading && posts.length === 0 && (
                            <div className="fb-empty-state fb-card">
                                <span>🏘️</span>
                                <p>لا يوجد بلاغات تطابق بحثك. كُن الأول وساعد مجتمعك!</p>
                            </div>
                        )}

                        {!hasMore && posts.length > 0 && (
                            <p className="fb-end-msg">لقد شاهدت جميع البلاغات 🏁</p>
                        )}
                    </div>
                </main>

                {/* ── RIGHT SIDEBAR (Leaderboard) ── */}
                <aside className="fb-sidebar fb-right-sidebar desktop-only">
                    <div className="fb-leaderboard-card">
                        <div className="fb-leaderboard-header">
                            <FaTrophy className="text-gold" />
                            <h4>أبطال المجتمع</h4>
                        </div>
                        <p className="fb-leaderboard-subtitle">الأكثر مساهمة هذا الشهر</p>
                        
                        <div className="fb-leaderboard-list">
                            {leaderboard.map((entry) => (
                                <div key={entry.rank} className="fb-lb-item">
                                    <div className="fb-lb-avatar-wrap">
                                        <img
                                            src={getAvatarUrl(entry.user.avatar, entry.user.name)}
                                            alt={entry.user.name}
                                            className="fb-lb-avatar"
                                        />
                                        <span className={`fb-lb-rank rank-${entry.rank}`}>
                                            {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : entry.rank}
                                        </span>
                                    </div>
                                    <div className="fb-lb-info">
                                        <span className="fb-lb-name">{entry.user.name}</span>
                                        <span className="fb-lb-pts">{entry.total_points} نقطة</span>
                                    </div>
                                </div>
                            ))}
                            {leaderboard.length === 0 && (
                                <div className="fb-empty-state small">
                                    <span>🏆</span>
                                    <p>لا يوجد إنجازات بعد</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
};

export default CommunityPage;
