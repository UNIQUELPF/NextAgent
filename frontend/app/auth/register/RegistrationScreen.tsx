"use client";

import { UpdateRegistrationFlowBody } from "@ory/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { ory } from "@/lib/ory";

import type { RegistrationFlow, UiNode } from "@ory/client";

const PASSWORD_METHOD = "password";
const CODE_METHOD = "code";

const defaultRoles = {
  external: ["customer"],
  internal: ["staff"],
  tenant: ["tenant_admin"],
};

export function RegistrationScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [flow, setFlow] = useState<RegistrationFlow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [userType, setUserType] = useState<"external" | "internal" | "tenant">(
    "external",
  );
  const [tenantId, setTenantId] = useState("");
  const [rolesInput, setRolesInput] = useState(defaultRoles.external.join(","));
  const flowId = searchParams.get("flow");
  const returnTo = searchParams.get("return_to") ?? "/welcome";

  const roles = useMemo(() => {
    return rolesInput
      .split(",")
      .map((role) => role.trim())
      .filter(Boolean);
  }, [rolesInput]);

  const csrfToken = useMemo(() => {
    if (!flow) {
      return "";
    }
    return extractNodeValue(flow.ui.nodes, "csrf_token") ?? "";
  }, [flow]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!flowId) {
      ory
        .createBrowserRegistrationFlow({ returnTo })
        .then(({ data }) => {
          router.replace(`/auth/register?flow=${data.id}${
            returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ""
          }`);
        })
        .catch((err) => {
          console.error("createBrowserRegistrationFlow failed", err);
          setError("无法初始化注册流程，请稍后再试。");
        });
      return;
    }

    ory
      .getRegistrationFlow({ id: flowId })
      .then(({ data }) => {
        setFlow(data);
        if (!phone) {
          const identifier = extractNodeValue(data.ui.nodes, "traits.phone");
          if (identifier) {
            setPhone(identifier);
          }
        }
      })
      .catch((err) => {
        console.error("getRegistrationFlow failed", err);
        setError("注册流程已失效，请刷新页面。");
      });
  }, [flowId, phone, returnTo, router]);

  useEffect(() => {
    setRolesInput(defaultRoles[userType].join(","));
  }, [userType]);

  const handleFlowError = useCallback((err: any) => {
    const response = err?.response;
    if (response?.data?.ui) {
      setFlow(response.data as RegistrationFlow);
      setError(null);
      return;
    }
    if (response?.data?.error?.message) {
      setError(response.data.error.message);
      return;
    }
    setError("注册失败，请重试。");
  }, []);

  const traits = useMemo(() => {
    return {
      phone,
      user_type: userType,
      tenant_id: tenantId || undefined,
      roles,
    };
  }, [phone, roles, tenantId, userType]);

  const afterSuccess = useCallback(() => {
    setError(null);
    router.push(returnTo || "/welcome");
  }, [returnTo, router]);

  const submitPassword = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!flow) {
        return;
      }
      if (!phone || !password) {
        setError("请填写手机号和密码。");
        return;
      }
      if (password !== confirmPassword) {
        setError("两次输入的密码不一致。");
        return;
      }

      const body: UpdateRegistrationFlowBody = {
        method: PASSWORD_METHOD,
        csrf_token: csrfToken,
        password,
        traits,
      };

      try {
        const { data } = await ory.updateRegistrationFlow({
          flowId: flow.id,
          updateRegistrationFlowBody: body,
        });
        if (data.identity?.id) {
          afterSuccess();
          return;
        }
        setFlow(data);
      } catch (err) {
        console.error("password registration failed", err);
        handleFlowError(err);
      }
    },
    [
      afterSuccess,
      confirmPassword,
      csrfToken,
      flow,
      handleFlowError,
      password,
      phone,
      traits,
    ],
  );

  const sendCode = useCallback(async () => {
    if (!flow) {
      return;
    }
    if (!phone) {
      setError("请输入手机号。");
      return;
    }

    const body: UpdateRegistrationFlowBody = {
      method: CODE_METHOD,
      traits,
    };

    try {
      const { data } = await ory.updateRegistrationFlow({
        flowId: flow.id,
        updateRegistrationFlowBody: body,
      });
      setFlow(data);
      setCodeSent(true);
      setError(null);
    } catch (err) {
      console.error("send registration code failed", err);
      handleFlowError(err);
    }
  }, [flow, handleFlowError, traits, phone]);

  const verifyCode = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!flow) {
        return;
      }
      if (!code) {
        setError("请输入验证码。");
        return;
      }

      const body: UpdateRegistrationFlowBody = {
        method: CODE_METHOD,
        traits,
        code,
        csrf_token: csrfToken,
      };

      try {
        const { data } = await ory.updateRegistrationFlow({
          flowId: flow.id,
          updateRegistrationFlowBody: body,
        });
        if (data.identity?.id) {
          afterSuccess();
          return;
        }
        setFlow(data);
      } catch (err) {
        console.error("verify registration code failed", err);
        handleFlowError(err);
      }
    },
    [afterSuccess, code, csrfToken, flow, handleFlowError, traits],
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">创建账户</h1>
        <p className="text-sm text-muted-foreground">
          设置用户类型、角色和租户信息，完成注册。
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {flow?.ui.messages?.length ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {flow.ui.messages.map((message) => (
            <div key={message.id}>{message.text}</div>
          ))}
        </div>
      ) : null}

      <section className="rounded-lg border bg-background p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-medium">基础信息</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            用户类型
            <select
              value={userType}
              onChange={(event) =>
                setUserType(event.target.value as "external" | "internal" | "tenant")
              }
              className="rounded-md border px-3 py-2"
            >
              <option value="external">外部终端用户</option>
              <option value="internal">公司内部用户</option>
              <option value="tenant">租户用户</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            租户 ID（可选）
            <input
              type="text"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
              placeholder="tenant-001"
              className="rounded-md border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            手机号
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+8613800000000"
              className="rounded-md border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            角色（逗号分隔）
            <input
              type="text"
              value={rolesInput}
              onChange={(event) => setRolesInput(event.target.value)}
              placeholder="customer,viewer"
              className="rounded-md border px-3 py-2"
            />
          </label>
        </div>
      </section>

      <form
        className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm"
        onSubmit={submitPassword}
      >
        <h2 className="text-lg font-medium">设置密码</h2>
        <label className="flex flex-col gap-1 text-sm">
          密码
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="至少 8 位字符"
            className="rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          确认密码
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="再次输入密码"
            className="rounded-md border px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          使用密码注册
        </button>
      </form>

      <form
        className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm"
        onSubmit={verifyCode}
      >
        <h2 className="text-lg font-medium">短信验证码注册</h2>
        <div className="flex items-end gap-2">
          <label className="flex w-full flex-col gap-1 text-sm">
            验证码
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="6 位验证码"
              className="rounded-md border px-3 py-2"
            />
          </label>
          <button
            type="button"
            onClick={sendCode}
            className="h-10 rounded-md border px-3 text-sm font-medium"
          >
            {codeSent ? "重新发送" : "发送验证码"}
          </button>
        </div>
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          验证并注册
        </button>
      </form>
    </div>
  );
}

function extractNodeValue(nodes: UiNode[], name: string): string | undefined {
  for (const node of nodes) {
    const attrs = node.attributes as Record<string, unknown>;
    if (attrs?.name === name && attrs?.value !== undefined) {
      return String(attrs.value);
    }
  }
  return undefined;
}

