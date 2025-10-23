export type BarcodeProcessSlug = "overview";

export type PrefixInfo = {
  prefix: string;
  region: string;
  validUntil: string;
  status: "正常" | "待续费" | "已过期";
  quota: {
    total: number;
    used: number;
  };
};

export type MetricCard = {
  title: string;
  value: string;
  trend: string;
};

export type BatchItem = {
  name: string;
  range: string;
  products: number;
  owner: string;
  channel: string;
  status: "草稿" | "待审核" | "已发放" | "作废";
};

export type WorkflowStage = {
  title: string;
  status: "完成" | "进行中" | "排队" | "待启动";
  owner: string;
  eta: string;
  description: string;
};

export type BarcodeItem = {
  product: string;
  sku: string;
  code: string;
  prefix: string;
  channel: string;
  status: "未同步" | "已同步" | "校验失败";
};

export type MaterialTemplate = {
  title: string;
  description: string;
  action: string;
  type: "agent" | "upload" | "external";
};

export type ReminderItem = {
  title: string;
  due: string;
  type: "续费" | "校验" | "平台";
  detail: string;
};

export type KnowledgeItem = {
  title: string;
  timestamp: string;
  summary: string;
  suggestion: string;
};

export type BarcodeConfig = {
  metrics: MetricCard[];
  prefixes: PrefixInfo[];
  batches: BatchItem[];
  workflow: WorkflowStage[];
  items: BarcodeItem[];
  materials: MaterialTemplate[];
  reminders: ReminderItem[];
  knowledge: KnowledgeItem[];
};

export const BARCODE_CONFIG: BarcodeConfig = {
  metrics: [
    { title: "本年度新增条码", value: "1,284", trend: "+182 同比增长" },
    { title: "待续费前缀", value: "2", trend: "60 天内到期" },
    { title: "待同步渠道", value: "31", trend: "京东与拼多多" },
  ],
  prefixes: [
    {
      prefix: "6901234",
      region: "中国 GS1 成员",
      validUntil: "2026-06-30",
      status: "正常",
      quota: { total: 100000, used: 58230 },
    },
    {
      prefix: "6939876",
      region: "中国 GS1 成员",
      validUntil: "2024-12-31",
      status: "待续费",
      quota: { total: 100000, used: 86420 },
    },
  ],
  batches: [
    {
      name: "健康食品 2024Q4",
      range: "6901234 020000-027999",
      products: 680,
      owner: "张琳",
      channel: "线下 + 天猫",
      status: "已发放",
    },
    {
      name: "智能家电新款",
      range: "6939876 110000-112999",
      products: 180,
      owner: "林宇",
      channel: "京东",
      status: "待审核",
    },
    {
      name: "OEM 联名批次",
      range: "6901234 090000-090999",
      products: 96,
      owner: "周岚",
      channel: "OEM 线下",
      status: "草稿",
    },
  ],
  workflow: [
    {
      title: "会员资质与资料准备",
      status: "完成",
      owner: "条码管理员",
      eta: "昨日 17:00",
      description: "确认企业营业执照、税务信息、品牌授权。",
    },
    {
      title: "前缀申请 / 续费提交",
      status: "进行中",
      owner: "财务部",
      eta: "今日 15:00",
      description: "提交前缀续费材料、缴纳年费并上传凭证。",
    },
    {
      title: "条码批次审核",
      status: "排队",
      owner: "条码中心",
      eta: "明日 11:00",
      description: "审核批次产品目录与编码范围。",
    },
    {
      title: "渠道同步与校验",
      status: "待启动",
      owner: "渠道运营",
      eta: "明日 18:00",
      description: "同步电商平台码表并进行校验回执检查。",
    },
  ],
  items: [
    {
      product: "企标邦能量棒（蓝莓味）",
      sku: "QB-ENERGY-BLUE",
      code: "6901234 020123",
      prefix: "6901234",
      channel: "天猫",
      status: "已同步",
    },
    {
      product: "AI 智能空气净化器 X3",
      sku: "QB-AIR-X3",
      code: "6939876 110256",
      prefix: "6939876",
      channel: "京东",
      status: "未同步",
    },
    {
      product: "健康谷物早餐 450g",
      sku: "QB-GRAIN-450",
      code: "6901234 021880",
      prefix: "6901234",
      channel: "拼多多",
      status: "校验失败",
    },
  ],
  materials: [
    {
      title: "条码注册申请表",
      description: "自动填充企业信息、前缀申请类型及联系人信息。",
      action: "生成申请表",
      type: "agent",
    },
    {
      title: "条码批次导入模板",
      description: "Excel 模板，支持批量导入产品条码和属性。",
      action: "下载模板",
      type: "external",
    },
    {
      title: "渠道同步说明书",
      description: "指导如何在京东/天猫/拼多多提交条码信息。",
      action: "生成说明书",
      type: "agent",
    },
    {
      title: "年费缴纳凭证上传",
      description: "上传 GS1 年费缴纳凭证和发票信息。",
      action: "上传凭证",
      type: "upload",
    },
  ],
  reminders: [
    {
      title: "前缀 6939876 年费续费",
      due: "2024-12-15",
      type: "续费",
      detail: "需提交年费缴费凭证与联系人确认表。",
    },
    {
      title: "京东平台条码校验失败",
      due: "2024-11-19",
      type: "校验",
      detail: "SKU QB-GRAIN-450 渠道反馈 GS1 未备案。",
    },
    {
      title: "拼多多新批次上线确认",
      due: "2024-11-20",
      type: "平台",
      detail: "请确认平台对接状态并填写上线回执。",
    },
  ],
  knowledge: [
    {
      title: "2024 版 GS1 条码前缀续费指南",
      timestamp: "今日 09:20",
      summary: "明确续费周期、缴纳流程与电子票据要求。",
      suggestion: "建议在到期前 60 天启动续费流程。",
    },
    {
      title: "电商平台条码校验常见问题",
      timestamp: "昨日 17:10",
      summary: "京东需提供 GS1 备案截图；拼多多需上传发票。",
      suggestion: "使用系统自动生成渠道提交材料。",
    },
    {
      title: "条码批次自检清单",
      timestamp: "本周一",
      summary: "包含重复码、前缀越界、缺少属性等风险。",
      suggestion: "发放前使用自检工具，减少渠道退回。",
    },
  ],
};
