export default function HistoryLoading() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded-lg w-52 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-64" />
        </div>
        <div className="h-9 bg-gray-200 rounded-lg w-28" />
      </div>
      <div className="bg-white border border-black/[0.07] rounded-xl">
        <div className="px-5 pt-5 pb-3 border-b border-black/[0.05]">
          <div className="flex flex-wrap gap-2 mb-4">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="h-7 bg-gray-100 rounded-full w-16" />
            ))}
          </div>
          <div className="h-9 bg-gray-100 rounded-lg w-full max-w-xs" />
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex-shrink-0" />
              <div className="flex-1 h-3 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded w-20" />
              <div className="h-3 bg-gray-100 rounded w-16" />
              <div className="h-3 bg-gray-100 rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
