"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { UpdateSettingsFlowBody } from "@ory/client";

import { ory } from "@/lib/ory";
import type { SettingsFlow, Identity, UiNode, UiNodeAttributes } from "@ory/client";
import { Button } from "@/components/ui/button";

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

export function SettingsScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [flow, setFlow] = useState<SettingsFlow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const flowId = searchParams.get("flow");
  const returnTo = searchParams.get("return_to") ?? "/";
  const sectionParam = searchParams.get("section");
  const section = sectionParam === "password" ? "password" : "profile";

  const identityTraits = useMemo(() => {
    return (flow?.identity?.traits as Record<string, unknown>) ?? {};
  }, [flow]);

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(false);
    setPassword("");
    setConfirmPassword("");
  }, [section]);

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
          if (sectionParam) {
            params.set("section", sectionParam);
          }
          router.replace(`/account/settings?${params.toString()}`);
        })
        .catch((err) => {
          console.error("createBrowserSettingsFlow failed", err);
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
        console.error("getSettingsFlow failed", err);
        setError("设置流程已失效，请刷新页面。");
      });
  }, [flowId, returnTo, router, sectionParam]);

  const csrfToken = useMemo(() => {
    if (!flow) {
      return "";
    }
    return extractNodeValue(flow.ui.nodes, "csrf_token") ?? "";
  }, [flow]);

  const isNetworkError = (err: any) => Boolean(err?.isAxiosError && !err?.response);

  const refreshFlow = useCallback(async (id: string) => {
    const { data } = await ory.getSettingsFlow({ id });
    setFlow(data);
    return data;
  }, []);

  const handleFlowError = useCallback((err: any) => {
    const response = err?.response;
    if (isNetworkError(err) && flow) {
      refreshFlow(flow.id).catch((refreshErr) => {
        console.error("refresh settings flow failed", refreshErr);
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
    setError("设置失败，请重试。");
  }, [flow, refreshFlow]);

  const submitProfile = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!flow) {
        return;
      }

      if (!nickname.trim()) {
        setError("请输入昵称。");
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

        try {
          await refreshFlow(flow.id);
        } catch (refreshErr) {
          console.error("refresh settings flow after profile failed", refreshErr);
        }

        setSuccess("昵称已更新。");
        router.push(returnTo || "/");
      } catch (err) {
        console.error("update settings failed", err);
        handleFlowError(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [csrfToken, flow, handleFlowError, identityTraits, nickname, refreshFlow, returnTo, router],
  );

  const submitPassword = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!flow) {
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
          console.error("refresh settings flow after password failed", refreshErr);
        }

        setSuccess("密码已更新。");
        setPassword("");
        setConfirmPassword("");
        router.push(returnTo || "/");
      } catch (err) {
        console.error("update password failed", err);
        handleFlowError(err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [confirmPassword, csrfToken, flow, handleFlowError, password, refreshFlow, returnTo, router],
  );

  if (!flow) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-12 text-center text-sm text-muted-foreground">
        正在加载设置流程...
      </div>
    );
  }

  const phoneDisplay = formatPhoneDisplay(typeof identityTraits.phone === "string" ? identityTraits.phone : "");

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{section === "password" ? "更改密码" : "完善账户信息"}</h1>
        <p className="text-sm text-muted-foreground">
          {section === "password" ? "为账户设置新的登录密码。" : "查看手机号并更新昵称。"}
        </p>
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

      {section === "password" ? (
        <form className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm" onSubmit={submitPassword}>
          <label className="flex flex-col gap-1 text-sm">
            设置新密码
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
            {isSubmitting ? "提交中..." : "保存密码"}
          </Button>
        </form>
      ) : (
        <form className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm" onSubmit={submitProfile}>
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

          <Button type="submit" className="mt-2" disabled={isSubmitting}>
            {isSubmitting ? "提交中..." : "保存昵称"}
          </Button>
        </form>
      )}
    </div>
  );
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
