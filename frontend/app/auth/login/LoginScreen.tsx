"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { UpdateLoginFlowBody } from "@ory/client";

import { ory } from "@/lib/ory";

import type {
  UiNode,
  UiNodeAttributes,
  LoginFlow,
  SuccessfulNativeLogin,
} from "@ory/client";

const PASSWORD_METHOD = "password";
const CODE_METHOD = "code";

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [flow, setFlow] = useState<LoginFlow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState(""); // 存储 E.164，如 +8613800000000
  const [localPhone, setLocalPhone] = useState(""); // UI 输入，仅 11 位数字
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"password" | "code">("password");
  const toggleLoginMethod = useCallback(() => {
    setLoginMethod((prev) => (prev === "password" ? "code" : "password"));
  }, []);
  const flowId = searchParams.get("flow");
  const returnTo = searchParams.get("return_to") ?? "/";
  const prefilledPhone = searchParams.get("phone");

  const redirectToRegistration = useCallback(
    (phoneNumber: string) => {
      const params = new URLSearchParams({ phone: phoneNumber });
      if (returnTo) {
        params.set("return_to", returnTo);
      }
      router.push(`/auth/register?${params.toString()}`);
    },
    [returnTo, router],
  );

  const openRegistration = useCallback(() => {
    const params = new URLSearchParams();
    const normalized = phone || normalizePhone(localPhone);
    if (normalized) {
      params.set("phone", normalized);
    }
    if (!normalized && localPhone) {
      params.set("phone", localPhone);
    }
    if (returnTo) {
      params.set("return_to", returnTo);
    }
    const query = params.toString();
    router.push(query ? `/auth/register?${query}` : "/auth/register");
  }, [localPhone, phone, returnTo, router]);

  useEffect(() => {
    setError(null);
    if (loginMethod === "password") {
      setCode("");
      setCodeSent(false);
    }
  }, [loginMethod]);

  useEffect(() => {
    if (prefilledPhone) {
      const normalized = normalizePhone(prefilledPhone);
      if (normalized) {
        setPhone(normalized);
        setLocalPhone(stripCountryCode(normalized));
      } else {
        setLocalPhone(prefilledPhone.replace(/\D/g, ""));
      }
    }
  }, [prefilledPhone]);

  const refreshFlow = useCallback(async (id: string) => {
    const { data } = await ory.getLoginFlow({ id });
    setFlow(data);
    return data;
  }, []);

  const isNetworkError = (err: any) => Boolean(err?.isAxiosError && !err?.response);

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
          router.replace(
            `/auth/login?flow=${data.id}${returnTo ? `&return_to=${encodeURIComponent(returnTo)}` : ""}`,
          );
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
          const identifier =
            extractNodeValue(data.ui.nodes, "password_identifier") ??
            extractNodeValue(data.ui.nodes, "traits.phone");
          if (identifier) {
            const normalized = normalizePhone(identifier);
            if (normalized) {
              setPhone(normalized);
              setLocalPhone(stripCountryCode(normalized));
            }
          }
        }
      })
      .catch((err) => {
        console.error("getLoginFlow failed", err);
        setError("登录流程已失效，请刷新页面。");
      });
  }, [flowId, phone, returnTo, router]);

  const handleFlowError = useCallback(
    (
      err: any,
      context?: { method?: "password" | "code"; phone?: string },
    ) => {
      if (
        context?.method === "code" &&
        context.phone &&
        shouldRedirectToRegisterResponse(err)
      ) {
        redirectToRegistration(context.phone);
        return;
      }

      const response = err?.response;
      if (response?.data?.ui) {
        const flowData = response.data as LoginFlow;
        if (
          context?.method === "code" &&
          context.phone &&
          shouldRedirectToRegisterFlow(flowData)
        ) {
          redirectToRegistration(context.phone);
          return;
        }
        setFlow(flowData);
        setError(null);
        return;
      }
      if (response?.data?.error?.message) {
        setError(response.data.error.message);
        return;
      }

      setError("登录失败，请重试。");
    },
    [redirectToRegistration],
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

      const normalizedPhone = phone || normalizePhone(localPhone);
      if (!normalizedPhone) {
        setError("请输入有效的 11 位手机号。");
        return;
      }
      if (!password) {
        setError("请填写手机号和密码。");
        return;
      }

      const body: UpdateLoginFlowBody = {
        method: PASSWORD_METHOD,
        csrf_token: csrfToken,
        password,
        identifier: normalizedPhone,
      };

      try {
        const { data } = await ory.updateLoginFlow({
          flow: flow.id,
          updateLoginFlowBody: body,
        });
        if (data.session || data.session_token) {
          afterSuccess();
          return;
        }
        if (isLoginFlow(data)) {
          setFlow(data);
        }
      } catch (err) {
        console.error("password login failed", err);
        handleFlowError(err, { method: "password", phone: normalizedPhone });
      }
    },
    [afterSuccess, csrfToken, flow, handleFlowError, localPhone, password, phone],
  );

  const sendCode = useCallback(async () => {
    if (!flow) {
      return;
    }
    const normalizedPhone = phone || normalizePhone(localPhone);
    if (!normalizedPhone) {
      setError("请输入有效的 11 位手机号。");
      return;
    }

    const body: UpdateLoginFlowBody & {
      identifier: string;
      channel: "sms";
    } = {
      method: CODE_METHOD,
      identifier: normalizedPhone,
      channel: "sms",
      csrf_token: csrfToken,
    };

    try {
      const { data } = await ory.updateLoginFlow({
        flow: flow.id,
        updateLoginFlowBody: body,
      });
      if (isLoginFlow(data)) {
        if (shouldRedirectToRegisterFlow(data)) {
          redirectToRegistration(normalizedPhone);
          return;
        }
        setFlow(data);
      }
      setCodeSent(true);
      setPhone(normalizedPhone);
      setError(null);
    } catch (err) {
      console.error("send login code failed", err);
      if (isNetworkError(err) && flow) {
        try {
          await refreshFlow(flow.id);
          setCodeSent(true);
          setPhone(normalizedPhone);
          setError(null);
          return;
        } catch (refreshErr) {
          console.error("refresh login flow failed", refreshErr);
        }
      }
      handleFlowError(err, { method: "code", phone: normalizedPhone });
    }
  }, [flow, csrfToken, handleFlowError, localPhone, phone, redirectToRegistration, refreshFlow]);

  const verifyCode = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (!flow) {
        return;
      }

      const normalizedPhone = phone || normalizePhone(localPhone);
      if (!normalizedPhone) {
        setError("请输入有效的 11 位手机号。");
        return;
      }
      if (!code) {
        setError("请输入验证码。");
        return;
      }

      const body: UpdateLoginFlowBody & {
        identifier: string;
        channel: "sms";
      } = {
        method: CODE_METHOD,
        identifier: normalizedPhone,
        code,
        channel: "sms",
        csrf_token: csrfToken,
      };

      try {
        const { data } = await ory.updateLoginFlow({
          flow: flow.id,
          updateLoginFlowBody: body,
        });
        if (data.session || data.session_token) {
          afterSuccess();
          return;
        }
        if (isLoginFlow(data)) {
          if (shouldRedirectToRegisterFlow(data)) {
            redirectToRegistration(normalizedPhone);
            return;
          }
          setFlow(data);
        }
      } catch (err) {
        console.error("verify login code failed", err);
        if (isNetworkError(err) && flow) {
          try {
            await refreshFlow(flow.id);
            setPhone(normalizedPhone);
            setError(null);
            return;
          } catch (refreshErr) {
            console.error("refresh login flow failed", refreshErr);
          }
        }
        handleFlowError(err, { method: "code", phone: normalizedPhone });
      }
    },
    [afterSuccess, code, csrfToken, flow, handleFlowError, localPhone, phone, redirectToRegistration, refreshFlow],
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

      <div className="rounded-lg border bg-background p-6 shadow-sm">
        {loginMethod === "password" ? (
          <form className="flex flex-col gap-4" onSubmit={submitPassword}>
            <label className="flex flex-col gap-1 text-sm">
              手机号
              <div className="flex gap-2">
                <div className="flex items-center rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground">
                  +86
                </div>
                <input
                  type="tel"
                  value={localPhone}
                  onChange={(event) => setLocalPhone(event.target.value)}
                  placeholder="请输入 11 位手机号"
                  className="flex-1 rounded-md border px-3 py-2"
                  autoComplete="tel"
                />
              </div>
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
        ) : (
          <form className="flex flex-col gap-4" onSubmit={verifyCode}>
            <label className="flex flex-col gap-1 text-sm">
              手机号
              <div className="flex gap-2">
                <div className="flex items-center rounded-md border px-3 py-2 text-sm font-medium text-muted-foreground">
                  +86
                </div>
                <input
                  type="tel"
                  value={localPhone}
                  onChange={(event) => setLocalPhone(event.target.value)}
                  placeholder="请输入 11 位手机号"
                  className="flex-1 rounded-md border px-3 py-2"
                  autoComplete="tel"
                />
              </div>
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
        )}
        <button
          type="button"
          onClick={toggleLoginMethod}
          className="mt-4 text-sm text-primary underline"
        >
          {loginMethod === "password" ? "改用短信验证码登录" : "返回密码登录"}
        </button>
        <div className="mt-3 text-center text-sm text-muted-foreground">
          还没有账号？
          <button
            type="button"
            onClick={openRegistration}
            className="ml-1 text-primary underline"
          >
            立即注册
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 11 || !digits.startsWith("1")) {
    return null;
  }
  return `+86${digits}`;
}

function stripCountryCode(e164: string): string {
  if (e164.startsWith("+86")) {
    return e164.slice(3);
  }
  return e164.replace(/\D/g, "");
}

function extractNodeValue(nodes: UiNode[], name: string): string | undefined {
  for (const node of nodes) {
    const attrs = node.attributes as UiNodeAttributes;
    if (isNamedInput(attrs, name) && attrs.value !== undefined) {
      return String(attrs.value);
    }
  }
  return undefined;
}

type InputNode = Extract<UiNodeAttributes, { node_type: "input" }>;

function isNamedInput(
  attrs: UiNodeAttributes,
  name: string,
): attrs is InputNode {
  return (
    attrs.node_type === "input" &&
    Object.prototype.hasOwnProperty.call(attrs, "name") &&
    (attrs as InputNode).name === name
  );
}

function shouldRedirectToRegisterFlow(flow: LoginFlow): boolean {
  const messages = flow.ui.messages ?? [];
  return messages.some((message) =>
    containsRegistrationHint(message.text ?? ""),
  );
}

function shouldRedirectToRegisterResponse(err: any): boolean {
  const response = err?.response;
  if (!response) {
    return false;
  }
  if (response.data?.ui) {
    return shouldRedirectToRegisterFlow(response.data as LoginFlow);
  }
  const message: string = response.data?.error?.message ?? "";
  return containsRegistrationHint(message);
}

function containsRegistrationHint(text: string): boolean {
  if (!text) {
    return false;
  }
  const normalized = text.toLowerCase();
  return (
    normalized.includes("sign up") ||
    normalized.includes("register") ||
    normalized.includes("未注册") ||
    normalized.includes("不存在")
  );
}

function isLoginFlow(
  data: LoginFlow | SuccessfulNativeLogin,
): data is LoginFlow {
  return "id" in data && "ui" in data;
}
