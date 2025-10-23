export type CategorySlug =
  | "software"
  | "literature"
  | "music"
  | "art"
  | "other";

export type CategorySummary = {
  slug: CategorySlug;
  label: string;
  tagline: string;
};

export type MetricCard = {
  title: string;
  value: string;
  trend: string;
};

export type PipelineStage = {
  title: string;
  status: "完成" | "进行中" | "排队" | "待启动";
  description: string;
};

export type TemplateItem = {
  title: string;
  description: string;
  action: string;
};

export type TaskItem = {
  title: string;
  owner: string;
  status: "待提交" | "审核中" | "待补充" | "已完成";
  due: string;
  progress: string;
};

export type InsightItem = {
  title: string;
  timestamp: string;
  summary: string;
};

export type CategoryConfig = {
  heroTitle: string;
  heroDescription: string;
  metrics: MetricCard[];
  pipeline: PipelineStage[];
  templates: TemplateItem[];
  tasks: TaskItem[];
  insights: InsightItem[];
};

export const CATEGORY_LIST: CategorySummary[] = [
  {
    slug: "software",
    label: "软件著作权",
    tagline: "源代码材料、功能说明、测试报告自动生成。",
  },
  {
    slug: "literature",
    label: "文学作品",
    tagline: "创作过程留痕与原创证明一键整理。",
  },
  {
    slug: "music",
    label: "音乐作品",
    tagline: "谱曲拆分、词曲协同与权属声明全流程管理。",
  },
  {
    slug: "art",
    label: "美术作品",
    tagline: "高清样本、创作手稿与授权书自动归档。",
  },
  {
    slug: "other",
    label: "其他作品",
    tagline: "影视、摄影、舞蹈等多类型著作权统一申报。",
  },
];

export const CATEGORY_CONFIG: Record<CategorySlug, CategoryConfig> = {
  software: {
    heroTitle: "软件著作权自动化工作台",
    heroDescription:
      "通过源码解析、模块识别与测试覆盖追踪，自动生成合规材料并完成差异核验。",
    metrics: [
      {
        title: "本周立项",
        value: "18",
        trend: "+4 较上周",
      },
      {
        title: "自动生成材料",
        value: "126",
        trend: "93% AI 输出",
      },
      {
        title: "复核待处理",
        value: "6",
        trend: "2 项逾期",
      },
    ],
    pipeline: [
      {
        title: "项目清单解析",
        status: "完成",
        description: "自动读取仓库与需求文档，补齐模块描述与版本信息。",
      },
      {
        title: "代码采样与脱密",
        status: "进行中",
        description: "依政策抽取 30% 源码并自动脱敏，形成签章包。",
      },
      {
        title: "测试报告生成",
        status: "排队",
        description: "结合 CI 结果生成功能与性能测试报告。",
      },
      {
        title: "交付材料归档",
        status: "待启动",
        description: "生成材料清单、目录索引与风险提示。",
      },
    ],
    templates: [
      {
        title: "功能说明书模版",
        description: "依据模块视图生成功能描述，支持自动插入界面截图。",
        action: "AI 生成说明书",
      },
      {
        title: "测试用例矩阵",
        description: "同步测试框架结果，自动归类正向、异常与性能用例。",
        action: "生成测试矩阵",
      },
      {
        title: "源代码脱敏包",
        description: "按政策抽样、去除秘钥与敏感信息，压缩打包并签章。",
        action: "导出脱敏包",
      },
    ],
    tasks: [
      {
        title: "慧算云 ERP V3.2",
        owner: "张琳",
        status: "审核中",
        due: "11-18",
        progress: "资料复核中",
      },
      {
        title: "青杉低代码平台",
        owner: "刘宇",
        status: "待补充",
        due: "11-20",
        progress: "缺少压力测试报告",
      },
      {
        title: "星河 IoT 中台",
        owner: "朱凯",
        status: "待提交",
        due: "11-22",
        progress: "等待客户盖章",
      },
    ],
    insights: [
      {
        title: "国家版权局：源码脱敏需保留日志",
        timestamp: "今日 09:20",
        summary: "新增要求对脱敏操作保留审计日志，平台已自动记录。",
      },
      {
        title: "常见驳回原因汇总",
        timestamp: "昨日 17:30",
        summary: "重复功能描述、缺少测试日志为主要问题，Agent 已新增校验。",
      },
    ],
  },
  literature: {
    heroTitle: "文学作品著作权自动申请",
    heroDescription:
      "面向图书、剧本、内容营销稿件的原创性核验、写作痕迹留存与存证。",
    metrics: [
      { title: "在办作品", value: "9", trend: "4 篇待校对" },
      { title: "原创证据包", value: "36", trend: "含 12 次版本迭代" },
      { title: "驳回预警", value: "1", trend: "需补充作者授权" },
    ],
    pipeline: [
      {
        title: "创作痕迹采集",
        status: "完成",
        description: "同步写作平台记录，生成创作时间轴。",
      },
      {
        title: "原创性比对",
        status: "进行中",
        description: "与公开语料库比对重复率，生成差异说明。",
      },
      {
        title: "授权与声明",
        status: "排队",
        description: "自动生成作者授权书并待签署。",
      },
      {
        title: "材料封装",
        status: "待启动",
        description: "整理电子书样本、封面与目录，导出提交包。",
      },
    ],
    templates: [
      {
        title: "原创性比对报告",
        description: "整合多源检测结果，突出原创段落与引用依据。",
        action: "生成比对报告",
      },
      {
        title: "作者授权书",
        description: "自动填充作者与出版方信息，支持线上签署。",
        action: "创建授权书",
      },
      {
        title: "出版物封面模版",
        description: "按备案要求导出高清封面与版权页。",
        action: "导出封面包",
      },
    ],
    tasks: [
      {
        title: "《风起南塘》长篇小说",
        owner: "林舟",
        status: "待补充",
        due: "11-19",
        progress: "缺少作者身份证明",
      },
      {
        title: "《城市进化论》白皮书",
        owner: "苗薇",
        status: "审核中",
        due: "11-22",
        progress: "比对报告待客户确认",
      },
      {
        title: "《远星探险记》童书",
        owner: "赵明",
        status: "已完成",
        due: "11-15",
        progress: "材料已封装提交",
      },
    ],
    insights: [
      {
        title: "上海局更新文学作品纸质提交指引",
        timestamp: "今日 10:05",
        summary: "额外要求提交两份简装书稿，系统已更新提醒模板。",
      },
      {
        title: "多作者作品授权注意事项",
        timestamp: "本周一",
        summary: "需区分主创与参与作者，保持授权书一致性。",
      },
    ],
  },
  music: {
    heroTitle: "音乐作品著作权管理中心",
    heroDescription:
      "覆盖词曲创作、版权分成、音频样本与版权声明全链路自动化。",
    metrics: [
      { title: "待发布作品", value: "14", trend: "3 首需处理异议" },
      { title: "伴奏/母带文件", value: "28", trend: "100% 已校验格式" },
      { title: "合作协议", value: "7", trend: "2 份待签署" },
    ],
    pipeline: [
      {
        title: "词曲拆分归档",
        status: "完成",
        description: "区分词作者、曲作者与改编信息，生成分成表。",
      },
      {
        title: "音频指纹生成",
        status: "进行中",
        description: "为母带与演示版生成指纹，避免重复注册。",
      },
      {
        title: "权属协议签署",
        status: "排队",
        description: "邀请合作方线上签署版权合约。",
      },
      {
        title: "提交材料打包",
        status: "待启动",
        description: "整理乐谱、歌词、音频与授权文件打包下载。",
      },
    ],
    templates: [
      {
        title: "歌词与乐谱模版",
        description: "自动排版歌词与五线谱，符合提交规范。",
        action: "生成模版",
      },
      {
        title: "版权分成表",
        description: "根据合作关系生成分成方案，支持导出 Excel。",
        action: "创建分成表",
      },
      {
        title: "音频指纹报告",
        description: "为上传音频生成唯一指纹并校验重复注册风险。",
        action: "生成指纹",
      },
    ],
    tasks: [
      {
        title: "《逐光》商业广告曲",
        owner: "贺瑶",
        status: "审核中",
        due: "11-21",
        progress: "等待品牌方确认分成",
      },
      {
        title: "《天际线》电影主题曲",
        owner: "刘洋",
        status: "待补充",
        due: "11-23",
        progress: "缺少伴奏无水印版本",
      },
      {
        title: "《雨中日记》原创 EP",
        owner: "陈骁",
        status: "待提交",
        due: "11-19",
        progress: "等待制作人签署合同",
      },
    ],
    insights: [
      {
        title: "版权协会发布联合声明",
        timestamp: "昨日 16:40",
        summary: "新增短视频平台同步备案要求，建议提前生成分发协议。",
      },
      {
        title: "AI 生成音乐著作权建议",
        timestamp: "上周五",
        summary: "需明确人类创作者参与度，本平台已更新模板字段。",
      },
    ],
  },
  art: {
    heroTitle: "美术作品著作权工作台",
    heroDescription:
      "高质量图像采集、创作日志留痕与收藏人授权自动化协同。",
    metrics: [
      { title: "在办作品", value: "11", trend: "含 4 件展览作品" },
      { title: "高清样本", value: "52", trend: "完成色彩校准" },
      { title: "授权文件", value: "18", trend: "1 份待补签" },
    ],
    pipeline: [
      {
        title: "作品影像采集",
        status: "完成",
        description: "生成多角度样本并附带 EXIF 记录。",
      },
      {
        title: "创作过程记录",
        status: "进行中",
        description: "自动整理草图、创作日志与展览证据。",
      },
      {
        title: "权属证明整理",
        status: "排队",
        description: "收集艺术家与收藏方授权确认。",
      },
      {
        title: "提交资料封包",
        status: "待启动",
        description: "导出高清样本、作品说明与授权文件。",
      },
    ],
    templates: [
      {
        title: "作品说明书",
        description: "自动生成作品背景、创作技法与材料说明。",
        action: "生成说明书",
      },
      {
        title: "展览记录集",
        description: "提取展览合同与媒体报道，形成佐证材料。",
        action: "整理展览记录",
      },
      {
        title: "授权书模版",
        description: "支持收藏方/委托方协同签署，自动编号归档。",
        action: "创建授权书",
      },
    ],
    tasks: [
      {
        title: "《晨光》油画系列",
        owner: "周岚",
        status: "待补充",
        due: "11-20",
        progress: "缺少创作过程图片",
      },
      {
        title: "《山海》雕塑装置",
        owner: "郭哲",
        status: "审核中",
        due: "11-24",
        progress: "等待收藏机构确认",
      },
      {
        title: "《竹影》国画作品",
        owner: "王澜",
        status: "待提交",
        due: "11-22",
        progress: "材料封装进行中",
      },
    ],
    insights: [
      {
        title: "广东局更新作品尺寸要求",
        timestamp: "今日 08:45",
        summary: "新增高清样本最小尺寸 3000px 指标，系统已提醒。",
      },
      {
        title: "馆藏作品授权要点",
        timestamp: "本周二",
        summary: "需上传收藏合同复印件并附盖章扫描件。",
      },
    ],
  },
  other: {
    heroTitle: "多类型著作权统一管理",
    heroDescription:
      "覆盖影视、摄影、舞蹈、工程图等作品类型的定制化代理流程。",
    metrics: [
      { title: "定制流程", value: "6", trend: "新增 2 条行业模板" },
      { title: "跨部门协同", value: "15", trend: "5 份待审批" },
      { title: "AI 材料产出", value: "72", trend: "89% 自动完成" },
    ],
    pipeline: [
      {
        title: "类型识别",
        status: "完成",
        description: "根据上传材料自动匹配申报模板与流程负责人。",
      },
      {
        title: "证据采集",
        status: "进行中",
        description: "解析素材、合同与背书，生成证据链。",
      },
      {
        title: "合规审查",
        status: "排队",
        description: "对照各类政策要求生成差距提示。",
      },
      {
        title: "材料交付",
        status: "待启动",
        description: "按部门输出提交包及复核清单。",
      },
    ],
    templates: [
      {
        title: "影视作品脚本模版",
        description: "自动标注场次、角色，支持导出脚本集。",
        action: "生成脚本模版",
      },
      {
        title: "摄影作品证据集",
        description: "保留 EXIF、地理位置与签约信息，生成版权声明。",
        action: "创建证据集",
      },
      {
        title: "舞蹈作品录像包",
        description: "整合排练及演出视频，自动提取关键帧。",
        action: "导出录像包",
      },
    ],
    tasks: [
      {
        title: "《流光》舞蹈剧目",
        owner: "叶晨",
        status: "审核中",
        due: "11-25",
        progress: "等待演出场次证明",
      },
      {
        title: "工业设计图纸集",
        owner: "唐越",
        status: "待补充",
        due: "11-19",
        progress: "缺少签字版说明书",
      },
      {
        title: "《远山》摄影展",
        owner: "秦梦",
        status: "待提交",
        due: "11-21",
        progress: "授权书收集中",
      },
    ],
    insights: [
      {
        title: "多类型作品联合申报新规",
        timestamp: "昨日 14:15",
        summary: "允许同一批次混合申报，系统已支持批量导出。",
      },
      {
        title: "区块链存证对接",
        timestamp: "上周三",
        summary: "新增可信时间戳接口，建议高价值作品启用。",
      },
    ],
  },
};
