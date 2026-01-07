import AboutSection from "./sections/AboutSection/AboutSection";
import CardsRow from "./sections/CardsRow/CardsRow";
import HeroSection from "./sections/HeroSection/HeroSection";
// import ServicesSection from "../../components/home/ServicesSection";

const Home: React.FC = () => {
    return (
        <>
            <HeroSection />
            <CardsRow/>
            <AboutSection/>
            {/* <ServicesSection /> */}
        </>
    );
};

export default Home;

