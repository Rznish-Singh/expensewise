"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-6">⚠️</div>
          <h1 className="font-serif text-2xl font-light text-foreground mb-3">
            Something went wrong
          </h1>
          <p className="text-[13px] text-muted-foreground mb-8">
            An unexpected error occurred. Please try again. If the problem
            persists, contact support.
          </p>
          {error.digest && (
            <p className="text-[11px] text-muted-foreground mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <Button onClick={reset} icon={<RefreshCw size={14} />}>
            Try Again
          </Button>
        </div>
      </body>
    </html>
  );
}
