"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  LayoutDashboard, History, Calendar, Settings, Mail,
  TrendingUp, Plus, ChevronDown, ChevronRight, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddExpenseModal } from "@/components/modals/AddExpenseModal";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Dashboard", icon: LayoutDashboard },
  { href: "/history",    label: "History",   icon: History },
  { href: "/calendar",   label: "Calendar",  icon: Calendar },
  { href: "/settings",   label: "Settings",  icon: Settings },
  { href: "/contact",    label: "Contact",   icon: Mail },
];

const MONTH_ITEMS = [
  { label: "June 2026",      href: "/dashboard?m=2026-06", active: true },
  { label: "May 2026",       href: "/dashboard?m=2026-05" },
  { label: "April 2026",     href: "/dashboard?m=2026-04" },
  { label: "March 2026",     href: "/dashboard?m=2026-03" },
  { label: "February 2026",  href: "/dashboard?m=2026-02" },
  { label: "January 2026",   href: "/dashboard?m=2026-01" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [monthsOpen, setMonthsOpen]   = useState(true);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-black/[0.07]">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
          <TrendingUp size={16} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-serif text-[15px] font-light leading-none text-foreground">ExpenseWise</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Expense Tracker</div>
        </div>
        <button
          className="ml-auto lg:hidden text-muted-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* Add Expense */}
      <div className="px-4 py-3">
        <button
          onClick={() => setAddModalOpen(true)}
          className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-700 text-white rounded-lg px-4 py-2.5 text-[13px] font-medium transition-colors duration-150"
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Expense
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest px-3 py-2 mt-1">
          Main
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg mx-1 my-0.5 text-[13px] transition-all duration-150",
                isActive
                  ? "bg-green-50 text-green-900 font-medium"
                  : "text-muted-foreground hover:bg-cream-200 hover:text-foreground"
              )}
            >
              <item.icon
                size={15}
                className={isActive ? "text-green-700" : "text-muted-foreground"}
              />
              {item.label}
            </Link>
          );
        })}

        <div className="h-px bg-black/[0.07] mx-3 my-3" />

        {/* Months collapsible */}
        <button
          onClick={() => setMonthsOpen(!monthsOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-[13px] text-muted-foreground hover:text-foreground rounded-lg mx-1 transition-colors"
        >
          <span className="font-medium text-foreground">Months</span>
          {monthsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {monthsOpen && (
          <div className="mt-1 space-y-0.5">
            {MONTH_ITEMS.map((m) => (
              <Link
                key={m.label}
                href={m.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 mx-1 rounded-lg text-[12px] transition-colors",
                  m.active
                    ? "text-green-900 font-medium"
                    : "text-muted-foreground hover:bg-cream-200 hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-2">
                  {m.active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  )}
                  {!m.active && <span className="w-1.5 h-1.5" />}
                  {m.label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-black/[0.07] p-4">
        <div className="flex items-center gap-2.5">
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-8 h-8 rounded-full",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium truncate">
              {user?.fullName ?? user?.firstName ?? "User"}
            </div>
            <div className="text-[11px] text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-border rounded-lg p-2 shadow-sm"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-black/[0.07] z-30 hidden lg:flex flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-black/[0.07] z-50 flex flex-col lg:hidden transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      <AddExpenseModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {}}
      />
    </>
  );
}
