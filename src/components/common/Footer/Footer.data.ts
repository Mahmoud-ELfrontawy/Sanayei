// footer.data.ts
import { FiPhone, FiFacebook, FiMail } from "react-icons/fi";

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
        icon: FiPhone,
        href: "tel:+2010202098765",
        label: "اتصل بنا",
    },
    {
        icon: FiFacebook,
        href: "https://facebook.com",
        label: "فيسبوك",
    },
    {
        icon: FiMail,
        href: "mailto:info@sanayee.com",
        label: "إيميل",
    },
];

export const CONTACT_NUMBERS = [
    "+2010202098765",
    "+206543234567",
    "+212345678",
];
