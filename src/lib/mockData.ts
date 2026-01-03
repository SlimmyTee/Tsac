// Mock data store - simulates a backend database
// This will be replaced with Firebase later

export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string; // Computed from first_name + last_name
  phone: string;
  gender: string;
  law_enforcement_affiliated: string;
  date_of_birth: string;
  deposit_amount: number;
  duration: number; // Initial meet up duration in minutes
  service_type: string;
  personal_items: string;
  profile_picture: string | null;
  role: 'user' | 'admin';
  card_number: string | null;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit' | 'adjustment';
  description: string;
  admin_id: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
};

// Mock users (stored in localStorage for persistence)
const STORAGE_KEY_USERS = 'mock_users';
const STORAGE_KEY_TRANSACTIONS = 'mock_transactions';
const STORAGE_KEY_SESSION = 'mock_session';

// Initialize with default data
function initializeMockData() {
  if (typeof window === 'undefined') return;

  // Check if data already exists
  if (localStorage.getItem(STORAGE_KEY_USERS)) return;

  // Create default admin user
  const defaultAdmin: Profile = {
    id: 'admin-1',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    full_name: 'Admin User',
    phone: '',
    gender: '',
    law_enforcement_affiliated: '',
    date_of_birth: '',
    deposit_amount: 0,
    duration: 0,
    service_type: '',
    personal_items: '',
    profile_picture: null,
    role: 'admin',
    card_number: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Create default regular user
  const defaultUser: Profile = {
    id: 'user-1',
    email: 'user@example.com',
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    phone: '',
    gender: '',
    law_enforcement_affiliated: '',
    date_of_birth: '',
    deposit_amount: 0,
    duration: 0,
    service_type: '',
    personal_items: '',
    profile_picture: null,
    role: 'user',
    card_number: generateCardNumber(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Default password for both is "password123"
  const users = [
    { profile: defaultAdmin, password: 'password123' },
    { profile: defaultUser, password: 'password123' },
  ];

  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([]));
}

function generateCardNumber(): string {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
}

// Get all users
export function getUsers(): Profile[] {
  if (typeof window === 'undefined') return [];
  initializeMockData();
  const data = localStorage.getItem(STORAGE_KEY_USERS);
  if (!data) return [];
  const users = JSON.parse(data) as Array<{ profile: Profile; password: string }>;
  return users.map((u) => u.profile);
}

// Get user by ID
export function getUserById(id: string): Profile | null {
  const users = getUsers();
  return users.find((u) => u.id === id) || null;
}

// Get user by email and password
export function authenticateUser(email: string, password: string): Profile | null {
  if (typeof window === 'undefined') return null;
  initializeMockData();
  const data = localStorage.getItem(STORAGE_KEY_USERS);
  if (!data) return null;
  const users = JSON.parse(data) as Array<{ profile: Profile; password: string }>;
  const user = users.find((u) => u.profile.email === email && u.password === password);
  return user ? user.profile : null;
}

// Create new user
export function createUser(userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  law_enforcement_affiliated: string;
  date_of_birth: string;
  deposit_amount: number;
  duration: number;
  service_type: string;
  personal_items: string;
  profile_picture?: string | null;
}): Profile {
  if (typeof window === 'undefined') {
    throw new Error('Cannot create user outside browser');
  }
  initializeMockData();
  const data = localStorage.getItem(STORAGE_KEY_USERS);
  const users = data ? (JSON.parse(data) as Array<{ profile: Profile; password: string }>) : [];

  // Check if user already exists
  if (users.some((u) => u.profile.email === userData.email)) {
    throw new Error('User with this email already exists');
  }

  const newProfile: Profile = {
    id: `user-${Date.now()}`,
    email: userData.email,
    first_name: userData.first_name,
    last_name: userData.last_name,
    full_name: `${userData.first_name} ${userData.last_name}`,
    phone: userData.phone,
    gender: userData.gender,
    law_enforcement_affiliated: userData.law_enforcement_affiliated,
    date_of_birth: userData.date_of_birth,
    deposit_amount: userData.deposit_amount,
    duration: userData.duration,
    service_type: userData.service_type,
    personal_items: userData.personal_items,
    profile_picture: userData.profile_picture || null,
    role: 'user',
    card_number: generateCardNumber(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  users.push({ profile: newProfile, password: userData.password });
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  return newProfile;
}

// Get transactions for a user
export function getTransactions(userId?: string): Transaction[] {
  if (typeof window === 'undefined') return [];
  initializeMockData();
  const data = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
  if (!data) return [];
  const transactions = JSON.parse(data) as Transaction[];
  if (userId) {
    return transactions.filter((t) => t.user_id === userId);
  }
  return transactions;
}

// Add transaction
export function addTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Transaction {
  if (typeof window === 'undefined') {
    throw new Error('Cannot add transaction outside browser');
  }
  initializeMockData();
  const data = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
  const transactions = data ? (JSON.parse(data) as Transaction[]) : [];

  const newTransaction: Transaction = {
    ...transaction,
    id: `txn-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  transactions.push(newTransaction);
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  return newTransaction;
}

// Update transaction
export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
  if (typeof window === 'undefined') {
    throw new Error('Cannot update transaction outside browser');
  }
  initializeMockData();
  const data = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
  if (!data) return null;
  const transactions = JSON.parse(data) as Transaction[];
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return null;

  transactions[index] = { ...transactions[index], ...updates };
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  return transactions[index];
}

// Delete transaction
export function deleteTransaction(id: string): boolean {
  if (typeof window === 'undefined') {
    throw new Error('Cannot delete transaction outside browser');
  }
  initializeMockData();
  const data = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
  if (!data) return false;
  const transactions = JSON.parse(data) as Transaction[];
  const filtered = transactions.filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(filtered));
  return true;
}

// Session management
export function setSession(profile: Profile | null) {
  if (typeof window === 'undefined') return;
  if (profile) {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(profile));
  } else {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  }
}

export function getSession(): Profile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY_SESSION);
  return data ? (JSON.parse(data) as Profile) : null;
}

