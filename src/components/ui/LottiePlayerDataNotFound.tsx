import Lottie from "lottie-react";
import Empty from "../../assets/lottie/empty.json"

interface LottiePlayerProps {
    animationData: object;
    loop?: boolean;
    autoplay?: boolean;
    className?: string;
}

const LottiePlayerDataNotFound: React.FC<LottiePlayerProps> = ({
    loop = true,
    autoplay = true,
    className = "w-100 h-100",
}) => {
    return (
        <Lottie 
            animationData={Empty}
            loop={loop}
            autoplay={autoplay}
            className={className}
        />
    );
};

export default LottiePlayerDataNotFound;