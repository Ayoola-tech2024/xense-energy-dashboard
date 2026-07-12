"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [disconnectThreshold, setDisconnectThreshold] = useState(35);
  const [reconnectThreshold, setReconnectThreshold] = useState(55);
  const [gridThreshold, setGridThreshold] = useState(20);

  const toggles = [
    {
      label: "Auto Mode Switching",
      desc: "Automatically switch to grid when available",
      checked: true,
    },
    {
      label: "AI Load Decisions",
      desc: "Enable intelligent load control",
      checked: true,
    },
    {
      label: "Push Notifications",
      desc: "Get alerts for important events",
      checked: true,
    },
    {
      label: "Dark Mode",
      desc: "Use dark theme",
      checked: true,
    },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title="Settings"
          subtitle="Configure your Xense Energy system preferences"
        />
        <main className="flex-1 p-5 lg:p-7 space-y-4 page-enter">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* General Settings */}
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-5">
              <h3 className="text-sm font-semibold text-[#e8edf5] mb-4">
                General Settings
              </h3>
              <div className="space-y-4">
                {toggles.map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-[#e8edf5]">
                        {t.label}
                      </div>
                      <div className="text-[10px] text-[#5a6d8a] mt-0.5">
                        {t.desc}
                      </div>
                    </div>
                    <label className="relative w-[40px] h-[22px] cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        defaultChecked={t.checked}
                        className="sr-only peer"
                      />
                      <span className="absolute inset-0 rounded-full bg-[#1e293b] peer-checked:bg-[#2dd4bf] transition-colors" />
                      <span className="absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-[#8899b4] peer-checked:bg-white peer-checked:left-[21px] transition-all" />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Battery Thresholds */}
            <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-5">
              <h3 className="text-sm font-semibold text-[#e8edf5] mb-4">
                Battery Thresholds
              </h3>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#8899b4]">
                      Disconnect Load Below
                    </span>
                    <span className="text-xs font-bold text-[#2dd4bf]">
                      {disconnectThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    value={disconnectThreshold}
                    onChange={(e) =>
                      setDisconnectThreshold(Number(e.target.value))
                    }
                    className="w-full h-1.5 bg-[#1e293b] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2dd4bf] [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#8899b4]">
                      Reconnect Load Above
                    </span>
                    <span className="text-xs font-bold text-[#2dd4bf]">
                      {reconnectThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={80}
                    value={reconnectThreshold}
                    onChange={(e) =>
                      setReconnectThreshold(Number(e.target.value))
                    }
                    className="w-full h-1.5 bg-[#1e293b] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2dd4bf] [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#8899b4]">
                      Grid Switch Threshold
                    </span>
                    <span className="text-xs font-bold text-[#2dd4bf]">
                      {gridThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={40}
                    value={gridThreshold}
                    onChange={(e) =>
                      setGridThreshold(Number(e.target.value))
                    }
                    className="w-full h-1.5 bg-[#1e293b] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2dd4bf] [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] p-5">
            <h3 className="text-sm font-semibold text-[#e8edf5] mb-4">
              About
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold">
                  Firmware
                </div>
                <div className="text-sm font-medium text-[#e8edf5] mt-0.5">
                  v2.1.3
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold">
                  Dashboard
                </div>
                <div className="text-sm font-medium text-[#e8edf5] mt-0.5">
                  v1.0.0
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold">
                  Devices
                </div>
                <div className="text-sm font-medium text-[#e8edf5] mt-0.5">
                  3 Connected
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#5a6d8a] font-semibold">
                  Plan
                </div>
                <div className="text-sm font-medium text-[#2dd4bf] mt-0.5">
                  Premium
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
