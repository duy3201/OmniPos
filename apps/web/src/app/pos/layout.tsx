import React from 'react';
import { PosHeader } from '@/components/layout/PosHeader';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function PosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="h-screen w-screen overflow-hidden flex flex-col bg-surface select-none">
        <PosHeader />
        <main className="w-full pt-14 flex-1 overflow-hidden">{children}</main>
      </div>
    </AuthGuard>
  );
}
