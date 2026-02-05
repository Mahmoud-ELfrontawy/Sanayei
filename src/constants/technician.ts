export interface Technician {
    [x: string]: string;
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

    governorate?: {
        id: number;
        name: string;
    };
}


