export type FoodCategorySlug =
  | "blended-wine"
  | "compressed-candy"
  | "solid-drink"
  | "substitute-tea"
  | "grains"
  | "others";

export type FoodCategorySummary = {
  slug: FoodCategorySlug;
  label: string;
  description: string;
  activeCount: number;
  highlight: string;
};

export type MetricCard = {
  title: string;
  value: string;
  trend: string;
};

export type StandardItem = {
  code: string;
  name: string;
  type: "国家标准" | "行业标准" | "地方标准" | "团体标准";
  updatedAt: string;
  note: string;
};

export type IngredientRule = {
  ingredient: string;
  limit: string;
  status: "合规" | "需提示" | "超限";
  remark: string;
};

export type PipelineStage = {
  title: string;
  status: "完成" | "进行中" | "排队" | "待启动";
  owner: string;
  eta: string;
  description: string;
};

export type FilingTask = {
  product: string;
  category: string;
  standard: string;
  phase: string;
  owner: string;
  due: string;
  status: "待提交" | "检测中" | "待补正" | "评审中" | "已报送";
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
  type: "补正" | "检测" | "评审" | "提交";
  detail: string;
};

export type KnowledgeItem = {
  title: string;
  timestamp: string;
  summary: string;
  suggestion: string;
};

export type FoodCategoryConfig = {
  heroTitle: string;
  heroDescription: string;
  metrics: MetricCard[];
  standards: StandardItem[];
  ingredients: IngredientRule[];
  pipeline: PipelineStage[];
  tasks: FilingTask[];
  materials: MaterialTemplate[];
  alerts: AlertItem[];
  knowledge: KnowledgeItem[];
};

export const FOOD_CATEGORY_LIST: FoodCategorySummary[] = [
  {
    slug: "blended-wine",
    label: "配制酒",
    description: "适用 GB/T 20821 等标准，关注酒精度与感官检测。",
    activeCount: 11,
    highlight: "待检测 4 批",
  },
  {
    slug: "compressed-candy",
    label: "压片糖果",
    description: "关注甜味剂、营养素限量，常用 T/CCCMHPIE 规范。",
    activeCount: 14,
    highlight: "补正风险低",
  },
  {
    slug: "solid-drink",
    label: "固体饮料",
    description: "涉及营养强化、溶解性检测，常用 GB/T 29602。",
    activeCount: 19,
    highlight: "需补充功效试验",
  },
  {
    slug: "substitute-tea",
    label: "代用茶",
    description: "关注原料合规与功效宣称，适用地方标准。",
    activeCount: 9,
    highlight: "专家评审 2 件",
  },
  {
    slug: "grains",
    label: "谷物",
    description: "适用于杂粮粉、营养谷物等，关注重金属与农残。",
    activeCount: 13,
    highlight: "检测排队",
  },
  {
    slug: "others",
    label: "其他类别",
    description: "适配特种功能食品、营养补充类自定义流程。",
    activeCount: 6,
    highlight: "需配置流程",
  },
];

export const FOOD_CATEGORY_CONFIG: Record<FoodCategorySlug, FoodCategoryConfig> = {
  "blended-wine": {
    heroTitle: "配制酒备案作业台",
    heroDescription:
      "自动匹配配制酒标准，生成原料限量对比、感官评价记录与理化检测委托，确保配方合规。",
    metrics: [
      { title: "在办项目", value: "11", trend: "+2 本周新增" },
      { title: "检测通过率", value: "92%", trend: "近 30 天" },
      { title: "补正风险", value: "低", trend: "仅 1 项感官待补正" },
    ],
    standards: [
      {
        code: "GB/T 20821-2021",
        name: "配制酒通用技术条件",
        type: "国家标准",
        updatedAt: "2024-01-01",
        note: "关注酒精度、总酸、亚硫酸盐限量。",
      },
      {
        code: "SB/T 10345-2020",
        name: "配制酒生产通用规范",
        type: "行业标准",
        updatedAt: "2023-06-18",
        note: "需提交生产过程控制记录。",
      },
      {
        code: "地方标准",
        name: "各省配制酒备案细则",
        type: "地方标准",
        updatedAt: "2024-09-01",
        note: "需附原料来源、充填工艺说明。",
      },
    ],
    ingredients: [
      {
        ingredient: "枸杞",
        limit: "≤ 2.0%",
        status: "合规",
        remark: "符合药食同源目录要求。",
      },
      {
        ingredient: "人参提取物",
        limit: "≤ 0.5%",
        status: "需提示",
        remark: "建议提供功效支持资料。",
      },
      {
        ingredient: "甜味剂（阿斯巴甜）",
        limit: "≤ 0.6 g/kg",
        status: "合规",
        remark: "符合 GB 2760 限量要求。",
      },
    ],
    pipeline: [
      {
        title: "原料与标准匹配",
        status: "完成",
        owner: "配方中心",
        eta: "今日 09:00",
        description: "比对原料限量，自动推荐标准组合。",
      },
      {
        title: "感官与理化检测委托",
        status: "进行中",
        owner: "检测协调",
        eta: "今日 16:00",
        description: "生成理化、重金属、感官评定委托书。",
      },
      {
        title: "专家评审准备",
        status: "排队",
        owner: "法规部",
        eta: "明日 10:00",
        description: "整理评审资料与风险提示。",
      },
      {
        title: "备案材料封装",
        status: "待启动",
        owner: "文控中心",
        eta: "明日 17:00",
        description: "生成备案申请书、配方说明与检测报告清单。",
      },
    ],
    tasks: [
      {
        product: "云萃人参枸杞配制酒",
        category: "配制酒",
        standard: "GB/T 20821-2021",
        phase: "检测委托",
        owner: "李航",
        due: "11-22",
        status: "检测中",
      },
      {
        product: "蓝莓低度配制酒",
        category: "配制酒",
        standard: "SB/T 10345-2020",
        phase: "材料整理",
        owner: "王莹",
        due: "11-20",
        status: "待补正",
      },
      {
        product: "桂花蜂蜜配制酒",
        category: "配制酒",
        standard: "地方标准",
        phase: "专家评审",
        owner: "周振",
        due: "11-25",
        status: "评审中",
      },
    ],
    materials: [
      {
        title: "配制酒备案申请表",
        description: "自动填入企业信息、产品配方与执行标准。",
        action: "生成申请表",
        type: "agent",
      },
      {
        title: "检测委托书",
        description: "针对理化、感官、重金属检测生成委托单。",
        action: "导出委托书",
        type: "agent",
      },
      {
        title: "生产过程控制记录",
        description: "上传发酵、调配、过滤、灌装等记录表格。",
        action: "上传记录",
        type: "upload",
      },
    ],
    alerts: [
      {
        title: "蓝莓配制酒补正提醒",
        due: "11-19",
        type: "补正",
        detail: "需补充感官评定报告与原料采购合同。",
      },
      {
        title: "桂花蜂蜜配制酒评审会议",
        due: "11-24",
        type: "评审",
        detail: "专家会议上午 10:00，准备风险说明。",
      },
      {
        title: "人参配制酒检测出报告",
        due: "11-22",
        type: "检测",
        detail: "关注亚硫酸盐检测结果，及时更新系统。",
      },
    ],
    knowledge: [
      {
        title: "国家市场监管总局更新配制酒备案指南",
        timestamp: "今日 09:30",
        summary: "新增低度配制酒标签标识示例。",
        suggestion: "更新标签审查流程，确保标识符合要求。",
      },
      {
        title: "枸杞原料检测高频问题",
        timestamp: "昨日 16:50",
        summary: "多起案例因农残超限被要求补充检测。",
        suggestion: "在委托前先进行原料自检。",
      },
    ],
  },
  "compressed-candy": {
    heroTitle: "压片糖果备案作业台",
    heroDescription:
      "覆盖甜味剂、营养强化剂限量自动校验，生成功效说明与检测委托表。",
    metrics: [
      { title: "在办项目", value: "14", trend: "本周新立项 3" },
      { title: "补正率", value: "2%", trend: "常见为营养素含量不足" },
      { title: "检测周期", value: "5 天", trend: "比上月缩短 2 天" },
    ],
    standards: [
      {
        code: "T/CCCMHPIE 001-2023",
        name: "健康食品压片糖果规范",
        type: "团体标准",
        updatedAt: "2024-03-16",
        note: "需提交功效成分检测、压片硬度、崩解时限数据。",
      },
      {
        code: "地方标准",
        name: "广东压片糖果备案细则",
        type: "地方标准",
        updatedAt: "2024-07-08",
        note: "关注甜味剂组合使用限制。",
      },
      {
        code: "GB 14880-2023",
        name: "食品营养强化剂使用标准",
        type: "国家标准",
        updatedAt: "2024-02-20",
        note: "自动校验营养强化剂添加量是否合规。",
      },
    ],
    ingredients: [
      {
        ingredient: "维生素C",
        limit: "≤ 3.0 g/kg",
        status: "合规",
        remark: "当前配方使用 2.4 g/kg。",
      },
      {
        ingredient: "葡萄糖酸锌",
        limit: "≤ 0.3 g/kg",
        status: "需提示",
        remark: "建议提供儿童适用性说明。",
      },
      {
        ingredient: "赤藓糖醇",
        limit: "按需使用",
        status: "合规",
        remark: "注意与甜菊糖苷联合使用比例。",
      },
    ],
    pipeline: [
      {
        title: "配方合规校验",
        status: "完成",
        owner: "配方中心",
        eta: "今日 08:45",
        description: "比对营养强化剂、甜味剂的使用限量。",
      },
      {
        title: "检测排期",
        status: "进行中",
        owner: "检测协调",
        eta: "今日 15:30",
        description: "安排硬度、崩解时限、活性成分检测。",
      },
      {
        title: "材料封装",
        status: "排队",
        owner: "文控中心",
        eta: "明日 11:00",
        description: "生成备案申请表与功效说明。",
      },
      {
        title: "提交备案",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 17:30",
        description: "上传材料并抓取回执。",
      },
    ],
    tasks: [
      {
        product: "小熊 VC 压片糖果",
        category: "压片糖果",
        standard: "T/CCCMHPIE 001-2023",
        phase: "检测中",
        owner: "韩敏",
        due: "11-21",
        status: "检测中",
      },
      {
        product: "夜安褪黑压片糖果",
        category: "压片糖果",
        standard: "地方标准",
        phase: "材料封装",
        owner: "许亮",
        due: "11-19",
        status: "待提交",
      },
      {
        product: "儿童锌铁压片糖果",
        category: "压片糖果",
        standard: "GB 14880-2023",
        phase: "补正中",
        owner: "梁晨",
        due: "11-23",
        status: "待补正",
      },
    ],
    materials: [
      {
        title: "配方说明书",
        description: "自动生成配方组成、作用与依据说明。",
        action: "AI 生成说明",
        type: "agent",
      },
      {
        title: "功效检测报告模板",
        description: "指导第三方实验室填写功效检测数据。",
        action: "导出模板",
        type: "external",
      },
      {
        title: "原料采购证明",
        description: "收集供应商资质、批次检验报告。",
        action: "上传证明",
        type: "upload",
      },
    ],
    alerts: [
      {
        title: "儿童锌铁糖果补正提醒",
        due: "11-22",
        type: "补正",
        detail: "需提供营养素添加依据及安全性评估。",
      },
      {
        title: "小熊 VC 检测结果出具",
        due: "11-21",
        type: "检测",
        detail: "关注维生素损耗率，及时更新系统。",
      },
    ],
    knowledge: [
      {
        title: "压片糖果营养强化剂添加指南",
        timestamp: "今日 11:20",
        summary: "新增针对儿童产品的添加建议。",
        suggestion: "更新模板并提示客户关注年龄段限制。",
      },
      {
        title: "补正高发问题：功效宣称不匹配",
        timestamp: "昨日 17:10",
        summary: "功效描述需与检测数据一致。",
        suggestion: "使用 AI 审核功效文案与检测结果。",
      },
    ],
  },
  "solid-drink": {
    heroTitle: "固体饮料备案作业台",
    heroDescription:
      "智能拆解配方、推荐标准组合，联动检测与物流，让营养固饮备案更高效。",
    metrics: [
      { title: "在办项目", value: "19", trend: "含 6 个新品" },
      { title: "检测批次", value: "8", trend: "2 批次在运输中" },
      { title: "补正风险", value: "中", trend: "功效说明需优化" },
    ],
    standards: [
      {
        code: "GB/T 29602-2013",
        name: "固体饮料",
        type: "国家标准",
        updatedAt: "2024-05-01",
        note: "需提交冲调溶解度、营养成分检测报告。",
      },
      {
        code: "Q/企标 2024",
        name: "企业固饮标准",
        type: "团体标准",
        updatedAt: "2024-06-10",
        note: "推荐用于特定营养成分声明。",
      },
      {
        code: "地方标准",
        name: "华东地区备案指引",
        type: "地方标准",
        updatedAt: "2024-09-18",
        note: "强调包装标签与冲调比例说明。",
      },
    ],
    ingredients: [
      {
        ingredient: "乳清蛋白",
        limit: "配方占比≤ 30%",
        status: "合规",
        remark: "当前配方 18%，符合要求。",
      },
      {
        ingredient: "膳食纤维",
        limit: "≥ 6 g/100 g",
        status: "需提示",
        remark: "建议增加膳食纤维含量以达宣称标准。",
      },
      {
        ingredient: "红枣粉",
        limit: "按需使用",
        status: "合规",
        remark: "需提供原料农残检测报告。",
      },
    ],
    pipeline: [
      {
        title: "配方拆解与标准推荐",
        status: "完成",
        owner: "配方中心",
        eta: "今日 09:30",
        description: "推荐 GB/T 29602 与企业标准组合。",
      },
      {
        title: "检测委托与物流",
        status: "进行中",
        owner: "检测协调",
        eta: "今日 17:30",
        description: "安排理化、功能成分、溶解性检测及样品运输。",
      },
      {
        title: "功效说明优化",
        status: "排队",
        owner: "文案组",
        eta: "明日 14:00",
        description: "生成与检测结果匹配的功效说明。",
      },
      {
        title: "报送材料封装",
        status: "待启动",
        owner: "文控中心",
        eta: "后日 10:00",
        description: "生成备案申请表、标签样稿、检测报告集。",
      },
    ],
    tasks: [
      {
        product: "轻燃高纤固体饮料",
        category: "固体饮料",
        standard: "GB/T 29602-2013",
        phase: "检测中",
        owner: "周娜",
        due: "11-23",
        status: "检测中",
      },
      {
        product: "高蛋白代餐粉",
        category: "固体饮料",
        standard: "Q/企标 2024",
        phase: "功效说明",
        owner: "刘俊",
        due: "11-24",
        status: "待补正",
      },
      {
        product: "红枣益生菌冲剂",
        category: "固体饮料",
        standard: "地方标准",
        phase: "材料封装",
        owner: "张琰",
        due: "11-22",
        status: "待提交",
      },
    ],
    materials: [
      {
        title: "固体饮料配方说明",
        description: "生成配方组成、功效依据、使用人群说明。",
        action: "AI 生成说明",
        type: "agent",
      },
      {
        title: "检测委托与物流单",
        description: "同步检测项目、样品数量、物流单号。",
        action: "导出委托单",
        type: "external",
      },
      {
        title: "冲调说明与标签样稿",
        description: "生成标签内容、冲调比例与注意事项。",
        action: "上传标签",
        type: "upload",
      },
    ],
    alerts: [
      {
        title: "高蛋白代餐粉补正提醒",
        due: "11-23",
        type: "补正",
        detail: "功效说明需匹配检测数据，补充热量对比。",
      },
      {
        title: "固饮样品到达实验室",
        due: "11-21",
        type: "检测",
        detail: "确认样品完好并启动检测。",
      },
      {
        title: "红枣益生菌冲剂提交预约",
        due: "11-22",
        type: "提交",
        detail: "预约省局备案窗口，准备纸质材料。",
      },
    ],
    knowledge: [
      {
        title: "固体饮料功效宣称规范要点",
        timestamp: "今日 10:20",
        summary: "需与检测数据一致并注明目标人群。",
        suggestion: "使用模板自动生成符合要求的功效描述。",
      },
      {
        title: "营养强化剂新规",
        timestamp: "昨日 15:30",
        summary: "部分矿物质添加限量调整。",
        suggestion: "更新配方校验逻辑，自动提示超限。",
      },
    ],
  },
  "substitute-tea": {
    heroTitle: "代用茶备案作业台",
    heroDescription:
      "聚焦药食同源原料组合、功效宣称与地方标准差异，支持原料追溯与专家评审。",
    metrics: [
      { title: "在办项目", value: "9", trend: "专家评审 2 件" },
      { title: "补正风险", value: "中", trend: "原料证明待完善" },
      { title: "检测周期", value: "7 天", trend: "保持稳定" },
    ],
    standards: [
      {
        code: "地方标准",
        name: "代用茶备案技术指南（浙江）",
        type: "地方标准",
        updatedAt: "2024-07-15",
        note: "强调原料来源与功效佐证。",
      },
      {
        code: "T/CCCMHPIE 6-2022",
        name: "药食同源原料应用指南",
        type: "团体标准",
        updatedAt: "2024-05-18",
        note: "提供原料组合建议与用量限制。",
      },
      {
        code: "企业规范",
        name: "代用茶生产控制程序",
        type: "团体标准",
        updatedAt: "2024-04-12",
        note: "规范炒制、烘干、杀青等工艺记录。",
      },
    ],
    ingredients: [
      {
        ingredient: "蒲公英",
        limit: "≤ 30%",
        status: "合规",
        remark: "当前配方使用 18%。",
      },
      {
        ingredient: "桑叶",
        limit: "≤ 25%",
        status: "需提示",
        remark: "需提供农残检测报告。",
      },
      {
        ingredient: "陈皮",
        limit: "按需使用",
        status: "合规",
        remark: "建议提供产地证明。",
      },
    ],
    pipeline: [
      {
        title: "原料追溯与标准匹配",
        status: "完成",
        owner: "配方中心",
        eta: "今日 08:20",
        description: "根据原料组合推荐指南与地方标准。",
      },
      {
        title: "功效佐证收集",
        status: "进行中",
        owner: "法规部",
        eta: "今日 17:00",
        description: "收集文献、临床或实验数据。",
      },
      {
        title: "专家评审协调",
        status: "排队",
        owner: "客户经理",
        eta: "明日 14:00",
        description: "组织专家评审会议并汇总意见。",
      },
      {
        title: "材料封装与报送",
        status: "待启动",
        owner: "文控中心",
        eta: "后日 11:00",
        description: "生成备案申请、原料说明、风险提示。",
      },
    ],
    tasks: [
      {
        product: "蒲公英桑叶代用茶",
        category: "代用茶",
        standard: "地方标准",
        phase: "专家评审",
        owner: "孙悦",
        due: "11-24",
        status: "评审中",
      },
      {
        product: "山楂陈皮代用茶",
        category: "代用茶",
        standard: "T/CCCMHPIE 6-2022",
        phase: "功效佐证",
        owner: "姚博",
        due: "11-20",
        status: "待补正",
      },
      {
        product: "菊花桑葚代用茶",
        category: "代用茶",
        standard: "企业规范",
        phase: "材料封装",
        owner: "魏华",
        due: "11-22",
        status: "待提交",
      },
    ],
    materials: [
      {
        title: "原料追溯报告",
        description: "自动生成产地、采收、加工流转记录。",
        action: "生成追溯报告",
        type: "agent",
      },
      {
        title: "功效佐证汇编",
        description: "汇总文献、试验报告并生成摘要。",
        action: "整理佐证",
        type: "agent",
      },
      {
        title: "专家评审记录模板",
        description: "记录评审意见、风险结论与整改建议。",
        action: "下载模板",
        type: "external",
      },
    ],
    alerts: [
      {
        title: "山楂陈皮代用茶补正",
        due: "11-19",
        type: "补正",
        detail: "补充原料农残检测与功效文献摘要。",
      },
      {
        title: "专家评审会议",
        due: "11-23",
        type: "评审",
        detail: "准备专家资料包并邀请参会。",
      },
    ],
    knowledge: [
      {
        title: "代用茶功效宣称规范",
        timestamp: "今日 09:10",
        summary: "强调不得夸大疾病疗效。",
        suggestion: "结合检测数据使用模板化描述。",
      },
      {
        title: "地方标准差异对比",
        timestamp: "昨日 18:00",
        summary: "各省对原料证明要求不同。",
        suggestion: "系统已集成差异清单，发起备案前先比对。",
      },
    ],
  },
  grains: {
    heroTitle: "谷物类食品备案作业台",
    heroDescription:
      "监控谷物粉、营养谷物配方的重金属、农残、营养强化限量，优化检测排期与材料生成。",
    metrics: [
      { title: "在办项目", value: "13", trend: "3 项待检测" },
      { title: "农残合格率", value: "96%", trend: "稳定" },
      { title: "补正风险", value: "低", trend: "主要为标签问题" },
    ],
    standards: [
      {
        code: "GB 14880-2023",
        name: "食品营养强化剂使用标准",
        type: "国家标准",
        updatedAt: "2024-02-20",
        note: "关注维生素、矿物质添加限量。",
      },
      {
        code: "GB 2761-2022",
        name: "食品真菌毒素限量",
        type: "国家标准",
        updatedAt: "2024-05-05",
        note: "重点关注黄曲霉毒素、玉米赤霉烯酮。",
      },
      {
        code: "地方标准",
        name: "谷物健康食品备案细则",
        type: "地方标准",
        updatedAt: "2024-08-10",
        note: "要求提供原料验收与生产过程记录。",
      },
    ],
    ingredients: [
      {
        ingredient: "燕麦粉",
        limit: "农残符合 GB 2763",
        status: "合规",
        remark: "最新检测合格。",
      },
      {
        ingredient: "黑芝麻粉",
        limit: "黄曲霉毒素 B1 ≤ 5 μg/kg",
        status: "需提示",
        remark: "建议增加滤清步骤。",
      },
      {
        ingredient: "葡萄糖酸钙",
        limit: "≤ 1.0 g/kg",
        status: "合规",
        remark: "符合营养强化剂限量。",
      },
    ],
    pipeline: [
      {
        title: "原料检测与限量校验",
        status: "完成",
        owner: "质控部",
        eta: "今日 08:10",
        description: "核对重金属与农残限量。",
      },
      {
        title: "营养强化剂配方确认",
        status: "进行中",
        owner: "配方中心",
        eta: "今日 15:40",
        description: "自动计算营养素含量符合声明标准。",
      },
      {
        title: "材料封装",
        status: "排队",
        owner: "文控中心",
        eta: "明日 13:00",
        description: "生成备案申请表、生产流程记录。",
      },
      {
        title: "提交报送",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 17:30",
        description: "完成电子报送与回执抓取。",
      },
    ],
    tasks: [
      {
        product: "高纤黑芝麻代餐粉",
        category: "谷物",
        standard: "GB 14880-2023",
        phase: "原料检测",
        owner: "赵珂",
        due: "11-21",
        status: "检测中",
      },
      {
        product: "燕麦坚果营养粉",
        category: "谷物",
        standard: "地方标准",
        phase: "材料封装",
        owner: "郭婧",
        due: "11-19",
        status: "待提交",
      },
      {
        product: "谷物能量棒",
        category: "谷物",
        standard: "GB 2761-2022",
        phase: "配方确认",
        owner: "陈帅",
        due: "11-22",
        status: "待补正",
      },
    ],
    materials: [
      {
        title: "原料检测汇总表",
        description: "自动汇总农残、重金属检测数据。",
        action: "导出汇总表",
        type: "agent",
      },
      {
        title: "生产过程记录模板",
        description: "涵盖混合、烘焙、包装等关键控制点。",
        action: "下载模板",
        type: "external",
      },
      {
        title: "营养成分标签",
        description: "生成标签营养成分表，并校验宣称。",
        action: "生成标签",
        type: "agent",
      },
    ],
    alerts: [
      {
        title: "谷物能量棒补正提醒",
        due: "11-21",
        type: "补正",
        detail: "补充营养强化剂添加依据与检测数据。",
      },
      {
        title: "高纤黑芝麻检测出具",
        due: "11-22",
        type: "检测",
        detail: "重点关注黄曲霉毒素结果。",
      },
    ],
    knowledge: [
      {
        title: "谷物类备案高频问题",
        timestamp: "今日 08:50",
        summary: "多集中在标签与原料农残。",
        suggestion: "在提交前完成标签审查与农残预检。",
      },
      {
        title: "营养强化剂添加新规解读",
        timestamp: "昨日 19:10",
        summary: "对矿物质和维生素添加上限进行调整。",
        suggestion: "立即更新配方校验脚本。",
      },
    ],
  },
  others: {
    heroTitle: "其他类别备案作业台",
    heroDescription:
      "覆盖特种营养食品、功能性饮品等定制流程，提供标准组合、材料模板与风险提示。",
    metrics: [
      { title: "在办项目", value: "6", trend: "定制流程 2" },
      { title: "流程时长", value: "18 天", trend: "复杂度较高" },
      { title: "补正风险", value: "中", trend: "需专家评审确认" },
    ],
    standards: [
      {
        code: "Q/企业定制",
        name: "企业标准模板",
        type: "团体标准",
        updatedAt: "2024-10-01",
        note: "支持定制标准，需专家论证。",
      },
      {
        code: "地方标准汇编",
        name: "特殊功能食品备案指引",
        type: "地方标准",
        updatedAt: "2024-09-12",
        note: "按地区区分材料要求。",
      },
      {
        code: "GB 7718-2024",
        name: "食品标签通则",
        type: "国家标准",
        updatedAt: "2024-07-20",
        note: "标签需符合新规提醒。",
      },
    ],
    ingredients: [
      {
        ingredient: "胶原蛋白肽",
        limit: "≤ 10%",
        status: "需提示",
        remark: "建议提供功效说明。",
      },
      {
        ingredient: "植物甾醇酯",
        limit: "符合功能性食品标准",
        status: "需提示",
        remark: "需提供降血脂功效支持。",
      },
      {
        ingredient: "益生菌（嗜酸乳杆菌）",
        limit: "≥ 1×10^7 CFU/g",
        status: "合规",
        remark: "需提供菌种检测报告。",
      },
    ],
    pipeline: [
      {
        title: "流程建模与标准匹配",
        status: "完成",
        owner: "流程管理员",
        eta: "昨日 18:40",
        description: "搭建定制流程并关联标准组合。",
      },
      {
        title: "材料模板配置",
        status: "进行中",
        owner: "文控中心",
        eta: "今日 17:20",
        description: "配置申请书、说明书、风险评估模版。",
      },
      {
        title: "专家论证协调",
        status: "排队",
        owner: "法规部",
        eta: "明日 13:00",
        description: "安排专家论证并记录意见。",
      },
      {
        title: "提交与跟踪",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 19:00",
        description: "提交备案并跟踪通知公示。",
      },
    ],
    tasks: [
      {
        product: "胶原蛋白肽饮品",
        category: "其他类别",
        standard: "企业标准模板",
        phase: "模板配置",
        owner: "杜晓",
        due: "11-20",
        status: "待补正",
      },
      {
        product: "植物甾醇营养包",
        category: "其他类别",
        standard: "地方标准汇编",
        phase: "专家论证",
        owner: "马楠",
        due: "11-24",
        status: "评审中",
      },
      {
        product: "益生菌固体饮品",
        category: "其他类别",
        standard: "GB 7718-2024",
        phase: "材料提交",
        owner: "颜妮",
        due: "11-21",
        status: "待提交",
      },
    ],
    materials: [
      {
        title: "定制流程申请书",
        description: "根据流程自动生成申请书草稿。",
        action: "生成申请书",
        type: "agent",
      },
      {
        title: "风险评估报告",
        description: "对配方、工艺、目标人群进行风险评估。",
        action: "生成评估",
        type: "agent",
      },
      {
        title: "专家论证记录",
        description: "上传专家签字版意见与会议纪要。",
        action: "上传记录",
        type: "upload",
      },
    ],
    alerts: [
      {
        title: "胶原蛋白肽饮品补正",
        due: "11-19",
        type: "补正",
        detail: "补充功效论证及安全性评估。",
      },
      {
        title: "专家论证会议通知",
        due: "11-23",
        type: "评审",
        detail: "确认专家名单并准备资料包。",
      },
      {
        title: "益生菌固饮提交预约",
        due: "11-21",
        type: "提交",
        detail: "预约备案窗口并准备纸质材料。",
      },
    ],
    knowledge: [
      {
        title: "特种营养食品备案要点",
        timestamp: "今日 11:50",
        summary: "强调功效与安全性数据对应。",
        suggestion: "系统已提供风险评估模板，可快速生成。",
      },
      {
        title: "专家论证合规要求",
        timestamp: "昨日 14:40",
        summary: "需记录专家背景与会议结论。",
        suggestion: "上传论证记录后系统自动生成摘要。",
      },
    ],
  },
};
