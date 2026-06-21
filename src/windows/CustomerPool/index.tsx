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
  X,
  SlidersHorizontal,
  UserPlus,
  Users,
  CalendarRange,
  AlertCircle,
  CheckCircle2,
  GripVertical,
} from "lucide-react";
import { WindowFrame } from "../../components/layout/WindowFrame";
import { useAppStore, useFilteredCustomers } from "../../stores/useAppStore";
import {
  CHANNEL_LABELS,
  CHANNEL_COLORS,
  PROJECT_OPTIONS,
  type Channel,
  type Customer,
  type CustomerStatus,
  type Employee,
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
  const [projectFilters, setProjectFilters] = useState<string[]>([]);
  const [onlyMine, setOnlyMine] = useState(true);
  const [onlyUnclaimed, setOnlyUnclaimed] = useState(false);
  const [showProjectFilter, setShowProjectFilter] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [createTimeFrom, setCreateTimeFrom] = useState("");
  const [createTimeTo, setCreateTimeTo] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [distributeEvenly, setDistributeEvenly] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState(false);

  const setActiveCustomer = useAppStore((s) => s.setActiveCustomer);
  const activeCustomerId = useAppStore((s) => s.activeCustomerId);
  const claimCustomers = useAppStore((s) => s.claimCustomers);
  const markCustomerInvalid = useAppStore((s) => s.markCustomerInvalid);
  const assignCustomers = useAppStore((s) => s.assignCustomers);
  const openWindow = useAppStore((s) => s.openWindow);
  const currentUser = useAppStore((s) => s.currentUser);
  const allCustomers = useAppStore((s) => s.customers);
  const employees = useAppStore((s) => s.employees);

  const agents = useMemo(
    () => employees.filter((e) => e.role === "agent"),
    [employees]
  );

  const isManager = currentUser.role === "manager";

  const filtered = useFilteredCustomers({
    keyword,
    channels: channelFilter === "all" ? undefined : [channelFilter],
    status: statusFilter === "all" ? undefined : [statusFilter],
    projects: projectFilters.length > 0 ? projectFilters : undefined,
    onlyMyClaimed: onlyMine && !onlyUnclaimed,
    onlyUnclaimed,
    createTimeFrom: createTimeFrom || undefined,
    createTimeTo: createTimeTo || undefined,
  });

  const stats = useMemo(() => {
    const base = filtered;
    const today = dayjs().format("YYYY-MM-DD");
    const todayCalled = base.filter(
      (c) => c.lastCallTime && dayjs(c.lastCallTime).format("YYYY-MM-DD") === today
    );
    const booked = base.filter((c) => c.status === "booked");
    const pending = base.filter((c) => c.callCount === 0);
    return {
      total: filtered.length,
      pending: pending.length,
      called: todayCalled.length,
      booked: booked.length,
      rate: todayCalled.length > 0 ? ((booked.length / Math.max(todayCalled.length, 1)) * 100).toFixed(1) : "0",
    };
  }, [filtered]);

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

  const toggleAssignee = (empId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleAssign = () => {
    if (selectedIds.size === 0 || selectedAssignees.length === 0) return;
    assignCustomers({
      customerIds: Array.from(selectedIds),
      assigneeIds: selectedAssignees,
      distributeEvenly: selectedAssignees.length > 1 && distributeEvenly,
    });
    setAssignSuccess(true);
    setTimeout(() => {
      setAssignSuccess(false);
      setShowAssignModal(false);
      setSelectedIds(new Set());
      setSelectedAssignees([]);
      setDistributeEvenly(false);
    }, 1500);
  };

  const toggleProject = (proj: string) => {
    setProjectFilters((prev) =>
      prev.includes(proj) ? prev.filter((p) => p !== proj) : [...prev, proj]
    );
  };

  const clearProjectFilters = () => setProjectFilters([]);

  const statCards = [
    { label: "筛选后客资", value: stats.total, icon: UsersIcon, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "待拨打数", value: stats.pending, icon: Phone, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "今日已拨打", value: stats.called, icon: UserCheck, color: "text-primary-600", bg: "bg-primary-50" },
    { label: "已预约数", value: stats.booked, icon: HandCoins, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "预约转化率", value: `${stats.rate}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const getAssigneeName = (claimedBy?: string) => {
    if (!claimedBy) return "未分配";
    return agents.find((e) => e.id === claimedBy)?.name || "未知";
  };

  return (
    <WindowFrame windowKey="customer-pool" title="客户池" iconName="Users">
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-5 gap-3 p-4 border-b border-neutral-200 bg-gradient-to-b from-neutral-50 to-white">
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
            <div className="relative">
              <button
                onClick={() => setShowProjectFilter(!showProjectFilter)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs transition-all",
                  projectFilters.length > 0
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                )}
              >
                <SlidersHorizontal size={13} />
                <span>意向项目</span>
                {projectFilters.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {projectFilters.length}
                  </span>
                )}
              </button>

              {showProjectFilter && (
                <div className="absolute top-full left-0 mt-2 w-72 z-50 card p-3 shadow-window animate-slide-up">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-neutral-700">按意向项目筛选</span>
                    <button
                      onClick={clearProjectFilters}
                      className="text-[11px] text-neutral-400 hover:text-red-500 flex items-center gap-0.5"
                    >
                      <X size={10} /> 清空
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-auto">
                    {PROJECT_OPTIONS.map((proj) => (
                      <button
                        key={proj}
                        onClick={() => toggleProject(proj)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-xs transition-all border",
                          projectFilters.includes(proj)
                            ? "bg-rose-500 text-white border-rose-500 shadow-sm"
                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                        )}
                      >
                        {proj}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">
                      匹配 {filtered.length} 条客资
                    </span>
                    <button
                      onClick={() => setShowProjectFilter(false)}
                      className="btn-primary text-xs py-1 px-3"
                    >
                      确定
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isManager && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-violet-50 border border-violet-200">
                <CalendarRange size={13} className="text-violet-600" />
                <input
                  type="date"
                  value={createTimeFrom}
                  onChange={(e) => setCreateTimeFrom(e.target.value)}
                  className="text-xs bg-transparent border-none text-neutral-700 focus:outline-none w-24"
                  placeholder="创建日期起"
                />
                <span className="text-violet-400">→</span>
                <input
                  type="date"
                  value={createTimeTo}
                  onChange={(e) => setCreateTimeTo(e.target.value)}
                  className="text-xs bg-transparent border-none text-neutral-700 focus:outline-none w-24"
                  placeholder="创建日期止"
                />
                {(createTimeFrom || createTimeTo) && (
                  <button
                    onClick={() => {
                      setCreateTimeFrom("");
                      setCreateTimeTo("");
                    }}
                    className="text-violet-400 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            )}

            {isManager ? (
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 cursor-pointer hover:bg-neutral-100">
                <input
                  type="checkbox"
                  checked={onlyUnclaimed}
                  onChange={(e) => {
                    setOnlyUnclaimed(e.target.checked);
                    if (e.target.checked) setOnlyMine(false);
                  }}
                  className="rounded border-neutral-300 text-violet-600 focus:ring-violet-500"
                />
                只看未分配
              </label>
            ) : (
              <label className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 cursor-pointer hover:bg-neutral-100">
                <input
                  type="checkbox"
                  checked={onlyMine}
                  onChange={(e) => {
                    setOnlyMine(e.target.checked);
                    if (e.target.checked) setOnlyUnclaimed(false);
                  }}
                  className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                只看我领取的
              </label>
            )}
          </div>

          {projectFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap bg-rose-50/60 rounded-md px-3 py-2 border border-rose-100">
              <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <Filter size={11} /> 项目筛选：
              </span>
              {projectFilters.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-rose-700 text-xs border border-rose-200 shadow-sm"
                >
                  {p}
                  <button
                    onClick={() => toggleProject(p)}
                    className="hover:text-red-500 text-rose-400"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearProjectFilters}
                className="ml-auto text-[11px] text-rose-500 hover:text-red-600"
              >
                清除筛选
              </button>
            </div>
          )}

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
                    ? "bg-primary-600 text-white shadow-sm"
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
              {isManager ? (
                <button
                  onClick={() => setShowAssignModal(true)}
                  disabled={selectedIds.size === 0}
                  className="px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 bg-violet-600 text-white hover:bg-violet-700 shadow-sm"
                >
                  <UserPlus size={13} />
                  批量分配 ({selectedIds.size})
                </button>
              ) : (
                <button
                  onClick={handleBatchClaim}
                  disabled={selectedIds.size === 0}
                  className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
                >
                  <HandCoins size={13} />
                  批量领取 ({selectedIds.size})
                </button>
              )}
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
                {isManager && (
                  <th className="px-3 py-2.5 font-medium">归属坐席</th>
                )}
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
                        {customer.projectInterest.slice(0, 3).map((p) => {
                          const isFiltered = projectFilters.includes(p);
                          return (
                            <span
                              key={p}
                              className={cn(
                                "tag",
                                isFiltered
                                  ? "bg-rose-500 text-white shadow-sm"
                                  : "bg-rose-50 text-rose-600"
                              )}
                            >
                              {p}
                            </span>
                          );
                        })}
                        {customer.projectInterest.length > 3 && (
                          <span className="tag bg-neutral-100 text-neutral-500">
                            +{customer.projectInterest.length - 3}
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
                    {isManager && (
                      <td className="px-3 py-2">
                        <span className={cn(
                          "text-xs",
                          customer.claimedBy ? "text-neutral-600" : "text-neutral-400"
                        )}>
                          {getAssigneeName(customer.claimedBy)}
                        </span>
                      </td>
                    )}
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
                  <td colSpan={isManager ? 9 : 8} className="py-16 text-center text-neutral-400 text-sm">
                    暂无符合条件的客资
                    {projectFilters.length > 0 && (
                      <div className="text-xs mt-2 text-rose-500">
                        请尝试调整意向项目筛选条件
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2 border-t border-neutral-200 bg-neutral-50 text-xs text-neutral-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>共 <span className="font-semibold text-neutral-700">{filtered.length}</span> 条客资</span>
            {projectFilters.length > 0 && (
              <span className="text-rose-500">
                · 含项目筛选 {projectFilters.length} 项
              </span>
            )}
            {isManager && onlyUnclaimed && (
              <span className="text-violet-500">· 未分配</span>
            )}
          </div>
          <span>已选择 <span className="font-semibold text-neutral-700">{selectedIds.size}</span> 条</span>
        </div>
      </div>

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl w-[520px] max-h-[80vh] flex flex-col animate-fade-in">
            <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-neutral-800 flex items-center gap-2">
                  <UserPlus size={18} className="text-violet-600" />
                  批量分配客资
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  将 {selectedIds.size} 条客资分配给坐席跟进
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-5">
              {assignSuccess ? (
                <div className="py-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                  </div>
                  <div className="text-lg font-semibold text-emerald-700">分配成功！</div>
                  <div className="text-sm text-neutral-500 mt-1">
                    {selectedIds.size} 条客资已分配给 {selectedAssignees.length} 名坐席
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 rounded-lg bg-violet-50 border border-violet-100">
                    <div className="text-xs font-medium text-violet-700 mb-2 flex items-center gap-1">
                      <GripVertical size={12} />
                      已选中客户（{selectedIds.size} 条）
                    </div>
                    <div className="text-xs text-violet-600">
                      筛选条件：{channelFilter === "all" ? "全部渠道" : CHANNEL_LABELS[channelFilter]}
                      {projectFilters.length > 0 && ` · ${projectFilters.length}个项目`}
                      {statusFilter !== "all" && ` · ${STATUS_FILTERS.find((s) => s.value === statusFilter)?.label}`}
                      {onlyUnclaimed && " · 未分配"}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-700 mb-2.5 block flex items-center gap-1">
                      <Users size={13} className="text-violet-600" />
                      选择分配对象 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-56 overflow-auto pr-1">
                      {agents.map((agent) => {
                        const isSelected = selectedAssignees.includes(agent.id);
                        const stats = agent.stats;
                        return (
                          <button
                            key={agent.id}
                            onClick={() => toggleAssignee(agent.id)}
                            className={cn(
                              "p-3 rounded-lg text-left border-2 transition-all",
                              isSelected
                                ? "border-violet-500 bg-violet-50 shadow-sm"
                                : "border-neutral-200 bg-white hover:border-neutral-300"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold",
                                isSelected ? "bg-violet-500" : "bg-gradient-to-br from-primary-400 to-rose-400"
                              )}>
                                {agent.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-neutral-800 truncate">
                                  {agent.name}
                                </div>
                                <div className="text-[10px] text-neutral-500 truncate">
                                  {agent.department} · 转化 {stats?.conversionRate || 0}%
                                </div>
                              </div>
                              {isSelected && (
                                <CheckCircle2 size={16} className="text-violet-500 flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedAssignees.length > 1 && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={distributeEvenly}
                          onChange={(e) => setDistributeEvenly(e.target.checked)}
                          className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <div>
                          <span className="text-xs font-medium text-amber-800">平均分配</span>
                          <p className="text-[11px] text-amber-700 mt-0.5">
                            {selectedIds.size} 条客资随机打乱后，平均分配给 {selectedAssignees.length} 名坐席
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {selectedAssignees.length === 0 && (
                    <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-3 rounded-lg">
                      <AlertCircle size={14} />
                      请至少选择一名坐席
                    </div>
                  )}
                </>
              )}
            </div>

            {!assignSuccess && (
              <div className="px-5 py-4 border-t border-neutral-200 flex items-center justify-between bg-neutral-50 rounded-b-xl">
                <div className="text-xs text-neutral-500">
                  已选 {selectedIds.size} 条 · {selectedAssignees.length} 名坐席
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 rounded-md text-sm text-neutral-600 hover:bg-neutral-100 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={selectedAssignees.length === 0}
                    className="px-5 py-2 rounded-md text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    确认分配
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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

function UsersIcon(props: { size?: number; className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
