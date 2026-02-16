import imageHome from "../../../../assets/images/home.jpg";
import "./HeroSection.css";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { toast } from "react-toastify";

const HeroSection: React.FC = () => {

    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleRequestNow = () => {
        if (!isAuthenticated) {
            toast.info("من فضلك سجل دخولك أولًا 🔐");
            navigate("/login");
            return;
        }

        navigate("/choose");
    };

    const handleReadMore = () => {
        // يعمل بدون تسجيل دخول
        navigate("/choose");
    };

    return (
        <section className="home">
            <div className="image-home">
                <img
                    src={imageHome}
                    alt="Home"
                    className="image-home__img"
                />

                <div className="image-home__overlay" />

                <div className="image-home__content">
                    <h1>اطلب صنايعك... وخلي الشغل علينا!</h1>

                    <div>
                        <p>
                            مع صنايعي هتلاقي كل خدمات الصيانة والدِيكور في مكان واحد -
                        </p>
                        <p className="text-white">
                            صنايعية خبرة، أسعار واضحة، وشغل مضمون يوصل لحد بابك.
                        </p>
                    </div>

                    {/* أزرار */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleRequestNow}
                            className="btn-hero"
                        >
                            اطلب الآن
                        </button>

                        <button
                            onClick={handleReadMore}
                            className="btn-outline-herosection"
                        >
                            اقرأ اكثر
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
