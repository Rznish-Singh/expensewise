// ── Expense / Transaction ──────────────────────────────────────────────────────
export type ExpenseCategory =
  | "food"
  | "transport"
  | "bills"
  | "shopping"
  | "entertainment"
  | "gym"
  | "grocery"
  | "travel"
  | "online"
  | "income"
  | "other";

export type ExpenseType = "expense" | "income";

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
  date: string; // ISO date string YYYY-MM-DD
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInsert {
  description: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
  date: string;
  notes?: string;
}

// ── Stats ──────────────────────────────────────────────────────────────────────
export interface MonthStats {
  totalExpenses: number;
  totalIncome: number;
  totalSavings: number;
  budgetRemaining: number;
  transactionCount: number;
  expenseChangePercent: number;
  savingsChangePercent: number;
  budgetChangePercent: number;
  transactionChangePercent: number;
}

export interface CategoryStat {
  category: ExpenseCategory;
  label: string;
  emoji: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface DailyTrend {
  date: string;
  day: number;
  amount: number;
}

export interface MonthlyTrend {
  month: string;
  expenses: number;
  income: number;
}

// ── Calendar ──────────────────────────────────────────────────────────────────
export interface DayExpenses {
  date: string;
  total: number;
  count: number;
  expenses: Expense[];
}

// ── Settings ──────────────────────────────────────────────────────────────────
export interface UserSettings {
  id: string;
  userId: string;
  monthlyBudget: number;
  currency: string;
  currencySymbol: string;
  notifyBudgetAlert: boolean;
  notifyWeeklySummary: boolean;
  notifyNewTransaction: boolean;
  notifyMonthlyReport: boolean;
  darkMode: boolean;
  compactView: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsUpdate {
  monthlyBudget?: number;
  currency?: string;
  currencySymbol?: string;
  notifyBudgetAlert?: boolean;
  notifyWeeklySummary?: boolean;
  notifyNewTransaction?: boolean;
  notifyMonthlyReport?: boolean;
  darkMode?: boolean;
  compactView?: boolean;
}

// ── API Responses ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ── Filters ───────────────────────────────────────────────────────────────────
export interface ExpenseFilters {
  category?: ExpenseCategory | "all";
  type?: ExpenseType | "all";
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "date" | "amount" | "category";
  sortOrder?: "asc" | "desc";
}

// ── Chart Data ────────────────────────────────────────────────────────────────
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// ── Category Meta ─────────────────────────────────────────────────────────────
export const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; emoji: string; color: string; bgColor: string; textColor: string }
> = {
  food:          { label: "Food & Dining",     emoji: "🍽",  color: "#1D9E75", bgColor: "#E1F5EE", textColor: "#085041" },
  transport:     { label: "Transport",          emoji: "🚗",  color: "#378ADD", bgColor: "#E6F1FB", textColor: "#0C447C" },
  bills:         { label: "Bills & Utilities",  emoji: "📋",  color: "#534AB7", bgColor: "#EEEDFE", textColor: "#3C3489" },
  shopping:      { label: "Shopping",           emoji: "🛍",  color: "#BA7517", bgColor: "#FAEEDA", textColor: "#633806" },
  entertainment: { label: "Entertainment",      emoji: "🎮",  color: "#D85A30", bgColor: "#FAECE7", textColor: "#712B13" },
  gym:           { label: "Gym & Fitness",      emoji: "💪",  color: "#4D9E1D", bgColor: "#EAF3DE", textColor: "#27500A" },
  grocery:       { label: "Grocery",            emoji: "🛒",  color: "#7A7660", bgColor: "#F1EFE8", textColor: "#444441" },
  travel:        { label: "Travel",             emoji: "✈",   color: "#1A6FBB", bgColor: "#E6F1FB", textColor: "#185FA5" },
  online:        { label: "Online Services",    emoji: "💻",  color: "#A0244A", bgColor: "#FBEAF0", textColor: "#72243E" },
  income:        { label: "Income",             emoji: "💰",  color: "#1D9E75", bgColor: "#E1F5EE", textColor: "#085041" },
  other:         { label: "Other",              emoji: "📦",  color: "#9B998F", bgColor: "#F1F0EC", textColor: "#555450" },
};

export const CURRENCY_OPTIONS = [
  { code: "INR", symbol: "₹", label: "INR – Indian Rupee" },
  { code: "USD", symbol: "$", label: "USD – US Dollar" },
  { code: "EUR", symbol: "€", label: "EUR – Euro" },
  { code: "GBP", symbol: "£", label: "GBP – British Pound" },
  { code: "JPY", symbol: "¥", label: "JPY – Japanese Yen" },
  { code: "AUD", symbol: "A$", label: "AUD – Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "CAD – Canadian Dollar" },
];
