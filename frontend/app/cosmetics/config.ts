export type DisinfectantSlug =
  | "skin"
  | "surface"
  | "air"
  | "fabric"
  | "medical";

export type DisinfectantSummary = {
  slug: DisinfectantSlug;
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

export type ApprovalItem = {
  document: string;
  authority: "国家药监局" | "省级药监局";
  updatedAt: string;
  requirement: string;
};

export type ComplianceCheck = {
  item: string;
  status: "合规" | "需补充" | "风险";
  detail: string;
};

export type PipelineStage = {
  title: string;
  status: "完成" | "进行中" | "排队" | "待启动";
  owner: string;
  eta: string;
  description: string;
};

export type CaseItem = {
  product: string;
  classification: string;
  batch: string;
  owner: string;
  due: string;
  status: "资料准备" | "检验中" | "补正中" | "审批中" | "已获批";
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
  type: "补正" | "检验" | "审批" | "复检";
  detail: string;
};

export type KnowledgeItem = {
  title: string;
  timestamp: string;
  summary: string;
  suggestion: string;
};

export type DisinfectantConfig = {
  heroTitle: string;
  heroDescription: string;
  metrics: MetricCard[];
  approvals: ApprovalItem[];
  compliance: ComplianceCheck[];
  pipeline: PipelineStage[];
  cases: CaseItem[];
  materials: MaterialTemplate[];
  alerts: AlertItem[];
  knowledge: KnowledgeItem[];
};

export const DISINFECTANT_LIST: DisinfectantSummary[] = [
  {
    slug: "skin",
    label: "皮肤消毒类",
    description: "凝胶、泡沫、喷雾等皮肤消毒产品的消字号批文。",
    activeCount: 18,
    highlight: "检验待出 3 份",
  },
  {
    slug: "surface",
    label: "物体表面消毒类",
    description: "家居、工业场景的表面消毒液、湿巾等备案。",
    activeCount: 22,
    highlight: "补正风险低",
  },
  {
    slug: "air",
    label: "空气消毒类",
    description: "空气清洁剂、雾化器等空气消毒产品审批。",
    activeCount: 9,
    highlight: "专家评审 1 起",
  },
  {
    slug: "fabric",
    label: "织物消毒类",
    description: "衣物、布草消毒剂及洗涤产品的消字号资料。",
    activeCount: 12,
    highlight: "检测排队",
  },
  {
    slug: "medical",
    label: "医用辅助类",
    description: "手术器械、医用环境消毒类产品审批流程。",
    activeCount: 14,
    highlight: "审批节点复杂",
  },
];

export const DISINFECTANT_CONFIG: Record<DisinfectantSlug, DisinfectantConfig> = {
  skin: {
    heroTitle: "皮肤消毒产品批文作业台",
    heroDescription:
      "覆盖凝胶、喷雾、泡沫类皮肤消毒产品的成分审查、检验安排、批文申请与标签审查。",
    metrics: [
      { title: "在办批件", value: "18", trend: "+4 本周立项" },
      { title: "检验通过率", value: "94%", trend: "近 30 天" },
      { title: "补正率", value: "6%", trend: "配方描述易缺失" },
    ],
    approvals: [
      {
        document: "《消毒产品生产企业卫生许可证》复核",
        authority: "省级药监局",
        updatedAt: "2024-07-01",
        requirement: "需提供生产车间布局、关键设备与质控体系。",
      },
      {
        document: "皮肤消毒剂产品检验报告",
        authority: "国家药监局",
        updatedAt: "2024-08-20",
        requirement: "必须由具有 CMA 资质的检验机构出具。",
      },
      {
        document: "安全性与功效评价资料",
        authority: "国家药监局",
        updatedAt: "2024-09-15",
        requirement: "包含急性毒性、皮肤刺激性和临床对照试验。",
      },
    ],
    compliance: [
      { item: "有效成分含量", status: "合规", detail: "符合备案配方设定范围。" },
      {
        item: "用途范围描述",
        status: "需补充",
        detail: "建议补充敏感肌肤使用限制说明。",
      },
      {
        item: "标签警示语",
        status: "合规",
        detail: "包含“外用”及儿童使用注意提示。",
      },
    ],
    pipeline: [
      {
        title: "配方与原料核验",
        status: "完成",
        owner: "研发部",
        eta: "今日 09:00",
        description: "核对有效成分、辅料来源与毒理数据。",
      },
      {
        title: "检验委托与样品送检",
        status: "进行中",
        owner: "质控中心",
        eta: "今日 17:00",
        description: "安排理化、微生物、安全性项目，生成物流追踪。",
      },
      {
        title: "资料编制与审核",
        status: "排队",
        owner: "法规部",
        eta: "明日 12:00",
        description: "完善申报表、说明书、标签及安全评价综述。",
      },
      {
        title: "线上提交与批文跟踪",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 20:00",
        description: "上传资料至药监局平台并抓取批件状态。",
      },
    ],
    cases: [
      {
        product: "盈护免洗手消毒凝胶",
        classification: "皮肤消毒剂",
        batch: "2024Q4-皮肤-016",
        owner: "陈颖",
        due: "11-22",
        status: "检验中",
      },
      {
        product: "舒安医护消毒喷雾",
        classification: "皮肤消毒剂",
        batch: "2024Q4-皮肤-011",
        owner: "赵亮",
        due: "11-20",
        status: "资料准备",
      },
      {
        product: "柑橘泡沫消毒液",
        classification: "皮肤消毒剂",
        batch: "2024Q4-皮肤-019",
        owner: "郝敏",
        due: "11-24",
        status: "补正中",
      },
    ],
    materials: [
      {
        title: "消毒产品说明书与标签",
        description: "自动生成用途、使用方法、注意事项与警示语。",
        action: "生成说明书",
        type: "agent",
      },
      {
        title: "检验委托单与样品清单",
        description: "列出检验项目、样品规格、批号与数量。",
        action: "导出委托单",
        type: "agent",
      },
      {
        title: "安全性与功效评估报告",
        description: "整合毒理、皮肤刺激和功效试验结果。",
        action: "上传报告",
        type: "upload",
      },
    ],
    alerts: [
      {
        title: "柑橘泡沫消毒液补正截止",
        due: "11-21",
        type: "补正",
        detail: "需补充皮肤累积刺激性试验报告。",
      },
      {
        title: "盈护免洗手送检报告出具",
        due: "11-22",
        type: "检验",
        detail: "关注理化项目与微生物杀灭效果。",
      },
      {
        title: "医护喷雾资料审查会议",
        due: "11-23",
        type: "审批",
        detail: "法规部审核重点在标签风险提示。",
      },
    ],
    knowledge: [
      {
        title: "皮肤消毒剂功效评价新规范",
        timestamp: "今日 09:30",
        summary: "要求提供杀灭率对比及对照试验。",
        suggestion: "模板已更新功效章节，提交前请同步使用。",
      },
      {
        title: "免洗凝胶补正高发原因",
        timestamp: "昨日 18:10",
        summary: "常见缺失皮肤重复刺激数据或标签警示。",
        suggestion: "提交前运行 AI 检查工具，减少补正。",
      },
    ],
  },
  surface: {
    heroTitle: "物体表面消毒产品批文作业台",
    heroDescription:
      "管理家庭、工业场景使用的消毒液、湿巾等产品，自动生成材料、监控检验与批文进度。",
    metrics: [
      { title: "在办批件", value: "22", trend: "本周新增 5" },
      { title: "检验完成率", value: "82%", trend: "剩余 4 件在排队" },
      { title: "补正率", value: "3%", trend: "标签合规性提升" },
    ],
    approvals: [
      {
        document: "物体表面消毒剂产品检验报告",
        authority: "省级药监局",
        updatedAt: "2024-08-05",
        requirement: "需覆盖理化、稳定性、杀灭效果、抗腐蚀等项目。",
      },
      {
        document: "产品配方及原料来源说明",
        authority: "国家药监局",
        updatedAt: "2024-09-01",
        requirement: "需声明有效成分含量与供应商资质。",
      },
    ],
    compliance: [
      {
        item: "有效成分与杀菌谱",
        status: "合规",
        detail: "含季铵盐复配，符合杀灭细菌、病毒要求。",
      },
      {
        item: "腐蚀性检测",
        status: "需补充",
        detail: "建议补充金属腐蚀性测试结果。",
      },
      {
        item: "标签环保说明",
        status: "合规",
        detail: "已标注使用后处理方式。",
      },
    ],
    pipeline: [
      {
        title: "配方与用途核准",
        status: "完成",
        owner: "产品经理",
        eta: "今日 08:30",
        description: "确认适用场景、杀菌谱与配方一致性。",
      },
      {
        title: "检验排期与样品送检",
        status: "进行中",
        owner: "检测协调",
        eta: "今日 14:00",
        description: "安排杀灭、腐蚀性、稳定性检测，生成物流单。",
      },
      {
        title: "资料编制与内部审查",
        status: "排队",
        owner: "法规部",
        eta: "明日 11:30",
        description: "生成申报材料、说明书与标签，进行内部审核。",
      },
      {
        title: "申报提交与批文跟踪",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 18:30",
        description: "向省局提交并实时同步审批状态。",
      },
    ],
    cases: [
      {
        product: "星洁多效消毒液",
        classification: "物体表面消毒剂",
        batch: "2024Q4-表面-023",
        owner: "苏婧",
        due: "11-21",
        status: "检验中",
      },
      {
        product: "守护抗菌湿巾",
        classification: "物体表面消毒湿巾",
        batch: "2024Q4-表面-017",
        owner: "贺涛",
        due: "11-19",
        status: "资料准备",
      },
      {
        product: "工业设备防疫液",
        classification: "物体表面消毒剂",
        batch: "2024Q4-表面-015",
        owner: "于翔",
        due: "11-25",
        status: "审批中",
      },
    ],
    materials: [
      {
        title: "消毒剂说明书模板",
        description: "列出使用方法、杀灭对象、注意事项。",
        action: "生成说明书",
        type: "agent",
      },
      {
        title: "腐蚀性检测委托单",
        description: "针对不锈钢、铜、铝等材质测试。",
        action: "导出委托单",
        type: "external",
      },
      {
        title: "批文申请表",
        description: "自动填充产品信息与企业资质。",
        action: "生成申请表",
        type: "agent",
      },
    ],
    alerts: [
      {
        title: "星洁消毒液检验报告预计完成",
        due: "11-22",
        type: "检验",
        detail: "留意腐蚀性试验结果。",
      },
      {
        title: "抗菌湿巾资料初审",
        due: "11-20",
        type: "审批",
        detail: "法规部完成内部审查后提交。",
      },
    ],
    knowledge: [
      {
        title: "物表消毒剂腐蚀性检验要点",
        timestamp: "今日 10:40",
        summary: "建议针对多种材质开展测试。",
        suggestion: "系统已更新委托模板，填写即生成。",
      },
      {
        title: "杀灭谱声明规范",
        timestamp: "昨日 15:00",
        summary: "需准确标注杀灭微生物，并提供检验依据。",
        suggestion: "在说明书中引用检测报告结论。",
      },
    ],
  },
  air: {
    heroTitle: "空气消毒产品批文作业台",
    heroDescription:
      "面向空气清洁剂、雾化器等产品，自动协调现场检验、专家评审与批文申报。",
    metrics: [
      { title: "在办批件", value: "9", trend: "专家评审 1 起" },
      { title: "现场检验完成率", value: "78%", trend: "待预约 2 项" },
      { title: "补正率", value: "8%", trend: "需关注设备运行数据" },
    ],
    approvals: [
      {
        document: "空气消毒剂现场检验报告",
        authority: "国家药监局",
        updatedAt: "2024-08-12",
        requirement: "需在实际使用场景检验空气中微生物浓度变化。",
      },
      {
        document: "设备运行安全性评估",
        authority: "省级药监局",
        updatedAt: "2024-07-30",
        requirement: "对雾化器、喷雾装置进行安全验证。",
      },
    ],
    compliance: [
      {
        item: "灭菌率数据",
        status: "合规",
        detail: "实验室与现场检测数据一致。",
      },
      {
        item: "设备噪音与能耗",
        status: "需补充",
        detail: "建议提供长时运行数据。",
      },
      {
        item: "空气残留物监测",
        status: "合规",
        detail: "残留符合国家标准。",
      },
    ],
    pipeline: [
      {
        title: "方案设计与场景确认",
        status: "完成",
        owner: "项目经理",
        eta: "昨日 17:00",
        description: "确定消毒场景、空间大小与设备配置。",
      },
      {
        title: "现场检验与数据采集",
        status: "进行中",
        owner: "检测协调",
        eta: "今日 18:00",
        description: "安排第三方现场检测采集数据。",
      },
      {
        title: "专家评审准备",
        status: "排队",
        owner: "法规部",
        eta: "明日 14:00",
        description: "汇总检验报告与现场记录，准备评审资料。",
      },
      {
        title: "批文申报与跟踪",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 20:00",
        description: "向国家药监局提交并跟踪审批节点。",
      },
    ],
    cases: [
      {
        product: "清安雾化空气消毒器",
        classification: "空气消毒器",
        batch: "2024Q4-空气-006",
        owner: "江岚",
        due: "11-24",
        status: "检验中",
      },
      {
        product: "蓝盾空气消毒喷剂",
        classification: "空气消毒剂",
        batch: "2024Q4-空气-004",
        owner: "郎凯",
        due: "11-19",
        status: "资料准备",
      },
      {
        product: "医护环境雾化器",
        classification: "空气消毒器",
        batch: "2024Q4-空气-008",
        owner: "高琳",
        due: "11-26",
        status: "审批中",
      },
    ],
    materials: [
      {
        title: "现场检验计划与记录",
        description: "自动生成检验方案、记录表与采样数据模板。",
        action: "导出计划",
        type: "agent",
      },
      {
        title: "设备运行安全报告",
        description: "整理设备安全、电气、噪音、残留数据。",
        action: "上传报告",
        type: "upload",
      },
      {
        title: "专家评审资料包",
        description: "生成评审议题、风险提示与结论记录模板。",
        action: "生成资料包",
        type: "agent",
      },
    ],
    alerts: [
      {
        title: "清安雾化器现场检验报告出具",
        due: "11-23",
        type: "检验",
        detail: "确认现场数据并上传系统。",
      },
      {
        title: "蓝盾喷剂资料提交",
        due: "11-20",
        type: "审批",
        detail: "补充安全性数据与标签说明。",
      },
    ],
    knowledge: [
      {
        title: "空气消毒剂现场检验规范更新",
        timestamp: "今日 11:30",
        summary: "新增对不同空间体积的样本量要求。",
        suggestion: "检验计划模板已更新，请重新生成。",
      },
      {
        title: "雾化设备安全风险案例",
        timestamp: "昨日 17:20",
        summary: "运行过热及残留超限为高发问题。",
        suggestion: "提前自检并记录温度、残留数据。",
      },
    ],
  },
  fabric: {
    heroTitle: "织物消毒产品批文作业台",
    heroDescription:
      "针对衣物、布草、医疗织物等消毒剂，自动生成检测任务、标签说明与批文资料。",
    metrics: [
      { title: "在办批件", value: "12", trend: "检验排队 2 项" },
      { title: "杀菌率合格率", value: "98%", trend: "稳定" },
      { title: "补正率", value: "4%", trend: "主要发生在标签说明" },
    ],
    approvals: [
      {
        document: "织物消毒剂产品检验报告",
        authority: "省级药监局",
        updatedAt: "2024-07-18",
        requirement: "需针对织物材质进行杀灭与残留检测。",
      },
      {
        document: "纤维兼容性与色牢度检测",
        authority: "国家药监局",
        updatedAt: "2024-09-08",
        requirement: "需证明产品不会损伤纤维与染料。",
      },
    ],
    compliance: [
      {
        item: "杀灭细菌、真菌效果",
        status: "合规",
        detail: "符合规定杀灭率。",
      },
      {
        item: "对织物色牢度影响",
        status: "需补充",
        detail: "建议补做深色织物色牢度试验。",
      },
      {
        item: "残留与刺激性",
        status: "合规",
        detail: "残留量符合国家限值。",
      },
    ],
    pipeline: [
      {
        title: "配方与适用织物确认",
        status: "完成",
        owner: "产品经理",
        eta: "今日 09:10",
        description: "确认适用织物类型及注意事项。",
      },
      {
        title: "检测委托与样品送检",
        status: "进行中",
        owner: "质控中心",
        eta: "今日 16:30",
        description: "安排杀菌率、色牢度、残留等检测。",
      },
      {
        title: "标签说明校验",
        status: "排队",
        owner: "法规部",
        eta: "明日 11:00",
        description: "校验标签用语、防护说明与注意事项。",
      },
      {
        title: "批文提交与跟踪",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 18:30",
        description: "向省局提交并跟踪批文状态。",
      },
    ],
    cases: [
      {
        product: "衣安抑菌洗衣液",
        classification: "织物消毒剂",
        batch: "2024Q4-织物-009",
        owner: "何薇",
        due: "11-21",
        status: "检验中",
      },
      {
        product: "医用布草高效消毒剂",
        classification: "织物消毒剂",
        batch: "2024Q4-织物-006",
        owner: "邢鹏",
        due: "11-19",
        status: "资料准备",
      },
      {
        product: "酒店布草除菌液",
        classification: "织物消毒剂",
        batch: "2024Q4-织物-011",
        owner: "袁媛",
        due: "11-25",
        status: "审批中",
      },
    ],
    materials: [
      {
        title: "纤维兼容性检测模板",
        description: "记录不同织物材质的色牢度、损耗情况。",
        action: "导出模板",
        type: "external",
      },
      {
        title: "批文申请材料清单",
        description: "列出所有需要的文件、检测报告与资质。",
        action: "生成清单",
        type: "agent",
      },
      {
        title: "标签说明书",
        description: "自动生成使用方法、防护提示与贮存条件。",
        action: "生成说明书",
        type: "agent",
      },
    ],
    alerts: [
      {
        title: "医用布草消毒剂资料初审",
        due: "11-20",
        type: "审批",
        detail: "确认标签与说明书合规。",
      },
      {
        title: "衣安抑菌洗衣液检验出具",
        due: "11-22",
        type: "检验",
        detail: "重点关注色牢度数据。",
      },
    ],
    knowledge: [
      {
        title: "织物消毒剂色牢度检测方法",
        timestamp: "今日 10:50",
        summary: "建议使用高温湿洗测试真实场景。",
        suggestion: "在检测委托单中勾选 40℃×30min 条件。",
      },
      {
        title: "织物类产品标签规范",
        timestamp: "昨日 16:05",
        summary: "需突出儿童衣物、深色衣物的注意事项。",
        suggestion: "标签模板已更新，提交前执行校验。",
      },
    ],
  },
  medical: {
    heroTitle: "医用辅助消毒产品批文作业台",
    heroDescription:
      "涵盖手术器械、医用环境、消毒湿巾等医用辅助产品，重视高标准检验、风险评估与多节点审批。",
    metrics: [
      { title: "在办批件", value: "14", trend: "高优先级 5 项" },
      { title: "检验完成率", value: "71%", trend: "密切跟踪剩余 4 项" },
      { title: "补正率", value: "10%", trend: "重点关注风险评估报告" },
    ],
    approvals: [
      {
        document: "医用消毒产品检验报告",
        authority: "国家药监局",
        updatedAt: "2024-08-25",
        requirement: "需覆盖灭菌效果、残留、毒理与医用场景测试。",
      },
      {
        document: "风险评估与临床应用说明",
        authority: "国家药监局",
        updatedAt: "2024-09-30",
        requirement: "需对医用环境、器械材料兼容性进行评估。",
      },
      {
        document: "生产质量管理体系证明",
        authority: "省级药监局",
        updatedAt: "2024-07-12",
        requirement: "提供 GMP 证书或第三方审计报告。",
      },
    ],
    compliance: [
      {
        item: "医疗器械兼容性",
        status: "需补充",
        detail: "建议提供手术器械腐蚀性试验数据。",
      },
      {
        item: "风险评估报告",
        status: "合规",
        detail: "包括高风险场景与应急处理。",
      },
      {
        item: "标签临床警示语",
        status: "合规",
        detail: "包含“仅限医疗机构使用”等提示。",
      },
    ],
    pipeline: [
      {
        title: "资质校核与风险评估",
        status: "完成",
        owner: "法规部",
        eta: "昨日 19:00",
        description: "确认企业资质、GMP 状态与风险评估结论。",
      },
      {
        title: "检验排程与样品管理",
        status: "进行中",
        owner: "质控中心",
        eta: "今日 18:00",
        description: "涉及器械腐蚀、灭菌、残留等项目。",
      },
      {
        title: "资料封装与内审",
        status: "排队",
        owner: "文控中心",
        eta: "明日 13:00",
        description: "整合检验报告、风险评估、受托生产协议。",
      },
      {
        title: "批文提交与跟踪",
        status: "待启动",
        owner: "流程机器人",
        eta: "明日 21:00",
        description: "提交至国家药监局并跟踪审批反馈。",
      },
    ],
    cases: [
      {
        product: "手术器械速干消毒液",
        classification: "医用辅助",
        batch: "2024Q4-医辅-010",
        owner: "蒋蕾",
        due: "11-24",
        status: "检验中",
      },
      {
        product: "医用环境消毒湿巾",
        classification: "医用辅助",
        batch: "2024Q4-医辅-007",
        owner: "姚晨",
        due: "11-20",
        status: "补正中",
      },
      {
        product: "ICU 专用雾化消毒剂",
        classification: "医用辅助",
        batch: "2024Q4-医辅-012",
        owner: "韩洁",
        due: "11-27",
        status: "审批中",
      },
    ],
    materials: [
      {
        title: "风险评估报告模板",
        description: "包含风险识别、应对措施、残留控制等章节。",
        action: "生成报告",
        type: "agent",
      },
      {
        title: "医用场景检验计划",
        description: "列出器械接触材料、浸泡时间、灭菌对照等。",
        action: "导出计划",
        type: "agent",
      },
      {
        title: "GMP 资质材料",
        description: "上传 GMP 证书、审计报告或质量协议。",
        action: "上传材料",
        type: "upload",
      },
    ],
    alerts: [
      {
        title: "医用环境湿巾补正期限",
        due: "11-21",
        type: "补正",
        detail: "需补充器械兼容性测试与风险措施。",
      },
      {
        title: "速干消毒液检验报告出具",
        due: "11-23",
        type: "检验",
        detail: "包括灭菌、腐蚀、残留项目。",
      },
      {
        title: "ICU 雾化剂审批反馈",
        due: "11-26",
        type: "审批",
        detail: "关注专家组意见，准备答复。",
      },
    ],
    knowledge: [
      {
        title: "医用消毒剂风险评估指南",
        timestamp: "今日 12:10",
        summary: "对高风险场景提出评估框架要求。",
        suggestion: "使用系统模板，自动生成核心章节。",
      },
      {
        title: "器械兼容性试验要点",
        timestamp: "昨日 17:40",
        summary: "重点在金属腐蚀、塑料开裂测试。",
        suggestion: "提前准备多材质测试计划。",
      },
    ],
  },
};
