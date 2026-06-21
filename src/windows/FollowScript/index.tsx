import { useState, useMemo } from "react";
import {
  AlertTriangle,
  Lightbulb,
  History,
  Megaphone,
  User,
  Sparkles,
  MessageSquarePlus,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { WindowFrame } from "../../components/layout/WindowFrame";
import { useAppStore } from "../../stores/useAppStore";
import {
  SCRIPT_STAGE_LABELS,
  CHANNEL_LABELS,
  CHANNEL_COLORS,
  type ScriptStage,
} from "../../types";
import { cn } from "../../lib/utils";
import dayjs from "dayjs";

export function FollowScript() {
  const [activeStage, setActiveStage] = useState<ScriptStage>("opening");
  const [showSuggestions, setShowSuggestions] = useState(true);

  const scripts = useAppStore((s) => s.scripts);
  const scriptSuggestions = useAppStore((s) => s.scriptSuggestions);
  const updateScriptSuggestionStatus = useAppStore(
    (s) => s.updateScriptSuggestionStatus
  );
  const adoptSuggestionToScript = useAppStore((s) => s.adoptSuggestionToScript);
  const activeCustomer = useAppStore((s) =>
    s.customers.find((c) => c.id === s.activeCustomerId)
  );
  const callRecords = useAppStore((s) => s.callRecords);
  const customerCalls = useMemo(
    () => callRecords.filter((r) => r.customerId === activeCustomer?.id),
    [callRecords, activeCustomer?.id]
  );
  const currentUser = useAppStore((s) => s.currentUser);
  const isQAOrManager = currentUser.role === "qa" || currentUser.role === "manager";

  const stages: ScriptStage[] = [
    "opening",
    "intro",
    "objection",
    "invitation",
    "closing",
  ];

  const activeScript =
    scripts.find((s) => s.stage === activeStage) || scripts[0];

  const stageSuggestions = useMemo(() => {
    return scriptSuggestions.filter(
      (s) => s.stage === activeStage && s.status === "pending"
    );
  }, [scriptSuggestions, activeStage]);

  const totalPendingSuggestions = useMemo(() => {
    return scriptSuggestions.filter((s) => s.status === "pending").length;
  }, [scriptSuggestions]);

  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => (
      <p
        key={i}
        className={cn(
          "mb-2",
          i === 0 ? "font-medium text-neutral-800" : "text-neutral-600"
        )}
      >
        {line
          .replace(/\{[^}]+\}/g, (m) => {
            const key = m.slice(1, -1);
            const map: Record<string, string> = {
              姓名: activeCustomer?.name || "客户",
              项目: activeCustomer?.projectInterest[0] || "项目",
              推荐人: "朋友",
              我的名字: "客服",
              时间: "本周五下午2点",
              院区地址: "总院（上海市静安区南京西路1266号）",
            };
            return `<span class="text-primary-600 font-medium">${
              map[key] || m
            }</span>`;
          })
          .split(/(<[^>]+>)/g)
          .map((part, j) => {
            if (part.startsWith("<")) {
              const match = part.match(
                /^<span class="([^"]+)">([^<]+)<\/span>$/
              );
              if (match) {
                return (
                  <span key={j} className={match[1]}>
                    {match[2]}
                  </span>
                );
              }
            }
            return <span key={j}>{part}</span>;
          })}
      </p>
    ));
  };

  const handleAdoptSuggestion = (id: string) => {
    if (activeScript && isQAOrManager) {
      adoptSuggestionToScript(id, activeScript.id);
    } else {
      updateScriptSuggestionStatus(id, "adopted");
    }
  };

  const handleRejectSuggestion = (id: string) => {
    updateScriptSuggestionStatus(id, "rejected");
  };

  return (
    <WindowFrame windowKey="follow-script" title="跟进脚本" iconName="FileText">
      <div className="h-full flex flex-col">
        {activeCustomer ? (
          <>
            <div className="p-4 border-b border-neutral-200 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <User size={18} />
                </div>
                <div>
                  <div className="font-semibold">{activeCustomer.name}</div>
                  <div className="text-xs text-white/70 font-mono">
                    {activeCustomer.phoneMasked}
                  </div>
                </div>
                <span
                  className={cn(
                    "ml-auto tag text-xs",
                    CHANNEL_COLORS[activeCustomer.channel]
                  )}
                >
                  {CHANNEL_LABELS[activeCustomer.channel]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/10 rounded-md p-2.5">
                  <div className="flex items-center gap-1 text-white/60 mb-1">
                    <Megaphone size={11} />
                    <span>广告来源</span>
                  </div>
                  <div className="text-white/90">{activeCustomer.sourceAd}</div>
                </div>
                <div className="bg-white/10 rounded-md p-2.5">
                  <div className="flex items-center gap-1 text-white/60 mb-1">
                    <Sparkles size={11} />
                    <span>意向项目</span>
                  </div>
                  <div className="text-white/90">
                    {activeCustomer.projectInterest.join("、")}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-3 py-2 border-b border-neutral-200 bg-amber-50 border-l-4 border-l-amber-400">
              <div className="flex items-start gap-2">
                <AlertTriangle
                  size={14}
                  className="text-amber-600 mt-0.5 flex-shrink-0"
                />
                <div className="text-xs text-amber-800">
                  <span className="font-medium">广告承诺提示：</span>
                  {activeCustomer.adPromise}
                  <br />
                  <span className="text-amber-700">
                    ⚠️ 请勿夸大效果、请勿承诺具体维持时间、请务必告知治疗风险
                  </span>
                </div>
              </div>
            </div>

            <div className="flex border-b border-neutral-200 bg-white overflow-x-auto">
              {stages.map((stage, i) => {
                const pendingCount = scriptSuggestions.filter(
                  (s) => s.stage === stage && s.status === "pending"
                ).length;
                return (
                  <button
                    key={stage}
                    onClick={() => setActiveStage(stage)}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all border-b-2 -mb-px relative",
                      activeStage === stage
                        ? "text-primary-600 border-primary-600 bg-primary-50/50"
                        : "text-neutral-500 border-transparent hover:text-neutral-700 hover:bg-neutral-50"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full text-[10px] flex items-center justify-center",
                        activeStage === stage
                          ? "bg-primary-600 text-white"
                          : "bg-neutral-200 text-neutral-500"
                      )}
                    >
                      {i + 1}
                    </span>
                    {SCRIPT_STAGE_LABELS[stage]}
                    {pendingCount > 0 && (
                      <span
                        className={cn(
                          "ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold",
                          activeStage === stage
                            ? "bg-rose-500 text-white"
                            : "bg-rose-100 text-rose-600"
                        )}
                      >
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-auto p-4">
              {activeScript && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Lightbulb size={14} className="text-primary-600" />
                      <span className="text-xs font-medium text-primary-700">
                        {activeScript.title}
                      </span>
                    </div>
                    <div className="card p-4 bg-gradient-to-br from-primary-50/50 to-white leading-relaxed text-sm">
                      {renderContent(activeScript.content)}
                    </div>
                  </div>

                  {activeScript.keywords.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-neutral-500 mb-2">
                        关键词要点
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeScript.keywords.map((kw) => (
                          <span
                            key={kw}
                            className="tag bg-primary-100 text-primary-700"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeScript.warnings.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-red-500 mb-2 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        合规警示
                      </div>
                      <div className="space-y-1.5">
                        {activeScript.warnings.map((w, i) => (
                          <div
                            key={i}
                            className="text-xs text-red-700 bg-red-50 rounded-md px-3 py-2"
                          >
                            {w}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeScript.adoptedContents.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-blue-600 mb-2 flex items-center gap-1">
                        <CheckCircle size={12} />
                        团队采纳建议
                        <span className="text-blue-400 font-normal ml-1">
                          （{activeScript.adoptedContents.length}条）
                        </span>
                      </div>
                      <div className="space-y-2.5">
                        {activeScript.adoptedContents.map((adopted) => (
                          <div
                            key={adopted.id}
                            className="card p-3 bg-gradient-to-br from-blue-50/60 to-white border-l-4 border-l-blue-400"
                          >
                            <div className="text-sm text-neutral-700 leading-relaxed mb-2">
                              {adopted.content}
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                              <span className="flex items-center gap-1">
                                <User size={10} />
                                {adopted.adoptedByName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {dayjs(adopted.adoptedAt).format("MM-DD HH:mm")}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                                已入脚本库
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-5">
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:from-amber-100 hover:to-orange-100 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <MessageSquarePlus size={14} className="text-amber-600" />
                    <span className="text-xs font-medium text-amber-800">
                      待采纳话术建议
                      <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                        {stageSuggestions.length}条
                      </span>
                      {totalPendingSuggestions !== stageSuggestions.length && (
                        <span className="ml-1 text-amber-600 font-normal">
                          （全库共{totalPendingSuggestions}条待处理）
                        </span>
                      )}
                    </span>
                  </div>
                  {showSuggestions ? (
                    <ChevronUp size={14} className="text-amber-600" />
                  ) : (
                    <ChevronDown size={14} className="text-amber-600" />
                  )}
                </button>

                {showSuggestions && (
                  <div className="mt-2.5 space-y-2.5">
                    {stageSuggestions.length > 0 ? (
                      stageSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="card p-3.5 border-l-4 border-l-amber-400 bg-gradient-to-br from-amber-50/40 to-white"
                        >
                          <div className="mb-2 text-sm text-neutral-700 leading-relaxed">
                            {suggestion.content}
                          </div>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                              {suggestion.employeeName && (
                                <span className="flex items-center gap-1">
                                  <User size={10} />
                                  {suggestion.employeeName}的通话
                                </span>
                              )}
                              {suggestion.customerName && (
                                <span>客户：{suggestion.customerName}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {dayjs(suggestion.createdAt).fromNow()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() =>
                                  handleAdoptSuggestion(suggestion.id)
                                }
                                className={cn(
                                  "px-2.5 py-1 rounded-md text-[11px] flex items-center gap-1 transition-colors border",
                                  isQAOrManager
                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                                    : "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200"
                                )}
                                title={isQAOrManager ? "采纳并追加到正式脚本草稿" : "仅个人标记采纳，不会修改正式脚本"}
                              >
                                <CheckCircle size={12} />
                                {isQAOrManager ? "采纳并入脚本库" : "采纳（仅个人）"}
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectSuggestion(suggestion.id)
                                }
                                className="px-2.5 py-1 rounded-md bg-neutral-50 text-neutral-600 hover:bg-neutral-100 text-[11px] flex items-center gap-1 transition-colors border border-neutral-200"
                              >
                                <XCircle size={12} />
                                忽略
                              </button>
                            </div>
                            {isQAOrManager && (
                              <div className="mt-1.5 text-[10px] text-emerald-600 bg-emerald-50 rounded px-2 py-0.5 inline-block">
                                💡 您的采纳将追加到正式脚本草稿，供全员参考
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-5 rounded-lg border border-dashed border-neutral-200 text-center">
                        <MessageSquarePlus
                          size={24}
                          className="mx-auto mb-2 text-neutral-300"
                        />
                        <div className="text-xs text-neutral-400">
                          暂无本阶段的待采纳建议
                        </div>
                        <div className="text-[10px] text-neutral-300 mt-1">
                          质检专员抽听后会同步话术优化建议
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {customerCalls.length > 0 && (
                <div className="mt-5">
                  <div className="text-xs font-medium text-neutral-500 mb-2 flex items-center gap-1">
                    <History size={12} />
                    历史沟通记录（{customerCalls.length}）
                  </div>
                  <div className="space-y-2">
                    {customerCalls.slice(0, 3).map((call) => (
                      <div key={call.id} className="card p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs text-neutral-500">
                            {dayjs(call.startTime).format("MM-DD HH:mm")} ·{" "}
                            {Math.floor(call.duration / 60)}分
                            {call.duration % 60}秒
                          </span>
                          <span
                            className={cn(
                              "tag text-[10px]",
                              call.result === "booked"
                                ? "bg-emerald-100 text-emerald-700"
                                : call.result === "considering"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-neutral-100 text-neutral-500"
                            )}
                          >
                            {call.result === "booked"
                              ? "已预约"
                              : call.result === "considering"
                              ? "考虑中"
                              : call.result === "rejected"
                              ? "拒绝"
                              : call.result === "no_answer"
                              ? "未接"
                              : "其他"}
                          </span>
                        </div>
                        {call.nextStep && (
                          <div className="text-xs text-neutral-600">
                            {call.nextStep}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-8">
            <Lightbulb
              size={48}
              strokeWidth={1}
              className="mb-3 opacity-40"
            />
            <div className="text-sm">选择客户后同步显示跟进脚本</div>
          </div>
        )}
      </div>
    </WindowFrame>
  );
}
