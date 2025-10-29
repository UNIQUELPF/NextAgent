# 多租户权限体系实施清单（结合 Oathkeeper + Keto）

## 1. 定义数据契约
- 确认后端 “whoami” / session 接口（如 `GET /api/v1/me`）返回：
  - `tenantId`
  - `employeeId`
  - `roles[]`
  - `permissions[]`（如 `module:action`）
  - 可选：权限作用域（部门 ID 列表等）
- 在 `docs/permissions.md` 记录角色 & 权限编码规范。

## 2. 后端改造
1. 在 `backend/internal/server/server.go` 保证 `/api/v1/me` 端点存在并输出上述结构。
2. `/api/v1/authorize`：
   - 将 `{object, action}` 翻译为 Keto 检查；
   - 失败时返回 403/401，而非 500。
3. 在部门 / 角色管理 API 中：调用 Keto Write API 写入 / 删除 Relation Tuple（参考 `backend/internal/keto`）。
4. 补充单元测试：
   - 员工加入 / 移出部门；
   - 角色赋权；
   - 权限校验与错误码。

## 3. Oathkeeper 规则（Regex 模式）
- `configs/oathkeeper/config.yaml`：
  ```yaml
  access_rules:
    repositories:
      - file:///etc/config/oathkeeper/rules.yaml
    matching_strategy: regexp
  ```
- `configs/oathkeeper/rules.yaml` 示例：
  ```yaml
  - id: kratos-public
    priority: 300
    match:
      url: http://localhost:4456/<\.ory/.*>
      methods: [GET, POST, PUT, PATCH, DELETE]
    …
  - id: backend-api
    priority: 200
    match:
      url: http://localhost:4456/<api/.*>
      methods: [GET, POST, PUT, PATCH, DELETE]
    …
  - id: front-assets
    priority: 150
    match:
      url: http://localhost:4456/<_next/.*>
      methods: [GET, HEAD, OPTIONS]
    …
  - id: front-root
    priority: 140
    match:
      url: http://localhost:4456/
      methods: [GET, HEAD, OPTIONS]
    …
  - id: front-all
    priority: 100
    match:
      url: http://localhost:4456/<(?!_next/|api/|\.ory/).+>
      methods: [GET, HEAD, OPTIONS, POST, PUT, PATCH, DELETE]
    …
  ```

## 4. 前端基础设施
1. **API 封装**  
   - `frontend/lib/auth.ts`：封装登录、登出、`getCurrentUser`（调用 `/api/v1/me`）。
2. **全局状态**  
   - `useCurrentUser` Hook（React Query 或 Zustand/Context）缓存用户信息；
   - 保存 `roles`, `permissions`, `tenantId`, `departmentScopes` 等。
3. **权限工具**  
   - `frontend/lib/rbac.ts`：提供 `hasPermission(code)`、`hasRole(role)`。
   - `components/RBAC.tsx`：根据权限包裹按钮/区域；
   - `components/ProtectedRoute.tsx` 或 Next 中间件：守卫路由。
4. **菜单/导航**  
   - 导航配置（如 `components/layout/sidebar-config.ts`）根据 `hasPermission` 过滤。
5. **按钮与操作**  
   - 所有需要权限的操作统一用 `RBAC` 包裹，例如：
     ```tsx
     <RBAC allow={['employee:create']}>
       <Button>新增员工</Button>
     </RBAC>
     ```

## 5. 页面路由与数据
- 在 `frontend/app/**` 页面：
  - Layout 中使用 `useCurrentUser`，在 `loading` 状态下显示 Skeleton；
  - 每个页面声明所需权限（如 `export const requiredPermissions = ['department:view'];`），在 Layout 或中间件检查。
- 组织树 / 员工列表页面：
  - 向后台带上 `tenantId`，懒加载大数据量；
  - 使用虚拟滚动优化性能（如 `react-virtual`）。
- 推广管理页面：
  - 展示 `PromotionLink` 列表、转化数据；
  - 结合权限控制导出/新建操作。

## 6. 租户管理
- 如尚未创建 `Tenant` 表：
  - 在数据库迁移中添加 `Tenant(id, code, name, status, contact_info, settings, created_at, ...)`;
  - 后端仓储层（`backend/internal/repository`）统一使用 `tenant_id`。
- 若需要后台管理界面，新增 `frontend/app/admin/tenants` 相关页面。

## 7. 测试计划
- **集成测试**：
  - 借助 `http.Client` 调用 `/api/healthz` 及业务接口，验证 Oathkeeper + Backend + Keto 流程。
- **前端测试**：
  - Jest/React Testing Library 测试 `RBAC` 组件和 `useCurrentUser`；
  - Snapshot 测试菜单过滤、按钮显示逻辑。
- **Keto Seed**：
  - 准备 `scripts/seed-keto.sh`，初始化租户、部门、角色的基础 Relation Tuple。

## 8. 部署上线步骤
1. 校验 `.env` 与 `docker-compose` 中 Keto 相关环境变量。
2. `docker compose restart oathkeeper backend frontend` 重载配置。
3. 运行 Keto seed 脚本，确保初始权限数据到位。
4. 更新文档：`docs/rbac.md` & `docs/permissions.md`，说明权限模型、API 契约、前端行为。

## 9. 后续优化建议
- 若内部工具与经销商界面差异大，可在未来考虑拆分子域。
- 利用缓存或 Graph 方案优化组织树查询；
- 对权限变更设立实时通知/刷新机制，提升使用体验。
