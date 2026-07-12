"use client";

import { MobileMenuButton } from "./sidebar";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
  subtitle?: string;
}

export default function Header({
  onMenuClick,
  title = "Energy Overview",
  subtitle = "Real-time monitoring and control of your energy system",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[rgba(11,14,20,0.85)] backdrop-blur-md border-b border-[#1e293b] flex items-center px-5 lg:px-7 gap-4">
      <MobileMenuButton onClick={onMenuClick} />

      <div className="flex-1 max-w-[360px] hidden sm:flex items-center bg-[#12171f] border border-[#1e293b] rounded-lg px-3.5 h-9 gap-2">
        <i className="fas fa-magnifying-glass text-[#5a6d8a] text-xs" />
        <input
          type="text"
          placeholder="Search devices, analytics..."
          className="bg-transparent border-none outline-none text-[#e8edf5] text-xs w-full font-sans placeholder-[#5a6d8a]"
        />
        <span className="ml-auto text-[10px] text-[#5a6d8a] hidden md:inline">
          ⌘K
        </span>
      </div>

      <div className="flex items-center gap-2.5 ml-auto">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#34d399] bg-[rgba(52,211,153,0.1)] px-3 py-1.5 rounded-md">
          <i className="fas fa-circle text-[8px]" />
          System Online
        </div>
        <button className="relative w-9 h-9 rounded-lg border border-[#1e293b] bg-[#12171f] text-[#8899b4] flex items-center justify-center cursor-pointer hover:bg-[#1a202c] hover:text-[#e8edf5] transition-all text-sm">
          <i className="fas fa-bell" />
          <span className="absolute top-[6px] right-[6px] w-[7px] h-[7px] bg-[#f87171] rounded-full border-2 border-[#12171f]" />
        </button>
        <button className="relative w-9 h-9 rounded-lg border border-[#1e293b] bg-[#12171f] text-[#8899b4] flex items-center justify-center cursor-pointer hover:bg-[#1a202c] hover:text-[#e8edf5] transition-all text-sm">
          <i className="fas fa-moon" />
        </button>
      </div>
    </header>
  );
}
