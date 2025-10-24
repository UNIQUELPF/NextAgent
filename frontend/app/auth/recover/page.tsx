export default function RecoverPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 py-12 text-center">
      <h1 className="text-2xl font-semibold">找回账户</h1>
      <p className="text-sm text-muted-foreground">
        目前支持通过 Kratos 自助流程发送短信验证码，请根据短信提示继续操作。
      </p>
      <p className="text-sm text-muted-foreground">
        后续可在此页面补充验证码输入与密码重置表单。
      </p>
    </div>
  );
}

