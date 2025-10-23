export type SectorSlug =
  | "apparel"
  | "electronics"
  | "beauty"
  | "appliances"
  | "food"
  | "industrial"
  | "custom";

export type SectorSummary = {
  slug: SectorSlug;
  label: string;
  description: string;
  activeCount: number;
};

export type MetricCard = {
  title: string;
  value: string;
  trend: string;
};

export type StandardItem = {
  code: string;
  name: string;
  type: "国家标准" | "行业标准" | "团体标准";
  updatedAt: string;
  tip: string;
};

export type PipelineStage = {
  title: string;
  description: string;
  owner: string;
  status: "完成" | "进行中" | "排队" | "待启动";
  eta: string;
};

export type TaskItem = {
  product: string;
  standard: string;
  phase: string;
  responsible: string;
  due: string;
  status: "待提交" | "审核中" | "待补件" | "已归档";
};

export type KnowledgeItem = {
  title: string;
  date: string;
  summary: string;
  impact: string;
};

export type SectorConfig = {
  heroTitle: string;
  heroDescription: string;
  metrics: MetricCard[];
  standards: StandardItem[];
  pipeline: PipelineStage[];
  tasks: TaskItem[];
  knowledge: KnowledgeItem[];
};

export const SECTOR_LIST: SectorSummary[] = [
  {
    slug: "apparel",
    label: "服装箱包",
    description: "纺织品、安全标签、八大检测项目自动生成。",
    activeCount: 18,
  },
  {
    slug: "electronics",
    label: "手机数码",
    description: "EMC、通信、能效等多标准一站式适配。",
    activeCount: 24,
  },
  {
    slug: "beauty",
    label: "美妆饰品",
    description: "化妆品备案、委托加工与功效测试全流程。",
    activeCount: 16,
  },
  {
    slug: "appliances",
    label: "家用电器",
    description: "能效、安规、环保标准协同管理。",
    activeCount: 22,
  },
  {
    slug: "food",
    label: "药食同源",
    description: "配方备案、原料溯源与检测报告模板。",
    activeCount: 14,
  },
  {
    slug: "industrial",
    label: "工业装备",
    description: "机械安全、环境适应、国家标准同步。",
    activeCount: 10,
  },
  {
    slug: "custom",
    label: "定制流程",
    description: "团体标准、企业标准混合管理。",
    activeCount: 8,
  },
];

export const SECTOR_CONFIG: Record<SectorSlug, SectorConfig> = {
  apparel: {
    heroTitle: "服装箱包执行标准备案中心",
    heroDescription:
      "覆盖纺织品安全、面料物性、成品检测的全套备案流程，自动生成检测任务与材料包。",
    metrics: [
      { title: "在办项目", value: "18", trend: "+5 本周新增" },
      { title: "行业/国家标准", value: "12 / 6", trend: "63% 选择行业标准" },
      { title: "平均周期", value: "7.8 天", trend: "缩短 2.1 天" },
    ],
    standards: [
      {
        code: "GB 18401-2023",
        name: "国家纺织产品基本安全技术规范",
        type: "国家标准",
        updatedAt: "2024-08-01",
        tip: "适用于成人服装，要求提供色牢度、甲醛、PH 值检测。",
      },
      {
        code: "FZ/T 73025-2021",
        name: "针织外衣",
        type: "行业标准",
        updatedAt: "2023-06-18",
        tip: "关注拉伸回复率和起球等级，建议上传测试曲线。",
      },
      {
        code: "T/CTWP 001-2024",
        name: "箱包产品质量评估规范",
        type: "团体标准",
        updatedAt: "2024-03-10",
        tip: "含拉链疲劳测试，平台可自动生成测试任务单。",
      },
    ],
    pipeline: [
      {
        title: "品类与标准匹配",
        description: "AI 根据面料、用途推荐最优标准组合。",
        owner: "王颖",
        status: "完成",
        eta: "今日 10:30",
      },
      {
        title: "检测任务派单",
        description: "生成面料安全、缝制强度、附件安全检测委托单。",
        owner: "检测中心",
        status: "进行中",
        eta: "今日 16:00",
      },
      {
        title: "材料归档与审查",
        description: "核对检测报告与产品标签，补充缺失条款说明。",
        owner: "李程",
        status: "排队",
        eta: "明日 10:00",
      },
      {
        title: "备案提交",
        description: "生成备案表、覆盖证明与签章记录。",
        owner: "陈唯",
        status: "待启动",
        eta: "明日 17:00",
      },
    ],
    tasks: [
      {
        product: "2024 秋装针织衫",
        standard: "GB 18401-2023",
        phase: "材料归档",
        responsible: "张慧",
        due: "11-20",
        status: "待补件",
      },
      {
        product: "旅行箱系列 A3",
        standard: "T/CTWP 001-2024",
        phase: "检测中",
        responsible: "刘明",
        due: "11-22",
        status: "审核中",
      },
      {
        product: "儿童背包 C5",
        standard: "GB 31701-2023",
        phase: "备案提交",
        responsible: "韩露",
        due: "11-18",
        status: "待提交",
      },
    ],
    knowledge: [
      {
        title: "国家标准 GB 18401 更新颜色牢度要求",
        date: "今日",
        summary: "新增湿摩擦牢度≥3 级要求，系统已更新检测模板。",
        impact: "影响所有成人服装项目，建议补充检测报告模板。",
      },
      {
        title: "纺织行业协会发布团体标准备案指南",
        date: "昨日",
        summary: "团体标准需附成员单位列表与授权函。",
        impact: "适用于箱包团标，Agent 已自动生成清单。",
      },
    ],
  },
  electronics: {
    heroTitle: "手机数码标准合规运营台",
    heroDescription:
      "涵盖 EMC、安规、能效及无线通信标准，自动拆分检测任务并输出整改建议。",
    metrics: [
      { title: "在办产品", value: "24", trend: "含 5 款新品" },
      { title: "通过率", value: "96%", trend: "近 30 天" },
      { title: "补件次数", value: "0.8 次/单", trend: "降低 25%" },
    ],
    standards: [
      {
        code: "GB/T 9254.1-2021",
        name: "多媒体设备的电磁兼容要求",
        type: "国家标准",
        updatedAt: "2024-01-01",
        tip: "需提供 EMI、EMS 测试数据，建议上传实验室原始记录。",
      },
      {
        code: "YD/T 1592.3-2023",
        name: "移动终端设备无线射频要求",
        type: "行业标准",
        updatedAt: "2023-11-20",
        tip: "针对 5G NR 频段，平台可自动比对 SAR 数据。",
      },
      {
        code: "T/CAS 5017-2022",
        name: "智能终端绿色设计评价",
        type: "团体标准",
        updatedAt: "2024-04-18",
        tip: "适合品牌宣传，需补充能耗与碳足迹材料。",
      },
    ],
    pipeline: [
      {
        title: "标准选型",
        description: "结合硬件平台与目标市场生成标准组合。",
        owner: "合规部",
        status: "完成",
        eta: "昨日 15:00",
      },
      {
        title: "检测排程",
        description: "整合 EMC、安规、射频检测机构档期。",
        owner: "实验室协调",
        status: "进行中",
        eta: "今日 18:00",
      },
      {
        title: "整改闭环",
        description: "针对测试不合格项生成整改清单并指派责任人。",
        owner: "研发部",
        status: "排队",
        eta: "明日 11:00",
      },
      {
        title: "文档输出",
        description: "生成备案申请表、检测汇总、整改报告。",
        owner: "文控中心",
        status: "待启动",
        eta: "明日 17:00",
      },
    ],
    tasks: [
      {
        product: "5G 智能手机 X2",
        standard: "GB/T 9254.1-2021",
        phase: "整改中",
        responsible: "陈凯",
        due: "11-19",
        status: "待补件",
      },
      {
        product: "蓝牙耳机 AirBeat",
        standard: "YD/T 1592.3-2023",
        phase: "检测中",
        responsible: "王新",
        due: "11-23",
        status: "审核中",
      },
      {
        product: "平板电脑 P8",
        standard: "T/CAS 5017-2022",
        phase: "材料封装",
        responsible: "赵倩",
        due: "11-21",
        status: "待提交",
      },
    ],
    knowledge: [
      {
        title: "工信部发布 5G 终端新要求",
        date: "今日",
        summary: "新增对 mmWave 频段的 EMS 验证项目。",
        impact: "涉及高端机型，Agent 已更新检测排程模版。",
      },
      {
        title: "绿色设计评价参考案例",
        date: "本周一",
        summary: "整理通过率 98% 的材料清单示例。",
        impact: "适合 T/CAS 5017 项目，提供下载链接。",
      },
    ],
  },
  beauty: {
    heroTitle: "美妆饰品备案与标准中心",
    heroDescription:
      "整合化妆品备案、功效测试、包装标签以及配方合规，自动同步原料白名单。",
    metrics: [
      { title: "备案产品", value: "16", trend: "8 款待功效验证" },
      { title: "原料合规率", value: "99%", trend: "自动比对 1280 个原料" },
      { title: "补件风险", value: "低", trend: "仅 1 个配方待优化" },
    ],
    standards: [
      {
        code: "GB 5296.3-2022",
        name: "消费品使用说明 化妆品通用标签",
        type: "国家标准",
        updatedAt: "2024-02-01",
        tip: "需要提供中文标签排版，自动校验禁限用词。",
      },
      {
        code: "QB/T 2872-2018",
        name: "化妆品良好生产规范",
        type: "行业标准",
        updatedAt: "2023-10-12",
        tip: "关注生产环境与记录，平台提供检查表模版。",
      },
      {
        code: "T/CAFFCI 11-2023",
        name: "化妆品功效评价指南",
        type: "团体标准",
        updatedAt: "2024-06-08",
        tip: "与备案系统联动，自动生成功效测试计划。",
      },
    ],
    pipeline: [
      {
        title: "配方与原料审核",
        description: "自动与原料库对比，提示禁限用成分。",
        owner: "配方师",
        status: "完成",
        eta: "昨日 19:00",
      },
      {
        title: "功效试验排期",
        description: "安排人体试验与第三方实验室检测。",
        owner: "功效实验室",
        status: "进行中",
        eta: "今日 15:00",
      },
      {
        title: "标签合规校验",
        description: "对包装设计进行中英对照审核。",
        owner: "品牌部",
        status: "排队",
        eta: "明日 09:30",
      },
      {
        title: "备案文件生成",
        description: "汇总配方、功效、原料信息生成备案报告。",
        owner: "合规部",
        status: "待启动",
        eta: "明日 18:00",
      },
    ],
    tasks: [
      {
        product: "花萃焕亮精华",
        standard: "T/CAFFCI 11-2023",
        phase: "功效试验",
        responsible: "李想",
        due: "11-24",
        status: "审核中",
      },
      {
        product: "云朵柔雾口红",
        standard: "GB 5296.3-2022",
        phase: "标签校验",
        responsible: "钱珊",
        due: "11-19",
        status: "待补件",
      },
      {
        product: "清透防晒乳",
        standard: "QB/T 2872-2018",
        phase: "备案文件生成",
        responsible: "孙婧",
        due: "11-21",
        status: "待提交",
      },
    ],
    knowledge: [
      {
        title: "国家药监局更新化妆品功效备案指引",
        date: "今日",
        summary: "新增在线功效试验报告上传要求。",
        impact: "所有功效型产品需补充原始数据表，系统已集成上传入口。",
      },
      {
        title: "标签禁用语提示库升级",
        date: "上周五",
        summary: "新增 56 条敏感词，自动提醒获取更正建议。",
        impact: "建议重新校验在售产品标签，避免抽检风险。",
      },
    ],
  },
  appliances: {
    heroTitle: "家用电器执行标准管控台",
    heroDescription:
      "集中管理能效、安规、环保与售后服务标准，自动追踪证书有效期与整改闭环。",
    metrics: [
      { title: "家电品类", value: "22", trend: "涵盖 6 大系列" },
      { title: "能效通过率", value: "94%", trend: "比行业平均高 12%" },
      { title: "在测样机", value: "38 台", trend: "3 台待复测" },
    ],
    standards: [
      {
        code: "GB 4706.1-2022",
        name: "家用和类似用途电器的安全 通用要求",
        type: "国家标准",
        updatedAt: "2024-05-01",
        tip: "涉及多数家电，需提供整机安规测试报告。",
      },
      {
        code: "GB 21455-2019",
        name: "房间空气调节器能效限定值",
        type: "国家标准",
        updatedAt: "2024-02-18",
        tip: "需提交能效测试原始数据与样机照片。",
      },
      {
        code: "JB/T 11121-2020",
        name: "洗衣机性能测试方法",
        type: "行业标准",
        updatedAt: "2023-09-09",
        tip: "洗涤、脱水、噪音指标需一次性达标。",
      },
    ],
    pipeline: [
      {
        title: "标准覆盖检查",
        description: "确认机型适用的安全、能效、环保标准。",
        owner: "产品经理",
        status: "完成",
        eta: "今日 09:00",
      },
      {
        title: "样机检测排期",
        description: "锁定合作实验室档期并生成检测计划。",
        owner: "测试部",
        status: "进行中",
        eta: "今日 17:00",
      },
      {
        title: "整改追踪",
        description: "针对能效未达标机型输出优化建议。",
        owner: "研发中心",
        status: "排队",
        eta: "明日 13:00",
      },
      {
        title: "证书归档",
        description: "收集检测证书、能效标识和质保承诺。",
        owner: "文控中心",
        status: "待启动",
        eta: "明日 18:00",
      },
    ],
    tasks: [
      {
        product: "变频空调 KX-3",
        standard: "GB 21455-2019",
        phase: "整改中",
        responsible: "戴宇",
        due: "11-20",
        status: "待补件",
      },
      {
        product: "扫地机器人 S8",
        standard: "GB 4706.1-2022",
        phase: "安规检测",
        responsible: "郝莹",
        due: "11-23",
        status: "审核中",
      },
      {
        product: "壁挂洗衣机 W5",
        standard: "JB/T 11121-2020",
        phase: "材料封装",
        responsible: "沈澜",
        due: "11-22",
        status: "待提交",
      },
    ],
    knowledge: [
      {
        title: "能效标识管理办法修订",
        date: "昨日",
        summary: "要求在备案材料中附加能效标签图样。",
        impact: "所有家电产品需补充标签 JPG，平台已支持生成。",
      },
      {
        title: "环保法规新增绿色设计指标",
        date: "上周三",
        summary: "对高耗能电器新增待机功耗限制。",
        impact: "建议更新测试计划并同步研发调优。",
      },
    ],
  },
  food: {
    heroTitle: "药食同源备案导航台",
    heroDescription:
      "适用于健康食品、功能饮料等品类，协助完成配方备案、原料溯源、功效验证与检测报告管理。",
    metrics: [
      { title: "备案配方", value: "14", trend: "3 条待专家审评" },
      { title: "原料合规覆盖", value: "98%", trend: "自动匹配国家目录" },
      { title: "批复周期", value: "12 天", trend: "稳定" },
    ],
    standards: [
      {
        code: "GB 16740-2014",
        name: "保健食品通用标准",
        type: "国家标准",
        updatedAt: "2024-07-01",
        tip: "需提供功能成分检测、功效宣称依据。",
      },
      {
        code: "T/CCCMHPIE 6-2022",
        name: "药食同源原料应用指南",
        type: "团体标准",
        updatedAt: "2024-05-18",
        tip: "关注原料来源与用量限制，平台支持自动生成差异表。",
      },
      {
        code: "地方标准",
        name: "各地市场监管局备案细则",
        type: "行业标准",
        updatedAt: "2024-09-30",
        tip: "按省市差异化材料要求自动调整清单。",
      },
    ],
    pipeline: [
      {
        title: "原料适配",
        description: "核对药食同源目录，输出禁限用提示。",
        owner: "研发部",
        status: "完成",
        eta: "今日 08:30",
      },
      {
        title: "检测委托",
        description: "安排功效、理化、微生物检测。",
        owner: "质量部",
        status: "进行中",
        eta: "今日 15:30",
      },
      {
        title: "专家评审",
        description: "汇总专家意见，生成整改清单。",
        owner: "法规部",
        status: "排队",
        eta: "明日 09:00",
      },
      {
        title: "备案报送",
        description: "生成报送表格与佐证材料清单。",
        owner: "行政部",
        status: "待启动",
        eta: "明日 17:30",
      },
    ],
    tasks: [
      {
        product: "姜黄复合饮料",
        standard: "GB 16740-2014",
        phase: "检测中",
        responsible: "杜楠",
        due: "11-24",
        status: "审核中",
      },
      {
        product: "人参益气颗粒",
        standard: "省局备案细则",
        phase: "专家评审",
        responsible: "吴莹",
        due: "11-21",
        status: "待补件",
      },
      {
        product: "枸杞植物饮",
        standard: "T/CCCMHPIE 6-2022",
        phase: "材料封装",
        responsible: "梁勇",
        due: "11-20",
        status: "待提交",
      },
    ],
    knowledge: [
      {
        title: "市场监管总局发布新原料目录",
        date: "今日",
        summary: "新增 4 种药食同源原料使用限制。",
        impact: "系统已同步更新配方校验算法。",
      },
      {
        title: "功效宣称规范案例解析",
        date: "本周二",
        summary: "整理近 10 起驳回案例及整改建议。",
        impact: "推荐在撰写功效文案前参考。",
      },
    ],
  },
  industrial: {
    heroTitle: "工业装备标准化指挥台",
    heroDescription:
      "对接机械安全、环境适应性、工业互联网等标准，提供多地区并行备案能力。",
    metrics: [
      { title: "重点项目", value: "10", trend: "4 个跨国项目" },
      { title: "检测机构", value: "6 家", trend: "全部通过资质复审" },
      { title: "标准覆盖度", value: "92%", trend: "持续提升" },
    ],
    standards: [
      {
        code: "GB 5226.1-2019",
        name: "机械电气安全 控制系统",
        type: "国家标准",
        updatedAt: "2024-03-30",
        tip: "要求提供控制系统安全分析与紧急停机验证。",
      },
      {
        code: "JB/T 10222-2020",
        name: "工业机器人通用技术条件",
        type: "行业标准",
        updatedAt: "2023-08-12",
        tip: "重点检查重复定位精度和安全防护。",
      },
      {
        code: "T/CSPIA 001-2023",
        name: "智能制造系统评估规范",
        type: "团体标准",
        updatedAt: "2024-04-05",
        tip: "用于工业互联网项目，需提交系统集成证据。",
      },
    ],
    pipeline: [
      {
        title: "标准适配诊断",
        description: "评估项目覆盖的国家、行业、团体标准。",
        owner: "项目办",
        status: "完成",
        eta: "昨日 18:00",
      },
      {
        title: "多地检测协调",
        description: "安排深圳、上海两地检测中心并行测试。",
        owner: "检测协调组",
        status: "进行中",
        eta: "今日 20:00",
      },
      {
        title: "整机风险评估",
        description: "汇总检测与现场整改问题，生成风险等级。",
        owner: "安全部",
        status: "排队",
        eta: "明日 17:00",
      },
      {
        title: "备案资料封包",
        description: "按地区生成备案包与电子签章流程。",
        owner: "合规中心",
        status: "待启动",
        eta: "后天 10:00",
      },
    ],
    tasks: [
      {
        product: "协作机器人 C-12",
        standard: "JB/T 10222-2020",
        phase: "检测中",
        responsible: "毕航",
        due: "11-25",
        status: "审核中",
      },
      {
        product: "智能产线 MES",
        standard: "T/CSPIA 001-2023",
        phase: "风险评估",
        responsible: "袁成",
        due: "11-27",
        status: "待补件",
      },
      {
        product: "重载 AGV 车",
        standard: "GB 5226.1-2019",
        phase: "资料封包",
        responsible: "焦娜",
        due: "11-22",
        status: "待提交",
      },
    ],
    knowledge: [
      {
        title: "工信部发布智能制造试点政策",
        date: "今日",
        summary: "鼓励采用团体标准补充国家标准不足。",
        impact: "适合工业互联网项目，建议跟进申请补贴。",
      },
      {
        title: "机械安全事故案例警示",
        date: "昨日",
        summary: "聚焦联锁保护不到位的问题。",
        impact: "建议在风险评估阶段重点检查安全模块。",
      },
    ],
  },
  custom: {
    heroTitle: "定制流程与企业标准管理台",
    heroDescription:
      "支持企业独立制定标准、混合使用团体与地方标准，形成复用模板并跟踪审批链。",
    metrics: [
      { title: "自定义流程", value: "8", trend: "新增 3 条" },
      { title: "审批节点", value: "42", trend: "平均 5 个节点/流程" },
      { title: "复用率", value: "78%", trend: "持续提升" },
    ],
    standards: [
      {
        code: "Q/CP-2024",
        name: "企业标准范本",
        type: "团体标准",
        updatedAt: "2024-10-01",
        tip: "用于导出企业标准备案材料，支持多语言版本。",
      },
      {
        code: "省市地方标准通告",
        name: "地方标准整合",
        type: "行业标准",
        updatedAt: "2024-09-18",
        tip: "需按地区上传企业达标证明。",
      },
      {
        code: "ISO/IEC 17025",
        name: "检测实验室能力要求",
        type: "国家标准",
        updatedAt: "2023-05-01",
        tip: "适用于自建实验室证明材料。",
      },
    ],
    pipeline: [
      {
        title: "流程建模",
        description: "拖拽编辑企业标准流程，配置审批节点。",
        owner: "流程管理员",
        status: "完成",
        eta: "今日 11:00",
      },
      {
        title: "模板配置",
        description: "关联标准条款与所需材料模版。",
        owner: "质控部",
        status: "进行中",
        eta: "今日 18:00",
      },
      {
        title: "审批链路确认",
        description: "根据部门结构分配审批权限与回退规则。",
        owner: "行政部",
        status: "排队",
        eta: "明日 09:00",
      },
      {
        title: "流程发布",
        description: "向团队发布新流程并自动生成培训资料。",
        owner: "培训中心",
        status: "待启动",
        eta: "明日 16:00",
      },
    ],
    tasks: [
      {
        product: "企业标准 Q/CP-2024",
        standard: "Q/CP-2024",
        phase: "模板配置",
        responsible: "秦岚",
        due: "11-19",
        status: "待补件",
      },
      {
        product: "地方标准联动流程",
        standard: "地方标准通告",
        phase: "审批确认",
        responsible: "薛东",
        due: "11-21",
        status: "审核中",
      },
      {
        product: "实验室授权维护",
        standard: "ISO/IEC 17025",
        phase: "资料封包",
        responsible: "官蕾",
        due: "11-24",
        status: "待提交",
      },
    ],
    knowledge: [
      {
        title: "企业标准备案提交流程调整",
        date: "本周三",
        summary: "需在提交前上传专家评审意见。",
        impact: "系统已新增评审意见入口，避免被退回。",
      },
      {
        title: "多流程版本管理最佳实践",
        date: "上周五",
        summary: "建议采用语义化版本并记录发布说明。",
        impact: "便利后续追溯和审计，Agent 可自动生成变更记录。",
      },
    ],
  },
};
