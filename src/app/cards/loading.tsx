export default function CardsLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Nav placeholder */}
      <div className="h-16 bg-white border-b border-gray-100" />

      {/* Hero search placeholder */}
      <div className="pt-12 pb-8 bg-gradient-to-b from-white to-[#F5F5F5]">
        <div className="max-w-3xl mx-auto text-center px-4 mb-6">
          <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto" />
        </div>
        <div className="max-w-2xl mx-auto px-4">
          <div className="h-14 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* Card grid placeholder */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar placeholder */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-card rounded-2xl shadow-lg p-6 space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-5 bg-gray-200 rounded" />
              ))}
            </div>
          </div>

          {/* Cards */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl shadow-lg overflow-hidden">
                <div className="h-44 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-12 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
