export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#0b0e14]">
      <div className="text-center">
        <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#2dd4bf] to-[#0891b2] flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-3 animate-pulse">
          X
        </div>
        <p className="text-[#8899b4] text-sm">Loading dashboard...</p>
      </div>
    </div>
  );
}