# Car Rental Admin Dashboard

A modern admin dashboard for managing car rental listings, built with Next.js (App Router), shadcn/ui, React Query, SQLite, and secure authentication.

## Features

- **Authentication**: Secure login with cookie-based session, protected routes (server & client-side)
- **Dashboard**: Paginated table of car rental listings with approve/reject/edit actions
- **Edit Modal**: Edit listing details with validation (react-hook-form + yup)
- **Status Management**: Approve, reject, or set pending status for listings
- **API Routes**: All CRUD operations via Next.js API routes, using SQLite (better-sqlite3)
- **SSR**: Dashboard data fetched server-side (App Router server component)
- **UI**: Clean, accessible design using shadcn/ui and Tailwind CSS
- **Feedback**: Success/error messages for all actions

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

2. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Database:**
   - SQLite is used for storage. The database file will be created automatically on first run.
   - Listings and audit logs are stored in the DB.

## Usage

- **Login:** Use the provided username/password (see code for credentials; default is mocked for demo).
- **Dashboard:**
  - View, approve, reject, or edit car rental listings.
  - Edit opens a modal with form validation.
  - Status can be set to Approved, Pending, or Rejected.
  - Logout securely from the dashboard.

## Tech Stack

- Next.js (App Router)
- React Query
- shadcn/ui & Tailwind CSS
- SQLite (better-sqlite3)
- react-hook-form & yup
- axios
- js-cookie

## Stretch Goals

- Filtering listings by status
- Audit trail/logging of actions
- Performance optimizations

## Credits

- Built for a Next.js developer assessment
- UI components: [shadcn/ui](https://ui.shadcn.com/)
- Inspired by modern admin dashboard best practices
