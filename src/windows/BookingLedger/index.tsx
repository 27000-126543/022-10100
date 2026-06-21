import { useState } from "react";
import {
  CalendarDays,
  Calendar,
  List,
  User,
  MapPin,
  Clock,
  FileText,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { WindowFrame } from "../../components/layout/WindowFrame";
import { useAppStore } from "../../stores/useAppStore";
import {
  BOOKING_STATUS_LABELS,
  BRANCH_LABELS,
  type Booking,
  type BookingStatus,
  type Branch,
} from "../../types";
import { cn } from "../../lib/utils";
import dayjs from "dayjs";

export function BookingLedger() {
  const bookings = useAppStore((s) => s.bookings);
  const employees = useAppStore((s) => s.employees);
  const updateBookingStatus = useAppStore((s) => s.updateBookingStatus);

  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [branchFilter, setBranchFilter] = useState<Branch | "all">("all");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [consultantFilter, setConsultantFilter] = useState<string>("all");
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  const consultants = employees.filter((e) => e.role === "agent");

  const filtered = bookings.filter((b) => {
    if (branchFilter !== "all" && b.branch !== branchFilter) return false;
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (consultantFilter !== "all" && b.consultantId !== consultantFilter) return false;
    return true;
  }).sort((a, b) => a.bookingTime.localeCompare(b.bookingTime));

  const agents = employees.filter((e) => e.role === "agent");

  const statusCount = (status: BookingStatus) =>
    bookings.filter((b) => b.status === status).length;

  const stats = [
    { label: "待确认", count: statusCount("pending"), color: "bg-amber-500" },
    { label: "已确认", count: statusCount("confirmed"), color: "bg-blue-500" },
    { label: "已到店", count: statusCount("checked_in"), color: "bg-emerald-500" },
    { label: "已取消", count: statusCount("cancelled"), color: "bg-neutral-400" },
  ];

  const generateCalendarDays = () => {
    const start = currentMonth.startOf("month");
    const end = currentMonth.endOf("month");
    const startWeekday = start.day();
    const daysInMonth = end.date();
    const weeks: (dayjs.Dayjs | null)[][] = [];
    let currentWeek: (dayjs.Dayjs | null)[] = [];

    for (let i = 0; i < startWeekday; i++) currentWeek.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = start.date(d);
      currentWeek.push(date);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return weeks;
  };

  const getBookingsForDate = (date: dayjs.Dayjs) => {
    return filtered.filter((b) => dayjs(b.bookingTime).isSame(date, "day"));
  };

  return (
    <WindowFrame windowKey="booking-ledger" title="预约台账" iconName="CalendarDays">
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-white">
          <div className="grid grid-cols-4 gap-3 mb-3">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full", s.color)} />
                <div>
                  <span className="text-lg font-bold font-serif text-neutral-800">{s.count}</span>
                  <span className="text-xs text-neutral-500 ml-1">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white rounded-md border border-neutral-200 p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all",
                  viewMode === "list" ? "bg-primary-600 text-white" : "text-neutral-600 hover:bg-neutral-50"
                )}
              >
                <List size={12} /> 列表
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all",
                  viewMode === "calendar" ? "bg-primary-600 text-white" : "text-neutral-600 hover:bg-neutral-50"
                )}
              >
                <Calendar size={12} /> 日历
              </button>
            </div>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value as Branch | "all")}
              className="h-7 px-2 rounded-md text-xs border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">全部院区</option>
              {(Object.keys(BRANCH_LABELS) as Branch[]).map((b) => (
                <option key={b} value={b}>{BRANCH_LABELS[b]}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BookingStatus | "all")}
              className="h-7 px-2 rounded-md text-xs border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">全部状态</option>
              {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((s) => (
                <option key={s} value={s}>{BOOKING_STATUS_LABELS[s]}</option>
              ))}
            </select>

            <select
              value={consultantFilter}
              onChange={(e) => setConsultantFilter(e.target.value)}
              className="h-7 px-2 rounded-md text-xs border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">全部咨询师</option>
              {consultants.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <div className="ml-auto text-xs text-neutral-500">
              共 <span className="font-semibold text-neutral-700">{filtered.length}</span> 条预约
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {viewMode === "list" ? (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 sticky top-0 z-10">
                <tr className="text-left text-xs text-neutral-500">
                  <th className="px-4 py-2.5 font-medium">客户信息</th>
                  <th className="px-4 py-2.5 font-medium">预约时间</th>
                  <th className="px-4 py-2.5 font-medium">院区</th>
                  <th className="px-4 py-2.5 font-medium">项目</th>
                  <th className="px-4 py-2.5 font-medium">咨询师</th>
                  <th className="px-4 py-2.5 font-medium">交接备注</th>
                  <th className="px-4 py-2.5 font-medium">状态</th>
                  <th className="px-4 py-2.5 font-medium w-24">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <BookingRow
                    key={booking.id}
                    booking={booking}
                    onUpdateStatus={updateBookingStatus}
                    agentName={agents.find((a) => a.id === booking.employeeId)?.name || ""}
                  />
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-neutral-400 text-sm">
                      暂无预约记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}
                    className="w-7 h-7 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-600"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-semibold text-neutral-800">
                    {currentMonth.format("YYYY年MM月")}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}
                    className="w-7 h-7 rounded-md hover:bg-neutral-100 flex items-center justify-center text-neutral-600"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-neutral-200 rounded-lg overflow-hidden">
                {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
                  <div key={d} className="bg-neutral-50 py-2 text-center text-xs font-medium text-neutral-500">
                    {d}
                  </div>
                ))}
                {generateCalendarDays().flat().map((date, i) => {
                  if (!date) return <div key={i} className="bg-white min-h-20" />;
                  const dayBookings = getBookingsForDate(date);
                  const isToday = date.isSame(dayjs(), "day");
                  return (
                    <div key={i} className="bg-white min-h-20 p-1.5">
                      <div className={cn(
                        "text-xs w-5 h-5 rounded-full flex items-center justify-center mb-1",
                        isToday && "bg-primary-600 text-white font-medium"
                      )}>
                        {date.date()}
                      </div>
                      <div className="space-y-1">
                        {dayBookings.slice(0, 2).map((b) => (
                          <div
                            key={b.id}
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded truncate",
                              b.status === "checked_in" ? "bg-emerald-100 text-emerald-700" :
                              b.status === "cancelled" ? "bg-neutral-100 text-neutral-500" :
                              b.status === "pending" ? "bg-amber-100 text-amber-700" :
                              "bg-blue-100 text-blue-700"
                            )}
                            title={`${b.customerName} ${b.project}`}
                          >
                            {dayjs(b.bookingTime).format("HH:mm")} {b.customerName}
                          </div>
                        ))}
                        {dayBookings.length > 2 && (
                          <div className="text-[10px] text-neutral-400 px-1">
                            +{dayBookings.length - 2} 更多
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
}

function BookingRow({
  booking,
  onUpdateStatus,
  agentName,
}: {
  booking: Booking;
  onUpdateStatus: (id: string, status: BookingStatus) => void;
  agentName: string;
}) {
  const statusColors: Record<BookingStatus, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    checked_in: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-neutral-100 text-neutral-500",
  };

  const branchColors: Record<Branch, string> = {
    main: "bg-rose-100 text-rose-700",
    branch1: "bg-blue-100 text-blue-700",
    branch2: "bg-violet-100 text-violet-700",
  };

  return (
    <tr className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-200 to-primary-200 flex items-center justify-center text-xs font-medium text-neutral-700">
            {booking.customerName.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-neutral-800 text-sm">{booking.customerName}</div>
            <div className="text-xs text-neutral-400 font-mono">{booking.phoneMasked}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm text-neutral-700">
          <CalendarDays size={12} className="text-neutral-400" />
          {dayjs(booking.bookingTime).format("MM-DD HH:mm")}
        </div>
        <div className="text-[10px] text-neutral-400 mt-0.5 flex items-center gap-1">
          <User size={9} /> 预约人：{agentName}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn("tag", branchColors[booking.branch])}>
          <MapPin size={9} className="inline mr-0.5" />
          {BRANCH_LABELS[booking.branch]}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-neutral-700">{booking.project}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${booking.consultantName}`}
            className="w-5 h-5 rounded-full bg-neutral-100"
            alt=""
          />
          <span className="text-sm text-neutral-700">{booking.consultantName}</span>
        </div>
      </td>
      <td className="px-4 py-3 max-w-xs">
        <div className="text-xs text-neutral-600 truncate" title={booking.notes}>
          <FileText size={10} className="inline mr-1 text-neutral-400" />
          {booking.notes || "—"}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={cn("tag", statusColors[booking.status])}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {booking.status !== "checked_in" && booking.status !== "cancelled" && (
            <button
              onClick={() => onUpdateStatus(booking.id, "checked_in")}
              className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
              title="确认到店"
            >
              <Check size={13} />
            </button>
          )}
          {booking.status !== "cancelled" && (
            <button
              onClick={() => onUpdateStatus(booking.id, "cancelled")}
              className="w-7 h-7 rounded-md bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
              title="取消预约"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
