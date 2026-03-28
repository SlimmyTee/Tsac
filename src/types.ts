
export interface Profile {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string; // Generated column
    phone?: string;
    role: 'user' | 'admin';
    avatar_url?: string;
    gender?: string;
    law_enforcement_affiliated?: string;
    date_of_birth?: string;
    deposit_amount?: number;
    duration?: number;
    service_type?: string;
    personal_items?: string;
    address?: string;
    card_number?: string;
    card_number_visible?: boolean;
    created_at?: string;
}

export interface Transaction {
    id: string;
    user_id: string;
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    status: 'completed' | 'pending' | 'failed';
    created_at: string;
}

export interface TransactionRequest {
    id: string;
    user_id: string;
    type: 'pay' | 'withdraw';
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    details: string;
    created_at: string;
    user?: Profile; // Joined data
}

export interface User {
    id: string;
    email: string;
}
