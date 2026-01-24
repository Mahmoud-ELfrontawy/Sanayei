
export interface NavLinkItem {
    label: string;
    path: string;
    hasDropdown?: boolean;
}


export const NAV_LINKS: NavLinkItem[] = [
    { label: "الرئيسية", path: "/" },
    { label: "طلب خدمة", path: "/services", hasDropdown: true },
    { label: "اختر صنايعي", path: "/choose" },
    { label: "متابعة الطلبات", path: "/orders" },
    { label: "تواصل معنا", path: "/contact" },
];
