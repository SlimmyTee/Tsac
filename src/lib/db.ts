import { supabase } from './supabase';
import { Transaction, TransactionRequest } from '../types';

// Transactions
export const fetchUserTransactions = async (userId: string) => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Transaction[];
};

export const fetchAllTransactions = async () => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*, user:user_id(email)') // Simplified join, adjust based on actual foreign key setup
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Transaction & { user: { email: string } })[];
};

// Requests
export const createRequest = async (request: Omit<TransactionRequest, 'id' | 'status' | 'created_at' | 'user'>) => {
    const { data, error } = await supabase
        .from('requests')
        .insert([
            {
                user_id: request.user_id,
                type: request.type,
                amount: request.amount,
                details: request.details,
                status: 'pending',
            },
        ])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const fetchPendingRequests = async () => {
    // Note: This relies on Supabase being able to fetch user metadata or a profiles table join.
    // For now, we will fetch requests and we might need to fetch profiles separately if join isn't trivial without a foreign key to a 'profiles' table.
    // Assuming 'requests.user_id' references 'auth.users'.
    const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data as TransactionRequest[];
};

export const processRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    const { data: request, error: fetchError } = await supabase
        .from('requests')
        .select('*')
        .eq('id', requestId)
        .single();

    if (fetchError) throw fetchError;
    if (!request) throw new Error('Request not found');

    if (status === 'rejected') {
        const { error } = await supabase
            .from('requests')
            .update({ status: 'rejected' })
            .eq('id', requestId);
        if (error) throw error;
        return;
    }

    // If Approved, create a transaction and update request status
    // ideally this should be a stored procedure or transaction to ensure atomicity.
    const type = request.type === 'pay' ? 'credit' : 'debit'; // Pay = User pays = Credit to account? Or User pays TO system? 
    // Context: "Pay" usually means User depositing money. "Withdraw" means User taking money out.
    // Let's assume:
    // "Pay" -> User adds funds -> Credit
    // "Withdraw" -> User removes funds -> Debit

    const { error: txnError } = await supabase
        .from('transactions')
        .insert([{
            user_id: request.user_id,
            amount: type === 'credit' ? request.amount : -Math.abs(request.amount),
            type: type,
            description: request.details || `${request.type} request approved`,
            status: 'completed'
        }]); // Removed duplicate amount key

    if (txnError) throw txnError;

    const { error: updateError } = await supabase
        .from('requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

    if (updateError) throw updateError;
};

// Profiles
export const fetchProfiles = async () => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    // Map database snake_case to app camelCase or expected structure if needed,
    // but the app seems to expect snake_case from Supabase generally, OR currently uses mock camelCase.
    // AdminDashboard expects: full_name, email, id, card_number, created_at.
    // The 'profiles' table has these columns (snake_case).
    return data;
};

// Payments (Mock Processing)
export const processPayment = async (userId: string, amount: number, description: string) => {
    // 1. Create a completed 'credit' transaction directly
    const { error } = await supabase
        .from('transactions')
        .insert([{
            user_id: userId,
            amount: Math.abs(amount), // Ensure positive for credit
            type: 'credit',
            description: description,
            status: 'completed'
        }]);

    if (error) throw error;
};

export const createAdminTransaction = async (userId: string, amount: number, type: 'credit' | 'debit', description: string) => {
    const { error } = await supabase
        .from('transactions')
        .insert([{
            user_id: userId,
            amount: type === 'debit' ? -Math.abs(amount) : Math.abs(amount),
            type: type,
            description: description,
            status: 'completed'
        }]);

    if (error) throw error;
}
