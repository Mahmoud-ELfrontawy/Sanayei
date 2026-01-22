import Lottie from "lottie-react";
import Empty from "../../assets/lottie/empty.json";

interface LottiePlayerProps {
    loop?: boolean;
    autoplay?: boolean;
    className?: string;
}

const LottiePlayerDataNotFound: React.FC<LottiePlayerProps> = ({
    loop = true,
    autoplay = true,
    className = "empty-lottie",
}) => {
    return (
        <div className="empty-wrapper">
            <Lottie
                animationData={Empty}
                loop={loop}
                autoplay={autoplay}
                className={className}
            />
        </div>
    );
};

export default LottiePlayerDataNotFound;
