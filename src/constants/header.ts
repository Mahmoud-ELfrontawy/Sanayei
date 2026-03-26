
export interface NavLinkItem {
    label: string;
    path: string;
    hasDropdown?: boolean;
    authRequired?: boolean;
}


export const NAV_LINKS: NavLinkItem[] = [
    { label: "الرئيسية", path: "/" },
    { label: "طلب خدمة", path: "/services" },
    { label: "سوق الطلبات", path: "/community" },
    { label: "المتجر", path: "/store" },
    { label: "متابعة الخدمات", path: "/orders", authRequired: true },
    { label: "تواصل معنا", path: "/contact" },
];
