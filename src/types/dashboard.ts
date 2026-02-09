import type { ReactNode } from "react";

export interface SidebarLink {
    title: string;
    path: string;
    icon: ReactNode;
}

export interface DashboardStats {
    title: string;
    value: string | number;
    change?: string;
    icon?: ReactNode;
}

export interface ChartData {
    name: string;
    value: number;
    color?: string;
}
