import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F6F2] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="font-serif text-[80px] font-light text-green-500 leading-none mb-4">
          404
        </div>
        <h1 className="font-serif text-2xl font-light text-foreground mb-3">
          Page not found
        </h1>
        <p className="text-[13px] text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-700 text-white rounded-lg px-5 py-2.5 text-[13px] font-medium transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
