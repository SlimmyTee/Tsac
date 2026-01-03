export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'user' | 'admin';
          card_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: 'user' | 'admin';
          card_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'user' | 'admin';
          card_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: 'credit' | 'debit' | 'adjustment';
          description: string;
          admin_id: string | null;
          created_at: string;
          metadata: Record<string, unknown>;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: 'credit' | 'debit' | 'adjustment';
          description: string;
          admin_id?: string | null;
          created_at?: string;
          metadata?: Record<string, unknown>;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: 'credit' | 'debit' | 'adjustment';
          description?: string;
          admin_id?: string | null;
          created_at?: string;
          metadata?: Record<string, unknown>;
        };
      };
    };
  };
}
