"use client";

import React from "react";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex w-full">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-5 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
