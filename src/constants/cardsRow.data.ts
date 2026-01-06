
import { FaShieldAlt, FaStopwatch, FaMoneyBillWave } from "react-icons/fa";
import type { IconType } from "react-icons";

export interface CardsRowItem {
    icon: IconType;
    title: string;
    text: string;
}

export const CARDS_ROW_DATA: CardsRowItem[] = [
    {
        icon: FaShieldAlt,
        title: "صنايعي موثوقين",
        text: "كل الحرفيين على صنايعي تم التحقق من خبرتهم وتقييماتهم لضمان أفضل جودة للخدمة.",
    },
    {
        icon: FaStopwatch,
        title: "حجز سهل وسريع",
        text: "احجز الخدمة اللي تحتاجها في دقائق بخطوات بسيطة، من غير مكالمات ولا تعقيد.",
    },
    {
        icon: FaMoneyBillWave,
        title: "أسعار مناسبة",
        text: "نعرض لك تكلفة الخدمة بشكل شفاف قبل تأكيد الطلب، بدون مفاجآت.",
    },
];
