"use client";

import { UpdateLoginFlowBody } from "@ory/client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { ory } from "@/lib/ory";

import type { UiNode, LoginFlow } from "@ory/client";

const PASSWORD_METHOD = "password";
const CODE_METHOD = "code";

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [flow, setFlow] = useState<LoginFlow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const flowId = searchParams.get("flow");
  const returnTo = searchParams.get("return_to") ?? "/";

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
        .createBrowserLoginFlow({ returnTo })
        .then(({ data }) => {
          router.replace(`/auth/login?flow=${data.id}${
            returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ""
          }`);
        })
        .catch((err) => {
          console.error("createBrowserLoginFlow failed", err);
          setError("无法初始化登录流程，请稍后再试。");
        });
      return;
    }

    ory
      .getLoginFlow({ id: flowId })
      .then(({ data }) => {
        setFlow(data);
        if (!phone) {
          const identifier = extractNodeValue(data.ui.nodes, "password_identifier");
          if (identifier) {
            setPhone(identifier);
          }
        }
      })
      .catch((err) => {
        console.error("getLoginFlow failed", err);
        setError("登录流程已失效，请刷新页面。");
      });
  }, [flowId, phone, returnTo, router]);

  const handleFlowError = useCallback(
    (err: any) => {
      const response = err?.response;
      if (response?.data?.ui) {
        setFlow(response.data as LoginFlow);
        setError(null);
        return;
      }
      if (response?.data?.error?.message) {
        setError(response.data.error.message);
        return;
      }

      setError("登录失败，请重试。");
    },
    [],
  );

  const afterSuccess = useCallback(() => {
    setError(null);
    router.push(returnTo || "/");
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

      const body: UpdateLoginFlowBody = {
        method: PASSWORD_METHOD,
        csrf_token: csrfToken,
        password,
        identifier: phone,
      };

      try {
        const { data } = await ory.updateLoginFlow({
          flowId: flow.id,
          updateLoginFlowBody: body,
        });
        if (data.session || data.session_token) {
          afterSuccess();
          return;
        }
        setFlow(data);
      } catch (err) {
        console.error("password login failed", err);
        handleFlowError(err);
      }
    },
    [afterSuccess, csrfToken, flow, handleFlowError, password, phone],
  );

  const sendCode = useCallback(async () => {
    if (!flow) {
      return;
    }
    if (!phone) {
      setError("请输入手机号。");
      return;
    }

    const body: UpdateLoginFlowBody = {
      method: CODE_METHOD,
      identifier: phone,
    };

    try {
      const { data } = await ory.updateLoginFlow({
        flowId: flow.id,
        updateLoginFlowBody: body,
      });
      setFlow(data);
      setCodeSent(true);
      setError(null);
    } catch (err) {
      console.error("send login code failed", err);
      handleFlowError(err);
    }
  }, [flow, handleFlowError, phone]);

  const verifyCode = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!flow) {
        return;
      }

      if (!phone || !code) {
        setError("请输入验证码。");
        return;
      }

      const body: UpdateLoginFlowBody = {
        method: CODE_METHOD,
        identifier: phone,
        code,
        csrf_token: csrfToken,
      };

      try {
        const { data } = await ory.updateLoginFlow({
          flowId: flow.id,
          updateLoginFlowBody: body,
        });
        if (data.session || data.session_token) {
          afterSuccess();
          return;
        }
        setFlow(data);
      } catch (err) {
        console.error("verify login code failed", err);
        handleFlowError(err);
      }
    },
    [afterSuccess, code, csrfToken, flow, handleFlowError, phone],
  );

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-12">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">登录平台</h1>
        <p className="text-sm text-muted-foreground">
          使用手机号 + 密码或验证码登录。
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

      <form
        className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm"
        onSubmit={submitPassword}
      >
        <h2 className="text-lg font-medium">密码登录</h2>
        <label className="flex flex-col gap-1 text-sm">
          手机号
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+8613800000000"
            className="rounded-md border px-3 py-2"
            autoComplete="tel"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          密码
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="请输入密码"
            className="rounded-md border px-3 py-2"
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          登录
        </button>
      </form>

      <form
        className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm"
        onSubmit={verifyCode}
      >
        <h2 className="text-lg font-medium">短信验证码登录</h2>
        <label className="flex flex-col gap-1 text-sm">
          手机号
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="+8613800000000"
            className="rounded-md border px-3 py-2"
            autoComplete="tel"
          />
        </label>
        <div className="flex items-end gap-2">
          <label className="flex w-full flex-col gap-1 text-sm">
            验证码
            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="6位验证码"
              className="rounded-md border px-3 py-2"
              autoComplete="one-time-code"
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
          验证并登录
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
