import { create } from "zustand";
import type {
  Customer,
  CallRecord,
  Booking,
  QAReviewItem,
  Employee,
  Script,
  ScriptSuggestion,
  WindowState,
  WindowKey,
  CallResult,
  Channel,
  StatsData,
  ScriptStage,
} from "../types";
import {
  generateMockCustomers,
  generateMockCallRecords,
  generateMockBookings,
  generateMockQAReviews,
  mockEmployees,
  mockScripts,
  generateDailyTrend,
  generateChannelStats,
} from "../data/mockData";

interface AppState {
  currentUser: Employee;
  customers: Customer[];
  callRecords: CallRecord[];
  bookings: Booking[];
  qaReviews: QAReviewItem[];
  employees: Employee[];
  scripts: Script[];
  scriptSuggestions: ScriptSuggestion[];
  windows: WindowState[];
  activeCustomerId: string | null;
  activeCallId: string | null;
  isOnCall: boolean;
  callDuration: number;

  stats: StatsData;

  setActiveCustomer: (id: string | null) => void;
  startCall: (customerId: string) => void;
  endCall: () => void;
  incrementCallDuration: () => void;
  saveCallResult: (data: Partial<CallRecord>) => void;

  claimCustomers: (customerIds: string[]) => void;
  releaseCustomer: (customerId: string) => void;
  markCustomerInvalid: (customerId: string) => void;

  createBooking: (data: Partial<Booking>) => void;
  updateBookingStatus: (id: string, status: Booking["status"]) => void;

  addQAReview: (review: QAReviewItem) => void;

  addScriptSuggestion: (
    data: Omit<ScriptSuggestion, "id" | "status" | "createdAt"> & {
      status?: ScriptSuggestion["status"];
    }
  ) => void;
  updateScriptSuggestionStatus: (
    id: string,
    status: ScriptSuggestion["status"]
  ) => void;

  openWindow: (key: WindowKey) => void;
  closeWindow: (key: WindowKey) => void;
  minimizeWindow: (key: WindowKey) => void;
  focusWindow: (key: WindowKey) => void;
  updateWindowPosition: (key: WindowKey, x: number, y: number) => void;
}

const initialWindows: WindowState[] = [
  { key: "customer-pool", title: "客户池", icon: "Users", isOpen: true, isMinimized: false, zIndex: 1, position: { x: 40, y: 80 }, size: { width: 820, height: 560 } },
  { key: "dial-panel", title: "拨打面板", icon: "Phone", isOpen: true, isMinimized: false, zIndex: 2, position: { x: 900, y: 80 }, size: { width: 520, height: 560 } },
  { key: "follow-script", title: "跟进脚本", icon: "FileText", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 880, y: 80 }, size: { width: 480, height: 520 } },
  { key: "qa-review", title: "质检抽听", icon: "Headphones", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 120, y: 100 }, size: { width: 880, height: 600 } },
  { key: "booking-ledger", title: "预约台账", icon: "CalendarDays", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 200, y: 100 }, size: { width: 900, height: 580 } },
  { key: "performance", title: "绩效统计", icon: "BarChart3", isOpen: false, isMinimized: false, zIndex: 1, position: { x: 160, y: 80 }, size: { width: 960, height: 620 } },
];

const initialCustomers = generateMockCustomers(120);
const initialCalls = generateMockCallRecords(initialCustomers, mockEmployees);
const initialBookings = generateMockBookings(initialCustomers, mockEmployees);
const initialQAReviews = generateMockQAReviews(initialCalls);

const initialScriptSuggestions: ScriptSuggestion[] = [
  {
    id: "suggestion_1",
    stage: "objection",
    content: "客户问热玛吉会不会反弹，建议回复：热玛吉是通过射频能量刺激胶原蛋白新生，效果是渐进式的，维持1-2年，配合日常保养能延长效果，不会突然反弹哦。",
    sourceQAReviewId: "qa_1",
    sourceCallRecordId: initialCalls[0]?.id,
    customerName: initialCustomers[0]?.name,
    employeeName: mockEmployees[0]?.name,
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "suggestion_2",
    stage: "intro",
    content: "介绍玻尿酸时，可以先问客户最在意的部位，针对性地推荐产品，比如想丰唇用乔雅登极致，填法令纹用瑞蓝2号，这样更专业。",
    sourceQAReviewId: "qa_2",
    sourceCallRecordId: initialCalls[1]?.id,
    customerName: initialCustomers[1]?.name,
    employeeName: mockEmployees[1]?.name,
    status: "pending",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockEmployees[0],
  customers: initialCustomers,
  callRecords: initialCalls,
  bookings: initialBookings,
  qaReviews: initialQAReviews,
  employees: mockEmployees,
  scripts: mockScripts,
  scriptSuggestions: initialScriptSuggestions,
  windows: initialWindows,
  activeCustomerId: initialCustomers[2]?.id ?? null,
  activeCallId: null,
  isOnCall: false,
  callDuration: 0,

  stats: {
    totalLeads: 120,
    called: 85,
    connected: 52,
    intent: 28,
    booked: 12,
    checkedIn: 6,
    dailyTrend: generateDailyTrend(),
    channelStats: generateChannelStats(),
    employeeRanking: mockEmployees.filter((e) => e.role === "agent"),
  },

  setActiveCustomer: (id) => set({ activeCustomerId: id }),

  startCall: (customerId) => {
    const customer = get().customers.find((c) => c.id === customerId);
    const employee = get().currentUser;
    const newCall: CallRecord = {
      id: `call_${Date.now()}`,
      customerId,
      customerName: customer?.name ?? "",
      employeeId: employee.id,
      startTime: new Date().toISOString(),
      duration: 0,
      result: "no_answer",
    };
    set({
      isOnCall: true,
      callDuration: 0,
      activeCallId: newCall.id,
      callRecords: [newCall, ...get().callRecords],
    });
  },

  endCall: () => {
    const { activeCallId, callDuration, callRecords } = get();
    if (!activeCallId) return;
    set({
      isOnCall: false,
      callRecords: callRecords.map((c) =>
        c.id === activeCallId ? { ...c, duration: callDuration } : c
      ),
    });
  },

  incrementCallDuration: () => set((s) => ({ callDuration: s.callDuration + 1 })),

  saveCallResult: (data) => {
    const { activeCallId, callRecords, customers, activeCustomerId } = get();
    if (!activeCallId) return;

    const updatedRecords = callRecords.map((c) =>
      c.id === activeCallId ? { ...c, ...data } : c
    );

    let updatedCustomers = customers;
    if (activeCustomerId && data.result) {
      const resultMap: Record<CallResult, Customer["status"]> = {
        booked: "booked",
        considering: "following",
        rejected: "following",
        no_answer: "following",
        no_need: "following",
        off: "following",
        invalid: "invalid",
      };
      updatedCustomers = customers.map((c) =>
        c.id === activeCustomerId
          ? {
              ...c,
              status: resultMap[data.result as CallResult] ?? c.status,
              callCount: c.callCount + 1,
              lastCallTime: new Date().toISOString(),
            }
          : c
      );
    }

    set({
      callRecords: updatedRecords,
      customers: updatedCustomers,
      activeCallId: null,
      callDuration: 0,
    });
  },

  claimCustomers: (customerIds) => {
    const employee = get().currentUser;
    set((state) => ({
      customers: state.customers.map((c) =>
        customerIds.includes(c.id) ? { ...c, claimedBy: employee.id } : c
      ),
    }));
  },

  releaseCustomer: (customerId) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId ? { ...c, claimedBy: undefined } : c
      ),
    }));
  },

  markCustomerInvalid: (customerId) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId ? { ...c, status: "invalid" } : c
      ),
    }));
  },

  createBooking: (data) => {
    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      customerId: "",
      customerName: "",
      phoneMasked: "",
      employeeId: "",
      employeeName: "",
      consultantId: "",
      consultantName: "",
      branch: "main",
      bookingTime: new Date().toISOString(),
      project: "",
      notes: "",
      status: "pending",
      createTime: new Date().toISOString(),
      ...data,
    } as Booking;
    set((state) => ({ bookings: [newBooking, ...state.bookings] }));
  },

  updateBookingStatus: (id, status) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id
          ? {
              ...b,
              status,
              checkinTime: status === "checked_in" ? new Date().toISOString() : b.checkinTime,
            }
          : b
      ),
    }));
  },

  addQAReview: (review) => {
    set((state) => ({
      qaReviews: [review, ...state.qaReviews],
      callRecords: state.callRecords.map((c) =>
        c.id === review.callRecordId
          ? { ...c, qaReviewed: true, qaScore: review.score }
          : c
      ),
    }));
    if (review.scriptSuggestion && review.scriptSuggestionStage) {
      get().addScriptSuggestion({
        stage: review.scriptSuggestionStage,
        content: review.scriptSuggestion,
        sourceQAReviewId: review.id,
        sourceCallRecordId: review.callRecordId,
        customerName: review.customerName,
        employeeName: review.employeeName,
      });
    }
  },

  addScriptSuggestion: (data) => {
    const newSuggestion: ScriptSuggestion = {
      id: `suggestion_${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      ...data,
    };
    set((state) => ({
      scriptSuggestions: [newSuggestion, ...state.scriptSuggestions],
    }));
  },

  updateScriptSuggestionStatus: (id, status) => {
    set((state) => ({
      scriptSuggestions: state.scriptSuggestions.map((s) =>
        s.id === id ? { ...s, status } : s
      ),
    }));
  },

  openWindow: (key) => {
    set((state) => {
      const maxZ = Math.max(...state.windows.map((w) => w.zIndex), 0);
      return {
        windows: state.windows.map((w) =>
          w.key === key ? { ...w, isOpen: true, isMinimized: false, zIndex: maxZ + 1 } : w
        ),
      };
    });
  },

  closeWindow: (key) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.key === key ? { ...w, isOpen: false, isMinimized: false } : w
      ),
    }));
  },

  minimizeWindow: (key) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.key === key ? { ...w, isMinimized: true } : w
      ),
    }));
  },

  focusWindow: (key) => {
    set((state) => {
      const maxZ = Math.max(...state.windows.map((w) => w.zIndex), 0);
      return {
        windows: state.windows.map((w) =>
          w.key === key ? { ...w, isMinimized: false, zIndex: maxZ + 1 } : w
        ),
      };
    });
  },

  updateWindowPosition: (key, x, y) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.key === key ? { ...w, position: { x, y } } : w
      ),
    }));
  },
}));

export function useFilteredCustomers(filters: {
  channels?: Channel[];
  status?: Customer["status"][];
  keyword?: string;
  onlyMyClaimed?: boolean;
  projects?: string[];
}) {
  const allCustomers = useAppStore((s) => s.customers);
  const currentUser = useAppStore((s) => s.currentUser);

  return allCustomers.filter((c) => {
    if (filters.channels && filters.channels.length > 0 && !filters.channels.includes(c.channel)) {
      return false;
    }
    if (filters.status && filters.status.length > 0 && !filters.status.includes(c.status)) {
      return false;
    }
    if (filters.projects && filters.projects.length > 0) {
      const hasMatch = c.projectInterest.some((p) => filters.projects!.includes(p));
      if (!hasMatch) return false;
    }
    if (filters.keyword && filters.keyword.trim()) {
      const kw = filters.keyword.trim().toLowerCase();
      if (!c.name.toLowerCase().includes(kw) && !c.phoneMasked.includes(kw)) {
        return false;
      }
    }
    if (filters.onlyMyClaimed && c.claimedBy !== currentUser.id) {
      return false;
    }
    return true;
  });
}
