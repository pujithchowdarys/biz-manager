
import React from 'react';
import { Link } from 'react-router-dom';

const InstructionsPage: React.FC = () => {
    const sqlSchema = `
-- Customers Table: Stores daily business customers
CREATE TABLE customers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer Transactions Table: Records money given to or received from customers
CREATE TABLE customer_transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  type TEXT NOT NULL -- 'Given' or 'Received'
);

-- Chits Table: Stores chit fund groups
CREATE TABLE chits (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  total_value NUMERIC(12, 2) NOT NULL,
  members_count INT NOT NULL,
  duration_months INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ongoing', -- 'Ongoing' or 'Completed'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chit Members Table: Stores members of each chit group
CREATE TABLE chit_members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  chit_id BIGINT NOT NULL REFERENCES chits(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  lottery_status TEXT NOT NULL DEFAULT 'Pending' -- 'Pending' or 'Won'
);

-- Chit Transactions Table: Records payments from members or payouts to them
CREATE TABLE chit_transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  member_id BIGINT NOT NULL REFERENCES chit_members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL, -- 'Given' (member pays to chit) or 'Received' (member gets payout)
  description TEXT
);

-- Expenses Table: Tracks household income and expenses
CREATE TABLE expenses (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  expense_date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL -- 'Income' or 'Expense'
);

-- Loans Table: Tracks loans taken or given
CREATE TABLE loans (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  principal NUMERIC(12, 2) NOT NULL,
  interest_rate NUMERIC(5, 2),
  duration_months INT,
  type TEXT NOT NULL, -- 'Taken' or 'Given'
  status TEXT NOT NULL DEFAULT 'Active' -- 'Active' or 'Paid Off'
);

-- Loan Transactions Table: Records loan payments or disbursements
CREATE TABLE loan_transactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  loan_id BIGINT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  type TEXT NOT NULL -- 'Payment' or 'Disbursement'
);
`;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-10 flex justify-center">
      <div className="max-w-4xl w-full bg-surface p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-textPrimary mb-4">Database Setup Instructions</h1>
        <p className="text-textSecondary mb-6">Follow these steps to set up your personal Supabase database for Business Manager Pro.</p>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-textPrimary mt-6">Step 1: Create a Supabase Account</h2>
            <p className="text-textSecondary mt-2">If you don't already have an account, go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">supabase.com</a> and sign up. It's free!</p>

            <h2 className="text-xl font-semibold text-textPrimary mt-6">Step 2: Create a New Project</h2>
            <p className="text-textSecondary mt-2">Once you're logged in, create a new project. Give it a name (e.g., "BusinessManagerDB"), generate a secure password, and choose a region close to you.</p>

            <h2 className="text-xl font-semibold text-textPrimary mt-6">Step 3: Find Your API Credentials</h2>
            <p className="text-textSecondary mt-2">After your project is created, navigate to the API settings:</p>
            <ol className="list-decimal list-inside text-textSecondary space-y-1 mt-2">
              <li>Click on the <strong>Settings</strong> icon (a cogwheel) in the left sidebar.</li>
              <li>In the settings menu, click on <strong>API</strong>.</li>
              <li>You will find your <strong>Project URL</strong> and your <strong>Project API Keys</strong> here.</li>
              <li>You need to copy the <strong>URL</strong> and the key labeled <code>anon</code> and <code>public</code>. This is your <strong>Anon Key</strong>.</li>
            </ol>
            <p className="text-textSecondary mt-2">You will enter these two values into the sign-up form in the app.</p>

            <h2 className="text-xl font-semibold text-textPrimary mt-6">Step 4: Create the Database Tables</h2>
            <p className="text-textSecondary mt-2">Next, you need to create the tables the app uses to store data.</p>
            <ol className="list-decimal list-inside text-textSecondary space-y-1 mt-2">
              <li>Click on the <strong>SQL Editor</strong> icon (a paper with "SQL") in the left sidebar.</li>
              <li>Click on <strong>+ New query</strong>.</li>
              <li>Copy the entire SQL script below and paste it into the query editor.</li>
              <li>Click the <strong>RUN</strong> button to execute the script and create all the tables.</li>
            </ol>
            <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mt-4">
              <code className="text-textPrimary">{sqlSchema.trim()}</code>
            </pre>

            <h2 className="text-xl font-semibold text-textPrimary mt-6">Step 5: Sign Up in the App</h2>
            <p className="text-textSecondary mt-2">You're all set! Go back to the <Link to="/signup" className="text-primary underline">Sign Up page</Link>, create your app username and password, and paste the Supabase URL and Anon Key you copied in Step 3.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsPage;
