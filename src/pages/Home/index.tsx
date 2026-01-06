import CardsRow from "./sections/CardsRow/CardsRow";
import HeroSection from "./sections/HeroSection/HeroSection";
// import ServicesSection from "../../components/home/ServicesSection";
// import WhyUsSection from "../../components/home/WhyUsSection";

const Home: React.FC = () => {
    return (
        <>
            <HeroSection />
            <CardsRow/>
            {/* <ServicesSection /> */}
            {/* <WhyUsSection /> */}
        </>
    );
};

export default Home;

