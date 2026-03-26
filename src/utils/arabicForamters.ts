/**
 * تهيئة صيغة الأيام باللغة العربية حسب العدد (المعدود).
 * 1: يوم
 * 2: يومان
 * 3-10: أيام
 * 11+: يوم
 */
export const formatArabicDays = (count: number): string => {
    if (count === 0) return "0 يوم";
    if (count === 1) return "يوم واحد";
    if (count === 2) return "يومان";
    if (count >= 3 && count <= 10) return `${count} أيام`;
    return `${count} يوم`;
};

/**
 * تهيئة اسم القسم/التصنيف بشكل احترافي مع ترجمة للقيم الافتراضية.
 */
export const formatCommunityCategory = (category: string | undefined | null, serviceName?: string): string => {
    if (serviceName) return serviceName;
    if (!category || category === "other" || category === "غير محدد") return "تخصص آخر";
    
    // خريطة بسيطة للترجمة إذا لزم الأمر
    const mapping: Record<string, string> = {
        "electrical": "كهرباء",
        "plumbing": "سباكة",
        "masonry": "بناء",
        "carpentry": "نجارة",
        "painting": "دهانات",
        "ac": "تكييف",
    };

    return mapping[category] || category;
};
