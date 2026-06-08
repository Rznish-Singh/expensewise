export default function DashboardLoading() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px] animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded-lg w-56 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-72" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 bg-gray-100 rounded-lg w-36" />
          <div className="h-9 bg-gray-200 rounded-lg w-28" />
        </div>
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-black/[0.07] rounded-xl p-5">
            <div className="h-3 bg-gray-100 rounded w-24 mb-3" />
            <div className="h-7 bg-gray-100 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-16" />
          </div>
        ))}
      </div>

      {/* Chart row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="lg:col-span-3 bg-white border border-black/[0.07] rounded-xl p-5">
          <div className="h-4 bg-gray-100 rounded w-32 mb-5" />
          <div className="h-[200px] bg-gray-50 rounded-lg" />
        </div>
        <div className="lg:col-span-2 bg-white border border-black/[0.07] rounded-xl p-5">
          <div className="h-4 bg-gray-100 rounded w-40 mb-5" />
          <div className="h-[160px] bg-gray-50 rounded-lg mb-4" />
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 bg-white border border-black/[0.07] rounded-xl p-5">
          <div className="h-4 bg-gray-100 rounded w-36 mb-5" />
          <div className="h-[200px] bg-gray-50 rounded-lg" />
        </div>
        <div className="lg:col-span-2 bg-white border border-black/[0.07] rounded-xl p-5">
          <div className="h-4 bg-gray-100 rounded w-40 mb-5" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-100 rounded w-3/4 mb-1.5" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1 bg-white border border-black/[0.07] rounded-xl p-5">
          <div className="h-4 bg-gray-100 rounded w-24 mb-5" />
          <div className="w-12 h-12 rounded-xl bg-gray-100 mb-3" />
          <div className="h-5 bg-gray-100 rounded w-20 mb-2" />
          <div className="h-7 bg-gray-100 rounded w-28 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-36" />
        </div>
      </div>
    </div>
  );
}
