import type { ReactNode } from "react";

export default function FunctionalFoodLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[85vw] px-4 py-10 2xl:max-w-[1600px]">{children}</div>
  );
}
