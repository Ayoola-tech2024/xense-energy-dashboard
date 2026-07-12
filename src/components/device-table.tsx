"use client";

import type { Device } from "@/lib/types";
import { setRelay } from "@/lib/api-service";
import { useState } from "react";

interface DeviceTableProps {
  devices: Device[];
}

export default function DeviceTable({ devices }: DeviceTableProps) {
  return (
    <div className="bg-[#12171f] border border-[#1e293b] rounded-[14px] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#e8edf5]">
          Connected Smart Plugs
        </h3>
        <div className="flex gap-2">
          <button className="text-xs px-3 py-1.5 rounded-lg border border-[#1e293b] text-[#8899b4] hover:border-[#2dd4bf] hover:text-[#2dd4bf] transition-all cursor-pointer">
            <i className="fas fa-filter mr-1" />
            Filter
          </button>
          <button className="text-xs px-3 py-1.5 rounded-lg border border-[#1e293b] text-[#8899b4] hover:border-[#2dd4bf] hover:text-[#2dd4bf] transition-all cursor-pointer">
            <i className="fas fa-arrow-down-wide-short mr-1" />
            Sort
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-[#8899b4] font-semibold">
              <th className="text-left px-3 py-2.5 border-b border-[#1e293b]">Device</th>
              <th className="text-left px-3 py-2.5 border-b border-[#1e293b]">Appliance</th>
              <th className="text-left px-3 py-2.5 border-b border-[#1e293b]">Status</th>
              <th className="text-left px-3 py-2.5 border-b border-[#1e293b]">Mode</th>
              <th className="text-left px-3 py-2.5 border-b border-[#1e293b]">Power</th>
              <th className="text-left px-3 py-2.5 border-b border-[#1e293b]">Signal</th>
              <th className="text-left px-3 py-2.5 border-b border-[#1e293b]">Relay</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <DeviceRow key={device.id} device={device} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeviceRow({ device }: { device: Device }) {
  const [relayOn, setRelayOn] = useState(device.relay_on);
  const [loading, setLoading] = useState(false);

  const statusColor = device.online ? "#34d399" : "#f87171";
  const signalColor =
    device.signal >= -55 ? "#34d399" : device.signal >= -70 ? "#fbbf24" : "#f87171";

  const modeColors: Record<string, string> = {
    xense: "rgba(45,212,191,0.12)",
    bypass: "rgba(96,165,250,0.1)",
    auto: "rgba(251,191,36,0.1)",
  };
  const modeTextColors: Record<string, string> = {
    xense: "#2dd4bf",
    bypass: "#60a5fa",
    auto: "#fbbf24",
  };

  const handleToggle = async () => {
    setLoading(true);
    try {
      await setRelay(device.id, relayOn ? "off" : "on");
      setRelayOn(!relayOn);
    } catch (err) {
      console.error("Failed to toggle relay:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <tr className="transition-colors hover:bg-[#1a202c]">
      <td className="px-3 py-3 border-b border-[#1e293b]">
        <div className="flex items-center gap-2 font-semibold text-[#e8edf5]">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-xs"
            style={{
              background: device.online
                ? "rgba(52,211,153,0.1)"
                : "rgba(248,113,113,0.1)",
              color: device.online ? "#34d399" : "#f87171",
            }}
          >
            <i className="fas fa-plug" />
          </div>
          {device.id}
        </div>
      </td>
      <td className="px-3 py-3 border-b border-[#1e293b] text-[#8899b4]">
        {device.appliance}
      </td>
      <td className="px-3 py-3 border-b border-[#1e293b]">
        <span className="flex items-center gap-1.5 text-xs">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: statusColor }}
          />
          <span style={{ color: statusColor }}>
            {device.online ? "Online" : "Offline"}
          </span>
        </span>
      </td>
      <td className="px-3 py-3 border-b border-[#1e293b]">
        <span
          className="px-2 py-0.5 rounded text-[10px] font-semibold"
          style={{
            background: modeColors[device.mode],
            color: modeTextColors[device.mode],
          }}
        >
          {device.mode.charAt(0).toUpperCase() + device.mode.slice(1)}
        </span>
      </td>
      <td className="px-3 py-3 border-b border-[#1e293b] text-[#e8edf5]">
        {device.power.toLocaleString()} W
      </td>
      <td className="px-3 py-3 border-b border-[#1e293b]">
        <i
          className="fas fa-signal text-sm"
          style={{ color: signalColor }}
        />
        <span className="text-[10px] text-[#5a6d8a] ml-1">
          {device.signal} dBm
        </span>
      </td>
      <td className="px-3 py-3 border-b border-[#1e293b]">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative w-[40px] h-[22px] rounded-full transition-colors duration-200 ${
            relayOn ? "bg-[#2dd4bf]" : "bg-[#1e293b]"
          } ${loading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
        >
          <span
            className={`absolute top-[3px] left-[3px] w-[16px] h-[16px] rounded-full bg-white transition-all duration-200 ${
              relayOn ? "left-[21px]" : "left-[3px]"
            }`}
          />
        </button>
      </td>
    </tr>
  );
}
