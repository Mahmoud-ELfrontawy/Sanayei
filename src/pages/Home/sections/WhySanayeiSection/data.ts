import { createElement } from "react";
import type { JSX } from "react";
import { FaBuilding, FaClock, FaHome, FaTools } from "react-icons/fa";

export interface WhyItem {
    icon: JSX.Element;
    value: number;
    suffix?: string;
    title: string;
    description: string;
}

export const WHY_ITEMS: WhyItem[] = [
    {
        icon: createElement(FaBuilding),
        value: 30,
        suffix: "+",
        title: "شركة تنفيذ وتشطيب",
        description:
            "شركات موثوقة ومعتمدة مع صنايعي لتنفيذ كل أنواع مشاريع التشطيب والبناء.",
    },
    {
        icon: createElement(FaClock),
        value: 6,
        suffix: "+",
        title: "سنين خبرة",
        description:
            "خبرة عملية في إدارة وتنفيذ مشاريع التشطيب من أول المعاينة لحد التسليم.",
    },
    {
        icon: createElement(FaHome),
        value: 250,
        suffix: "+",
        title: "مشروع تم تسليمه",
        description:
            "مشاريع منفذة في شقق، فلل، ومحلات تجارية بتقييمات حقيقية من العملاء.",
    },
    {
        icon: createElement(FaTools),
        value: 100,
        suffix: "+",
        title: "أشطر صنايعي معتمد",
        description:
            "صنايعية متخصصين في الكهرباء، السباكة، النجارة، الدهانات، وغيرها.",
    },
];
