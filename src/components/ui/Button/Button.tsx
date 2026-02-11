import { Link } from "react-router-dom";
import { type ReactNode, type ButtonHTMLAttributes } from "react";
import "./Button.css";

type ButtonVariant = "primary" | "outline";

type ButtonProps = {
    to?: string;
    children: ReactNode;
    variant?: ButtonVariant;
    icon?: ReactNode;
    className?: string;
    type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
    onClick?: () => void;
    disabled?: boolean;
    state?: any;
};

const Button: React.FC<ButtonProps> = ({
    to,
    children,
    variant = "primary",
    icon,
    className = "",
    type = "button",
    onClick,
    disabled = false,
    state,
}) => {
    const commonClasses = `btn btn-${variant} ${className}`;

    if (to) {
        return (
            <Link to={to} state={state} className={commonClasses}>
                <span>{children}</span>
                {icon && <span aria-hidden="true">{icon}</span>}
            </Link>
        );
    }

    return (
        <button
            type={type}
            className={commonClasses}
            onClick={onClick}
            disabled={disabled}
        >
            <span>{children}</span>
            {icon && <span aria-hidden="true">{icon}</span>}
        </button>
    );
};

export default Button;
