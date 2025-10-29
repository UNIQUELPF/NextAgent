"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { SettingsFlow, UiNode, UiNodeAttributes } from "@ory/client";
import { UpdateSettingsFlowBody } from "@ory/client";

import { ory } from "@/lib/ory";
import { Button } from "@/components/ui/button";

export function SetupScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [flow, setFlow] = useState<SettingsFlow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const flowId = searchParams.get("flow");
  const returnTo = searchParams.get("return_to") ?? "/";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!flowId) {
      ory
        .createBrowserSettingsFlow({ returnTo })
        .then(({ data }) => {
          const params = new URLSearchParams({ flow: data.id });
          if (returnTo) {
            params.set("return_to", returnTo);
          }
          router.replace(`/account/setup?${params.toString()}`);
        })
        .catch((err) => {
          console.error("createBrowserSettingsFlow (setup) failed", err);
          setError("无法初始化设置流程，请稍后再试。");
        });
      return;
    }

    ory
      .getSettingsFlow({ id: flowId })
      .then(({ data }) => {
        setFlow(data);
        const traits = (data.identity?.traits as Record<string, unknown>) ?? {};
        const initialNickname = String(traits.nickname ?? "");
        setNickname(initialNickname);
      })
      .catch((err) => {
        console.error("getSettingsFlow (setup) failed", err);
        setError("设置流程已失效，请刷新页面。");
      });
  }, [flowId, returnTo, router]);

  const identityTraits = useMemo(() => {
    return (flow?.identity?.traits as Record<string, unknown>) ?? {};
  }, [flow]);

  const csrfToken = useMemo(() => {
    if (!flow) {
      return "";
    }
    return extractNodeValue(flow.ui.nodes, "csrf_token") ?? "";
  }, [flow]);

  const isNetworkError = (err: any) => Boolean(err?.isAxiosError && !err?.response);

  const refreshFlow = useCallback(
    async (id: string) => {
      const { data } = await ory.getSettingsFlow({ id });
      setFlow(data);
      return data;
    },
    [],
  );

  const handleFlowError = useCallback(
    (err: any) => {
      const response = err?.response;
      if (isNetworkError(err) && flow) {
        refreshFlow(flow.id).catch((refreshErr) => {
          console.error("refresh settings flow (setup) failed", refreshErr);
        });
        return;
      }
      if (response?.data?.ui) {
        setFlow(response.data as SettingsFlow);
        setError(null);
        return;
      }
      if (response?.data?.error?.message) {
        setError(response.data.error.message);
        return;
      }
      setError("保存失败，请重试。");
    },
    [flow, refreshFlow],
  );

  const phoneDisplay = formatPhoneDisplay(typeof identityTraits.phone === "string" ? identityTraits.phone : "");

  const submit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!flow) {
        return;
      }
      if (!nickname.trim()) {
        setError("请输入昵称。");
        return;
      }
      if (!password) {
        setError("请输入密码。");
        return;
      }
      if (password !== confirmPassword) {
        setError("两次输入的密码不一致。");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const traitsPayload: Record<string, unknown> = {
          ...identityTraits,
          nickname,
        };
        if (identityTraits.phone) {
          traitsPayload.phone = identityTraits.phone;
        }
        if (identityTraits.user_type) {
          traitsPayload.user_type = identityTraits.user_type;
        }
        if (identityTraits.tenant_id) {
          traitsPayload.tenant_id = identityTraits.tenant_id;
        }
        if (identityTraits.roles) {
          traitsPayload.roles = identityTraits.roles;
        }

        const profileBody: UpdateSettingsFlowBody = {
          method: "profile",
          csrf_token: csrfToken,
          traits: traitsPayload,
        };

        await ory.updateSettingsFlow({
          flow: flow.id,
          updateSettingsFlowBody: profileBody,
        });

        const passwordBody: UpdateSettingsFlowBody = {
          method: "password",
          csrf_token: csrfToken,
          password,
        };

        await ory.updateSettingsFlow({
          flow: flow.id,
          updateSettingsFlowBody: passwordBody,
        });

        try {
          await refreshFlow(flow.id);
        } catch (refreshErr) {
          console.error("refresh settings flow after setup failed", refreshErr);
        }

        setSuccess("账户信息已保存。");
        setPassword("");
        setConfirmPassword("");
        router.push(returnTo || "/");
      } catch (err) {
        console.error("account setup submit failed", err);
        handleFlowError(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [confirmPassword, csrfToken, flow, handleFlowError, identityTraits, nickname, password, refreshFlow, returnTo, router],
  );

  if (!flow) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-12 text-center text-sm text-muted-foreground">
        正在加载设置流程...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">完成账户设置</h1>
        <p className="text-sm text-muted-foreground">请确认手机号，设置昵称和登录密码。</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      {flow.ui.messages?.length ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          {flow.ui.messages.map((message) => (
            <div key={message.id}>{message.text}</div>
          ))}
        </div>
      ) : null}

      <form className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm" onSubmit={submit}>
        <label className="flex flex-col gap-1 text-sm">
          手机号
          <input
            type="text"
            value={phoneDisplay}
            className="cursor-not-allowed rounded-md border border-dashed px-3 py-2 text-muted-foreground"
            disabled
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          昵称
          <input
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            className="rounded-md border px-3 py-2"
            placeholder="请输入昵称"
            autoComplete="nickname"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          设置密码
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border px-3 py-2"
            placeholder="至少 8 位，包含字母和数字"
            autoComplete="new-password"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          确认密码
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="rounded-md border px-3 py-2"
            placeholder="再次输入密码"
            autoComplete="new-password"
          />
        </label>

        <Button type="submit" className="mt-2" disabled={isSubmitting}>
          {isSubmitting ? "提交中..." : "保存并继续"}
        </Button>
      </form>
    </div>
  );
}

function extractNodeValue(nodes: UiNode[], name: string): string | undefined {
  for (const node of nodes) {
    const attrs = node.attributes as UiNodeAttributes;
    if (
      attrs.node_type === "input" &&
      "name" in attrs &&
      (attrs as { name?: string }).name === name &&
      attrs.value !== undefined
    ) {
      return String(attrs.value);
    }
  }
  return undefined;
}

function formatPhoneDisplay(phone: string): string {
  if (!phone) {
    return "";
  }
  if (phone.startsWith("+86")) {
    return `+86 ${phone.slice(3)}`;
  }
  return phone;
}
