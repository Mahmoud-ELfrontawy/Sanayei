import imageHome from "../../../../assets/images/home.jpg";
import Button from "../../../../components/ui/Button/Button";
import "./HeroSection.css";

const HeroSection: React.FC = () => {
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
                        <Button to="/login" variant="primary">
                            اطلب الآن
                        </Button>

                        <Button
                            to="/register"
                            variant="outline"
                        >
                            اقرأ اكثر
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
