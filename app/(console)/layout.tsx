'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { ToastContainer } from '@/components/ui/Toast';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/candidates': 'Candidates',
  '/companies/invite': 'Invite Company',
  '/settings': 'Settings',
};

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const title = pageTitles[pathname] || 'Console';

  return (
    <div className="flex font-sans">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />
      <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-[margin] duration-200 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <TopBar title={title} onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 sm:p-8">{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
}
