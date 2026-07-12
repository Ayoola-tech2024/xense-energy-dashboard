"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { fetchDashboardData } from "@/lib/api-service";
import type { DashboardData } from "@/lib/types";

export default function NotificationsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0e14]">
        <p className="text-[#8899b4] text-sm">Loading notifications...</p>
      </div>
    );
  }

  if (!data) return null;

  const unreadCount = data.notifications.filter((n) => n.unread).length;

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Notifications"
          subtitle="Stay informed about your energy system events"
        />
        <main className="flex-1 p-5 lg:p-7 space-y-4 page-enter">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8899b4]">
              {unreadCount > 0 ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#f87171] inline-block mr-1.5" />
                  {unreadCount} new
                </>
              ) : (
                "All caught up"
              )}
            </span>
            <button className="text-xs px-3 py-1.5 rounded-lg border border-[#1e293b] text-[#8899b4] hover:border-[#2dd4bf] hover:text-[#2dd4bf] transition-all cursor-pointer">
              <i className="fas fa-check-double mr-1" />
              Mark All Read
            </button>
          </div>

          <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] divide-y divide-[#1e293b] overflow-hidden">
            {data.notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex gap-3 px-5 py-4 ${
                  notif.unread ? "bg-[rgba(45,212,191,0.02)]" : ""
                }`}
              >
                <div
                  className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{
                    background: notif.iconBg,
                    color: notif.iconColor,
                  }}
                >
                  <i className={`fas fa-${notif.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <strong className="text-[#e8edf5]">{notif.title}</strong>
                    {" — "}
                    <span className="text-[#8899b4]">{notif.description}</span>
                  </p>
                  <div className="text-[10px] text-[#5a6d8a] mt-1">
                    {notif.time}
                  </div>
                </div>
                {notif.unread && (
                  <span className="w-2 h-2 rounded-full bg-[#2dd4bf] shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
