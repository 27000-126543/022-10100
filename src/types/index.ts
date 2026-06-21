export type Channel = "douyin" | "xiaohongshu" | "baidu" | "meituan" | "referral";

export type CustomerStatus = "new" | "following" | "booked" | "invalid";

export type CallResult =
  | "booked"
  | "considering"
  | "rejected"
  | "no_answer"
  | "no_need"
  | "off"
  | "invalid";

export type BookingStatus = "pending" | "confirmed" | "checked_in" | "cancelled";

export type Branch = "main" | "branch1" | "branch2";

export type ScriptStage = "opening" | "intro" | "objection" | "invitation" | "closing";

export type Role = "agent" | "qa" | "manager";

export type WindowKey =
  | "dial-panel"
  | "customer-pool"
  | "follow-script"
  | "qa-review"
  | "booking-ledger"
  | "performance";

export interface Customer {
  id: string;
  name: string;
  phoneMasked: string;
  channel: Channel;
  projectInterest: string[];
  sourceAd: string;
  adPromise: string;
  createTime: string;
  status: CustomerStatus;
  callCount: number;
  lastCallTime?: string;
  tags: string[];
  claimedBy?: string;
  age?: number;
  gender?: "female" | "male";
  city?: string;
  budget?: string;
}

export interface CallRecord {
  id: string;
  customerId: string;
  employeeId: string;
  customerName: string;
  startTime: string;
  duration: number;
  result: CallResult;
  rejectReason?: string;
  intentProjects?: string[];
  budgetRange?: string;
  preferredTime?: string;
  nextStep?: string;
  nextFollowTime?: string;
  recordingUrl?: string;
  qaReviewed?: boolean;
  qaScore?: number;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  phoneMasked: string;
  employeeId: string;
  employeeName: string;
  consultantId: string;
  consultantName: string;
  branch: Branch;
  bookingTime: string;
  project: string;
  notes: string;
  status: BookingStatus;
  checkinTime?: string;
  createTime: string;
}

export interface ScriptSuggestion {
  id: string;
  stage: ScriptStage;
  content: string;
  sourceQAReviewId?: string;
  sourceCallRecordId?: string;
  customerName?: string;
  employeeName?: string;
  status: "pending" | "adopted" | "rejected";
  createdAt: string;
}

export interface QAReviewItem {
  id: string;
  callRecordId: string;
  customerName: string;
  employeeName: string;
  employeeId: string;
  startTime: string;
  duration: number;
  score: number;
  dimensions: {
    exaggeration: number;
    riskDisclosure: number;
    attitude: number;
    compliance: number;
  };
  issues: string[];
  feedback: string;
  scriptSuggestion?: string;
  scriptSuggestionStage?: ScriptStage;
  reviewerId: string;
  reviewTime: string;
}

export interface Employee {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  department: string;
  stats?: {
    callsToday: number;
    connected: number;
    booked: number;
    conversionRate: number;
    qaAvgScore: number;
  };
}

export interface Script {
  id: string;
  stage: ScriptStage;
  title: string;
  content: string;
  keywords: string[];
  warnings: string[];
}

export interface WindowState {
  key: WindowKey;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface StatsData {
  totalLeads: number;
  called: number;
  connected: number;
  intent: number;
  booked: number;
  checkedIn: number;
  dailyTrend: { date: string; calls: number; booked: number }[];
  channelStats: { channel: string; count: number; rate: number }[];
  employeeRanking: Employee[];
}

export const CHANNEL_LABELS: Record<Channel, string> = {
  douyin: "抖音",
  xiaohongshu: "小红书",
  baidu: "百度",
  meituan: "美团",
  referral: "转介绍",
};

export const CHANNEL_COLORS: Record<Channel, string> = {
  douyin: "bg-neutral-900 text-white",
  xiaohongshu: "bg-red-500 text-white",
  baidu: "bg-blue-600 text-white",
  meituan: "bg-yellow-500 text-white",
  referral: "bg-primary-600 text-white",
};

export const CALL_RESULT_LABELS: Record<CallResult, string> = {
  booked: "已预约",
  considering: "考虑中",
  rejected: "拒接",
  no_answer: "无人接听",
  no_need: "无需求",
  off: "关机/停机",
  invalid: "空号/无效",
};

export const CALL_RESULT_COLORS: Record<CallResult, string> = {
  booked: "bg-emerald-100 text-emerald-700",
  considering: "bg-amber-100 text-amber-700",
  rejected: "bg-rose-100 text-rose-700",
  no_answer: "bg-slate-100 text-slate-600",
  no_need: "bg-slate-100 text-slate-600",
  off: "bg-slate-100 text-slate-600",
  invalid: "bg-slate-100 text-slate-600",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "待确认",
  confirmed: "已确认",
  checked_in: "已到店",
  cancelled: "已取消",
};

export const BRANCH_LABELS: Record<Branch, string> = {
  main: "总院",
  branch1: "浦东分院",
  branch2: "徐汇分院",
};

export const SCRIPT_STAGE_LABELS: Record<ScriptStage, string> = {
  opening: "开场白",
  intro: "项目介绍",
  objection: "异议处理",
  invitation: "邀约到店",
  closing: "收尾确认",
};

export const PROJECT_OPTIONS = [
  "玻尿酸填充",
  "肉毒素除皱",
  "热玛吉",
  "超声炮",
  "光子嫩肤",
  "皮秒祛斑",
  "双眼皮",
  "隆鼻",
  "吸脂塑形",
  "自体脂肪填充",
  "线雕提升",
  "水光针",
];

export const BUDGET_OPTIONS = ["5000以下", "5000-1万", "1-3万", "3-5万", "5万以上"];

export const REJECT_REASONS = [
  "价格太贵",
  "距离太远",
  "时间不合适",
  "需要再考虑",
  "家人不同意",
  "已在其他机构做过",
  "不信任效果",
  "害怕疼痛/风险",
];
