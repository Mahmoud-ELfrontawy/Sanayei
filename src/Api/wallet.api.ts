import axios from "axios";
import { authStorage } from "../context/auth/auth.storage";

const BASE_URL = "/api/wallet";

const getHeaders = () => {
    const token = authStorage.getToken();
    return {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export interface Transaction {
    id: number;
    amount: number;
    type: "credit" | "debit";
    status: string;
    description: string;
    reference?: string;
    created_at: string;
}

export interface WalletData {
    id: number;
    balance: number;
    currency: string;
}

export interface WalletOverview {
    wallet: WalletData;
    recentTransactions: Transaction[];
}

/**
 * Get wallet balance and recent transactions
 */
export const getWalletOverview = async (): Promise<WalletOverview> => {
    const response = await axios.get(BASE_URL, {
        headers: getHeaders(),
    });
    // ✅ Extract data safely from Laravel's response wrapper if it exists
    return response.data.data || response.data;
};

/**
 * Get paginated transactions
 */
export const getTransactions = async (params?: any) => {
    const response = await axios.get(`${BASE_URL}/transactions`, {
        params,
        headers: getHeaders(),
    });
    return response.data.data || response.data;
};

/**
 * Initiate adding funds via Paymob
 */
export const addFunds = async (amount: number, method: "card" | "wallet") => {
    const response = await axios.post(
        `${BASE_URL}/add-funds`,
        { amount, method },
        { headers: getHeaders() }
    );
    return response.data;
};

/**
 * Request a withdrawal from the wallet
 */
export const withdraw = async (data: {
    amount: number;
    payout_method: "bank" | "mobile_wallet";
    payout_details: any;
}) => {
    const response = await axios.post(`${BASE_URL}/withdraw`, data, {
        headers: getHeaders(),
    });
    return response.data;
};

/**
 * Manually create a wallet for the current user
 */
export const createWallet = async () => {
    const response = await axios.post(`${BASE_URL}/create`, {}, {
        headers: getHeaders(),
    });
    return response.data.data || response.data;
};
