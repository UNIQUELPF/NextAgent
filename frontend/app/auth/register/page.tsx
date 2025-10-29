import { Suspense } from "react";

import { RegistrationScreen } from "./RegistrationScreen";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-md justify-center py-12 text-sm text-muted-foreground">
          正在加载注册表单...
        </div>
      }
    >
      <RegistrationScreen />
    </Suspense>
  );
}
