import { Link } from "react-router-dom";
import { type ReactNode } from "react";
import "./Button.css";

type ButtonVariant = "primary" | "outline" ;

type ButtonProps = {
    to: string;
    children: ReactNode;
    variant?: ButtonVariant;
    icon?: ReactNode;
    className?: string;
};

const Button: React.FC<ButtonProps> = ({
    to,
    children,
    variant = "primary",
    icon,
    className = "",
}) => {
    return (
        <Link
            to={to}
            className={`btn btn-${variant} items-center gap-1.5 ${className}`}
        >
            <span>{children}</span>
            {icon && <span aria-hidden="true">{icon}</span>}
        </Link>
    );
};

export default Button;
