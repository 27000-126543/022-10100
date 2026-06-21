import dayjs from "dayjs";
import type {
  Customer,
  CallRecord,
  Booking,
  Employee,
  Script,
  QAReviewItem,
  Channel,
} from "../types";

const channels: Channel[] = ["douyin", "xiaohongshu", "baidu", "meituan", "referral"];

const customerNames = [
  "王女士", "李女士", "张女士", "刘女士", "陈女士", "杨女士", "赵女士", "黄女士",
  "周女士", "吴女士", "徐女士", "孙女士", "胡女士", "朱女士", "高女士", "林女士",
  "何女士", "郭女士", "马女士", "罗女士", "梁女士", "宋女士", "郑女士", "谢女士",
];

const adCopies = [
  "暑期祛斑特惠，皮秒低至1999",
  "热玛吉五代，抗衰紧致首选",
  "玻尿酸买一送一，填充塑形",
  "超声炮全面部，提拉紧致",
  "双眼皮微创，7天恢复自然",
  "隆鼻综合，打造立体五官",
  "光子嫩肤年卡，全年不限次",
  "吸脂塑形，夏季享瘦计划",
];

const adPromises = [
  "承诺一次见效，无恢复期",
  "签约保障效果，无效退款",
  "专家一对一设计方案",
  "进口材料，安全放心",
  "全程无痛，舒适体验",
];

const tagPool = ["高意向", "已咨询过", "老客户推荐", "预算充足", "时间灵活", "外地客户", "首次咨询", "对比多家"];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhoneMasked(): string {
  const prefix = ["138", "139", "150", "151", "158", "159", "186", "187", "188", "189"];
  const p = randomItem(prefix);
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();
  return `${p}****${suffix}`;
}

export function generateMockCustomers(count: number): Customer[] {
  const projects = [
    "玻尿酸填充", "肉毒素除皱", "热玛吉", "超声炮", "光子嫩肤",
    "皮秒祛斑", "双眼皮", "隆鼻", "吸脂塑形", "水光针",
  ];

  const statuses: Customer["status"][] = ["new", "new", "new", "following", "following", "booked", "invalid"];

  return Array.from({ length: count }, (_, i) => {
    const projectCount = Math.floor(Math.random() * 2) + 1;
    const selectedProjects: string[] = [];
    while (selectedProjects.length < projectCount) {
      const p = randomItem(projects);
      if (!selectedProjects.includes(p)) selectedProjects.push(p);
    }

    const tagCount = Math.floor(Math.random() * 3);
    const tags: string[] = [];
    while (tags.length < tagCount) {
      const t = randomItem(tagPool);
      if (!tags.includes(t)) tags.push(t);
    }

    const callCount = Math.floor(Math.random() * 4);
    const createMinutesAgo = Math.floor(Math.random() * 60 * 24 * 3);

    return {
      id: `cust_${i + 1}`,
      name: randomItem(customerNames),
      phoneMasked: randomPhoneMasked(),
      channel: randomItem(channels),
      projectInterest: selectedProjects,
      sourceAd: randomItem(adCopies),
      adPromise: randomItem(adPromises),
      createTime: dayjs().subtract(createMinutesAgo, "minute").toISOString(),
      status: randomItem(statuses),
      callCount,
      lastCallTime: callCount > 0 ? dayjs().subtract(Math.floor(Math.random() * 60 * 24), "minute").toISOString() : undefined,
      tags,
      claimedBy: i < 30 ? "emp_1" : undefined,
      age: 20 + Math.floor(Math.random() * 35),
      gender: Math.random() > 0.1 ? "female" : "male",
      city: randomItem(["上海", "北京", "广州", "深圳", "杭州", "南京", "苏州"]),
    };
  });
}

export function generateMockCallRecords(customers: Customer[], employees: Employee[]): CallRecord[] {
  const results: CallRecord["result"][] = [
    "booked", "considering", "considering", "rejected", "no_answer", "no_need", "off",
  ];

  const records: CallRecord[] = [];
  let id = 1;

  customers.slice(0, 40).forEach((customer) => {
    const callCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < callCount; i++) {
      const result = randomItem(results);
      const emp = randomItem(employees.filter((e) => e.role === "agent"));
      const minutesAgo = Math.floor(Math.random() * 60 * 12);

      records.push({
        id: `call_${id++}`,
        customerId: customer.id,
        customerName: customer.name,
        employeeId: emp.id,
        startTime: dayjs().subtract(minutesAgo, "minute").toISOString(),
        duration: 30 + Math.floor(Math.random() * 300),
        result,
        rejectReason: result === "rejected" || result === "no_need"
          ? randomItem(["价格太贵", "距离太远", "需要再考虑", "家人不同意"])
          : undefined,
        intentProjects: result === "booked" || result === "considering" ? customer.projectInterest : undefined,
        budgetRange: result === "booked" || result === "considering"
          ? randomItem(["5000以下", "5000-1万", "1-3万", "3-5万"])
          : undefined,
        nextStep: result === "considering" ? "明天下午再次跟进" : undefined,
        nextFollowTime: result === "considering"
          ? dayjs().add(1, "day").hour(15).minute(0).toISOString()
          : undefined,
        recordingUrl: "#",
        qaReviewed: Math.random() > 0.5,
        qaScore: Math.random() > 0.5 ? 70 + Math.floor(Math.random() * 30) : undefined,
      });
    }
  });

  return records.sort((a, b) => b.startTime.localeCompare(a.startTime));
}

export function generateMockBookings(customers: Customer[], employees: Employee[]): Booking[] {
  const consultants = employees.filter((e) => e.role === "agent");
  const bookedCustomers = customers.slice(0, 12);

  return bookedCustomers.map((customer, i) => {
    const emp = randomItem(employees.filter((e) => e.role === "agent"));
    const consultant = randomItem(consultants);
    const daysLater = Math.floor(Math.random() * 7);
    const hours = 9 + Math.floor(Math.random() * 9);

    return {
      id: `bk_${i + 1}`,
      customerId: customer.id,
      customerName: customer.name,
      phoneMasked: customer.phoneMasked,
      employeeId: emp.id,
      employeeName: emp.name,
      consultantId: consultant.id,
      consultantName: consultant.name,
      branch: randomItem(["main", "branch1", "branch2"]),
      bookingTime: dayjs().add(daysLater, "day").hour(hours).minute(0).toISOString(),
      project: customer.projectInterest[0],
      notes: randomItem([
        "客户对疼痛比较敏感，建议术前敷麻药",
        "客户是朋友推荐来的，期望较高",
        "客户下午时间较方便",
        "首次到店，需要详细介绍流程",
        "客户要求指定李医生操作",
      ]),
      status: randomItem(["pending", "confirmed", "confirmed", "checked_in"]),
      checkinTime: i < 3 ? dayjs().subtract(daysLater, "day").hour(hours).minute(15).toISOString() : undefined,
      createTime: dayjs().subtract(1 + Math.floor(Math.random() * 5), "day").toISOString(),
    };
  });
}

export const mockEmployees: Employee[] = [
  {
    id: "emp_1",
    name: "陈美玲",
    role: "agent",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=chenmeiling",
    department: "客服一组",
    stats: { callsToday: 42, connected: 28, booked: 6, conversionRate: 21.4, qaAvgScore: 92 },
  },
  {
    id: "emp_2",
    name: "王丽娜",
    role: "agent",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=wanglina",
    department: "客服一组",
    stats: { callsToday: 38, connected: 25, booked: 5, conversionRate: 20.0, qaAvgScore: 88 },
  },
  {
    id: "emp_3",
    name: "张晓雯",
    role: "agent",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangxiaowen",
    department: "客服二组",
    stats: { callsToday: 45, connected: 30, booked: 8, conversionRate: 26.7, qaAvgScore: 95 },
  },
  {
    id: "emp_4",
    name: "刘思琪",
    role: "agent",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=liusiqi",
    department: "客服二组",
    stats: { callsToday: 35, connected: 20, booked: 3, conversionRate: 15.0, qaAvgScore: 78 },
  },
  {
    id: "emp_5",
    name: "赵雅婷",
    role: "agent",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhaoyating",
    department: "电销组",
    stats: { callsToday: 52, connected: 35, booked: 7, conversionRate: 20.0, qaAvgScore: 85 },
  },
  {
    id: "emp_6",
    name: "孙雨萱",
    role: "agent",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sunyuxuan",
    department: "电销组",
    stats: { callsToday: 48, connected: 32, booked: 5, conversionRate: 15.6, qaAvgScore: 80 },
  },
  {
    id: "qa_1",
    name: "质检主管-林芳",
    role: "qa",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=linfang",
    department: "质检部",
  },
  {
    id: "mgr_1",
    name: "运营总监-周明",
    role: "manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zhouming",
    department: "运营部",
  },
];

export const mockScripts: Script[] = [
  {
    id: "s1",
    stage: "opening",
    title: "标准开场白",
    content: "您好，请问是{姓名}吗？我是XX医美客服中心的{我的名字}，打扰您两分钟时间可以吗？\n\n看到您之前在我们平台上咨询过{项目}的相关信息，特意给您回电介绍一下最新的活动方案。",
    keywords: ["自我介绍", "确认身份", "说明来意"],
    warnings: ["不要直接开始推销，先确认客户是否方便通话", "语速适中，不要过快"],
  },
  {
    id: "s2",
    stage: "opening",
    title: "转介绍开场白",
    content: "您好{姓名}，我是XX医美的{我的名字}，是{推荐人}推荐您的联系方式的。\n\n她说您近期有了解{项目}的打算，所以想给您详细介绍一下我们医院的方案和近期优惠。",
    keywords: ["提及推荐人", "建立信任", "说明来意"],
    warnings: ["确认推荐人信息是否正确", "不要泄露推荐人隐私"],
  },
  {
    id: "s3",
    stage: "intro",
    title: "热玛吉项目介绍",
    content: "热玛吉是目前抗衰领域非常成熟的项目，主要通过射频能量刺激胶原蛋白再生。\n\n我们医院用的是最新五代设备，有FDA和NMPA双认证。治疗前会敷表麻，全程舒适度很好。一般一次治疗可以维持1-2年，做完当时就能看到20%左右的效果，最佳效果在3个月后呈现。\n\n现在有暑期特惠，全面部送颈部，价格比平时优惠3000多。",
    keywords: ["设备认证", "效果说明", "维持时间", "优惠活动"],
    warnings: ["⚠️ 禁止承诺\"100%有效果\"", "⚠️ 禁止说\"完全无痛\"，应说\"舒适度良好\"", "⚠️ 需提及治疗后注意事项"],
  },
  {
    id: "s4",
    stage: "intro",
    title: "玻尿酸项目介绍",
    content: "玻尿酸填充是非常受欢迎的微整项目，我们医院全部使用进口正品材料，支持扫码验真。\n\n不同部位适合的分子大小不同，比如太阳穴和苹果肌适合中分子，唇部和泪沟适合小分子。医生会根据您的面部情况进行个性化设计。\n\n现在活动是买二送一，相当于6.7折，非常划算。",
    keywords: ["正品保障", "分子选择", "个性化设计", "优惠力度"],
    warnings: ["⚠️ 禁止承诺\"永久维持\"，一般维持6-18个月", "⚠️ 需提及可能的不良反应：红肿、淤青等", "⚠️ 强调是正规医生操作"],
  },
  {
    id: "s5",
    stage: "objection",
    title: "处理价格异议",
    content: "我理解您的顾虑，确实医美项目的费用不算低。不过您可以这样考虑：\n1. 我们的设备和材料都是正规渠道，有认证保障，安全是第一位的\n2. 医生都是有10年以上经验的，效果和安全都有保障\n3. 现在的活动价比平时优惠了近30%，全年力度最大\n\n而且我们支持分期付款，最低0首付，这样压力也会小很多。",
    keywords: ["价值塑造", "安全保障", "优惠说明", "分期方案"],
    warnings: ["不要贬低同行", "不要说\"我们最便宜\"，要说\"性价比最高\""],
  },
  {
    id: "s6",
    stage: "objection",
    title: "处理\"再考虑一下\"",
    content: "好的，完全理解您的心情。医美项目确实需要慎重考虑。\n\n方便问一下您主要担心哪方面吗？是效果、价格、还是恢复期的问题？我可以给您更详细的解答。\n\n另外近期活动本周末就结束了，如果您本周内预约还能享受优惠价，名额有限。您看要不要先帮您预留一个优惠名额？",
    keywords: ["了解顾虑", "针对性解答", "制造稀缺性", "预留名额"],
    warnings: ["不要催促客户，保持耐心", "不要说\"您还犹豫什么\"，容易引起反感"],
  },
  {
    id: "s7",
    stage: "invitation",
    title: "邀约到店话术",
    content: "这样吧，光电话里说可能不够直观，您方便的话可以来院里面诊一下。\n\n我们有免费的皮肤检测和专家面诊服务，医生会根据您的实际情况给出具体方案和报价，您了解清楚后再决定也不迟。\n\n您看这周末还是下周三比较方便？我帮您预约好时间，到店还有精美礼品赠送哦。",
    keywords: ["免费服务", "专家面诊", "时间二选一", "到店礼"],
    warnings: ["不要强制邀约，给客户选择权", "说明面诊是免费的，打消顾虑"],
  },
  {
    id: "s8",
    stage: "closing",
    title: "通话收尾确认",
    content: "好的，那我帮您预约了{时间}来院面诊，地址是{院区地址}，稍后我会把详细地址和预约信息发到您的手机上。\n\n到店后报您的手机号就可以了，如果临时有事记得提前跟我说，我帮您改期。\n\n感谢您的信任，期待您的光临，再见！",
    keywords: ["重复确认", "发送信息", "改期说明", "礼貌告别"],
    warnings: ["确认客户收到短信后再结束", "不要忘记礼貌告别"],
  },
];

export function generateMockQAReviews(callRecords: CallRecord[]): QAReviewItem[] {
  const reviewedCalls = callRecords.filter((c) => c.qaReviewed).slice(0, 10);

  return reviewedCalls.map((call, i) => {
    const exaggeration = 70 + Math.floor(Math.random() * 30);
    const riskDisclosure = 65 + Math.floor(Math.random() * 35);
    const attitude = 80 + Math.floor(Math.random() * 20);
    const compliance = 75 + Math.floor(Math.random() * 25);
    const score = Math.round((exaggeration + riskDisclosure + attitude + compliance) / 4);

    const issuePool = [
      "未告知治疗风险",
      "夸大治疗效果",
      "承诺具体维持时间",
      "语速过快",
      "未确认客户方便接听",
      "未使用标准开场白",
      "未主动提及优惠活动",
      "未进行到店邀约",
    ];

    const issues: string[] = [];
    const issueCount = Math.floor(Math.random() * 3);
    while (issues.length < issueCount) {
      const iss = randomItem(issuePool);
      if (!issues.includes(iss)) issues.push(iss);
    }

    return {
      id: `qa_${i + 1}`,
      callRecordId: call.id,
      customerName: call.customerName,
      employeeId: call.employeeId,
      employeeName: mockEmployees.find((e) => e.id === call.employeeId)?.name || "未知",
      startTime: call.startTime,
      duration: call.duration,
      score,
      dimensions: { exaggeration, riskDisclosure, attitude, compliance },
      issues,
      feedback: issues.length > 0
        ? "通话整体流程较完整，但存在上述问题，特别是风险告知环节需要加强。建议加强话术培训。"
        : "通话流程规范，话术标准，服务态度良好，继续保持。",
      scriptSuggestion: score < 85 ? "建议在风险披露部分增加标准化话术提醒" : undefined,
      reviewerId: "qa_1",
      reviewTime: dayjs().subtract(Math.floor(Math.random() * 60 * 24), "minute").toISOString(),
    };
  });
}

export function generateDailyTrend() {
  return Array.from({ length: 14 }, (_, i) => ({
    date: dayjs().subtract(13 - i, "day").format("MM-DD"),
    calls: 80 + Math.floor(Math.random() * 60),
    booked: 8 + Math.floor(Math.random() * 10),
  }));
}

export function generateChannelStats() {
  const channelNames: Record<Channel, string> = {
    douyin: "抖音",
    xiaohongshu: "小红书",
    baidu: "百度",
    meituan: "美团",
    referral: "转介绍",
  };

  return channels.map((ch) => ({
    channel: channelNames[ch],
    count: 30 + Math.floor(Math.random() * 120),
    rate: 10 + Math.random() * 20,
  }));
}
