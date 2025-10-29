import { Suspense } from "react";

import { SettingsScreen } from "./settings-screen";

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">正在加载设置页面...</div>}>
      <SettingsScreen />
    </Suspense>
  );
}
