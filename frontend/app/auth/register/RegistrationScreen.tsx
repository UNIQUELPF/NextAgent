"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { UpdateRegistrationFlowBody } from "@ory/client";

import { ory } from "@/lib/ory";

import type {
  RegistrationFlow,
  SuccessfulNativeRegistration,
  UiNode,
  UiNodeAttributes,
} from "@ory/client";

const PASSWORD_METHOD = "password";
const CODE_METHOD = "code";
const DEFAULT_USER_TYPE = "external";
const DEFAULT_ROLES = ["customer"];

export function RegistrationScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [flow, setFlow] = useState<RegistrationFlow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState(""); // 存储 E.164，如 +8613800000000
  const [localPhone, setLocalPhone] = useState(""); // UI 输入，仅 11 位数字
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [step, setStep] = useState<"code" | "password">("code");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const flowId = searchParams.get("flow");
  const returnTo = searchParams.get("return_to") ?? "/";
  const prefilledPhone = searchParams.get("phone");

  useEffect(() => {
    if (prefilledPhone) {
      const normalized = normalizePhone(prefilledPhone);
      if (normalized) {
        setPhone(normalized);
        setLocalPhone(stripCountryCode(normalized));
      }
    }
  }, [prefilledPhone]);

  const csrfToken = useMemo(() => {
    if (!flow) {
      return "";
    }
    return extractNodeValue(flow.ui.nodes, "csrf_token") ?? "";
  }, [flow]);

  const deriveStepFromFlow = useCallback((f: RegistrationFlow | null) => {
    if (!f) {
      return "code";
    }
    const hasPasswordNode = f.ui.nodes.some((node) => {
      const attrs = node.attributes as UiNodeAttributes | undefined;
      if (!attrs) {
        return false;
      }
      const name = (attrs as Partial<InputNode>).name;
      if (name === "password") {
        return true;
      }
      const group = (attrs as { group?: string }).group;
      return group === "password";
    });
    const requiresCode = f.ui.nodes.some((node) => {
      const attrs = node.attributes as UiNodeAttributes | undefined;
      return (attrs as Partial<InputNode>)?.name === "code";
    });
    if (hasPasswordNode && !requiresCode) {
      return "password";
    }
    return "code";
  }, []);

  useEffect(() => {
    setStep((prev) => {
      const next = deriveStepFromFlow(flow);
      if (prev !== next) {
        return next;
      }
      return prev;
    });
  }, [flow, deriveStepFromFlow]);

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!flowId) {
      ory
        .createBrowserRegistrationFlow({ returnTo })
        .then(({ data }) => {
          const params = new URLSearchParams({ flow: data.id });
          if (returnTo) {
            params.set("return_to", returnTo);
          }
          if (prefilledPhone) {
            params.set("phone", prefilledPhone);
          }
          router.replace(`/auth/register?${params.toString()}`);
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
            const normalized = normalizePhone(identifier);
            if (normalized) {
              setPhone(normalized);
              setLocalPhone(stripCountryCode(normalized));
            }
          }
        }
        const nameFromFlow = extractNodeValue(data.ui.nodes, "traits.username");
        if (nameFromFlow) {
          setUsername(nameFromFlow);
        }
      })
      .catch((err) => {
        console.error("getRegistrationFlow failed", err);
        setError("注册流程已失效，请刷新页面。");
      });
  }, [flowId, phone, returnTo, router, prefilledPhone]);

  const passwordError = useMemo(() => {
    if (!password) {
      return "";
    }
    if (password.length < 8) {
      return "密码至少 8 位";
    }
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return "密码需包含字母和数字";
    }
    return "";
  }, [password]);

  const passwordsMatch = password === confirmPassword;

  const sendCode = useCallback(async () => {
    if (!flow) {
      return;
    }
    const normalizedPhone = normalizePhone(localPhone);
    if (!normalizedPhone) {
      setError("请输入有效的 11 位手机号。");
      return;
    }

    setIsSendingCode(true);
    setError(null);

    const tempUsername = `user_${normalizedPhone.replace('+86', '')}`;
    const body: UpdateRegistrationFlowBody & {
      identifier: string;
      channel: "sms";
    } = {
      method: CODE_METHOD,
      traits: {
        phone: normalizedPhone,
        username: tempUsername,
        user_type: DEFAULT_USER_TYPE,
      },
      csrf_token: csrfToken,
      identifier: normalizedPhone,
      channel: "sms",
    };

    try {
      const { data } = await ory.updateRegistrationFlow({
        flow: flow.id,
        updateRegistrationFlowBody: body,
      });
      if (isRegistrationFlow(data)) {
        setFlow(data);
      }
      setCodeSent(true);
      setPhone(normalizedPhone);
    } catch (err) {
      console.error("send registration code failed", err);
      handleFlowError(err);
    } finally {
      setIsSendingCode(false);
    }
  }, [csrfToken, flow, handleFlowError, localPhone]);

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

      setIsVerifyingCode(true);
      setError(null);

      const tempUsername = `user_${normalizedPhone.replace('+86', '')}`;
      const body: UpdateRegistrationFlowBody & {
        identifier: string;
        channel: "sms";
      } = {
        method: CODE_METHOD,
        code,
        traits: {
          phone: normalizedPhone,
          username: tempUsername,
          user_type: DEFAULT_USER_TYPE,
        },
        csrf_token: csrfToken,
        identifier: normalizedPhone,
        channel: "sms",
      };

      try {
        const { data } = await ory.updateRegistrationFlow({
          flow: flow.id,
          updateRegistrationFlowBody: body,
        });
        if (isRegistrationFlow(data)) {
          setFlow(data);
          setStep("password");
          setPhone(normalizedPhone);
        } else if (data.identity?.id) {
          router.push(returnTo || "/");
        }
      } catch (err) {
        console.error("verify registration code failed", err);
        handleFlowError(err);
      } finally {
        setIsVerifyingCode(false);
      }
    },
    [code, csrfToken, flow, handleFlowError, localPhone, phone, returnTo, router],
  );

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
      if (!username.trim()) {
        setError("请输入用户名。");
        return;
      }
      if (!password) {
        setError("请输入密码。");
        return;
      }
      if (passwordError) {
        setError(passwordError);
        return;
      }
      if (!passwordsMatch) {
        setError("两次输入的密码不一致。");
        return;
      }

      setIsSubmittingPassword(true);
      setError(null);

      const body: UpdateRegistrationFlowBody = {
        method: PASSWORD_METHOD,
        csrf_token: csrfToken,
        password,
        traits: {
          phone: normalizedPhone,
          username: username || `user_${normalizedPhone.replace('+86', '')}`,
          user_type: DEFAULT_USER_TYPE,
          roles: DEFAULT_ROLES,
        },
      };

      try {
        const { data } = await ory.updateRegistrationFlow({
          flow: flow.id,
          updateRegistrationFlowBody: body,
        });
        if (data.identity?.id) {
          router.push(returnTo || "/");
          return;
        }
        if (isRegistrationFlow(data)) {
          setFlow(data);
        }
      } catch (err) {
        console.error("password registration failed", err);
        handleFlowError(err);
      } finally {
        setIsSubmittingPassword(false);
      }
    },
    [csrfToken, flow, handleFlowError, localPhone, password, passwordError, passwordsMatch, phone, returnTo, router, username],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">注册账户</h1>
        <p className="text-sm text-muted-foreground">
          通过手机号验证并设置密码，完成账号创建。
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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

      {step === "code" ? (
        <form
          className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm"
          onSubmit={verifyCode}
        >
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
                placeholder="6 位验证码"
                className="rounded-md border px-3 py-2"
                autoComplete="one-time-code"
              />
            </label>
            <button
              type="button"
              onClick={sendCode}
              className="h-10 rounded-md border px-3 text-sm font-medium"
              disabled={isSendingCode || !localPhone}
            >
              {isSendingCode ? "发送中..." : codeSent ? "重新发送" : "发送验证码"}
            </button>
          </div>
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            disabled={isVerifyingCode}
          >
            {isVerifyingCode ? "验证中..." : "验证并继续"}
          </button>
        </form>
      ) : (
        <form
          className="flex flex-col gap-4 rounded-lg border bg-background p-6 shadow-sm"
          onSubmit={submitPassword}
        >
          <div className="rounded-md border border-dashed border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            已验证手机号：<span className="font-medium text-foreground">{formatPhone(phone)}</span>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            用户名
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入用户名"
              className="rounded-md border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            设置密码
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 8 位，包含字母和数字"
              className="rounded-md border px-3 py-2"
              autoComplete="new-password"
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
              autoComplete="new-password"
            />
          </label>
          {passwordError && password && (
            <p className="text-sm text-red-600">{passwordError}</p>
          )}
          <button
            type="submit"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            disabled={isSubmittingPassword}
          >
            {isSubmittingPassword ? "提交中..." : "提交注册"}
          </button>
        </form>
      )}
    </div>
  );
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

function isRegistrationFlow(
  data: RegistrationFlow | SuccessfulNativeRegistration,
): data is RegistrationFlow {
  return typeof data === "object" && data !== null && "ui" in data;
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

function formatPhone(e164: string): string {
  if (!e164) {
    return "";
  }
  if (e164.startsWith("+86")) {
    return `+86 ${e164.slice(3)}`;
  }
  return e164;
}
