"use client";
import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <Sidebar />
      <main className="transition-all duration-300 pl-[280px]">
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1 p-8 overflow-y-auto">
            {children}
          </div>
        </div>
      </main>
      
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-40">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-mint/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-gold/5 blur-[100px] rounded-full" />
      </div>
    </ToastProvider>
  );
}
