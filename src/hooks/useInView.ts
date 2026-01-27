import { useInView } from "framer-motion";
import { useRef } from "react";

export const useFramerInView = (options?: {
    amount?: number;
    once?: boolean;
}) => {
    const ref = useRef<HTMLDivElement | null>(null);

    const isVisible = useInView(ref, {
        amount: options?.amount ?? 0.5,
        once: options?.once ?? true,
    });

    return { ref, isVisible };
};
