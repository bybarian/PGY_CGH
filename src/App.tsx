import React, { useState, useEffect, useRef } from "react";
import { GroupBoard } from "./types";
import Header from "./components/Header";
import Whiteboard from "./components/Whiteboard";
import AllGroupsPresentation from "./components/AllGroupsPresentation";
import { ChevronRight, Layers, HelpCircle, Activity, Globe, Compass, WifiOff } from "lucide-react";
import { getBackendUrl, isOfflineMode, getDefaultGroups } from "./utils";

export default function App() {
  const [activeView, setActiveView] = useState<"board" | "presentation">("board");
  const [activeGroupId, setActiveGroupId] = useState<string>("group-1");
  const [groups, setGroups] = useState<{ [groupId: string]: GroupBoard }>({});
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const consecutiveErrors = useRef(0);

  // Fetch initial board state (online REST / offline LocalStorage)
  const fetchState = async () => {
    const offline = isOfflineMode();
    if (offline) {
      try {
        setIsSyncing(true);
        const stored = localStorage.getItem("whiteboard_groups");
        if (stored) {
          setGroups(JSON.parse(stored));
        } else {
          const defaults = getDefaultGroups();
          setGroups(defaults);
          localStorage.setItem("whiteboard_groups", JSON.stringify(defaults));
        }
        setActiveUsers(1);
        setErrorMsg(null);
      } catch (err) {
        console.warn("Offline load failed:", err);
      } finally {
        setIsSyncing(false);
      }
      return;
    }

    // Online mode
    try {
      setIsSyncing(true);
      const host = getBackendUrl();
      const response = await fetch(`${host}/api/board`);
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups);
        setActiveUsers(data.activeUsers || 1);
        setErrorMsg(null);
        consecutiveErrors.current = 0;
      }
    } catch (err) {
      consecutiveErrors.current += 1;
      console.log("Sync status check in progress...");
      if (consecutiveErrors.current >= 4) {
        setErrorMsg("目前與大會伺服器連線中斷，正在自動嘗試重新連線...");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Connect to SSE stream or localStorage synchronization
  useEffect(() => {
    fetchState();

    const offline = isOfflineMode();
    if (offline) {
      // Listen to cross-tab updates for same machine multi-window presentation
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === "whiteboard_groups" && e.newValue) {
          setGroups(JSON.parse(e.newValue));
        }
      };
      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }

    // Online EventSource configuration
    const host = getBackendUrl();
    let eventSource: EventSource | null = null;
    
    try {
      eventSource = new EventSource(`${host}/api/sync-stream`);
      
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
          console.log("Parsing update payload...");
        }
      };

      eventSource.onerror = () => {
        console.log("Sync signal active.");
      };
    } catch (e) {
      console.warn("EventSource setup failed:", e);
    }

    // Fallback HTTP polling every 4 seconds in parallel to ensure stability
    const pollingInterval = setInterval(fetchState, 4000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(pollingInterval);
    };
  }, []);

  // Update board state on backend or local storage
  const handleUpdateBoard = async (updatedBoard: GroupBoard) => {
    // 1. Optimistic local update for sub-second visual feedback
    const updatedGroups = {
      ...groups,
      [updatedBoard.id]: updatedBoard,
    };
    setGroups(updatedGroups);

    const offline = isOfflineMode();
    if (offline) {
      try {
        localStorage.setItem("whiteboard_groups", JSON.stringify(updatedGroups));
      } catch (e) {
        console.warn("Offline save failed:", e);
      }
      return;
    }

    // 2. Persist to server
    try {
      setIsSyncing(true);
      const host = getBackendUrl();
      await fetch(`${host}/api/board/update`, {
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
    const offline = isOfflineMode();
    if (offline) {
      try {
        setIsSyncing(true);
        const defaults = getDefaultGroups();
        setGroups(defaults);
        localStorage.setItem("whiteboard_groups", JSON.stringify(defaults));
      } catch (e) {
        console.warn("Offline reset failed:", e);
      } finally {
        setIsSyncing(false);
      }
      return;
    }

    try {
      setIsSyncing(true);
      const host = getBackendUrl();
      const response = await fetch(`${host}/api/board/reset`, {
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

      {/* Offline Mode Banner */}
      {isOfflineMode() && (
        <div className="bg-emerald-50 border-b border-emerald-150 text-emerald-900 text-[11px] px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shadow-xs select-none">
          <span className="flex items-center gap-1.5 font-medium">
            <WifiOff className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>目前執行於「單機離線展示模式」（變更將儲存於此瀏覽器的 LocalStorage）。若您想與手機多裝置即時同步，請點擊此處</span>
            <button
              onClick={() => {
                const url = prompt(
                  "請輸入您的 Google Cloud Run 後端 API 網址 (例如 https://ais-dev-...run.app):",
                  localStorage.getItem("whiteboard_backend_url") || ""
                );
                if (url !== null) {
                  const cleaned = url.trim();
                  if (cleaned) {
                    localStorage.setItem("whiteboard_backend_url", cleaned);
                  } else {
                    localStorage.removeItem("whiteboard_backend_url");
                  }
                  window.location.reload();
                }
              }}
              className="underline text-emerald-800 hover:text-emerald-950 font-bold ml-1 cursor-pointer"
            >
              配置雲端後端網址
            </button>
          </span>
          <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-sans font-bold">
            離線獨立運作
          </span>
        </div>
      )}

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
