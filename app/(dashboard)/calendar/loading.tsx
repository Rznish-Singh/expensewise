export default function CalendarLoading() {
  return (
    <div className="p-6 md:p-8 max-w-[1200px] animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded-lg w-36 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-72" />
        </div>
        <div className="h-9 bg-gray-200 rounded-lg w-28" />
      </div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
        <div className="h-7 bg-gray-200 rounded-lg w-40" />
        <div className="w-8 h-8 bg-gray-100 rounded-lg" />
      </div>
      <div className="bg-white border border-black/[0.07] rounded-xl p-5">
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 42 }).map((_, i) => (
            <div key={i} className="h-[72px] rounded-lg bg-gray-50" />
          ))}
        </div>
      </div>
    </div>
  );
}
