import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Clock,
  Phone,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  User,
  CheckCircle2,
  AlertCircle,
  BellRing,
  X,
  Minimize2,
  Maximize2,
  LayoutList,
  Sun,
  Moon,
} from "lucide-react";
import { useAppStore } from "../stores/useAppStore";
import { cn } from "../lib/utils";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

type ViewMode = "list" | "rhythm";

const TIME_PERIODS = [
  { key: "morning", label: "上午", time: "9:00–12:00", Icon: Sun, minHour: 0, maxHour: 12 },
  { key: "afternoon", label: "下午", time: "12:00–18:00", Icon: Sun, minHour: 12, maxHour: 18 },
  { key: "evening", label: "晚间", time: "18:00–21:00", Icon: Moon, minHour: 18, maxHour: 24 },
] as const;

export function TodayTodoList() {
  const todoTasks = useAppStore((s) => s.todoTasks);
  const currentUser = useAppStore((s) => s.currentUser);
  const setActiveCustomer = useAppStore((s) => s.setActiveCustomer);
  const openWindow = useAppStore((s) => s.openWindow);
  const completeTodoTask = useAppStore((s) => s.completeTodoTask);
  const updateTodoTask = useAppStore((s) => s.updateTodoTask);
  const setActiveTodoTaskId = useAppStore((s) => s.setActiveTodoTaskId);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [fadingOutIds, setFadingOutIds] = useState<Set<string>>(new Set());
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
      const now = new Date();
      const todayStart = dayjs().startOf("day");
      const todayEnd = dayjs().endOf("day");
      todoTasks.forEach((task) => {
        const scheduled = dayjs(task.scheduledTime);
        if (
          task.status === "pending" &&
          task.employeeId === currentUser.id &&
          scheduled.isBetween(todayStart, todayEnd, null, "[]") &&
          scheduled.isBefore(dayjs(now))
        ) {
          updateTodoTask(task.id, { status: "missed" });
        }
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [todoTasks, currentUser.id, updateTodoTask]);

  const myTasks = useMemo(() => {
    const todayStart = dayjs().startOf("day");
    const todayEnd = dayjs().endOf("day");
    return todoTasks.filter((t) => {
      if (t.employeeId !== currentUser.id) return false;
      const scheduled = dayjs(t.scheduledTime);
      return scheduled.isBetween(todayStart, todayEnd, null, "[]");
    });
  }, [todoTasks, currentUser.id]);

  const sortedTasks = useMemo(() => {
    return [...myTasks].sort((a, b) => {
      if (a.status !== b.status) {
        const order = { pending: 0, missed: 1, completed: 2 };
        return order[a.status] - order[b.status];
      }
      return new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime();
    });
  }, [myTasks]);

  const visibleTasks = useMemo(() => {
    return sortedTasks.filter((t) => {
      if (t.status === "completed" && !fadingOutIds.has(t.id)) return false;
      return true;
    });
  }, [sortedTasks, fadingOutIds]);

  const pendingCount = myTasks.filter(
    (t) => t.status === "pending" || t.status === "missed"
  ).length;
  const completedCount = myTasks.filter((t) => t.status === "completed").length;
  const now = new Date();
  const upcomingCount = sortedTasks.filter(
    (t) =>
      t.status === "pending" &&
      dayjs(t.scheduledTime).isBetween(now, new Date(now.getTime() + 30 * 60 * 1000), null, "[)")
  ).length;

  const handleTaskClick = (task: any) => {
    if (task.status === "completed") return;
    setActiveCustomer(task.customerId);
    setActiveTodoTaskId(task.id);
    openWindow("dial-panel");
    openWindow("follow-script");
  };

  const handleComplete = useCallback(
    (e: React.MouseEvent, taskId: string) => {
      e.stopPropagation();
      setFadingOutIds((prev) => {
        const next = new Set(prev);
        next.add(taskId);
        return next;
      });
      completeTodoTask(taskId);
      setTimeout(() => {
        setFadingOutIds((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }, 300);
    },
    [completeTodoTask]
  );

  const getTaskStatusInfo = (task: any) => {
    const scheduled = dayjs(task.scheduledTime);
    const now = dayjs();
    const isUrgent =
      task.status === "pending" &&
      scheduled.isBefore(now.add(10, "minute")) &&
      scheduled.isAfter(now.subtract(5, "minute"));
    const isMissed = task.status === "missed";
    const isCompleted = task.status === "completed";
    return { isUrgent, isMissed, isCompleted };
  };

  const getTaskPeriod = (task: any) => {
    const hour = dayjs(task.scheduledTime).hour();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  const rhythmGroups = useMemo(() => {
    const groups: Record<string, any[]> = { morning: [], afternoon: [], evening: [] };
    visibleTasks
      .filter((t) => t.status !== "completed" || fadingOutIds.has(t.id))
      .forEach((task) => {
        const period = getTaskPeriod(task);
        groups[period].push(task);
      });
    return groups;
  }, [visibleTasks, fadingOutIds]);

  const renderTaskCard = (task: any) => {
    const { isUrgent, isMissed, isCompleted } = getTaskStatusInfo(task);
    const scheduled = dayjs(task.scheduledTime);
    const isFadingOut = fadingOutIds.has(task.id);

    return (
      <div
        key={task.id}
        onClick={() => handleTaskClick(task)}
        className={cn(
          "p-3 cursor-pointer transition-all duration-300",
          isFadingOut && "opacity-0",
          !isFadingOut &&
            (isCompleted
              ? "bg-neutral-50 opacity-70"
              : isMissed
              ? "bg-red-50/50"
              : isUrgent
              ? "bg-amber-50 animate-pulse-slow"
              : "hover:bg-neutral-50")
        )}
      >
        <div className="flex items-start gap-2.5">
          <button
            onClick={(e) => handleComplete(e, task.id)}
            disabled={isCompleted}
            className={cn(
              "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
              isCompleted
                ? "bg-emerald-500 border-emerald-500"
                : isMissed
                ? "border-red-400 hover:bg-red-50"
                : isUrgent
                ? "border-amber-500 hover:bg-amber-100"
                : "border-neutral-300 hover:border-primary-400 hover:bg-primary-50"
            )}
          >
            {isCompleted && <CheckCircle2 size={12} className="text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  isCompleted
                    ? "text-neutral-400 line-through"
                    : isMissed
                    ? "text-red-600"
                    : "text-neutral-800"
                )}
              >
                {task.customerName}
              </span>
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-medium",
                  task.taskType === "follow_up"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-emerald-100 text-emerald-700"
                )}
              >
                {task.taskType === "follow_up" ? "二次外呼" : "预约确认"}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span
                className={cn(
                  "text-xs flex items-center gap-1",
                  isCompleted
                    ? "text-neutral-400"
                    : isMissed
                    ? "text-red-500"
                    : isUrgent
                    ? "text-amber-600 font-medium"
                    : "text-neutral-500"
                )}
              >
                {isUrgent ? (
                  <AlertCircle size={11} className="animate-pulse" />
                ) : (
                  <Clock size={11} />
                )}
                {scheduled.format("HH:mm")}
                {isMissed && " · 已错过"}
                {isCompleted &&
                  task.completedAt &&
                  ` · 完成于 ${dayjs(task.completedAt).format("HH:mm")}`}
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {task.phoneMasked}
              </span>
            </div>

            {task.notes && !isCompleted && (
              <div className="mt-1.5 text-[11px] text-neutral-500 bg-white/60 rounded px-2 py-1 border border-neutral-100">
                {task.notes}
              </div>
            )}
          </div>

          {!isCompleted && (
            <Phone
              size={14}
              className={cn(
                "mt-1 flex-shrink-0",
                isMissed ? "text-red-400" : "text-primary-500"
              )}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed right-4 top-20 z-40 transition-all duration-300 ease-out",
        isCollapsed ? "w-12" : "w-72"
      )}
    >
      {!isCollapsed ? (
        <div className="card shadow-window overflow-hidden">
          <div className="px-3.5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing size={16} className={cn(upcomingCount > 0 && "animate-bounce")} />
              <span className="text-sm font-semibold">今日待办</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {upcomingCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-400 animate-pulse">
                  {upcomingCount}个即将开始
                </span>
              )}
              <div className="flex items-center bg-white/10 rounded-md p-0.5">
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-1 rounded transition-colors",
                    viewMode === "list" ? "bg-white/20" : "hover:bg-white/10"
                  )}
                  title="列表视图"
                >
                  <LayoutList size={12} />
                </button>
                <button
                  onClick={() => setViewMode("rhythm")}
                  className={cn(
                    "p-1 rounded transition-colors",
                    viewMode === "rhythm" ? "bg-white/20" : "hover:bg-white/10"
                  )}
                  title="节奏视图"
                >
                  <Clock size={12} />
                </button>
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1 rounded-md hover:bg-white/20 transition-colors"
              >
                <Minimize2 size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-[380px] overflow-auto">
            {visibleTasks.length > 0 ? (
              viewMode === "list" ? (
                <div className="divide-y divide-neutral-100">
                  {visibleTasks.map((task) => renderTaskCard(task))}
                </div>
              ) : (
                <div>
                  {TIME_PERIODS.map(({ key, label, time, Icon }) => {
                    const tasks = rhythmGroups[key];
                    if (!tasks || tasks.length === 0) return null;
                    return (
                      <div key={key}>
                        <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-100 flex items-center gap-2">
                          <Icon size={13} className="text-amber-500" />
                          <span className="text-xs font-semibold text-neutral-700">{label}</span>
                          <span className="text-[10px] text-neutral-400">{time}</span>
                          <span className="ml-auto text-[10px] text-neutral-400 font-medium">
                            {tasks.length}项
                          </span>
                        </div>
                        <div className="divide-y divide-neutral-100">
                          {tasks.map((task) => renderTaskCard(task))}
                        </div>
                      </div>
                    );
                  })}
                  {Object.values(rhythmGroups).every((g) => !g || g.length === 0) && (
                    <div className="py-10 text-center">
                      <CalendarClock size={32} className="mx-auto mb-2 text-neutral-300" />
                      <div className="text-sm text-neutral-400">今日暂无待办</div>
                      <div className="text-xs text-neutral-300 mt-0.5">
                        拨打时设置二次外呼会出现在这里
                      </div>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="py-10 text-center">
                <CalendarClock size={32} className="mx-auto mb-2 text-neutral-300" />
                <div className="text-sm text-neutral-400">今日暂无待办</div>
                <div className="text-xs text-neutral-300 mt-0.5">
                  拨打时设置二次外呼会出现在这里
                </div>
              </div>
            )}
          </div>

          <div className="px-3.5 py-2 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
            <span>
              待跟进 {pendingCount} · 已完成 {completedCount}
            </span>
            <span className="text-neutral-400">点击任务直接拨打</span>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform relative"
        >
          <BellRing size={20} className={cn(upcomingCount > 0 && "animate-bounce")} />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
