export interface Technician {
    id: number;
    name: string;
    description?: string;

    price_range: string | null;

    rating?: number;
    reviews_count?: number;

    work_photos?: string;

    service?: {
        id: number;
        name: string;
    };

    governorate?: {
        id: number;
        name: string;
    };
}


