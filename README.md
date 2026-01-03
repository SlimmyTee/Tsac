# Wallet Transaction Admin System

A full-stack web application for managing user wallets and transactions with separate user and admin roles.

## Features

### User Features
- Sign up / Log in
- View wallet balance
- View virtual card number
- View transaction history
- Filter and search transactions

### Admin Features
- Admin login
- View all users
- View user wallet details
- Add/edit/delete transactions for users
- Real-time balance updates

## Current Setup

**Note:** This app currently uses **mock data stored in localStorage** for the frontend. The backend can be easily replaced with Firebase or any other backend service.

### Default Test Accounts

- **Admin Account:**
  - Email: `admin@example.com`
  - Password: `password123`

- **User Account:**
  - Email: `user@example.com`
  - Password: `password123`

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the URL shown (typically `http://localhost:5173`)

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Data Storage:** localStorage (mock data - ready to be replaced with Firebase)

## Future Backend Integration

The app is structured to easily integrate with Firebase or any other backend:

1. Replace `src/lib/mockData.ts` functions with Firebase calls
2. Update `src/contexts/AuthContext.tsx` to use Firebase Auth
3. Update components to use Firebase Firestore/Realtime Database

All data structures are already defined and ready for migration.
