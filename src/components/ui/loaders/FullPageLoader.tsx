import React from "react";
import { motion } from "motion/react";
import logo from "../../../assets/images/final logo.png";
import logoDark from "../../../assets/images/logo image dark 1.png";
import { useTheme } from "../../../context/ThemeContext";
import "./FullPageLoader.css";

interface LogoLoaderProps {
    text?: string;
}

const LogoLoader: React.FC<LogoLoaderProps> = ({
    text = "جاري التحميل"
}) => {
    const { isDark } = useTheme();
    
    return (
        <div className="logo-loader">
            {/* Decorative background elements */}
            <div className="loader-bg-decos">
                <div className="deco-blob blob-1"></div>
                <div className="deco-blob blob-2"></div>
            </div>

            <div className="logo-box">
                <motion.div
                    className="logo-wrapper"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <img src={isDark ? logoDark : logo} alt="Sanayei Loader" className="main-logo-img" />
                </motion.div>

                <div className="loader-content">
                    <div className="progress-container">
                        <motion.div 
                            className="progress-bar"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                            }}
                        />
                    </div>

                    <motion.div 
                        className="loader-text"
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                    >
                        {text}
                        <span className="loader-dots">
                            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>.</motion.span>
                            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}>.</motion.span>
                            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.6 }}>.</motion.span>
                        </span>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default LogoLoader;
