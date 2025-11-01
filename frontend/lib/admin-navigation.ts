export interface AdminSection {
  href: string;
  label: string;
  description?: string;
}

export const ADMIN_ACCESS_ROLES = ["platform_admin", "tenant_admin"] as const;

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    href: "/admin/groups",
    label: "部门与人员管理",
    description: "维护组织结构、调整人员隶属关系并查看成员详情。",
  },
  {
    href: "/admin/tenants",
    label: "租户管理",
    description: "创建和维护经销商租户，配置基础信息与状态。",
  },
  {
    href: "/admin/roles",
    label: "角色管理",
    description: "定义角色与权限集，分配给租户或内部成员。",
  },
];
