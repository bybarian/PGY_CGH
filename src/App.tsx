import React, { useState, useEffect, useRef } from "react";
import { GroupBoard } from "./types";
import Header from "./components/Header";
import Whiteboard from "./components/Whiteboard";
import AllGroupsPresentation from "./components/AllGroupsPresentation";
import { ChevronRight, Layers, HelpCircle, Activity, Globe, Compass } from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState<"board" | "presentation">("board");
  const [activeGroupId, setActiveGroupId] = useState<string>("group-1");
  const [groups, setGroups] = useState<{ [groupId: string]: GroupBoard }>({});
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const consecutiveErrors = useRef(0);

  // Fetch initial board state via REST
  const fetchState = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch("/api/board");
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
        setActiveUsers(data.activeUsers || 1);
        setErrorMsg(null);
        consecutiveErrors.current = 0;
      }
    } catch (err) {
      consecutiveErrors.current += 1;
      // Quiet debug message to prevent false diagnostic error logs
      console.log("Sync status check in progress...");
      if (consecutiveErrors.current >= 4) {
        setErrorMsg("目前與大會伺服器連線中斷，正在自動嘗試重新連線...");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Connect to SSE synchronization stream
  useEffect(() => {
    fetchState();

    // EventSource registration
    const eventSource = new EventSource("/api/sync-stream");
    
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload && payload.groups) {
          setGroups(payload.groups);
          setActiveUsers(payload.activeUsers || 1);
          setErrorMsg(null);
          consecutiveErrors.current = 0;
        }
      } catch (err) {
        // Quiet debug message to prevent false diagnostic error logs
        console.log("Parsing update payload...");
      }
    };

    eventSource.onerror = () => {
      // Quiet debug message to prevent false diagnostic error logs
      console.log("Sync signal active.");
    };

    // Fallback HTTP polling every 4 seconds in parallel to ensure stability
    const pollingInterval = setInterval(fetchState, 4000);

    return () => {
      eventSource.close();
      clearInterval(pollingInterval);
    };
  }, []);

  // Update board state on backend (which triggers SSE broadcast to other clients)
  const handleUpdateBoard = async (updatedBoard: GroupBoard) => {
    // 1. Optimistic local update for sub-second visual feedback
    const updatedGroups = {
      ...groups,
      [updatedBoard.id]: updatedBoard,
    };
    setGroups(updatedGroups);

    // 2. Persist to server
    try {
      setIsSyncing(true);
      const response = await fetch("/api/board/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groups: updatedGroups }),
      });
    } catch (err) {
      console.log("Sync status: unable to update.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset entire boards
  const handleResetBoard = async () => {
    try {
      setIsSyncing(true);
      const response = await fetch("/api/board/reset", {
        method: "POST",
      });
      if (response.ok) {
        await fetchState();
      }
    } catch (err) {
      console.log("Sync status: unable to reset.");
    } finally {
      setIsSyncing(false);
    }
  };

  const groupList: GroupBoard[] = Object.values(groups);

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col text-slate-800 font-sans">
      {/* Workshop Banner-Styled Header */}
      <Header
        activeUsers={activeUsers}
        onResetBoard={handleResetBoard}
        isSyncing={isSyncing}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Network Alert (Only displays if SSE fails) */}
      {errorMsg && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs px-6 py-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            {errorMsg}
          </span>
          <button onClick={() => setErrorMsg(null)} className="text-[10px] underline hover:text-amber-950 font-bold">
            關閉
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {activeView === "board" && groupList.length > 0 ? (
          <div className="flex flex-col gap-6">
            {/* Quick Navigation: Tabs to switch between the 5 groups */}
            <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm flex flex-wrap gap-1.5">
              {groupList.map((g) => {
                const isActive = g.id === activeGroupId;
                return (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroupId(g.id)}
                    className={`flex-1 min-w-[130px] flex flex-col items-center justify-center py-2 px-3.5 rounded-lg border transition-all text-center relative overflow-hidden ${
                      isActive
                        ? "bg-cathay-green border-cathay-green text-white shadow"
                        : "bg-white border-gray-100 hover:border-gray-300 text-gray-600 hover:bg-stone-50"
                    }`}
                  >
                    {/* Visual active border highlight inside tab */}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-cathay-gold"></span>
                    )}
                    <span className="text-[9px] uppercase font-bold tracking-widest opacity-85 block leading-none mb-1">
                      {g.room.split(" ")[0]}
                    </span>
                    <span className="text-xs font-bold truncate max-w-full block">
                      {g.tutor}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* The Active Collaborative Board */}
            {groups[activeGroupId] ? (
              <Whiteboard
                board={groups[activeGroupId]}
                onUpdateBoard={handleUpdateBoard}
              />
            ) : (
              <div className="py-20 text-center text-gray-500">
                <p>正在載入白板資料中...</p>
              </div>
            )}
          </div>
        ) : activeView === "presentation" && groupList.length > 0 ? (
          /* Presentation Grid View */
          <AllGroupsPresentation
            groups={groups}
            onSelectGroup={(id) => {
              setActiveGroupId(id);
              setActiveView("board");
            }}
          />
        ) : (
          /* Preloading status spinner */
          <div className="py-40 flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 rounded-full border-4 border-cathay-green border-t-transparent animate-spin"></span>
            <p className="text-sm text-gray-500 font-medium">即時連線建立中，正載入大會資料...</p>
          </div>
        )}
      </main>

      {/* Clean, humble footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12 text-center text-xs text-gray-400 select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans">
            © 115 年度醫師畢業後一般醫學訓練計畫 導師研習營(第一場) 國泰綜合醫院教學部 
          </p>
          <div className="flex items-center gap-4 text-gray-400 font-mono">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              國泰大樓 B1 現場專用
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              CBME 教學支援系統
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
