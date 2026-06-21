import { Phone, Users, FileText, Headphones, CalendarDays, BarChart3, type LucideIcon } from "lucide-react";
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

export function DockBar() {
  const windows = useAppStore((s) => s.windows);
  const openWindow = useAppStore((s) => s.openWindow);
  const focusWindow = useAppStore((s) => s.focusWindow);
  const minimizeWindow = useAppStore((s) => s.minimizeWindow);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]">
      <div className="flex items-end gap-1 px-3 py-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-window border border-white/60">
        {windowDefs.map(({ key, label, icon: Icon }) => {
          const win = windows.find((w) => w.key === key);
          const isOpen = win?.isOpen;
          const isMinimized = win?.isMinimized;

          const handleClick = () => {
            if (!isOpen) {
              openWindow(key);
            } else if (isMinimized) {
              focusWindow(key);
            } else {
              minimizeWindow(key);
            }
          };

          return (
            <button
              key={key}
              onClick={handleClick}
              className={cn(
                "group relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200",
                isOpen && !isMinimized
                  ? "bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-lg"
                  : "hover:bg-neutral-100 text-neutral-600"
              )}
              title={label}
            >
              <Icon size={22} strokeWidth={isOpen && !isMinimized ? 2.2 : 1.8} />
              {isOpen && !isMinimized && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-white"></span>
              )}
              <span
                className={cn(
                  "absolute -top-8 px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                  isOpen && !isMinimized
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-900 text-white"
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
