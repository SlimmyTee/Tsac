import { supabase } from './supabase';
import { Transaction, TransactionRequest, Profile } from '../types';

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
// Requests

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
    return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
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
};

export const updateTransactionStatus = async (transactionId: string, status: 'completed' | 'pending' | 'failed') => {
    const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', transactionId);

    if (error) throw error;
};
