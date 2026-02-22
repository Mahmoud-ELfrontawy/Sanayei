import React, { useState, useEffect } from "react";
import { FiList, FiPackage, FiSearch, FiShoppingCart } from "react-icons/fi";
import StoreGalleryPage from "./StoreGalleryPage";
import StoreProductList from "./StoreProductList";
import ProductDetails from "./ProductDetails";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import StoreOrdersPage from "./StoreOrdersPage";
import { getCartItems } from "../../Api/store/cart.api";
import "./Store.css";
import { useAuth } from "../../hooks/useAuth";

const StorePage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState("products");
    const [selectedCategoryId] = useState<number | null>(null);
    const [cartCount, setCartCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [storeView, setStoreView] = useState("gallery"); // gallery, productList, productDetails
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState<any>(null);

    const fetchCartCount = async () => {
        if (!isAuthenticated) return;
        try {
            const items = await getCartItems();
            setCartCount(Array.isArray(items) ? items.length : 0);
        } catch (error: any) {
            // Only log if it's not an unauthorized error (which we already handled)
            if (error.message !== "Unauthorized") {
                console.error("Error fetching cart count:", error);
            }
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchCartCount();
            const interval = setInterval(fetchCartCount, 5000);
            return () => clearInterval(interval);
        }
    }, [activeTab, isAuthenticated]);

    const renderStoreContent = () => {
        switch (storeView) {
            case "gallery":
                return <StoreGalleryPage
                    initialCategoryId={selectedCategoryId}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onBrowseProducts={(companyId) => {
                        setSelectedCompanyId(companyId);
                        setStoreView("productList");
                    }}
                />;
            case "productList":
                return <StoreProductList 
                    companyId={selectedCompanyId} 
                    onBack={() => setStoreView("gallery")}
                    onProductClick={(product) => {
                        setSelectedProduct(product);
                        setStoreView("productDetails");
                    }}
                />;
            case "productDetails":
                return <ProductDetails 
                    product={selectedProduct} 
                    onBack={() => setStoreView("productList")} 
                />;
            default:
                return <StoreGalleryPage initialCategoryId={selectedCategoryId} />;
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case "products":
                return renderStoreContent();
            case "cart":
                return <CartPage onCheckout={() => setActiveTab("checkout")} />;
            case "checkout":
                return <CheckoutPage />;
            case "orders":
                return <StoreOrdersPage />;
            default:
                return renderStoreContent();
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
