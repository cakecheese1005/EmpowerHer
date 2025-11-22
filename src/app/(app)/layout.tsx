import { AppShell } from "@/components/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </AppShell>
  );
}
