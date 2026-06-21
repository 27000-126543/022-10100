import {
  Phone,
  Users,
  FileText,
  Headphones,
  CalendarDays,
  BarChart3,
  Search,
  Bell,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";
import type { WindowKey } from "../../types";
import { cn } from "../../lib/utils";

const windowDefs: { key: WindowKey; label: string; icon: LucideIcon }[] = [
  { key: "customer-pool", label: "客户池", icon: Users },
  { key: "dial-panel", label: "拨打面板", icon: Phone },
  { key: "follow-script", label: "跟进脚本", icon: FileText },
  { key: "qa-review", label: "质检抽听", icon: Headphones },
  { key: "booking-ledger", label: "预约台账", icon: CalendarDays },
  { key: "performance", label: "绩效统计", icon: BarChart3 },
];

export function TopBar() {
  const currentUser = useAppStore((s) => s.currentUser);
  const openWindow = useAppStore((s) => s.openWindow);
  const windows = useAppStore((s) => s.windows);

  return (
    <div className="h-14 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white px-6 flex items-center justify-between border-b border-neutral-700">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow">
            <span className="font-bold text-sm">医</span>
          </div>
          <div>
            <div className="text-sm font-semibold">医美私域客资跟进系统</div>
            <div className="text-[10px] text-neutral-400">Customer Follow-up Platform</div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {windowDefs.map(({ key, label, icon: Icon }) => {
            const isOpen = windows.find((w) => w.key === key)?.isOpen;
            return (
              <button
                key={key}
                onClick={() => openWindow(key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  isOpen
                    ? "bg-primary-600 text-white shadow-lg"
                    : "text-neutral-300 hover:bg-neutral-700 hover:text-white"
                )}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            className="bg-neutral-700 border border-neutral-600 rounded-md pl-9 pr-3 py-1.5 text-xs w-56 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="搜索客户、预约、通话记录..."
          />
        </div>

        <button className="relative p-1.5 rounded-md hover:bg-neutral-700 transition-colors">
          <Bell size={16} />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="p-1.5 rounded-md hover:bg-neutral-700 transition-colors">
          <Settings size={16} />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l border-neutral-700">
          <img
            src={currentUser.avatar}
            alt=""
            className="w-7 h-7 rounded-full bg-neutral-600 border border-neutral-500"
          />
          <div className="text-xs">
            <div className="font-medium">{currentUser.name}</div>
            <div className="text-neutral-400">{currentUser.department}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
