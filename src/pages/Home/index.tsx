import AboutSection from "./sections/AboutSection/AboutSection";
import CardsRow from "./sections/CardsRow/CardsRow";
import HeroSection from "./sections/HeroSection/HeroSection";
import RequestServiceSection from "./sections/RequestServiceSection/RequestServiceSection";
import ServicesSection from "./sections/ServicesSection/ServicesSection";
import WhySanayeiSection from "./sections/WhySanayeiSection/WhySanayeiSection";

const Home: React.FC = () => {
    return (
        <>
            <HeroSection />
            <CardsRow/>
            <AboutSection/>
            <ServicesSection limit={4}/>
            <RequestServiceSection/>
            <WhySanayeiSection/>
        </>
    );
};

export default Home;

