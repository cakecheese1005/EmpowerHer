'use client';

import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
