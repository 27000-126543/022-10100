import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  HandCoins,
  Ban,
  RefreshCw,
  Phone,
  Clock,
  UserCheck,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { WindowFrame } from "../../components/layout/WindowFrame";
import { useAppStore, useFilteredCustomers } from "../../stores/useAppStore";
import {
  CHANNEL_LABELS,
  CHANNEL_COLORS,
  type Channel,
  type Customer,
  type CustomerStatus,
} from "../../types";
import { cn } from "../../lib/utils";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

const STATUS_FILTERS: { value: CustomerStatus | "all"; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "new", label: "新线索" },
  { value: "following", label: "跟进中" },
  { value: "booked", label: "已预约" },
  { value: "invalid", label: "已无效" },
];

const CHANNEL_FILTERS: { value: Channel | "all"; label: string }[] = [
  { value: "all", label: "全部渠道" },
  { value: "douyin", label: "抖音" },
  { value: "xiaohongshu", label: "小红书" },
  { value: "baidu", label: "百度" },
  { value: "meituan", label: "美团" },
  { value: "referral", label: "转介绍" },
];

export function CustomerPool() {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "all">("all");
  const [channelFilter, setChannelFilter] = useState<Channel | "all">("all");
  const [onlyMine, setOnlyMine] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const setActiveCustomer = useAppStore((s) => s.setActiveCustomer);
  const activeCustomerId = useAppStore((s) => s.activeCustomerId);
  const claimCustomers = useAppStore((s) => s.claimCustomers);
  const markCustomerInvalid = useAppStore((s) => s.markCustomerInvalid);
  const openWindow = useAppStore((s) => s.openWindow);
  const currentUser = useAppStore((s) => s.currentUser);
  const allCustomers = useAppStore((s) => s.customers);

  const filtered = useFilteredCustomers({
    keyword,
    channels: channelFilter === "all" ? undefined : [channelFilter],
    status: statusFilter === "all" ? undefined : [statusFilter],
    onlyMyClaimed: onlyMine,
  });

  const stats = useMemo(() => {
    const mine = allCustomers.filter((c) => c.claimedBy === currentUser.id);
    const today = dayjs().format("YYYY-MM-DD");
    const todayCalled = mine.filter(
      (c) => c.lastCallTime && dayjs(c.lastCallTime).format("YYYY-MM-DD") === today
    );
    const booked = mine.filter((c) => c.status === "booked");
    return {
      total: mine.length,
      pending: mine.filter((c) => c.callCount === 0).length,
      called: todayCalled.length,
      booked: booked.length,
      rate: todayCalled.length > 0 ? ((booked.length / Math.max(todayCalled.length, 1)) * 100).toFixed(1) : "0",
    };
  }, [allCustomers, currentUser.id]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setActiveCustomer(customer.id);
    openWindow("dial-panel");
    openWindow("follow-script");
  };

  const handleBatchClaim = () => {
    if (selectedIds.size === 0) return;
    claimCustomers(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const statCards = [
    { label: "今日待拨打", value: stats.pending, icon: Phone, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "今日已拨打", value: stats.called, icon: UserCheck, color: "text-primary-600", bg: "bg-primary-50" },
    { label: "已预约数", value: stats.booked, icon: HandCoins, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "预约转化率", value: `${stats.rate}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <WindowFrame windowKey="customer-pool" title="客户池" iconName="Users">
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-neutral-200 bg-gradient-to-b from-neutral-50 to-white">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card p-3 flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", bg)}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <div className="text-xl font-bold font-serif text-neutral-800 leading-tight">{value}</div>
                <div className="text-xs text-neutral-500">{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-b border-neutral-200 space-y-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                className="input pl-9"
                placeholder="搜索客户姓名、手机号..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 cursor-pointer hover:bg-neutral-100">
              <input
                type="checkbox"
                checked={onlyMine}
                onChange={(e) => setOnlyMine(e.target.checked)}
                className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              只看我领取的
            </label>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Filter size={12} className="text-neutral-400" />
              <span className="text-xs text-neutral-500">状态：</span>
            </div>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                  statusFilter === f.value
                    ? "bg-primary-600 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {f.label}
              </button>
            ))}
            <div className="w-px h-4 bg-neutral-200 mx-1" />
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value as Channel | "all")}
              className="h-7 px-2 rounded-md text-xs border border-neutral-200 bg-white text-neutral-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {CHANNEL_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleBatchClaim}
                disabled={selectedIds.size === 0}
                className="btn-primary text-xs py-1.5 px-3"
              >
                <HandCoins size={13} />
                批量领取 ({selectedIds.size})
              </button>
              <button className="btn-secondary text-xs py-1.5 px-3">
                <RefreshCw size={13} />
                刷新
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 sticky top-0 z-10">
              <tr className="text-left text-xs text-neutral-500">
                <th className="px-3 py-2.5 w-9">
                  <button onClick={toggleSelectAll} className="text-neutral-400 hover:text-primary-600">
                    {selectedIds.size === filtered.length && filtered.length > 0 ? (
                      <CheckSquare size={16} className="text-primary-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium">客户信息</th>
                <th className="px-3 py-2.5 font-medium">渠道</th>
                <th className="px-3 py-2.5 font-medium">意向项目</th>
                <th className="px-3 py-2.5 font-medium">拨打</th>
                <th className="px-3 py-2.5 font-medium">最后跟进</th>
                <th className="px-3 py-2.5 font-medium">状态</th>
                <th className="px-3 py-2.5 font-medium w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => {
                const isSelected = selectedIds.has(customer.id);
                const isActive = customer.id === activeCustomerId;
                return (
                  <tr
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer)}
                    className={cn(
                      "border-b border-neutral-100 cursor-pointer transition-colors",
                      isActive ? "bg-primary-50/70" : "hover:bg-neutral-50"
                    )}
                  >
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleSelect(customer.id)}>
                        {isSelected ? (
                          <CheckSquare size={16} className="text-primary-600" />
                        ) : (
                          <Square size={16} className="text-neutral-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-200 to-primary-200 flex items-center justify-center text-xs font-medium text-neutral-700">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-800 text-sm">{customer.name}</div>
                          <div className="text-xs text-neutral-400 font-mono">{customer.phoneMasked}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={cn("tag", CHANNEL_COLORS[customer.channel])}>
                        {CHANNEL_LABELS[customer.channel]}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {customer.projectInterest.slice(0, 2).map((p) => (
                          <span key={p} className="tag bg-rose-50 text-rose-600">
                            {p}
                          </span>
                        ))}
                        {customer.projectInterest.length > 2 && (
                          <span className="tag bg-neutral-100 text-neutral-500">
                            +{customer.projectInterest.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Phone size={11} />
                        <span>{customer.callCount}次</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {customer.lastCallTime ? (
                        <div className="flex items-center gap-1 text-xs text-neutral-500">
                          <Clock size={11} />
                          <span>{dayjs(customer.lastCallTime).fromNow()}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-300">未拨打</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={customer.status} />
                    </td>
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => markCustomerInvalid(customer.id)}
                        className="text-xs text-neutral-400 hover:text-red-500 flex items-center gap-1"
                        title="标记无效"
                      >
                        <Ban size={12} />
                        <ChevronDown size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-neutral-400 text-sm">
                    暂无符合条件的客资
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50 text-xs text-neutral-500 flex items-center justify-between">
          <span>共 {filtered.length} 条客资</span>
          <span>已选择 {selectedIds.size} 条</span>
        </div>
      </div>
    </WindowFrame>
  );
}

function StatusBadge({ status }: { status: CustomerStatus }) {
  const config: Record<CustomerStatus, { label: string; className: string }> = {
    new: { label: "新线索", className: "bg-blue-50 text-blue-600" },
    following: { label: "跟进中", className: "bg-amber-50 text-amber-600" },
    booked: { label: "已预约", className: "bg-emerald-50 text-emerald-600" },
    invalid: { label: "已无效", className: "bg-neutral-100 text-neutral-500" },
  };
  return <span className={cn("tag", config[status].className)}>{config[status].label}</span>;
}
