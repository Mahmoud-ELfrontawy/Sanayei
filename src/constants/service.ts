export type ServiceIcon = | "paint"| "electric"| "carpentry"| "plumbing";

export interface Service {
    id: number;
    name: string;
    phone: string;
    description: string;
    slug: string;
    icon: ServiceIcon;
}
