import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-cream-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div>
            <h1 className="font-serif text-xl font-light text-foreground leading-none">ExpenseWise</h1>
            <p className="text-xs text-muted-foreground">Expense Tracker</p>
          </div>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-sm border border-border rounded-2xl",
              headerTitle: "font-serif font-light",
              formButtonPrimary:
                "bg-green-500 hover:bg-green-700 font-sans text-sm",
              footerActionLink: "text-green-700 hover:text-green-900",
            },
          }}
        />

        <p className="text-center text-xs text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-green-700 underline hover:text-green-900">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
