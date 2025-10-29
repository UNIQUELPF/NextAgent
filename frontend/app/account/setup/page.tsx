"use client";

import { Suspense } from "react";

import { SetupScreen } from "./setup-screen";

export default function AccountSetupPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">正在初始化账户设置...</div>}>
      <SetupScreen />
    </Suspense>
  );
}
