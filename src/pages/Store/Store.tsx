import React, { useState } from "react";
import { FiList, FiPackage, FiShoppingCart } from "react-icons/fi";
import StoreGalleryPage from "./StoreGalleryPage";
import StoreProductList from "./StoreProductList";
import ProductDetails from "./ProductDetails";
import StoreOrdersPage from "./StoreOrdersPage";
import StoreCartTab from "./StoreCartTab";
import "./Store.css";

const StorePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState("products");
    const [searchQuery, setSearchQuery] = useState("");
    const [storeView, setStoreView] = useState("gallery");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState<any>(null);
    const [cartCount, setCartCount] = useState(0);

    const renderStoreContent = () => {
        switch (storeView) {
            case "gallery":
                return (
                    <StoreGalleryPage
                        initialCategoryId={null}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onBrowseProducts={(companyId) => {
                            setSelectedCompanyId(companyId);
                            setStoreView("productList");
                        }}
                    />
                );
            case "productList":
                return (
                    <StoreProductList
                        companyId={selectedCompanyId}
                        onBack={() => setStoreView("gallery")}
                        onProductClick={(product) => {
                            setSelectedProduct(product);
                            setStoreView("productDetails");
                        }}
                        onCartCountChange={setCartCount}
                    />
                );
            case "productDetails":
                return (
                    <ProductDetails
                        product={selectedProduct}
                        onBack={() => setStoreView("productList")}
                    />
                );
            default:
                return <StoreGalleryPage initialCategoryId={null} />;
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
                        <input
                            type="text"
                            placeholder="ابحث في المتجر..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (activeTab !== "products") setActiveTab("products");
                            }}
                        />
                        {searchQuery && (
                            <button className="clear-search-btn" onClick={() => setSearchQuery("")}>&times;</button>
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

                        {/* ── Cart Tab ── */}
                        <button
                            className={`store-tab-btn ${activeTab === "cart" ? "active" : ""}`}
                            onClick={() => setActiveTab("cart")}
                            style={{ position: "relative" }}
                        >
                            <FiShoppingCart />
                            <span>السلة</span>
                            {cartCount > 0 && (
                                <span className="tab-cart-badge">{cartCount}</span>
                            )}
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
                {activeTab === "products" && renderStoreContent()}
                {activeTab === "cart" && <StoreCartTab onCartCountChange={setCartCount} onGoToOrders={() => setActiveTab("orders")} />}
                {activeTab === "orders" && <StoreOrdersPage />}
            </main>
        </section>
    );
};

export default StorePage;
