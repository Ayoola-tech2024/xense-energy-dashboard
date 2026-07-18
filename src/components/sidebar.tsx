"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Overview", icon: "house" },
  { href: "/analytics", label: "Analytics", icon: "chart-line" },
  { href: "/decisions", label: "AI Decisions", icon: "brain" },
  { href: "/devices", label: "Devices", icon: "plug" },
  { href: "/automation", label: "Automation", icon: "robot" },
  { href: "/priority", label: "Priority List", icon: "list-ol" },
  { href: "/notifications", label: "Notifications", icon: "bell" },
  { href: "/settings", label: "Settings", icon: "gear" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleNav = () => {
    if (window.innerWidth <= 900) onClose?.();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-[#0d1117] border-r border-[#1e293b] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[#1e293b]">
          <img
            src="/logo.jpeg"
            alt="Xense Energy"
            className="w-9 h-9 rounded-[10px] object-cover"
          />
          <div>
            <h1 className="text-[15px] font-bold tracking-tight text-[#e8edf5]">
              Xense Energy
            </h1>
            <span className="text-[10px] text-[#8899b4] font-medium">
              Intelligent Load Control
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNav}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200 relative ${
                  active
                    ? "bg-[rgba(45,212,191,0.12)] text-[#2dd4bf]"
                    : "text-[#8899b4] hover:bg-[#1a202c] hover:text-[#e8edf5]"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#2dd4bf] rounded-r" />
                )}
                <i className={`fas fa-${item.icon} w-[18px] text-center text-sm`} />
                <span>{item.label}</span>
                {item.href === "/devices" && (
                  <span className="ml-auto text-[10px] bg-[rgba(248,113,113,0.1)] text-[#f87171] px-2 py-0.5 rounded-full font-semibold">
                    3
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-t border-[#1e293b]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-sm font-semibold">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#e8edf5]">John Doe</p>
            <span className="text-[10px] text-[#5a6d8a]">Premium Plan</span>
          </div>
          <i className="fas fa-ellipsis-vertical text-[#5a6d8a] cursor-pointer text-sm" />
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden w-9 h-9 rounded-lg bg-[#12171f] border border-[#1e293b] flex items-center justify-center text-[#e8edf5] text-base"
    >
      <i className="fas fa-bars" />
    </button>
  );
}
