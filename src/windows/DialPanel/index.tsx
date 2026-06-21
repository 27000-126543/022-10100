import { useState, useMemo, useEffect } from "react";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CalendarClock,
  Tag,
  DollarSign,
  ChevronRight,
  MapPin,
  UserCheck,
  FileText,
  AlertCircle,
} from "lucide-react";
import { WindowFrame } from "../../components/layout/WindowFrame";
import { useAppStore } from "../../stores/useAppStore";
import { useCallTimer } from "../../hooks/useCallTimer";
import {
  CALL_RESULT_LABELS,
  CALL_RESULT_COLORS,
  CHANNEL_LABELS,
  CHANNEL_COLORS,
  PROJECT_OPTIONS,
  BUDGET_OPTIONS,
  REJECT_REASONS,
  BRANCH_LABELS,
  type CallResult,
  type Branch,
} from "../../types";
import { cn } from "../../lib/utils";
import dayjs from "dayjs";

export function DialPanel() {
  const customers = useAppStore((s) => s.customers);
  const activeCustomerId = useAppStore((s) => s.activeCustomerId);
  const employees = useAppStore((s) => s.employees);
  const activeCustomer = useMemo(
    () => customers.find((c) => c.id === activeCustomerId),
    [customers, activeCustomerId]
  );
  const isOnCall = useAppStore((s) => s.isOnCall);
  const callDuration = useAppStore((s) => s.callDuration);
  const startCall = useAppStore((s) => s.startCall);
  const endCall = useAppStore((s) => s.endCall);
  const incrementCallDuration = useAppStore((s) => s.incrementCallDuration);
  const saveCallResult = useAppStore((s) => s.saveCallResult);
  const openWindow = useAppStore((s) => s.openWindow);
  const createBooking = useAppStore((s) => s.createBooking);
  const currentUser = useAppStore((s) => s.currentUser);

  const consultants = useMemo(
    () => employees.filter((e) => e.role === "agent" || e.department.includes("咨询")),
    [employees]
  );

  const { formatted: timerFormatted } = useCallTimer(isOnCall);
  const displayDuration = useMemo(() => {
    const mins = Math.floor(callDuration / 60);
    const secs = callDuration % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [callDuration]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isOnCall) {
      interval = setInterval(() => {
        incrementCallDuration();
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnCall, incrementCallDuration]);

  const [isMuted, setIsMuted] = useState(false);
  const [result, setResult] = useState<CallResult>("considering");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [nextFollowDate, setNextFollowDate] = useState("");
  const [nextFollowTime, setNextFollowTime] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingBranch, setBookingBranch] = useState<Branch | "">("");
  const [consultantId, setConsultantId] = useState("");
  const [consultantNotes, setConsultantNotes] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    setErrors([]);
  }, [
    result,
    rejectReason,
    nextFollowDate,
    nextFollowTime,
    notes,
    bookingBranch,
    consultantId,
    consultantNotes,
  ]);

  const validateForm = (): string[] => {
    const errs: string[] = [];
    if (["rejected", "no_need"].includes(result) && !rejectReason) {
      errs.push("请选择拒绝/无需求原因");
    }
    if (result === "considering") {
      const hasSchedule = nextFollowDate && nextFollowTime;
      const hasNotes = notes.trim().length > 0;
      if (!hasSchedule && !hasNotes) {
        errs.push("请填写二次外呼时间或下一步说明");
      }
    }
    if (result === "booked") {
      if (!bookingBranch) errs.push("请选择预约院区");
      if (!consultantId) errs.push("请选择交接咨询师");
      if (!(nextFollowDate && nextFollowTime)) errs.push("请选择预约时间");
    }
    return errs;
  };

  const resetForm = () => {
    setResult("considering");
    setRejectReason("");
    setSelectedProjects([]);
    setBudget("");
    setNextFollowDate("");
    setNextFollowTime("");
    setNotes("");
    setBookingBranch("");
    setConsultantId("");
    setConsultantNotes("");
    setErrors([]);
  };

  const handleStartCall = () => {
    if (!activeCustomerId) return;
    startCall(activeCustomerId);
    openWindow("follow-script");
  };

  const handleEndCall = () => {
    endCall();
  };

  const handleSave = () => {
    if (!activeCustomerId) return;

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    let nextFollowTimeISO: string | undefined;
    if (nextFollowDate && nextFollowTime) {
      nextFollowTimeISO = dayjs(`${nextFollowDate} ${nextFollowTime}`).toISOString();
    }

    const consultantName = consultants.find((c) => c.id === consultantId)?.name || "";

    saveCallResult({
      result,
      rejectReason:
        result === "rejected" || result === "no_need" ? rejectReason : undefined,
      intentProjects: selectedProjects.length > 0 ? selectedProjects : undefined,
      budgetRange: budget || undefined,
      nextStep: notes || consultantNotes || undefined,
      nextFollowTime: nextFollowTimeISO,
      duration: callDuration,
    });

    if (result === "booked" && activeCustomer) {
      createBooking({
        customerId: activeCustomer.id,
        customerName: activeCustomer.name,
        phoneMasked: activeCustomer.phoneMasked,
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        consultantId: consultantId || "emp_3",
        consultantName: consultantName || "张晓雯",
        branch: (bookingBranch as Branch) || "main",
        bookingTime: nextFollowTimeISO || dayjs().add(1, "day").toISOString(),
        project: selectedProjects[0] || activeCustomer.projectInterest[0] || "",
        notes: consultantNotes || notes || "",
      });
    }

    resetForm();
  };

  const toggleProject = (proj: string) => {
    setSelectedProjects((prev) =>
      prev.includes(proj) ? prev.filter((p) => p !== proj) : [...prev, proj]
    );
  };

  const showRejectReason = result === "rejected" || result === "no_need";
  const showBookingFields =
    result === "booked" || result === "considering";
  const isBooked = result === "booked";

  const hasError = (field: string) => {
    if (errors.length === 0) return false;
    const errMap: Record<string, string[]> = {
      rejectReason: ["请选择拒绝/无需求原因"],
      schedule: ["请填写二次外呼时间或下一步说明", "请选择预约时间"],
      notes: ["请填写二次外呼时间或下一步说明"],
      branch: ["请选择预约院区"],
      consultant: ["请选择交接咨询师"],
    };
    return Object.entries(errMap).some(([key, msgs]) =>
      key === field ? errors.some((e) => msgs.includes(e)) : false
    );
  };

  return (
    <WindowFrame windowKey="dial-panel" title="拨打面板" iconName="Phone">
      <div className="h-full flex flex-col">
        {activeCustomer ? (
          <>
            <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-primary-50 to-white">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-300 to-primary-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {activeCustomer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-800">
                      {activeCustomer.name}
                    </span>
                    <span
                      className={cn("tag", CHANNEL_COLORS[activeCustomer.channel])}
                    >
                      {CHANNEL_LABELS[activeCustomer.channel]}
                    </span>
                    {activeCustomer.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="tag bg-neutral-100 text-neutral-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    意向项目：{activeCustomer.projectInterest.join("、")}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-500">
                    广告来源：{activeCustomer.sourceAd}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-8 bg-gradient-to-b from-white to-neutral-50 flex flex-col items-center">
              <div className="text-3xl font-mono font-semibold text-neutral-800 tracking-wider">
                {activeCustomer.phoneMasked}
              </div>
              <div className="mt-1 text-sm text-neutral-400">
                {isOnCall ? `通话中 ${displayDuration}` : "待拨打"}
              </div>

              <div className="mt-6 flex items-center gap-4">
                {isOnCall ? (
                  <button
                    onClick={handleEndCall}
                    className="relative w-16 h-16 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all flex items-center justify-center"
                  >
                    <span className="absolute inset-0 rounded-full bg-red-500 animate-pulse-ring"></span>
                    <PhoneOff size={24} className="relative" />
                  </button>
                ) : (
                  <button
                    onClick={handleStartCall}
                    className="relative w-16 h-16 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center"
                  >
                    <span className="absolute inset-0 rounded-full bg-emerald-500 animate-pulse-ring"></span>
                    <Phone size={24} className="relative" />
                  </button>
                )}

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-all",
                    isMuted
                      ? "bg-neutral-800 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  )}
                >
                  {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <button className="w-11 h-11 rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 flex items-center justify-center transition-all">
                  <Volume2 size={18} />
                </button>
              </div>

              {isOnCall && (
                <div className="mt-6 flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-500 rounded-full animate-wave"
                      style={{
                        height: `${12 + Math.random() * 16}px`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
              {errors.length > 0 && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 space-y-1">
                  {errors.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-red-600"
                    >
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      <span>{e}</span>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-neutral-600 mb-1.5 block">
                  通话结果 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(CALL_RESULT_LABELS) as CallResult[]).map((key) => (
                    <button
                      key={key}
                      onClick={() => setResult(key)}
                      className={cn(
                        "px-2 py-2 rounded-md text-xs font-medium transition-all border",
                        result === key
                          ? cn(
                              CALL_RESULT_COLORS[key],
                              "border-transparent shadow-sm ring-2 ring-offset-1 ring-primary-400"
                            )
                          : "bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                      )}
                    >
                      {CALL_RESULT_LABELS[key]}
                    </button>
                  ))}
                </div>
              </div>

              {showRejectReason && (
                <div>
                  <label className="text-xs font-medium text-neutral-600 mb-1.5 block">
                    {result === "rejected" ? "拒接原因" : "无需求原因"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className={cn(
                      "select",
                      hasError("rejectReason") &&
                        "border-red-400 ring-1 ring-red-200 bg-red-50"
                    )}
                  >
                    <option value="">请选择原因</option>
                    {REJECT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isBooked && (
                <>
                  <div>
                    <label className="text-xs font-medium text-neutral-600 mb-1.5 flex items-center gap-1">
                      <MapPin size={12} />
                      预约院区 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bookingBranch}
                      onChange={(e) => setBookingBranch(e.target.value as Branch)}
                      className={cn(
                        "select",
                        hasError("branch") &&
                          "border-red-400 ring-1 ring-red-200 bg-red-50"
                      )}
                    >
                      <option value="">请选择院区</option>
                      {(Object.keys(BRANCH_LABELS) as Branch[]).map((b) => (
                        <option key={b} value={b}>
                          {BRANCH_LABELS[b]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-600 mb-1.5 flex items-center gap-1">
                      <UserCheck size={12} />
                      交接咨询师 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={consultantId}
                      onChange={(e) => setConsultantId(e.target.value)}
                      className={cn(
                        "select",
                        hasError("consultant") &&
                          "border-red-400 ring-1 ring-red-200 bg-red-50"
                      )}
                    >
                      <option value="">请选择咨询师</option>
                      {consultants.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} · {c.department}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {showBookingFields && (
                <>
                  <div>
                    <label className="text-xs font-medium text-neutral-600 mb-1.5 flex items-center gap-1">
                      <Tag size={12} /> 意向项目补全
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PROJECT_OPTIONS.slice(0, 8).map((proj) => (
                        <button
                          key={proj}
                          onClick={() => toggleProject(proj)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs transition-all border",
                            selectedProjects.includes(proj)
                              ? "bg-primary-50 text-primary-700 border-primary-300"
                              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                          )}
                        >
                          {proj}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-600 mb-1.5 flex items-center gap-1">
                      <DollarSign size={12} /> 预算范围
                    </label>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="select"
                    >
                      <option value="">请选择预算范围</option>
                      {BUDGET_OPTIONS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-600 mb-1.5 flex items-center gap-1">
                      <CalendarClock size={12} />
                      {result === "booked" ? "预约时间" : "二次外呼排程"}
                      {isBooked && <span className="text-red-500">*</span>}
                      {!isBooked && (
                        <span className="text-neutral-400 font-normal">
                          （与下一步说明二选一）
                        </span>
                      )}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={nextFollowDate}
                        onChange={(e) => setNextFollowDate(e.target.value)}
                        className={cn(
                          "input",
                          hasError("schedule") &&
                            "border-red-400 ring-1 ring-red-200 bg-red-50"
                        )}
                        min={dayjs().format("YYYY-MM-DD")}
                      />
                      <input
                        type="time"
                        value={nextFollowTime}
                        onChange={(e) => setNextFollowTime(e.target.value)}
                        className={cn(
                          "input",
                          hasError("schedule") &&
                            "border-red-400 ring-1 ring-red-200 bg-red-50"
                        )}
                      />
                    </div>
                  </div>
                </>
              )}

              {isBooked && (
                <div>
                  <label className="text-xs font-medium text-neutral-600 mb-1.5 flex items-center gap-1">
                    <FileText size={12} />
                    交接备注
                    <span className="text-neutral-400 font-normal">（给咨询师看的）</span>
                  </label>
                  <textarea
                    value={consultantNotes}
                    onChange={(e) => setConsultantNotes(e.target.value)}
                    rows={2}
                    placeholder="客户关注点、特殊需求、性格特点等交接信息..."
                    className="input resize-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-neutral-600 mb-1.5 block">
                  备注 / 下一步
                  {!isBooked && showBookingFields && (
                    <span className="text-neutral-400 font-normal ml-1">
                      （与排程二选一）
                    </span>
                  )}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="记录客户特殊需求、关注点等..."
                  className={cn(
                    "input resize-none",
                    hasError("notes") &&
                      "border-red-400 ring-1 ring-red-200 bg-red-50"
                  )}
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!activeCustomerId}
                className="w-full btn-primary py-2.5"
              >
                <span>保存并继续下一个</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-8">
            <Phone size={48} strokeWidth={1} className="mb-3 opacity-40" />
            <div className="text-sm">请在客户池中选择一个客户</div>
            <div className="text-xs mt-1">点击客户行即可选中</div>
          </div>
        )}
      </div>
    </WindowFrame>
  );
}
