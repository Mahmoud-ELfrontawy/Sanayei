// footer.data.ts
import { FiPhone, FiFacebook, FiMail, FiInstagram, FiLinkedin, FiYoutube, FiGlobe } from "react-icons/fi";

export const FOOTER_LINKS = [
    {
        title: "عن الموقع",
        links: [
            { label: "من نحن", to: "/about" },
            { label: "كيف نعمل", to: "/how-it-works" },
            { label: "انضم إلينا", to: "/join-us" },
        ],
    },
    {
        title: "روابط مهمة",
        links: [
            { label: "سجل الطلبات", to: "/orders" },
            { label: "اطلب خدمة", to: "/request-service" },
            { label: "اختر صنايعي", to: "/choose" },
            { label: "الإعدادات", to: "/settings" },
        ],
    },
];

export const SOCIAL_LINKS = [
    {
        icon: FiFacebook,
        href: "https://facebook.com",
        label: "فيسبوك",
    },
    {
        icon: FiInstagram,
        href: "https://instagram.com",
        label: "إنستجرام",
    },
    {
        icon: FiLinkedin,
        href: "https://linkedin.com",
        label: "لينكد إن",
    },
    {
        icon: FiYoutube,
        href: "https://youtube.com",
        label: "يوتيوب",
    },
];

export const CONTACT_INFO = [
    {
        icon: FiPhone,
        label: "+2010202098765",
        href: "tel:+2010202098765",
    },
    {
        icon: FiMail,
        label: "info@sanayee.com",
        href: "mailto:info@sanayee.com",
    },
    {
        icon: FiGlobe,
        label: "www.sanayee.com",
        href: "https://www.sanayee.com",
    },
];
