import React, { useState } from "react";
import { Users, Server, RefreshCw, Layers } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

interface HeaderProps {
  activeUsers: number;
  onResetBoard: () => void;
  isSyncing: boolean;
  activeView: "board" | "presentation";
  setActiveView: (view: "board" | "presentation") => void;
}

export default function Header({
  activeUsers,
  onResetBoard,
  isSyncing,
  activeView,
  setActiveView,
}: HeaderProps) {
  const [jctImgErr, setJctImgErr] = useState(false);
  const [cathayImgErr, setCathayImgErr] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  return (
    <header className="relative w-full bg-white border-b border-gray-200 overflow-hidden select-none">
      {/* Decorative Wave Background (Inspired by the Banner) */}
      <div className="absolute top-0 left-0 w-64 h-full pointer-events-none opacity-20">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full text-cathay-green fill-current">
          <path d="M0,0 Q30,50 0,100 Z" />
          <path d="M0,15 Q40,60 0,85" stroke="#c5a059" strokeWidth="1" fill="none" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-80 h-full pointer-events-none opacity-20">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full text-cathay-green fill-current">
          <path d="M100,0 Q70,40 100,70 Z" />
          <path d="M100,10 Q60,50 100,90" stroke="#c5a059" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Hexagonal grid placeholder on left margin */}
      <div className="absolute left-6 bottom-4 flex flex-col gap-1.5 opacity-30 pointer-events-none">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cathay-green"></span>
          <span className="w-2 h-2 rounded-full bg-cathay-green"></span>
          <span className="w-2 h-2 rounded-full bg-cathay-green"></span>
        </div>
        <div className="flex gap-1.5 ml-2">
          <span className="w-2 h-2 rounded-full bg-cathay-gold"></span>
          <span className="w-2 h-2 rounded-full bg-cathay-gold"></span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left Side: JCT Joint Commission of Taiwan logo styling */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
            {/* JCT Stylized Logo */}
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-red-800 bg-white shadow-sm relative overflow-hidden">
              {!jctImgErr ? (
                <img
                  src="/jct_logo.png"
                  alt="醫策會 Logo"
                  className="w-10 h-10 object-contain"
                  referrerPolicy="no-referrer"
                  onError={() => {
                    // Try joint_logo.png as alternate before giving up to vector SVG
                    setJctImgErr(true);
                  }}
                />
              ) : (
                <svg className="w-9 h-9 text-red-800 fill-current" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="3" fill="none" />
                  <path d="M40 30 C45 35, 45 65, 40 70 M60 30 C55 35, 55 65, 60 70 M25 50 H 75" stroke="currentColor" strokeWidth="4" fill="none" />
                  <text x="50" y="55" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#991b1b" fontFamily="sans-serif">醫策會</text>
                </svg>
              )}
              <span className="absolute -bottom-1 text-[8px] bg-red-800 text-white font-mono px-1 rounded-sm leading-none">JCT</span>
            </div>
            <div className="text-[10px] leading-tight text-gray-500 font-mono hidden sm:block">
              <div className="font-bold tracking-wider">JOINT COMMISSION</div>
              <div>OF TAIWAN</div>
            </div>
          </div>

          <div className="flex flex-col text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-serif font-bold text-cathay-green tracking-wide">
              115 年度醫師畢業後一般醫學訓練計畫
            </h1>
            <h2 className="text-lg md:text-xl font-sans font-medium text-gray-700 tracking-wider flex items-center gap-2 justify-center md:justify-start">
              <span>導師研習營（第一場）議程</span>
              <span className="px-2 py-0.5 text-xs font-semibold bg-cathay-gold-light text-cathay-gold border border-cathay-gold/30 rounded-full">
                國泰綜合醫院
              </span>
            </h2>
          </div>
        </div>

        {/* Right Side: Cathay Hospital Tree Logo and Controls */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <div className="flex items-center gap-3">
            {/* Cathay Banyan Tree Logo */}
            <div className="flex items-center gap-2 bg-emerald-50/50 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-sm overflow-hidden">
              {!cathayImgErr ? (
                <img
                  src="/cathay_logo.png"
                  alt="國泰 Logo"
                  className="w-8 h-8 object-contain"
                  referrerPolicy="no-referrer"
                  onError={() => setCathayImgErr(true)}
                />
              ) : (
                <svg className="w-8 h-8 text-cathay-green fill-current" viewBox="0 0 100 100">
                  {/* stylized Cathay Tree shape */}
                  <path d="M50 85 V 70 M45 70 H 55 V 60 H 45 Z" stroke="#009245" strokeWidth="6" strokeLinecap="round" />
                  <path d="M50 15 C 32 15, 20 28, 20 42 C 20 52, 28 60, 40 62 C 42 66, 48 68, 50 68 C 52 68, 58 66, 60 62 C 72 60, 80 52, 80 42 C 80 28, 68 15, 50 15 Z" fill="#009245" />
                  <circle cx="38" cy="40" r="4" fill="#ffffff" opacity="0.3" />
                  <circle cx="55" cy="30" r="5" fill="#ffffff" opacity="0.2" />
                </svg>
              )}
              <div className="text-left">
                <div className="text-xs font-bold text-cathay-green font-sans leading-none tracking-tight">國泰綜合醫院</div>
                <span className="text-[9px] text-gray-400 font-mono tracking-tighter">Cathay General Hospital</span>
              </div>
            </div>
          </div>

          {/* Sync status & view switcher */}
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100 shadow-inner">
            <button
              onClick={() => setActiveView("board")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeView === "board"
                  ? "bg-cathay-green text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              小組討論白板
            </button>
            <button
              onClick={() => setActiveView("presentation")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeView === "presentation"
                  ? "bg-cathay-green text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              多屏分組展示
            </button>
          </div>
        </div>
      </div>

      {/* Gold Divider Line with Center Diamond Motif */}
      <div className="relative w-full flex items-center justify-center">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-cathay-gold opacity-60"></div>
        </div>
        <div className="relative flex justify-center text-xs bg-white px-4">
          <span className="text-cathay-gold flex gap-1">
            <span className="transform rotate-45 w-1.5 h-1.5 bg-cathay-gold inline-block"></span>
            <span className="transform rotate-45 w-2 h-2 bg-cathay-gold inline-block"></span>
            <span className="transform rotate-45 w-1.5 h-1.5 bg-cathay-gold inline-block"></span>
          </span>
        </div>
      </div>

      {/* Secondary Bar: active clients & control commands */}
      <div className="bg-gray-50 px-4 md:px-8 py-2 flex flex-wrap items-center justify-between text-xs text-gray-500 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            即時線上研討：{activeUsers} 人在線
          </span>
          <span className="flex items-center gap-1 font-mono text-gray-400">
            <Server className="w-3 h-3 text-gray-300" />
            實時連線模式 (SSE Sync)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isSyncing && (
            <span className="flex items-center gap-1 text-[11px] text-cathay-green font-medium animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              同步中...
            </span>
          )}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 font-medium hover:underline border border-red-200 hover:bg-red-50 px-2 py-0.5 rounded transition"
          >
            <RefreshCw className="w-3 h-3" />
            重設白板數據
          </button>
        </div>
      </div>

      {/* Custom Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="重設電子白板數據"
        message="確定要重設所有小組的電子白板嗎？這將會清除所有便利貼留言與手繪線條，並還原至初始狀態。"
        confirmText="重設白板"
        cancelText="取消"
        isDanger={true}
        onConfirm={() => {
          setIsResetConfirmOpen(false);
          onResetBoard();
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </header>
  );
}
