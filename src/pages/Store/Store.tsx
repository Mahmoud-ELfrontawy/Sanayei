import React, { useState, useEffect } from "react";
import { FiList, FiPackage, FiSearch, FiShoppingCart } from "react-icons/fi";
import StoreGalleryPage from "./StoreGalleryPage";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import StoreOrdersPage from "./StoreOrdersPage";
import { getCartItems } from "../../Api/store/cart.api";
import "./Store.css";

const StorePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState("products");
    const [selectedCategoryId] = useState<number | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

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


    const renderContent = () => {
        switch (activeTab) {
            case "products":
                return <StoreGalleryPage
                    initialCategoryId={selectedCategoryId}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />;
            case "cart":
                return <CartPage onCheckout={() => setActiveTab("checkout")} />;
            case "checkout":
                return <CheckoutPage />;
            case "orders":
                return <StoreOrdersPage />;
            default:
                return <StoreGalleryPage initialCategoryId={selectedCategoryId} />;
        }
    };

    return (
        <section className="store-section-modern">
            <header className="store-navigation-header">
                <div className="nav-container">
                    <div className="store-brand-mini">
                        <h2>متجر<span>صنايعي</span></h2>
                    </div>

                    <div className="store-nav-search">
                        <FiSearch className="nav-search-icon" />
                        <input
                            type="text"
                            placeholder="ابحث في المتجر..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (activeTab !== "products") {
                                    setActiveTab("products");
                                }
                            }}
                        />
                        {searchQuery && (
                            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                                &times;
                            </button>
                        )}
                    </div>

                    <nav className="store-tabs-premium">
                        <button
                            className={`store-tab-btn ${activeTab === "products" ? "active" : ""}`}
                            onClick={() => setActiveTab("products")}
                        >
                            <FiList />
                            <span>المنتجات</span>
                        </button>
                        <button
                            className={`store-tab-btn ${activeTab === "cart" ? "active" : ""}`}
                            onClick={() => setActiveTab("cart")}
                        >
                            <div className="tab-with-badge">
                                <div className="icon-badge-wrapper">
                                    <FiShoppingCart />
                                    {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                                </div>
                                <span>السلة</span>
                            </div>
                        </button>
                        <button
                            className={`store-tab-btn ${activeTab === "orders" ? "active" : ""}`}
                            onClick={() => setActiveTab("orders")}
                        >
                            <FiPackage />
                            <span>طلباتي</span>
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
