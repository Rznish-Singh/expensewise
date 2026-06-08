import {
  pgTable,
  text,
  numeric,
  timestamp,
  boolean,
  integer,
  uuid,
  index,
} from "drizzle-orm/pg-core";

// ── Expenses table ────────────────────────────────────────────────────────────
export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    category: text("category").notNull().default("other"),
    type: text("type").notNull().default("expense"), // 'expense' | 'income'
    date: text("date").notNull(), // YYYY-MM-DD
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("expenses_user_id_idx").on(table.userId),
    dateIdx: index("expenses_date_idx").on(table.date),
    categoryIdx: index("expenses_category_idx").on(table.category),
    userDateIdx: index("expenses_user_date_idx").on(table.userId, table.date),
  })
);

// ── User settings table ───────────────────────────────────────────────────────
export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().unique(),
  monthlyBudget: numeric("monthly_budget", { precision: 12, scale: 2 })
    .notNull()
    .default("60000"),
  currency: text("currency").notNull().default("INR"),
  currencySymbol: text("currency_symbol").notNull().default("₹"),
  notifyBudgetAlert: boolean("notify_budget_alert").notNull().default(true),
  notifyWeeklySummary: boolean("notify_weekly_summary").notNull().default(true),
  notifyNewTransaction: boolean("notify_new_transaction")
    .notNull()
    .default(false),
  notifyMonthlyReport: boolean("notify_monthly_report").notNull().default(true),
  darkMode: boolean("dark_mode").notNull().default(false),
  compactView: boolean("compact_view").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Type exports ──────────────────────────────────────────────────────────────
export type ExpenseRow = typeof expenses.$inferSelect;
export type ExpenseInsertRow = typeof expenses.$inferInsert;
export type UserSettingsRow = typeof userSettings.$inferSelect;
export type UserSettingsInsertRow = typeof userSettings.$inferInsert;
