-- SpendWise database migration
-- Run this against your Neon / Supabase / PostgreSQL database

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     TEXT NOT NULL,
  description TEXT NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL,
  category    TEXT NOT NULL DEFAULT 'other',
  type        TEXT NOT NULL DEFAULT 'expense',
  date        TEXT NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS expenses_user_id_idx  ON expenses(user_id);
CREATE INDEX IF NOT EXISTS expenses_date_idx      ON expenses(date);
CREATE INDEX IF NOT EXISTS expenses_category_idx  ON expenses(category);
CREATE INDEX IF NOT EXISTS expenses_user_date_idx ON expenses(user_id, date);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id                     UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id                TEXT NOT NULL UNIQUE,
  monthly_budget         NUMERIC(12, 2) NOT NULL DEFAULT 60000,
  currency               TEXT NOT NULL DEFAULT 'INR',
  currency_symbol        TEXT NOT NULL DEFAULT '₹',
  notify_budget_alert    BOOLEAN NOT NULL DEFAULT TRUE,
  notify_weekly_summary  BOOLEAN NOT NULL DEFAULT TRUE,
  notify_new_transaction BOOLEAN NOT NULL DEFAULT FALSE,
  notify_monthly_report  BOOLEAN NOT NULL DEFAULT TRUE,
  dark_mode              BOOLEAN NOT NULL DEFAULT FALSE,
  compact_view           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at             TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Seed demo data function (optional)
-- Call: SELECT seed_demo_data('your_clerk_user_id');
CREATE OR REPLACE FUNCTION seed_demo_data(p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  -- Insert default settings
  INSERT INTO user_settings (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert sample expenses for June 2024
  INSERT INTO expenses (user_id, description, amount, category, type, date) VALUES
    (p_user_id, 'Lunch at Coffee House',    850,   'food',          'expense', '2024-06-12'),
    (p_user_id, 'Uber Ride',               320,   'transport',     'expense', '2024-06-12'),
    (p_user_id, 'Electricity Bill',       2450,   'bills',         'expense', '2024-06-11'),
    (p_user_id, 'Amazon Shopping',        1280,   'shopping',      'expense', '2024-06-10'),
    (p_user_id, 'Netflix Subscription',    649,   'entertainment', 'expense', '2024-06-10'),
    (p_user_id, 'Gym Membership',         1800,   'gym',           'expense', '2024-06-09'),
    (p_user_id, 'Grocery Run',            2100,   'grocery',       'expense', '2024-06-08'),
    (p_user_id, 'Salary Credit',         65000,   'income',        'income',  '2024-06-01'),
    (p_user_id, 'Zomato Order',            420,   'food',          'expense', '2024-06-07'),
    (p_user_id, 'Train Ticket',            580,   'travel',        'expense', '2024-06-06'),
    (p_user_id, 'Online Course',          1200,   'online',        'expense', '2024-06-05'),
    (p_user_id, 'Mobile Recharge',         399,   'bills',         'expense', '2024-06-04'),
    (p_user_id, 'Dinner with Friends',    1200,   'food',          'expense', '2024-06-13'),
    (p_user_id, 'Bus Pass',               500,   'transport',     'expense', '2024-06-14'),
    (p_user_id, 'Water Bill',             280,   'bills',         'expense', '2024-06-15'),
    (p_user_id, 'Swiggy Order',           350,   'food',          'expense', '2024-06-16'),
    (p_user_id, 'Petrol',                1200,   'transport',     'expense', '2024-06-17'),
    (p_user_id, 'Internet Bill',          899,   'bills',         'expense', '2024-06-18'),
    (p_user_id, 'Myntra Clothes',        2200,   'shopping',      'expense', '2024-06-19'),
    (p_user_id, 'Movie Tickets',          480,   'entertainment', 'expense', '2024-06-20'),
    (p_user_id, 'Flight Booking',        4500,   'travel',        'expense', '2024-06-21'),
    (p_user_id, 'Freelance Income',      8000,   'income',        'income',  '2024-06-15'),
    (p_user_id, 'Bakery Breakfast',       180,   'food',          'expense', '2024-06-22'),
    (p_user_id, 'Auto Rickshaw',          120,   'transport',     'expense', '2024-06-22'),
    (p_user_id, 'Gas Cylinder',          1000,   'bills',         'expense', '2024-06-23')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
