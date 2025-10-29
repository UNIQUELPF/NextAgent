import { Suspense } from "react";

import { LoginScreen } from "./LoginScreen";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-md justify-center py-12 text-sm text-muted-foreground">
          正在加载登录表单...
        </div>
      }
    >
      <LoginScreen />
    </Suspense>
  );
}
