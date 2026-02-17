import { useState } from "react";
import "./Store.css";

const StorePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState("products");

    const renderContent = () => {
        switch (activeTab) {
            case "departments":
                return <div className="store-placeholder">🚧 الأقسام - قريباً</div>;
            case "products":
                return <div className="store-placeholder">🚧 المنتجات - قريباً</div>;
            case "cart":
                return <div className="store-placeholder">🛒 السلة - قريباً</div>;
            case "checkout":
                return <div className="store-placeholder">💳 إتمام الشراء - قريباً</div>;
            default:
                return null;
        }
    };

    return (
        <section className="store-section">
            <div className="store-container">
                <h1 className="store-title">متجرنا</h1>

                {/* Store Navigation Tabs */}
                <div className="store-tabs">
                    <button
                        className={`store-tab ${activeTab === "departments" ? "active" : ""}`}
                        onClick={() => setActiveTab("departments")}
                    >
                        الأقسام
                    </button>
                    <button
                        className={`store-tab ${activeTab === "products" ? "active" : ""}`}
                        onClick={() => setActiveTab("products")}
                    >
                        المنتجات
                    </button>
                    <button
                        className={`store-tab ${activeTab === "cart" ? "active" : ""}`}
                        onClick={() => setActiveTab("cart")}
                    >
                        السلة
                    </button>
                    <button
                        className={`store-tab ${activeTab === "checkout" ? "active" : ""}`}
                        onClick={() => setActiveTab("checkout")}
                    >
                        إتمام الشراء
                    </button>
                </div>

                {/* Content Area */}
                <div className="store-content">
                    {renderContent()}
                </div>
            </div>
        </section>
    );
};

export default StorePage;
