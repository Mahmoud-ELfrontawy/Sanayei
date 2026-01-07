import { useEffect, useRef, useState } from "react";

interface CounterProps {
    value: number;
    duration?: number;
}

const Counter: React.FC<CounterProps> = ({ value, duration = 2200 }) => {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef<HTMLSpanElement | null>(null);

    // 🔹 مراقبة ظهور العنصر
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStarted(true);
                    observer.disconnect(); // يشتغل مرة واحدة بس
                }
            },
            { threshold: 0.3 } // %40 من العنصر يكون ظاهر
        );

        if (ref.current) observer.observe(ref.current);

        return () => observer.disconnect();
    }, []);

    // 🔹 Animation العداد
    useEffect(() => {
        if (!started) return;

        let start = 0;
        const increment = value / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= value) {
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [started, value, duration]);

    return <span ref={ref}>{count}</span>;
};

export default Counter;
