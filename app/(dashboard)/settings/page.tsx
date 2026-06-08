"use client";

import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { LogOut, Save, User, Bell, Palette, Shield } from "lucide-react";
import { useSettings } from "@/hooks/useExpenses";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CURRENCY_OPTIONS } from "@/types";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-10 h-[22px] rounded-full transition-colors duration-200 flex-shrink-0",
        checked ? "bg-green-500" : "bg-black/[0.15]"
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-200",
          checked && "translate-x-[18px]"
        )}
      />
    </button>
  );
}

interface SettingRowProps {
  label: string;
  desc?: string;
  children: React.ReactNode;
}

function SettingRow({ label, desc, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-black/[0.05] last:border-b-0">
      <div>
        <div className="text-[13px] font-medium">{label}</div>
        {desc && <div className="text-[12px] text-muted-foreground mt-0.5">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user }                  = useUser();
  const { signOut }               = useClerk();
  const { settings, updateSettings, loading } = useSettings();

  const [budget, setBudget]         = useState("60000");
  const [currency, setCurrency]     = useState("INR");
  const [saving, setSaving]         = useState(false);

  const [notify, setNotify] = useState({
    budgetAlert:    true,
    weeklySummary:  true,
    newTransaction: false,
    monthlyReport:  true,
  });

  const [appearance, setAppearance] = useState({
    darkMode:    false,
    compactView: false,
  });

  useEffect(() => {
    if (!settings) return;
    setBudget(String(settings.monthlyBudget));
    setCurrency(settings.currency);
    setNotify({
      budgetAlert:    settings.notifyBudgetAlert,
      weeklySummary:  settings.notifyWeeklySummary,
      newTransaction: settings.notifyNewTransaction,
      monthlyReport:  settings.notifyMonthlyReport,
    });
    setAppearance({
      darkMode:    settings.darkMode,
      compactView: settings.compactView,
    });
  }, [settings]);

  async function handleSaveProfile() {
    setSaving(true);
    const currObj = CURRENCY_OPTIONS.find(c => c.code === currency);
    await updateSettings({
      monthlyBudget:  parseFloat(budget),
      currency,
      currencySymbol: currObj?.symbol ?? "₹",
    });
    setSaving(false);
  }

  async function handleToggleNotify(key: keyof typeof notify, val: boolean) {
    setNotify(p => ({ ...p, [key]: val }));
    await updateSettings({
      notifyBudgetAlert:    key === "budgetAlert"    ? val : notify.budgetAlert,
      notifyWeeklySummary:  key === "weeklySummary"  ? val : notify.weeklySummary,
      notifyNewTransaction: key === "newTransaction" ? val : notify.newTransaction,
      notifyMonthlyReport:  key === "monthlyReport"  ? val : notify.monthlyReport,
    });
  }

  async function handleToggleAppearance(key: keyof typeof appearance, val: boolean) {
    setAppearance(p => ({ ...p, [key]: val }));
    await updateSettings({
      darkMode:    key === "darkMode"    ? val : appearance.darkMode,
      compactView: key === "compactView" ? val : appearance.compactView,
    });
  }

  return (
    <div className="p-6 md:p-8 max-w-[900px] animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Profile */}
        <Card className="col-span-1">
          <div className="flex items-center gap-2 mb-5">
            <User size={16} className="text-muted-foreground" />
            <h2 className="text-[14px] font-medium">Profile & Budget</h2>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Full Name</label>
                <input
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all"
                  defaultValue={user?.fullName ?? ""}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">Email Address</label>
                <input
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all"
                  defaultValue={user?.primaryEmailAddress?.emailAddress ?? ""}
                  readOnly
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">
                  Monthly Budget
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-muted-foreground mb-1.5">
                  Currency
                </label>
                <select
                  className="w-full px-3.5 py-2.5 border border-border rounded-lg text-[13px] bg-[#F7F6F2] outline-none focus:border-green-500 focus:bg-white transition-all appearance-none"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                >
                  {CURRENCY_OPTIONS.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={handleSaveProfile}
                loading={saving}
                icon={<Save size={14} />}
                className="w-full justify-center"
              >
                Save Changes
              </Button>
            </div>
          )}
        </Card>

        <div className="space-y-5">
          {/* Notifications */}
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <Bell size={16} className="text-muted-foreground" />
              <h2 className="text-[14px] font-medium">Notifications</h2>
            </div>
            <SettingRow label="Budget alerts" desc="Alert when you approach your budget limit">
              <Toggle
                checked={notify.budgetAlert}
                onChange={v => handleToggleNotify("budgetAlert", v)}
              />
            </SettingRow>
            <SettingRow label="Weekly summary" desc="Spending digest delivered every Monday">
              <Toggle
                checked={notify.weeklySummary}
                onChange={v => handleToggleNotify("weeklySummary", v)}
              />
            </SettingRow>
            <SettingRow label="New transaction" desc="Notify for each logged transaction">
              <Toggle
                checked={notify.newTransaction}
                onChange={v => handleToggleNotify("newTransaction", v)}
              />
            </SettingRow>
            <SettingRow label="Monthly report" desc="Auto-generate and email month-end PDF">
              <Toggle
                checked={notify.monthlyReport}
                onChange={v => handleToggleNotify("monthlyReport", v)}
              />
            </SettingRow>
          </Card>

          {/* Appearance */}
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <Palette size={16} className="text-muted-foreground" />
              <h2 className="text-[14px] font-medium">Appearance</h2>
            </div>
            <SettingRow label="Dark mode" desc="Switch to a darker interface theme">
              <Toggle
                checked={appearance.darkMode}
                onChange={v => handleToggleAppearance("darkMode", v)}
              />
            </SettingRow>
            <SettingRow label="Compact view" desc="Reduce spacing in transaction lists">
              <Toggle
                checked={appearance.compactView}
                onChange={v => handleToggleAppearance("compactView", v)}
              />
            </SettingRow>
          </Card>

          {/* Account */}
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-muted-foreground" />
              <h2 className="text-[14px] font-medium">Account</h2>
            </div>
            <SettingRow label="Manage account" desc="Update password, 2FA, and connected accounts">
              <a
                href="https://accounts.clerk.dev/user"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-green-700 hover:underline"
              >
                Open ›
              </a>
            </SettingRow>
            <SettingRow label="Data export" desc="Download all your data as CSV">
              <button
                onClick={() => toast("CSV export coming soon!")}
                className="text-[12px] text-green-700 hover:underline"
              >
                Export
              </button>
            </SettingRow>
            <div className="pt-3">
              <Button
                variant="danger"
                icon={<LogOut size={14} />}
                className="w-full justify-center"
                onClick={() => signOut({ redirectUrl: "/sign-in" })}
              >
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
