import React, { useState, useEffect } from "react";
import { GroupBoard } from "../types";
import { 
  Users, MessageSquare, PenTool, LayoutGrid, 
  Play, Pause, ArrowLeft, ArrowRight, Layers, 
  Bookmark, Award, HelpCircle, Activity 
} from "lucide-react";

interface AllGroupsPresentationProps {
  groups: { [groupId: string]: GroupBoard };
  onSelectGroup: (groupId: string) => void;
}

export default function AllGroupsPresentation({
  groups,
  onSelectGroup,
}: AllGroupsPresentationProps) {
  const groupList = Object.values(groups);
  
  // Slide Show State
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [carouselInterval, setCarouselInterval] = useState(8); // seconds

  // Auto carousel effect
  useEffect(() => {
    let timer: any;
    if (isPlaying && isFullscreenMode) {
      timer = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % groupList.length);
      }, carouselInterval * 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isFullscreenMode, carouselInterval, groupList.length]);

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % groupList.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + groupList.length) % groupList.length);
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-fadeIn">
      {/* Presentation Header Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-bold text-cathay-green flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-cathay-gold" />
            各組討論展示大廳 (All-Groups Presentation Arena)
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            國泰人壽大樓 B1 國際會議室現場主螢幕專用。即時追蹤 5 個會議室的便利貼編撰進度。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Slide show options */}
          <button
            onClick={() => {
              setIsFullscreenMode(!isFullscreenMode);
              setIsPlaying(true);
            }}
            className="flex items-center gap-1.5 bg-cathay-green hover:bg-cathay-green-hover text-white px-4 py-2 text-xs font-semibold rounded-lg shadow transition"
          >
            <Play className="w-3.5 h-3.5" />
            啟動大螢幕輪播投影
          </button>
        </div>
      </div>

      {/* Grid Dashboard */}
      {!isFullscreenMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groupList.map((group) => {
            const notesCount = group.notes.length;
            const commentsCount = group.notes.reduce((acc, note) => acc + (note.comments?.length || 0), 0);
            const drawingsCount = group.drawings.length;
            
            // Calculate a simple activity score (progress indicator)
            const activityScore = Math.min(100, (notesCount * 15) + (commentsCount * 5) + (drawingsCount * 10));

            return (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                className="bg-white rounded-xl border border-gray-200 hover:border-cathay-green hover:shadow-md transition-all cursor-pointer flex flex-col overflow-hidden group"
              >
                {/* Card Top Branding */}
                <div className="bg-stone-50 border-b border-gray-100 p-4 group-hover:bg-emerald-50/20 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-cathay-gold-light text-amber-800 font-bold px-2 py-0.5 rounded-sm">
                      {group.room}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-500" />
                      活性指數: {activityScore}%
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 mt-2 line-clamp-1 group-hover:text-cathay-green transition">
                    主持人：{group.tutor}
                  </h3>
                  <p className="text-[11px] text-gray-500 italic mt-0.5">{group.moderatorTitle}</p>
                </div>

                {/* Case topic brief */}
                <div className="p-4 flex-1 border-b border-gray-100 bg-white">
                  <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-sm">
                    討論案例主題
                  </span>
                  <h4 className="text-xs font-bold text-gray-900 mt-1.5 mb-2 line-clamp-1">
                    {group.caseTitle}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                    {group.caseDescription}
                  </p>

                  {/* Highlights of discussion notes */}
                  <div className="mt-4 pt-3 border-t border-dashed border-gray-100">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      最新討論觀點 ({notesCount})
                    </span>
                    {group.notes.length === 0 ? (
                      <p className="text-[11px] text-gray-400 italic py-1">等待學員張貼第一張討論便利貼...</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[100px] overflow-hidden">
                        {group.notes.slice(0, 3).map((note) => (
                          <div
                            key={note.id}
                            className="text-[11px] text-gray-600 truncate bg-stone-50 border-l-2 pl-2 py-1 rounded"
                            style={{ borderLeftColor: note.color }}
                          >
                            <span className="font-bold text-[10px] text-gray-500 mr-1">
                              {note.isAnonymous ? "匿名" : note.author}:
                            </span>
                            {note.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Statistics Footer */}
                <div className="bg-gray-50 p-3.5 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="便利貼貼紙數">
                      <Layers className="w-3.5 h-3.5 text-gray-400" />
                      {notesCount}
                    </span>
                    <span className="flex items-center gap-1" title="匿名討論評論數">
                      <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                      {commentsCount}
                    </span>
                    <span className="flex items-center gap-1" title="手繪線條數">
                      <PenTool className="w-3.5 h-3.5 text-gray-400" />
                      {drawingsCount}
                    </span>
                  </div>
                  
                  <span className="text-[10px] text-cathay-green font-bold group-hover:underline flex items-center gap-0.5">
                    進入討論白板
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Fullscreen Carousel Projection Mode (Perfect for conference big screen) */
        <div className="bg-slate-900 text-white rounded-xl overflow-hidden border border-slate-800 shadow-2xl relative h-[650px] flex flex-col justify-between animate-fadeIn">
          {/* Slide Top HUD info */}
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-cathay-gold text-slate-950 font-bold rounded text-xs">
                輪播放映模式
              </span>
              <h3 className="text-sm font-bold text-gray-300">
                115 年度醫師一般醫學訓練計畫 導師研習營(第一場) - 國泰場
              </h3>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 rounded-md px-3 py-1">
                <span>自動切換 ({carouselInterval}s):</span>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`p-1 rounded transition ${isPlaying ? "text-emerald-400" : "text-amber-500"}`}
                  title={isPlaying ? "暫停" : "播放"}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                onClick={() => setIsFullscreenMode(false)}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
              >
                退出投影
              </button>
            </div>
          </div>

          {/* Slide Content (Full Display of Single Group) */}
          <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto max-h-[500px]">
            {/* Left Box: Case study detail */}
            <div className="lg:col-span-1 bg-slate-950/60 rounded-xl p-6 border border-slate-800/80 flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-cathay-gold"></span>
                  <span className="text-xs text-cathay-gold font-bold tracking-widest font-sans">
                    {groupList[currentSlideIndex].room}
                  </span>
                </div>
                
                <h2 className="text-xl font-serif font-bold text-white leading-tight">
                  {groupList[currentSlideIndex].caseTitle}
                </h2>
                
                <p className="text-xs font-bold text-emerald-400 mt-2">
                  主持人：{groupList[currentSlideIndex].tutor} ({groupList[currentSlideIndex].moderatorTitle})
                </p>

                <p className="text-xs text-slate-300 leading-relaxed mt-4 whitespace-pre-line text-justify bg-slate-900/60 p-4 rounded-lg border border-slate-800 shadow-inner">
                  {groupList[currentSlideIndex].caseDescription}
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <span className="text-[10px] font-bold text-emerald-400 block mb-1">小組研討焦點：</span>
                <p className="text-xs text-slate-300 font-medium">{groupList[currentSlideIndex].caseTarget}</p>
              </div>
            </div>

            {/* Right Box: Live Sticky Notes snapshots from the board */}
            <div className="lg:col-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-4 flex items-center gap-2 justify-between">
                  <span>即時白板留言貼紙 ({groupList[currentSlideIndex].notes.length})</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Slide {currentSlideIndex + 1} of {groupList.length}
                  </span>
                </h3>

                {groupList[currentSlideIndex].notes.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center bg-slate-950/20 border border-dashed border-slate-800 rounded-xl">
                    <p className="text-sm text-slate-500 italic">本組目前尚無研討對策便利貼留言</p>
                    <button
                      onClick={() => onSelectGroup(groupList[currentSlideIndex].id)}
                      className="mt-4 bg-cathay-green hover:bg-cathay-green-hover text-white text-xs px-4 py-2 rounded-lg"
                    >
                      前往加入討論
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-2">
                    {groupList[currentSlideIndex].notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 rounded-lg shadow-md flex flex-col justify-between h-40 border border-black/10 select-none text-slate-800 relative"
                        style={{ backgroundColor: note.color }}
                      >
                        <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono border-b border-black/5 pb-1">
                          <span className="font-bold">{note.isAnonymous ? "👤 匿名導師" : `👨‍⚕️ ${note.author}`}</span>
                          <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <p className="flex-1 text-xs font-sans mt-2 overflow-y-auto line-clamp-4 leading-relaxed pr-1 font-medium">
                          {note.text}
                        </p>
                        {note.comments && note.comments.length > 0 && (
                          <div className="mt-1 flex justify-end">
                            <span className="text-[9px] bg-slate-900/10 px-1.5 py-0.5 rounded-full text-slate-700 font-bold flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" />
                              {note.comments.length} 條評論
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Slide view footer jump buttons */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => onSelectGroup(groupList[currentSlideIndex].id)}
                  className="bg-cathay-green hover:bg-cathay-green-hover text-white text-xs px-6 py-2.5 rounded-lg shadow font-bold flex items-center gap-1 transition"
                >
                  <Layers className="w-4 h-4" />
                  切換至此組，進行互動式編輯
                </button>
              </div>
            </div>
          </div>

          {/* Slide Navigation Bar */}
          <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handlePrevSlide}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition"
              title="上一組"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Slide bullet dots */}
            <div className="flex gap-2">
              {groupList.map((g, idx) => (
                <button
                  key={g.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentSlideIndex === idx
                      ? "bg-cathay-gold w-6"
                      : "bg-slate-700 hover:bg-slate-500"
                  }`}
                  title={g.room}
                />
              ))}
            </div>

            <button
              onClick={handleNextSlide}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition"
              title="下一組"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
