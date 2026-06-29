import React, { useState, useEffect } from "react";
import { GroupBoard } from "./types";
import Header from "./components/Header";
import Whiteboard from "./components/Whiteboard";
import AllGroupsPresentation from "./components/AllGroupsPresentation";
import { ChevronRight, Layers, HelpCircle, Activity, Globe, Compass, WifiOff, Cloud } from "lucide-react";
import { getDefaultGroups } from "./utils";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { collection, doc, onSnapshot, setDoc, writeBatch } from "firebase/firestore";

export default function App() {
  const [activeView, setActiveView] = useState<"board" | "presentation">("board");
  const [activeGroupId, setActiveGroupId] = useState<string>("group-1");
  const [groups, setGroups] = useState<{ [groupId: string]: GroupBoard }>({});
  const [activeUsers, setActiveUsers] = useState<number>(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Connect to Firebase Firestore real-time synchronization
  useEffect(() => {
    setIsSyncing(true);
    const colRef = collection(db, "groups");

    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        try {
          if (snapshot.empty) {
            // Seeding default groups if collection is empty
            const defaults = getDefaultGroups();
            const batch = writeBatch(db);
            Object.keys(defaults).forEach((groupId) => {
              const docRef = doc(db, "groups", groupId);
              batch.set(docRef, defaults[groupId]);
            });
            try {
              await batch.commit();
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, "groups");
            }
            return;
          }

          const updatedGroups: { [groupId: string]: GroupBoard } = {};
          snapshot.docs.forEach((doc) => {
            updatedGroups[doc.id] = doc.data() as GroupBoard;
          });

          // Ensure all default keys exist
          const defaults = getDefaultGroups();
          const mergedGroups = { ...defaults, ...updatedGroups };

          setGroups(mergedGroups);
          setErrorMsg(null);
        } catch (err: any) {
          console.error("Firestore loading error:", err);
          setErrorMsg("無法與 Firebase 雲端同步，請檢查網路連線或金鑰設定。");
        } finally {
          setIsSyncing(false);
        }
      },
      (error) => {
        console.error("Firestore listener error:", error);
        setErrorMsg("Firebase 連線中斷，正自動嘗試重新連線...");
        setIsSyncing(false);
        // Throw structured error according to the skill
        handleFirestoreError(error, OperationType.GET, "groups");
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Update board state on Firebase
  const handleUpdateBoard = async (updatedBoard: GroupBoard) => {
    // 1. Optimistic update
    setGroups((prev) => ({
      ...prev,
      [updatedBoard.id]: updatedBoard,
    }));

    // 2. Persist to Firestore
    try {
      setIsSyncing(true);
      const docRef = doc(db, "groups", updatedBoard.id);
      await setDoc(docRef, updatedBoard);
    } catch (err) {
      console.error("Firestore save failed:", err);
      handleFirestoreError(err, OperationType.WRITE, `groups/${updatedBoard.id}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Reset entire boards on Firebase
  const handleResetBoard = async () => {
    try {
      setIsSyncing(true);
      const defaults = getDefaultGroups();
      const batch = writeBatch(db);
      Object.keys(defaults).forEach((groupId) => {
        const docRef = doc(db, "groups", groupId);
        batch.set(docRef, defaults[groupId]);
      });
      await batch.commit();
    } catch (err) {
      console.error("Firestore reset failed:", err);
      handleFirestoreError(err, OperationType.WRITE, "groups");
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

      {/* Firebase Cloud Sync Banner */}
      <div className="bg-sky-50 border-b border-sky-100 text-sky-900 text-[11px] px-6 py-2 flex flex-wrap items-center justify-between gap-2 shadow-xs select-none">
        <span className="flex items-center gap-1.5 font-medium">
          <Cloud className="w-3.5 h-3.5 text-sky-600 shrink-0 animate-pulse" />
          <span>大會 Firebase 雲端即時同步已啟用！所有裝置（含手機、平板）輸入後將立即互相同步呈現。</span>
        </span>
        <span className="text-[10px] text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded font-sans font-bold">
          雲端即時連線中
        </span>
      </div>

      {/* Network Alert (Only displays if SSE or Firestore fails) */}
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
