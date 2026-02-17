export interface Technician {
    id: number;
    name: string;
    description?: string;
    price_range: string | null;
    rating?: number;
    reviews_count?: number;
    profile_photo?: string;

    service?: {
        id: number;
        name: string;
    };

    governorate_id?: string | number;
    governorate?: {
        id: number;
        name: string;
    };

    is_online?: boolean;
    last_seen?: string | null;
    last_seen_human?: string | null;
}
