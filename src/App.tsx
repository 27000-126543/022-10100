import { TopBar } from "./components/layout/TopBar";
import { DockBar } from "./components/layout/DockBar";
import { DialPanel } from "./windows/DialPanel";
import { CustomerPool } from "./windows/CustomerPool";
import { FollowScript } from "./windows/FollowScript";
import { QAReview } from "./windows/QAReview";
import { BookingLedger } from "./windows/BookingLedger";
import { Performance } from "./windows/Performance";
import { useAppStore } from "./stores/useAppStore";

export default function App() {
  const windows = useAppStore((s) => s.windows);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-neutral-100">
      <TopBar />

      <div className="flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(15, 118, 110, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(232, 180, 160, 0.08) 0%, transparent 50%)
            `,
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,1) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <CustomerPool />
        <DialPanel />
        <FollowScript />
        <QAReview />
        <BookingLedger />
        <Performance />

        {windows.filter((w) => w.isOpen && !w.isMinimized).length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow mb-6">
              <span className="text-3xl font-bold text-white">医</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-700 mb-2">医美私域客资跟进系统</h2>
            <p className="text-sm text-neutral-500 mb-6">点击下方 Dock 栏图标打开功能窗口</p>
            <div className="flex gap-6 text-xs text-neutral-400">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-2 text-neutral-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <span>客户池</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-2 text-neutral-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <span>拨打面板</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-2 text-neutral-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <span>跟进脚本</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-2 text-neutral-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
                </div>
                <span>质检抽听</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-2 text-neutral-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                </div>
                <span>预约台账</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center mb-2 text-neutral-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 5-5"/></svg>
                </div>
                <span>绩效统计</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <DockBar />
    </div>
  );
}
