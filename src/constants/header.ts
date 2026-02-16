
export interface NavLinkItem {
    label: string;
    path: string;
    hasDropdown?: boolean;
    authRequired?: boolean;
}


export const NAV_LINKS: NavLinkItem[] = [
    { label: "الرئيسية", path: "/" },
    { label: "طلب خدمة", path: "/services" },
    { label: "اختر صنايعي", path: "/choose" },
    { label: "متابعة الطلبات", path: "/orders", authRequired: true },
    { label: "تواصل معنا", path: "/contact" },
];
