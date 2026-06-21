import { useState } from "react";
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
  ChevronDown,
  Shield,
  UserCheck,
  ClipboardCheck,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";
import type { WindowKey, Employee } from "../../types";
import { cn } from "../../lib/utils";

const windowDefs: { key: WindowKey; label: string; icon: LucideIcon }[] = [
  { key: "customer-pool", label: "客户池", icon: Users },
  { key: "dial-panel", label: "拨打面板", icon: Phone },
  { key: "follow-script", label: "跟进脚本", icon: FileText },
  { key: "qa-review", label: "质检抽听", icon: Headphones },
  { key: "booking-ledger", label: "预约台账", icon: CalendarDays },
  { key: "performance", label: "绩效统计", icon: BarChart3 },
];

const ROLE_LABELS: Record<Employee["role"], { label: string; icon: LucideIcon; color: string }> = {
  agent: { label: "坐席", icon: UserCheck, color: "text-emerald-400" },
  qa: { label: "质检", icon: ClipboardCheck, color: "text-amber-400" },
  manager: { label: "主管", icon: Shield, color: "text-purple-400" },
};

export function TopBar() {
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const currentUser = useAppStore((s) => s.currentUser);
  const employees = useAppStore((s) => s.employees);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const openWindow = useAppStore((s) => s.openWindow);
  const windows = useAppStore((s) => s.windows);

  const handleSwitchRole = (userId: string) => {
    setCurrentUser(userId);
    setShowRoleSwitcher(false);
  };

  const roleConfig = ROLE_LABELS[currentUser.role];
  const RoleIcon = roleConfig.icon;

  return (
    <div className="h-14 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 text-white px-6 flex items-center justify-between border-b border-neutral-700 relative">
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

        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-2 pl-3 border-l border-neutral-700 hover:bg-neutral-700/50 py-2 px-3 -mr-3 rounded-md transition-colors"
          >
            <img
              src={currentUser.avatar}
              alt=""
              className="w-7 h-7 rounded-full bg-neutral-600 border border-neutral-500"
            />
            <div className="text-xs text-left">
              <div className="font-medium flex items-center gap-1">
                {currentUser.name}
                <span className={cn("flex items-center gap-0.5 text-[10px]", roleConfig.color)}>
                  <RoleIcon size={10} />
                  {roleConfig.label}
                </span>
              </div>
              <div className="text-neutral-400">{currentUser.department}</div>
            </div>
            <ChevronDown size={14} className={cn("text-neutral-400 transition-transform", showRoleSwitcher && "rotate-180")} />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 top-full mt-1 w-72 bg-white rounded-lg shadow-xl border border-neutral-200 py-2 z-50 text-neutral-800">
              <div className="px-3 py-2 text-[11px] text-neutral-500 border-b border-neutral-100">
                切换身份（用于功能演示）
              </div>
              {employees.map((emp) => {
                const empRoleConfig = ROLE_LABELS[emp.role];
                const EmpRoleIcon = empRoleConfig.icon;
                const isActive = emp.id === currentUser.id;
                return (
                  <button
                    key={emp.id}
                    onClick={() => handleSwitchRole(emp.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-neutral-50 transition-colors",
                      isActive && "bg-primary-50"
                    )}
                  >
                    <img
                      src={emp.avatar}
                      alt=""
                      className="w-9 h-9 rounded-full bg-neutral-200 border border-neutral-200"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium flex items-center gap-1.5">
                        {emp.name}
                        {isActive && (
                          <span className="text-[10px] text-primary-600 bg-primary-100 px-1.5 py-0.5 rounded">
                            当前
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-500 flex items-center gap-2">
                        <span className={cn("flex items-center gap-0.5", empRoleConfig.color)}>
                          <EmpRoleIcon size={11} />
                          {empRoleConfig.label}
                        </span>
                        <span>·</span>
                        <span>{emp.department}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showRoleSwitcher && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowRoleSwitcher(false)}
        />
      )}
    </div>
  );
}
