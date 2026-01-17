import logo from "../../../assets/images/final logo.png";
import "./FullPageLoader.css";

interface LogoLoaderProps {
    text?: string;
}

const LogoLoader: React.FC<LogoLoaderProps> = ({
    text = "جاري التحميل ..."
}) => {
    return (
        <div className="logo-loader">
            <div className="logo-box">
                <img src={logo} alt="Sanayei Loader" />
                <p>{text}</p>
            </div>
        </div>
    );
};

export default LogoLoader;
