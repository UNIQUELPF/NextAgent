export default function VerifyPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-12 text-center">
      <h1 className="text-2xl font-semibold">验证账户</h1>
      <p className="text-sm text-muted-foreground">
        请按照短信提示输入验证码完成验证。
      </p>
      <p className="text-sm text-muted-foreground">
        开发阶段可在 Kratos courier 日志中查看验证码。后续可扩展此页面以调用验证码验证流程。
      </p>
    </div>
  );
}

