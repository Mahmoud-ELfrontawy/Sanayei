import React, { useState, useEffect } from "react";
import StoreGalleryPage from "./StoreGalleryPage";
import CartPage from "./CartPage";
import DepartmentsPage from "./DepartmentsPage";
import CheckoutPage from "./CheckoutPage";
import StoreOrdersPage from "./StoreOrdersPage";
import { getCartItems } from "../../Api/store/cart.api";
import "./Store.css";

const StorePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState("products");
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        try {
            const items = await getCartItems();
            setCartCount(Array.isArray(items) ? items.length : 0);
        } catch (error) {
            console.error("Error fetching cart count:", error);
        }
    };

    useEffect(() => {
        fetchCartCount();
        // Update count every 5 seconds or on tab change
        const interval = setInterval(fetchCartCount, 5000);
        return () => clearInterval(interval);
    }, [activeTab]);

    const handleSelectCategory = (categoryId: number | null) => {
        setSelectedCategoryId(categoryId);
        setActiveTab("products"); // Switch to products list after selecting a category
    };

    const renderContent = () => {
        switch (activeTab) {
            case "departments":
                return <DepartmentsPage onSelectCategory={handleSelectCategory} />;
            case "products":
                return <StoreGalleryPage initialCategoryId={selectedCategoryId} onResetCategory={() => setSelectedCategoryId(null)} />;
            case "cart":
                return <CartPage onCheckout={() => setActiveTab("checkout")} />;
            case "checkout":
                return <CheckoutPage />;
            case "orders":
                return <StoreOrdersPage />;
            default:
                return <StoreGalleryPage initialCategoryId={selectedCategoryId} onResetCategory={() => setSelectedCategoryId(null)} />;
        }
    };

    return (
        <section className="store-section-modern">
            <header className="store-navigation-header">
                <div className="nav-container">
                    <div className="store-brand-mini">
                        <h2>متجر<span>صنايعي</span></h2>
                    </div>
                    <nav className="store-tabs-premium">
                        <button
                            className={`store-tab-btn ${activeTab === "products" ? "active" : ""}`}
                            onClick={() => setActiveTab("products")}
                        >
                            🛍️ المنتجات
                        </button>
                        <button
                            className={`store-tab-btn ${activeTab === "departments" ? "active" : ""}`}
                            onClick={() => setActiveTab("departments")}
                        >
                            📁 الأقسام
                        </button>
                        <button
                            className={`store-tab-btn ${activeTab === "cart" ? "active" : ""}`}
                            onClick={() => setActiveTab("cart")}
                        >
                            <div className="tab-with-badge">
                                🛒 السلة
                                {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                            </div>
                        </button>
                        <button
                            className={`store-tab-btn ${activeTab === "orders" ? "active" : ""}`}
                            onClick={() => setActiveTab("orders")}
                        >
                            📦 طلباتي
                        </button>
                    </nav>
                </div>
            </header>

            <main className="store-render-area">
                {renderContent()}
            </main>
        </section>
    );
};

export default StorePage;
