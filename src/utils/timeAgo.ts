export const formatTimeAgo = (dateInput: string | Date): string => {
    const date = new Date(dateInput);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "الآن";
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        if (minutes === 1) return "منذ دقيقة";
        if (minutes === 2) return "منذ دقيقتين";
        if (minutes <= 10) return `منذ ${minutes} دقائق`;
        return `منذ ${minutes} دقيقة`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        if (hours === 1) return "منذ ساعة";
        if (hours === 2) return "منذ ساعتين";
        if (hours <= 10) return `منذ ${hours} ساعات`;
        return `منذ ${hours} ساعة`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        if (days === 1) return "منذ يوم";
        if (days === 2) return "منذ يومين";
        return `منذ ${days} أيام`;
    }

    return date.toLocaleDateString("ar-EG");
};
