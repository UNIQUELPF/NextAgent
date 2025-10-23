export type ProcessSlug =
  | "trademark-register"
  | "trademark-change"
  | "trademark-transfer"
  | "trademark-cancel"
  | "copyright"
  | "patent";

export type ProcessSummary = {
  slug: ProcessSlug;
  label: string;
  description: string;
  highlight: string;
};

export type MetricCard = {
  title: string;
  value: string;
  trend: string;
};

export type WorkflowStage = {
  title: string;
  status: "完成" | "进行中" | "排队" | "待启动";
  owner: string;
  eta: string;
  description: string;
};

export type CaseItem = {
  name: string;
  category: string;
  process: string;
  owner: string;
  deadline: string;
  status: "待提交" | "审核中" | "待补正" | "公告中" | "已核准";
};

export type MaterialTemplate = {
  title: string;
  description: string;
  action: string;
  type: "agent" | "upload" | "external";
};

export type AlertItem = {
  title: string;
  due: string;
  type: "补正期限" | "公告期" | "续展提醒";
  detail: string;
};

export type InsightItem = {
  title: string;
  timestamp: string;
  summary: string;
  link?: string;
};

export type ProcessConfig = {
  heroTitle: string;
  heroDescription: string;
  metrics: MetricCard[];
  workflow: WorkflowStage[];
  cases: CaseItem[];
  materials: MaterialTemplate[];
  alerts: AlertItem[];
  insights: InsightItem[];
};

export const PROCESS_LIST: ProcessSummary[] = [
  {
    slug: "trademark-register",
    label: "商标注册",
    description: "国内注册、国际马德里线上申报、批量续展。",
    highlight: "今日待提交 6 件",
  },
  {
    slug: "trademark-change",
    label: "商标变更",
    description: "名称、地址、代理变更与信息补正。",
    highlight: "常见驳回点自动提示",
  },
  {
    slug: "trademark-transfer",
    label: "商标转让",
    description: "转让协议、公证材料生成与交接提醒。",
    highlight: "新转让申请 3 件",
  },
  {
    slug: "trademark-cancel",
    label: "商标注销",
    description: "撤销、放弃、注销流程与风险提示。",
    highlight: "公告期 2 件",
  },
  {
    slug: "copyright",
    label: "版权登记",
    description: "作品登记、著作权合同备案、补证。",
    highlight: "关联著作权 12 件",
  },
  {
    slug: "patent",
    label: "专利申请",
    description: "发明、实用新型、外观设计全流程管理。",
    highlight: "年费提醒 5 起",
  },
];

export const PROCESS_CONFIG: Record<ProcessSlug, ProcessConfig> = {
  "trademark-register": {
    heroTitle: "商标注册自动化中心",
    heroDescription:
      "覆盖国内注册与马德里国际申请，提供近似检索、材料生成、流程追踪及公告提醒。",
    metrics: [
      { title: "本周提交", value: "32", trend: "国内 24 / 国际 8" },
      { title: "驳回率", value: "3.5%", trend: "低于行业均值 2.1%" },
      { title: "平均周期", value: "6.4 个月", trend: "缩短 0.6 个月" },
    ],
    workflow: [
      {
        title: "近似检索与风险评估",
        status: "完成",
        owner: "智能检索",
        eta: "今日 09:20",
        description:
          "对接国家知识产权局数据库，输出近似分值与风险建议。",
      },
      {
        title: "申请材料生成",
        status: "进行中",
        owner: "材料中心",
        eta: "今日 15:00",
        description:
          "自动填充申请书、委托书、受让证明，并支持批量导出。",
      },
      {
        title: "客户确认与签章",
        status: "排队",
        owner: "客户经理",
        eta: "明日 10:00",
        description:
          "跟进客户签署委托书与声明，系统自动提醒缺失页。",
      },
      {
        title: "提交与回执跟踪",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 18:00",
        description:
          "自动提交至商标网上服务大厅，抓取回执与申请号。",
      },
    ],
    cases: [
      {
        name: "企标邦 QIBIAO BANG",
        category: "第 35 类",
        process: "国内注册",
        owner: "赵倩",
        deadline: "11-20",
        status: "待补正",
      },
      {
        name: "NOVA AI",
        category: "第 9 类",
        process: "马德里申请",
        owner: "韩磊",
        deadline: "11-22",
        status: "审核中",
      },
      {
        name: "星瀚物流",
        category: "第 39 类",
        process: "国内注册",
        owner: "李俊",
        deadline: "11-18",
        status: "待提交",
      },
      {
        name: "Miracle Seal",
        category: "第 3 类",
        process: "马德里续展",
        owner: "宋宁",
        deadline: "11-25",
        status: "公告中",
      },
    ],
    materials: [
      {
        title: "商标注册申请书",
        description: "自动填充申请人信息、商品服务项目与代理授权。",
        action: "AI 生成申请书",
        type: "agent",
      },
      {
        title: "近似检索报告",
        description: "生成检索词、相似度评分与风险建议。",
        action: "生成风险报告",
        type: "agent",
      },
      {
        title: "委托代理协议",
        description: "支持批量生成并导出 PDF 供客户签署。",
        action: "导出模板",
        type: "upload",
      },
    ],
    alerts: [
      {
        title: "企标邦 QIBIAO BANG 补正截止",
        due: "11-21",
        type: "补正期限",
        detail: "需补充主营业务说明与代理授权。",
      },
      {
        title: "Miracle Seal 公告期即将结束",
        due: "11-27",
        type: "公告期",
        detail: "建议关注异议提交情况，保持客户沟通。",
      },
      {
        title: "NOVA AI 国际续展提醒",
        due: "12-05",
        type: "续展提醒",
        detail: "提前准备多国费用与翻译材料。",
      },
    ],
    insights: [
      {
        title: "国家知识产权局发布商标注册审查指南（更新版）",
        timestamp: "今日 09:40",
        summary:
          "添加新业态商标描述示例，系统已同步关键词库，建议执行新模板。",
      },
      {
        title: "热门近似案例：AI+通用词组合风险",
        timestamp: "昨日 17:10",
        summary:
          "近三个月内涉及 AI + Common Word 的驳回率 12.4%，建议增加显著性说明。",
      },
    ],
  },
  "trademark-change": {
    heroTitle: "商标变更与信息维护中心",
    heroDescription:
      "处理名称、地址、代理变更与信息补正，自动校验一致性、生成授权材料并追踪审批。",
    metrics: [
      { title: "本月变更", value: "21", trend: "名称 9 / 地址 12" },
      { title: "驳回率", value: "1.8%", trend: "敏感字段自动校验" },
      { title: "平均处理时长", value: "18 天", trend: "较上月缩短 4 天" },
    ],
    workflow: [
      {
        title: "变更信息采集",
        status: "完成",
        owner: "流程机器人",
        eta: "今日 08:50",
        description: "同步工商数据，自动校验主体与地址格式。",
      },
      {
        title: "材料编制",
        status: "进行中",
        owner: "材料中心",
        eta: "今日 13:00",
        description: "生成变更申请书、主体资格证明、代理委托书。",
      },
      {
        title: "客户确认与签章",
        status: "排队",
        owner: "客户经理",
        eta: "今日 17:30",
        description: "提醒客户确认营业执照与签章，系统自动对比影像。",
      },
      {
        title: "提交与回执跟踪",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 09:00",
        description: "上传材料、获取回执并更新案件状态。",
      },
    ],
    cases: [
      {
        name: "星瀚物流",
        category: "第 39 类",
        process: "名称变更",
        owner: "李俊",
        deadline: "11-21",
        status: "待补正",
      },
      {
        name: "银梧桐",
        category: "第 29 类",
        process: "地址变更",
        owner: "陈璇",
        deadline: "11-23",
        status: "审核中",
      },
      {
        name: "TechFusion",
        category: "第 42 类",
        process: "代理变更",
        owner: "张敏",
        deadline: "11-19",
        status: "待提交",
      },
    ],
    materials: [
      {
        title: "变更申请表",
        description: "自动填入商标信息与变更前后对比。",
        action: "AI 生成申请表",
        type: "agent",
      },
      {
        title: "主体资格证明清单",
        description: "列出需准备的营业执照、身份证明与翻译件。",
        action: "导出清单",
        type: "agent",
      },
      {
        title: "授权委托书",
        description: "支持电子签章，自动匹配生效日期。",
        action: "生成授权书",
        type: "upload",
      },
    ],
    alerts: [
      {
        title: "TechFusion 代理变更提交提醒",
        due: "11-19",
        type: "补正期限",
        detail: "需客户补签代理协议，过期需重新提交。",
      },
      {
        title: "银梧桐 地址变更审核",
        due: "11-24",
        type: "公告期",
        detail: "注意门牌号差异，建议上传现场照片。",
      },
    ],
    insights: [
      {
        title: "商标变更常见驳回点汇总",
        timestamp: "今日 11:20",
        summary:
          "营业执照地址变更需同步税务登记，否则易驳回；系统已加入校验规则。",
      },
      {
        title: "名称变更需注意主体一致问题",
        timestamp: "昨日 15:05",
        summary:
          "近 30 天 6 起案例因新旧主体不一致被退回，建议附上工商变更证明。",
      },
    ],
  },
  "trademark-transfer": {
    heroTitle: "商标转让与交接中心",
    heroDescription:
      "自动生成转让协议、公证材料与交接清单，跟踪批复节点与付款确认。",
    metrics: [
      { title: "在办转让", value: "18", trend: "新增 3 起" },
      { title: "转让完成率", value: "92%", trend: "支付环节自动提醒" },
      { title: "平均交付期", value: "45 天", trend: "加速 8 天" },
    ],
    workflow: [
      {
        title: "转让意向确认",
        status: "完成",
        owner: "业务经理",
        eta: "昨日 18:00",
        description: "确认双方主体、价款与转让范围。",
      },
      {
        title: "协议与授权生成",
        status: "进行中",
        owner: "法务机器人",
        eta: "今日 14:00",
        description: "根据模板生成转让协议、公证书草稿。",
      },
      {
        title: "材料公证/备案",
        status: "排队",
        owner: "公证团队",
        eta: "明日 09:30",
        description: "安排线上公证或现场办理，上传扫描件。",
      },
      {
        title: "提交与变更登记",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 17:00",
        description: "递交转让申请并跟踪批复进度。",
      },
    ],
    cases: [
      {
        name: "星瀚物流",
        category: "第 39 类",
        process: "转让给 海蓝供应链",
        owner: "李俊",
        deadline: "11-24",
        status: "审核中",
      },
      {
        name: "CloudSpark",
        category: "第 9 类",
        process: "转让给 Nova Tech",
        owner: "王越",
        deadline: "11-28",
        status: "待补正",
      },
      {
        name: "沐光香氛",
        category: "第 3 类",
        process: "转让给 七彩生活",
        owner: "于曼",
        deadline: "11-23",
        status: "待提交",
      },
    ],
    materials: [
      {
        title: "商标转让协议",
        description: "根据双方信息与价款自动生成协议草稿。",
        action: "生成协议",
        type: "agent",
      },
      {
        title: "公证材料清单",
        description: "列出所需的营业执照、公证申请书、身份证明等。",
        action: "导出清单",
        type: "agent",
      },
      {
        title: "权利交接表",
        description: "记录使用证据、授权渠道、续展状态等信息。",
        action: "下载模板",
        type: "upload",
      },
    ],
    alerts: [
      {
        title: "CloudSpark 转让补正期",
        due: "11-26",
        type: "补正期限",
        detail: "需补充价款支付凭证与双方盖章。",
      },
      {
        title: "星瀚物流 转让公告监控",
        due: "11-29",
        type: "公告期",
        detail: "观察是否有异议，建议同步客户处理方案。",
      },
    ],
    insights: [
      {
        title: "商标转让常见风险提醒",
        timestamp: "今日 10:00",
        summary:
          "注意关联公司之间的无偿转让易被审核；建议提供关联关系说明。",
      },
      {
        title: "跨区域交接注意事项",
        timestamp: "本周二",
        summary:
          "涉及海外主体时需准备翻译件与 Apostille，Agent 可自动生成清单。",
      },
    ],
  },
  "trademark-cancel": {
    heroTitle: "商标注销/撤销管理台",
    heroDescription:
      "支持主动注销、撤回、撤三答辩等场景，自动生成材料与风险提示。",
    metrics: [
      { title: "在办注销", value: "12", trend: "撤三答辩 4 件" },
      { title: "平均周期", value: "35 天", trend: "需关注公告期" },
      { title: "驳回率", value: "5%", trend: "风险提示降 1.5%" },
    ],
    workflow: [
      {
        title: "注销类型识别",
        status: "完成",
        owner: "智能助手",
        eta: "今日 08:40",
        description: "识别主动撤销、撤回或被撤三情形，生成流程建议。",
      },
      {
        title: "证据与说明准备",
        status: "进行中",
        owner: "法务组",
        eta: "今日 16:00",
        description: "生成使用证据、说明书或撤三答辩材料。",
      },
      {
        title: "客户确认与授权",
        status: "排队",
        owner: "客户经理",
        eta: "明日 11:00",
        description: "确认撤销原因、后续使用计划与授权文件。",
      },
      {
        title: "提交与公告监控",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 17:30",
        description: "提交备案并跟踪公告期提醒。",
      },
    ],
    cases: [
      {
        name: "星瀚物流",
        category: "第 39 类",
        process: "主动注销",
        owner: "李俊",
        deadline: "11-26",
        status: "待提交",
      },
      {
        name: "CloudSpark",
        category: "第 9 类",
        process: "撤三答辩",
        owner: "王越",
        deadline: "11-24",
        status: "审核中",
      },
      {
        name: "沐光香氛",
        category: "第 3 类",
        process: "撤回申请",
        owner: "于曼",
        deadline: "11-23",
        status: "待补正",
      },
    ],
    materials: [
      {
        title: "注销/撤回申请书",
        description: "根据注销类型生成对应材料与声明。",
        action: "生成申请书",
        type: "agent",
      },
      {
        title: "使用证据清单",
        description: "指导收集销售发票、广告宣传等证明材料。",
        action: "导出清单",
        type: "agent",
      },
      {
        title: "公告监控记录表",
        description: "记录公告日期、异议情况与后续动作。",
        action: "下载模板",
        type: "upload",
      },
    ],
    alerts: [
      {
        title: "撤三答辩补充证据期限",
        due: "11-24",
        type: "补正期限",
        detail: "需补充近三年的销售记录和广告投入。",
      },
      {
        title: "主动注销流程确认",
        due: "11-23",
        type: "公告期",
        detail: "确认企业不会继续使用，避免后续纠纷。",
      },
    ],
    insights: [
      {
        title: "撤三答辩高频驳回原因",
        timestamp: "今日 12:00",
        summary:
          "使用证据须覆盖三年内持续使用且与核定商品匹配，平台已加入证据校验。",
      },
      {
        title: "主动注销风险提示",
        timestamp: "昨日 18:00",
        summary:
          "建议在注销前完成资产评估，避免与合作伙伴合同冲突。",
      },
    ],
  },
  copyright: {
    heroTitle: "版权登记与合同备案中心",
    heroDescription:
      "处理软件、文学、音乐、美术等作品著作权登记以及著作权合同备案，快速生成材料并追踪批复。",
    metrics: [
      { title: "版权登记", value: "12", trend: "本周新增" },
      { title: "驳回率", value: "2%", trend: "材料自动校验" },
      { title: "批复时间", value: "15 天", trend: "稳定" },
    ],
    workflow: [
      {
        title: "作品与权利人确认",
        status: "完成",
        owner: "版权辅助",
        eta: "今日 09:10",
        description: "采集作品信息、创作过程与权利人授权。",
      },
      {
        title: "材料生成",
        status: "进行中",
        owner: "材料中心",
        eta: "今日 14:30",
        description: "生成登记表、样稿、权属说明与创作说明。",
      },
      {
        title: "合同备案准备",
        status: "排队",
        owner: "法务组",
        eta: "明日 10:00",
        description: "对接合同信息，生成备案表与授权书。",
      },
      {
        title: "提交与回执跟踪",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 18:00",
        description: "提交至版权中心并抓取受理回执。",
      },
    ],
    cases: [
      {
        name: "企标邦门户 UI 设计",
        category: "美术作品",
        process: "版权登记",
        owner: "唐悦",
        deadline: "11-22",
        status: "待提交",
      },
      {
        name: "NextAgent 系统",
        category: "软件著作权",
        process: "版权登记",
        owner: "钱博",
        deadline: "11-24",
        status: "审核中",
      },
      {
        name: "《标准化运营指南》",
        category: "文学作品",
        process: "合同备案",
        owner: "邵琳",
        deadline: "11-25",
        status: "待补正",
      },
    ],
    materials: [
      {
        title: "版权登记申请表",
        description: "按照作品类别自动填充信息，可导出 PDF。",
        action: "生成申请表",
        type: "agent",
      },
      {
        title: "作品样稿整理",
        description: "上传作品文件，生成缩略图与目录清单。",
        action: "整理样稿",
        type: "upload",
      },
      {
        title: "权属说明书",
        description: "根据创作分工自动生成权属说明与授权书。",
        action: "AI 生成说明书",
        type: "agent",
      },
    ],
    alerts: [
      {
        title: "版权登记补正提醒",
        due: "11-23",
        type: "补正期限",
        detail: "需补充源代码片段与创作说明。",
      },
      {
        title: "合同备案授权书签章",
        due: "11-25",
        type: "公告期",
        detail: "等待客户上传盖章扫描件。",
      },
    ],
    insights: [
      {
        title: "版权中心发布电子材料新规范",
        timestamp: "今日 08:50",
        summary:
          "要求提交可编辑文档，Agent 已支持自动转换与脱敏。",
      },
      {
        title: "软件著作权常见补正项",
        timestamp: "昨日 16:30",
        summary:
          "建议生成 30% 以上源码并提供 ER 图，系统已加入校验提醒。",
      },
    ],
  },
  patent: {
    heroTitle: "专利申请与年费管理中心",
    heroDescription:
      "管理发明、实用新型与外观设计专利的申请、审查意见答复、年费提醒与权利维持。",
    metrics: [
      { title: "在办专利", value: "28", trend: "发明 12 / 实用 10 / 外观 6" },
      { title: "授权率", value: "78%", trend: "近 12 个月" },
      { title: "待年费案件", value: "5", trend: "30 日内到期" },
    ],
    workflow: [
      {
        title: "创新点捕捉",
        status: "完成",
        owner: "专利分析",
        eta: "昨日 17:20",
        description: "整理技术交底书，生成权利要求草稿。",
      },
      {
        title: "申请文件撰写",
        status: "进行中",
        owner: "代理人团队",
        eta: "今日 19:00",
        description: "撰写说明书、权利要求书、附图与摘要。",
      },
      {
        title: "审查意见监控",
        status: "排队",
        owner: "流程机器人",
        eta: "明日 11:00",
        description: "监控 OA 并自动生成分析建议。",
      },
      {
        title: "年费提醒与维持",
        status: "待启动",
        owner: "年费客服",
        eta: "明日 17:00",
        description: "提前生成缴费清单并通知客户确认。",
      },
    ],
    cases: [
      {
        name: "智能排程算法",
        category: "发明专利",
        process: "实审阶段",
        owner: "高宁",
        deadline: "11-30",
        status: "待提交",
      },
      {
        name: "包装结构改良",
        category: "实用新型",
        process: "初审阶段",
        owner: "张淼",
        deadline: "11-20",
        status: "审核中",
      },
      {
        name: "仪器外观造型",
        category: "外观设计",
        process: "年费缴纳",
        owner: "林峰",
        deadline: "12-05",
        status: "待补正",
      },
    ],
    materials: [
      {
        title: "专利申请文件组合",
        description: "生成说明书、权利要求书、摘要、附图清单。",
        action: "AI 生成草稿",
        type: "agent",
      },
      {
        title: "审查意见答复模版",
        description: "根据 OA 自动生成答复框架与对比表格。",
        action: "生成答复",
        type: "agent",
      },
      {
        title: "年费缴费清单",
        description: "列出即将到期的专利号、缴费金额与期限。",
        action: "导出清单",
        type: "external",
      },
    ],
    alerts: [
      {
        title: "发明专利 OA 答复期限",
        due: "12-02",
        type: "补正期限",
        detail: "需提交实审意见答复，建议使用模板草稿。",
      },
      {
        title: "外观设计年费即将到期",
        due: "12-05",
        type: "续展提醒",
        detail: "客户确认后 3 日内完成缴费。",
      },
    ],
    insights: [
      {
        title: "国家知识产权局发布快速预审指南",
        timestamp: "今日 10:30",
        summary:
          "支持关键行业的快速授权，适合智能制造、新能源领域项目。",
      },
      {
        title: "年费逾期风险提示",
        timestamp: "本周一",
        summary:
          "建议提前 30 天提醒客户，未缴费将导致权利失效；平台已启动自动提醒。",
      },
    ],
  },
};
