import axios from "axios";
import { authStorage } from "../../../context/auth/auth.storage";

/* ================= Constants ================= */
// ... existing constants ...

const BASE_URL = "/api";

/* ================= Shared Types ================= */

export type Gender = "male" | "female";

export interface UpdateCraftsmanPayload {
    name?: string;
    phone?: string;
    email?: string;
    
    // بيانات شخصية
    birth_date?: string | null;  // YYYY-MM-DD from UI
    gender?: Gender;
    identity_number?: string;

    // الموقع
    address?: string;
    latitude?: number;
    longitude?: number;

    // العمل
    craft_type?: string;
    description?: string;
    experience_years?: number | string;
    price_range?: string;
    work_days?: string[];
    work_hours?: string;

    // صور
    profile_photo?: File | null;
    front_identity_photo?: File | null;
    back_identity_photo?: File | null;
    work_photos?: File[];

    // حذف صور
    delete_work_photos?: string[];

    // تغيير كلمة المرور
    current_password?: string;
    password?: string;
    password_confirmation?: string;
    governorate_id?: string | number;
    status?: string;
}

/* ================= Helpers ================= */

// مفاتيح نصية فقط
type TextFieldKey =
    | "name"
    | "phone"
    | "email"
    | "birth_date"
    | "gender"
    | "identity_number"
    | "address"
    | "governorate_id"
    | "craft_type"
    | "description"
    | "price_range"
    | "work_hours"
    | "current_password"
    | "password"
    | "password_confirmation"
    | "status";

// مفاتيح رقمية فقط
type NumberFieldKey =
    | "latitude"
    | "longitude"
    | "experience_years";

const appendIfExists = <
    K extends TextFieldKey
>(
    formData: FormData,
    data: UpdateCraftsmanPayload,
    key: K
) => {
    const value = data[key];
    if (value !== undefined && value !== null) {
        formData.append(key, String(value));
    }
};

const appendNumberIfExists = <
    K extends NumberFieldKey
>(
    formData: FormData,
    data: UpdateCraftsmanPayload,
    key: K
) => {
    const value = data[key];
    if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
    }
};



/* ================= Get Profile ================= */

export const getCraftsmanProfile = async () => {
    const token = authStorage.getToken();

    const res = await axios.get(
        `${BASE_URL}/craftsmen/profile/me`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        }
    );

    return res.data;
};

/* ================= Update Profile ================= */

export const updateCraftsmanProfile = async (
 _: number, data: UpdateCraftsmanPayload) => {
    const token = authStorage.getToken();
    const formData = new FormData();
    formData.append("_method", "PUT");

    /* ===== Text fields ===== */

    const textFields: TextFieldKey[] = [
        "name",
        "phone",
        "email",
        "birth_date",
        "gender",
        "identity_number",
        "address",
        "governorate_id",
        "craft_type",
        "description",
        "price_range",
        "work_hours",
        "current_password",
        "password",
        "password_confirmation",
        "status",
    ];

    textFields.forEach((key) => {
        if (key === "birth_date") {
            const val = data[key];
            if (val) {
                formData.append("birth_date", String(val));
            }
        } else {
            appendIfExists(formData, data, key);
        }
    });

    /* ===== Number fields ===== */

    const numberFields: NumberFieldKey[] = [
        "latitude",
        "longitude",
        "experience_years",
    ];

    numberFields.forEach((key) =>
        appendNumberIfExists(formData, data, key)
    );

    /* ===== Arrays ===== */

    if (Array.isArray(data.work_days)) {
        data.work_days.forEach((day) => {
            formData.append("work_days[]", day);
        });
    }

    if (Array.isArray(data.delete_work_photos)) {
        data.delete_work_photos.forEach((path) => {
            formData.append("delete_work_photos[]", path);
        });
    }

    /* ===== Files ===== */

    if (Array.isArray(data.work_photos)) {
        data.work_photos.forEach((photo) => {
            if (photo instanceof File) {
                formData.append("work_photos[]", photo);
            }
        });
    }

    if (data.profile_photo instanceof File) {
        formData.append("profile_photo", data.profile_photo);
    }

    if (data.front_identity_photo instanceof File) {
        formData.append("front_identity_photo", data.front_identity_photo);
    }

    if (data.back_identity_photo instanceof File) {
        formData.append("back_identity_photo", data.back_identity_photo);
    }

    /* ===== Request ===== */

    const res = await axios.post(
        `${BASE_URL}/craftsmen/profile/me`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        }
    );

    return res.data;
};

/* ================= Delete Account ================= */

export const deleteCraftsmanAccount = async () => {
    const token = authStorage.getToken();

    const res = await axios.delete(
        `${BASE_URL}/craftsmen/profile/me`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        }
    );

    return res.data;
};

/* ================= Upload Work Photo ================= */

export const uploadWorkPhoto = async (file: File) => {
    const token = authStorage.getToken();
    const formData = new FormData();

    formData.append("work_photo", file);

    const res = await axios.post(
        `${BASE_URL}/craftsmen/profile/work-photos`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        }
    );

    return res.data;
};

/* ================= Delete Work Photo ================= */

export const deleteWorkPhoto = async (photoPath: string) => {
    const token = authStorage.getToken();

    const res = await axios.delete(
        `${BASE_URL}/craftsmen/profile/work-photos`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
            data: {
                photo_path: photoPath,
            },
        }
    );

    return res.data;
};
