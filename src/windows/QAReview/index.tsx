import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Search,
  Filter,
  AlertTriangle,
  Star,
  Send,
  ChevronDown,
  User,
  Clock,
  MessageSquareWarning,
} from "lucide-react";
import { WindowFrame } from "../../components/layout/WindowFrame";
import { useAppStore } from "../../stores/useAppStore";
import { formatDuration } from "../../hooks/useCallTimer";
import { cn } from "../../lib/utils";
import dayjs from "dayjs";

interface DimensionScore {
  exaggeration: number;
  riskDisclosure: number;
  attitude: number;
  compliance: number;
}

const ISSUE_TAGS = [
  "未告知治疗风险",
  "夸大治疗效果",
  "承诺具体维持时间",
  "语速过快",
  "未确认客户方便接听",
  "未使用标准开场白",
  "未主动提及优惠活动",
  "未进行到店邀约",
];

export function QAReview() {
  const callRecords = useAppStore((s) => s.callRecords);
  const employees = useAppStore((s) => s.employees);
  const qaReviews = useAppStore((s) => s.qaReviews);
  const addQAReview = useAppStore((s) => s.addQAReview);

  const [selectedCallId, setSelectedCallId] = useState<string | null>(
    callRecords.find((c) => !c.qaReviewed)?.id || callRecords[0]?.id || null
  );
  const [keyword, setKeyword] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const [scores, setScores] = useState<DimensionScore>({
    exaggeration: 85,
    riskDisclosure: 80,
    attitude: 90,
    compliance: 85,
  });
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [scriptSuggestion, setScriptSuggestion] = useState("");

  const selectedCall = callRecords.find((c) => c.id === selectedCallId);
  const existingReview = qaReviews.find((r) => r.callRecordId === selectedCallId);

  const filteredCalls = callRecords.filter((c) => {
    if (employeeFilter !== "all" && c.employeeId !== employeeFilter) return false;
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      if (!c.customerName.toLowerCase().includes(kw)) return false;
    }
    return true;
  });

  const agents = employees.filter((e) => e.role === "agent");
  const lowConversionAgents = agents.filter(
    (e) => (e.stats?.conversionRate || 0) < 18
  );

  const avgScore = Math.round(
    (scores.exaggeration + scores.riskDisclosure + scores.attitude + scores.compliance) / 4
  );

  const setScore = (key: keyof DimensionScore, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const toggleIssue = (issue: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issue) ? prev.filter((i) => i !== issue) : [...prev, issue]
    );
  };

  const handleSubmit = () => {
    if (!selectedCall) return;
    addQAReview({
      id: `qa_${Date.now()}`,
      callRecordId: selectedCall.id,
      customerName: selectedCall.customerName,
      employeeId: selectedCall.employeeId,
      employeeName: agents.find((a) => a.id === selectedCall.employeeId)?.name || "",
      startTime: selectedCall.startTime,
      duration: selectedCall.duration,
      score: avgScore,
      dimensions: scores,
      issues: selectedIssues,
      feedback,
      scriptSuggestion: scriptSuggestion || undefined,
      reviewerId: "qa_1",
      reviewTime: new Date().toISOString(),
    });
    setFeedback("");
    setScriptSuggestion("");
    setSelectedIssues([]);
    setScores({ exaggeration: 85, riskDisclosure: 80, attitude: 90, compliance: 85 });
  };

  useEffect(() => {
    if (existingReview) {
      setScores(existingReview.dimensions);
    } else {
      setScores({ exaggeration: 85, riskDisclosure: 80, attitude: 90, compliance: 85 });
    }
  }, [selectedCallId]);

  return (
    <WindowFrame windowKey="qa-review" title="质检抽听" iconName="Headphones">
      <div className="h-full flex">
        <div className="w-72 border-r border-neutral-200 flex flex-col bg-white">
          <div className="p-3 border-b border-neutral-200 space-y-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                className="input pl-8 py-1.5 text-xs"
                placeholder="搜索客户姓名..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Filter size={12} className="text-neutral-400" />
              <select
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                className="flex-1 h-7 px-2 rounded-md text-xs border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">全部坐席</option>
                <optgroup label="低转化优先质检">
                  {lowConversionAgents.map((e) => (
                    <option key={e.id} value={e.id}>
                      ⚠️ {e.name} ({e.stats?.conversionRate}%)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="全部坐席">
                  {agents.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {filteredCalls.map((call) => {
              const isSelected = call.id === selectedCallId;
              const agent = agents.find((a) => a.id === call.employeeId);
              return (
                <div
                  key={call.id}
                  onClick={() => setSelectedCallId(call.id)}
                  className={cn(
                    "px-3 py-2.5 border-b border-neutral-100 cursor-pointer transition-colors",
                    isSelected ? "bg-primary-50" : "hover:bg-neutral-50"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-800">{call.customerName}</span>
                    {call.qaReviewed ? (
                      <span className="tag bg-emerald-100 text-emerald-600 text-[10px]">已质检</span>
                    ) : (
                      <span className="tag bg-amber-100 text-amber-600 text-[10px]">待质检</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <User size={10} />
                    <span>{agent?.name}</span>
                    <Clock size={10} />
                    <span>{formatDuration(call.duration)}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {dayjs(call.startTime).format("MM-DD HH:mm")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-neutral-50">
          {selectedCall ? (
            <>
              <div className="p-4 border-b border-neutral-200 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <div className="font-semibold text-neutral-800">{selectedCall.customerName}</div>
                    <div className="text-xs text-neutral-500">
                      {agents.find((a) => a.id === selectedCall.employeeId)?.name} ·{" "}
                      {dayjs(selectedCall.startTime).format("YYYY-MM-DD HH:mm")} ·{" "}
                      通话时长 {formatDuration(selectedCall.duration)}
                    </div>
                  </div>
                  {existingReview && (
                    <div className="ml-auto flex items-center gap-1">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span className="font-bold text-lg text-amber-600">{existingReview.score}</span>
                      <span className="text-xs text-neutral-400">分</span>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <button
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      onClick={() => setPlayProgress(Math.max(0, playProgress - 10))}
                    >
                      <SkipBack size={16} />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-400 flex items-center justify-center transition-colors shadow-lg"
                    >
                      {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                    </button>
                    <button
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      onClick={() => setPlayProgress(Math.min(100, playProgress + 10))}
                    >
                      <SkipForward size={16} />
                    </button>
                    <div className="ml-4 flex items-center gap-2">
                      <Volume2 size={16} className="text-white/60" />
                      {[0.5, 1, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setPlaybackRate(rate)}
                          className={cn(
                            "px-2 py-1 rounded text-xs transition-all",
                            playbackRate === rate
                              ? "bg-primary-500 text-white"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          )}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-16 bg-white/5 rounded-lg flex items-center justify-center gap-0.5 overflow-hidden px-2">
                      {[...Array(80)].map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "w-1 rounded-full transition-colors",
                            i < (playProgress / 100) * 80 ? "bg-primary-400" : "bg-white/20"
                          )}
                          style={{
                            height: `${30 + Math.sin(i * 0.5) * 20 + Math.random() * 20}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>{formatDuration(Math.floor((playProgress / 100) * selectedCall.duration))}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={playProgress}
                      onChange={(e) => setPlayProgress(Number(e.target.value))}
                      className="flex-1 mx-4 accent-primary-500"
                    />
                    <span>{formatDuration(selectedCall.duration)}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-5">
                <div>
                  <div className="text-xs font-medium text-neutral-500 mb-2.5 flex items-center gap-1">
                    <Star size={12} /> 质检评分（当前总分：<span className="text-primary-600 font-bold text-sm">{avgScore}</span>）
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: "exaggeration" as const, label: "夸大疗效（禁止承诺）", icon: AlertTriangle },
                      { key: "riskDisclosure" as const, label: "风险提示（必须告知）", icon: MessageSquareWarning },
                      { key: "attitude" as const, label: "服务态度", icon: User },
                      { key: "compliance" as const, label: "合规性（话术规范）", icon: CheckCircleIcon },
                    ]).map(({ key, label, icon: Icon }) => (
                      <div key={key} className="card p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-neutral-600 flex items-center gap-1">
                            <Icon size={12} className={scores[key] < 80 ? "text-red-500" : "text-neutral-400"} />
                            {label}
                          </span>
                          <span className={cn(
                            "text-sm font-bold",
                            scores[key] >= 90 ? "text-emerald-600" :
                            scores[key] >= 80 ? "text-amber-600" : "text-red-500"
                          )}>
                            {scores[key]}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[0, 20, 40, 60, 80, 100].filter((v) => v >= 60).map((v) => (
                            <button
                              key={v}
                              onClick={() => setScore(key, v)}
                              className={cn(
                                "flex-1 h-2 rounded transition-all",
                                scores[key] >= v
                                  ? scores[key] >= 90
                                    ? "bg-emerald-500"
                                    : scores[key] >= 80
                                    ? "bg-amber-500"
                                    : "bg-red-400"
                                  : "bg-neutral-200"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-neutral-500 mb-2 flex items-center gap-1">
                    <AlertTriangle size={12} /> 问题标记（可多选）
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ISSUE_TAGS.map((issue) => (
                      <button
                        key={issue}
                        onClick={() => toggleIssue(issue)}
                        className={cn(
                          "px-2.5 py-1 rounded-md text-xs transition-all border",
                          selectedIssues.includes(issue)
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                        )}
                      >
                        {issue}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-neutral-500 mb-2">质检反馈</div>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    placeholder="请输入详细质检意见和改进建议..."
                    className="input resize-none"
                  />
                </div>

                <div>
                  <div className="text-xs font-medium text-neutral-500 mb-2">反馈至脚本库（可选）</div>
                  <textarea
                    value={scriptSuggestion}
                    onChange={(e) => setScriptSuggestion(e.target.value)}
                    rows={2}
                    placeholder="如有话术优化建议，请在此填写，将同步更新到话术库..."
                    className="input resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={existingReview !== undefined}
                  className="w-full btn-primary py-2.5"
                >
                  <Send size={16} />
                  {existingReview ? "已完成质检" : "提交质检结果"}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <Search size={48} strokeWidth={1} className="mb-3 opacity-40" />
              <div className="text-sm">请从左侧选择通话记录</div>
            </div>
          )}
        </div>
      </div>
    </WindowFrame>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
