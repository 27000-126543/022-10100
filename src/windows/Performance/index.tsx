import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Phone,
  UserCheck,
  Award,
  Calendar,
  ChevronDown,
} from "lucide-react";
import {
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  Tooltip as ReTooltip,
  LabelList,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { WindowFrame } from "../../components/layout/WindowFrame";
import { useAppStore } from "../../stores/useAppStore";
import { cn } from "../../lib/utils";

export function Performance() {
  const stats = useAppStore((s) => s.stats);
  const employees = useAppStore((s) => s.employees);
  const currentUser = useAppStore((s) => s.currentUser);
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");

  const agents = employees
    .filter((e) => e.role === "agent")
    .sort((a, b) => (b.stats?.booked || 0) - (a.stats?.booked || 0));

  const funnelData = [
    { name: "客资总数", value: stats.totalLeads, fill: "#0F766E" },
    { name: "已拨打", value: stats.called, fill: "#14B8A6" },
    { name: "已接通", value: stats.connected, fill: "#2DD4BF" },
    { name: "有意向", value: stats.intent, fill: "#E8B4A0" },
    { name: "已预约", value: stats.booked, fill: "#D4917B" },
    { name: "已到店", value: stats.checkedIn, fill: "#10B981" },
  ];

  const rate = (a: number, b: number) => b > 0 ? ((a / b) * 100).toFixed(1) : "0";

  const COLORS = ["#0F766E", "#EF4444", "#3B82F6", "#F59E0B", "#10B981"];

  return (
    <WindowFrame windowKey="performance" title="绩效统计" iconName="BarChart3">
      <div className="h-full flex flex-col bg-neutral-50">
        <div className="px-4 py-3 border-b border-neutral-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-1 bg-neutral-100 rounded-md p-0.5">
            {[
              { k: "day", label: "今日" },
              { k: "week", label: "本周" },
              { k: "month", label: "本月" },
            ].map((p) => (
              <button
                key={p.k}
                onClick={() => setPeriod(p.k as typeof period)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium transition-all",
                  period === p.k
                    ? "bg-white text-primary-700 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-neutral-500 flex items-center gap-1">
            <Calendar size={12} />
            数据更新于 {new Date().toLocaleString("zh-CN", { hour12: false })}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="grid grid-cols-6 gap-3">
            {[
              { label: "客资总数", value: stats.totalLeads, icon: Users, color: "text-primary-600", bg: "bg-primary-50", trend: "+12%" },
              { label: "已拨打", value: stats.called, icon: Phone, color: "text-blue-600", bg: "bg-blue-50", trend: "+8%" },
              { label: "接通率", value: `${rate(stats.connected, stats.called)}%`, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+2.1%" },
              { label: "意向数", value: stats.intent, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", trend: "+5" },
              { label: "已预约", value: stats.booked, icon: Award, color: "text-rose-600", bg: "bg-rose-50", trend: "+3" },
              { label: "预约转化", value: `${rate(stats.booked, stats.called)}%`, icon: BarChart3, color: "text-violet-600", bg: "bg-violet-50", trend: "+1.5%" },
            ].map(({ label, value, icon: Icon, color, bg, trend }) => (
              <div key={label} className="card p-3 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", bg)}>
                    <Icon size={15} className={color} />
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">{trend}</span>
                </div>
                <div className="text-2xl font-bold font-serif text-neutral-800 leading-none">{value}</div>
                <div className="text-xs text-neutral-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-2 card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-primary-600" />
                  外呼转化漏斗
                </h3>
                <span className="text-xs text-neutral-400">整体转化</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <ReTooltip
                      formatter={(value: number, name: string) => [
                        `${value} (${rate(value, stats.totalLeads)}%)`,
                        name,
                      ]}
                    />
                    <Funnel
                      data={funnelData}
                      dataKey="value"
                      isAnimationActive
                    >
                      <LabelList
                        position="right"
                        fill="#475569"
                        stroke="none"
                        dataKey="name"
                        fontSize={11}
                      />
                      <LabelList
                        position="center"
                        fill="#fff"
                        stroke="none"
                        dataKey="value"
                        fontSize={12}
                        fontWeight={600}
                      />
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="col-span-2 card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-primary-600" />
                  拨打 / 预约趋势
                </h3>
                <span className="text-xs text-neutral-400">近14天</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.dailyTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
                    <ReTooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="calls"
                      name="拨打量"
                      stroke="#0F766E"
                      strokeWidth={2}
                      dot={{ fill: "#0F766E", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="booked"
                      name="预约数"
                      stroke="#E8B4A0"
                      strokeWidth={2}
                      dot={{ fill: "#E8B4A0", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                  <Users size={14} className="text-primary-600" />
                  渠道分布
                </h3>
              </div>
              <div className="h-72 flex flex-col">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.channelStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {stats.channelStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip formatter={(value: number) => [`${value}条`, "客资量"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 space-y-1.5">
                  {stats.channelStats.map((c, i) => (
                    <div key={c.channel} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-neutral-600">{c.channel}</span>
                      </div>
                      <span className="font-medium text-neutral-800">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                <Award size={14} className="text-amber-500" />
                个人业绩排行榜
              </h3>
              <div className="text-xs text-neutral-400">按预约数排序</div>
            </div>

            <div className="grid grid-cols-6 gap-4">
              {agents.map((emp, idx) => {
                const isMe = emp.id === currentUser.id;
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={emp.id}
                    className={cn(
                      "relative rounded-xl p-3 transition-all",
                      idx < 3
                        ? "bg-gradient-to-b from-amber-50 to-white border border-amber-100"
                        : "bg-neutral-50 border border-neutral-100",
                      isMe && "ring-2 ring-primary-500 ring-offset-1"
                    )}
                  >
                    {idx < 3 && (
                      <span className="absolute -top-2 -right-2 text-2xl">{medals[idx]}</span>
                    )}
                    {isMe && (
                      <span className="absolute -top-2 left-3 text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded-full">
                        我
                      </span>
                    )}
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={emp.avatar}
                        alt=""
                        className={cn(
                          "w-12 h-12 rounded-full mb-2 bg-neutral-200 border-2",
                          idx === 0 ? "border-amber-400" : idx === 1 ? "border-neutral-300" : idx === 2 ? "border-amber-700" : "border-white"
                        )}
                      />
                      <div className="font-semibold text-neutral-800 text-sm">{emp.name}</div>
                      <div className="text-[10px] text-neutral-400 mb-2">{emp.department}</div>
                      <div className="grid grid-cols-2 gap-2 w-full text-xs">
                        <div>
                          <div className="text-lg font-bold text-primary-700 font-serif">{emp.stats?.booked || 0}</div>
                          <div className="text-[10px] text-neutral-400">预约</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-emerald-600 font-serif">{emp.stats?.conversionRate || 0}%</div>
                          <div className="text-[10px] text-neutral-400">转化</div>
                        </div>
                      </div>
                      <div className="mt-2 w-full">
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 mb-0.5">
                          <span>质检评分</span>
                          <span className="font-medium text-neutral-700">{emp.stats?.qaAvgScore || 0}</span>
                        </div>
                        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              (emp.stats?.qaAvgScore || 0) >= 90 ? "bg-emerald-500" :
                              (emp.stats?.qaAvgScore || 0) >= 80 ? "bg-amber-500" : "bg-red-400"
                            )}
                            style={{ width: `${emp.stats?.qaAvgScore || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-800 flex items-center gap-1.5">
                <BarChart3 size={14} className="text-primary-600" />
                团队拨打量对比
              </h3>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agents.map((a) => ({
                  name: a.name,
                  拨打: a.stats?.callsToday || 0,
                  接通: a.stats?.connected || 0,
                  预约: a.stats?.booked || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ReTooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="拨打" fill="#0F766E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="接通" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="预约" fill="#E8B4A0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}
