import { HeaderVisibility } from "@/components/providers/header-visibility";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeaderVisibility visible={false}>
      <div className="flex min-h-[calc(100vh-40px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </HeaderVisibility>
  );
}
