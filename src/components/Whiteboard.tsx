import React, { useState, useRef, useEffect } from "react";
import { Note, DrawingPath, GroupBoard, Point } from "../types";
import { 
  Plus, Trash2, Edit2, Check, MessageSquare, 
  PenTool, Eye, X, HelpCircle, User, UserCheck, 
  ChevronRight, RefreshCw, Palette, Circle 
} from "lucide-react";
import { standardCases } from "../casesData";
import ConfirmModal from "./ConfirmModal";

interface WhiteboardProps {
  board: GroupBoard;
  onUpdateBoard: (updated: GroupBoard) => void;
}

export default function Whiteboard({ board, onUpdateBoard }: WhiteboardProps) {
  // Author setup
  const [authorName, setAuthorName] = useState(() => {
    return localStorage.getItem("pgy_author_name") || "張醫師";
  });
  const [isAnonymous, setIsAnonymous] = useState(() => {
    return localStorage.getItem("pgy_is_anonymous") === "true";
  });

  // Save author info to localstorage
  useEffect(() => {
    localStorage.setItem("pgy_author_name", authorName);
    localStorage.setItem("pgy_is_anonymous", String(isAnonymous));
  }, [authorName, isAnonymous]);

  // Whiteboard control state
  const [newNoteText, setNewNoteText] = useState("");
  const [selectedColor, setSelectedColor] = useState("#fef08a"); // soft yellow
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  
  // Comment section state
  const [activeCommentNoteId, setActiveCommentNoteId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [penColor, setPenColor] = useState("#009245"); // default Cathay Green
  const [penWidth, setPenWidth] = useState(3);
  const [currentPath, setCurrentPath] = useState<Point[] | null>(null);

  // Dragging state
  const [draggingNote, setDraggingNote] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Custom Modal States
  const [isCaseSelectOpen, setIsCaseSelectOpen] = useState(false);
  const [noteToDeleteId, setNoteToDeleteId] = useState<string | null>(null);
  const [isClearDrawingsConfirmOpen, setIsClearDrawingsConfirmOpen] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);

  // Soft note colors
  const noteColors = [
    { value: "#fef08a", name: "活力黃" },
    { value: "#bbf7d0", name: "健康綠" },
    { value: "#e0f2fe", name: "思維藍" },
    { value: "#ffedd5", name: "暖橘色" },
    { value: "#fce7f3", name: "溫柔粉" },
  ];

  const penColors = [
    { value: "#009245", name: "國泰綠" },
    { value: "#ef4444", name: "警示紅" },
    { value: "#3b82f6", name: "醫學藍" },
    { value: "#eab308", name: "重點黃" },
    { value: "#1e293b", name: "沉穩黑" },
  ];

  // Helper to handle adding notes
  const handleAddNote = (textOverride?: string) => {
    const textToAdd = textOverride || newNoteText;
    if (!textToAdd.trim()) return;

    // Place new notes randomly near the middle-left of the board to prevent overlaps
    const randomOffset = () => Math.floor(Math.random() * 80) - 40;
    const newNote: Note = {
      id: "note-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
      text: textToAdd,
      color: selectedColor,
      x: 100 + randomOffset(),
      y: 120 + randomOffset(),
      width: 260,
      height: 120,
      author: isAnonymous ? "匿名導師" : authorName || "臨床導師",
      isAnonymous: isAnonymous,
      createdAt: Date.now(),
      tilt: Math.floor(Math.random() * 6) - 3, // slight tilt for authentic feel
      comments: [],
    };

    const updatedBoard = {
      ...board,
      notes: [...board.notes, newNote],
    };

    onUpdateBoard(updatedBoard);
    if (!textOverride) {
      setNewNoteText("");
    }
  };

  // Dragging Handlers
  const handleNoteMouseDown = (e: React.MouseEvent, note: Note) => {
    if (isDrawingMode || editingNoteId || activeCommentNoteId) return;
    e.preventDefault();
    
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    // Calculate mouse position relative to the note's top-left corner
    const mouseX = e.clientX - boardRect.left;
    const mouseY = e.clientY - boardRect.top;

    setDraggingNote({
      id: note.id,
      offsetX: mouseX - note.x,
      offsetY: mouseY - note.y,
    });
  };

  const handleBoardMouseMove = (e: React.MouseEvent) => {
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const mouseX = e.clientX - boardRect.left;
    const mouseY = e.clientY - boardRect.top;

    // Handle Note Dragging
    if (draggingNote) {
      const updatedNotes = board.notes.map((n) => {
        if (n.id === draggingNote.id) {
          // Keep note within bounds of the board
          const newX = Math.max(10, Math.min(boardRect.width - (n.width || 260) - 10, mouseX - draggingNote.offsetX));
          const newY = Math.max(10, Math.min(boardRect.height - (n.height || 120) - 10, mouseY - draggingNote.offsetY));
          return { ...n, x: newX, y: newY };
        }
        return n;
      });

      onUpdateBoard({ ...board, notes: updatedNotes });
      return;
    }

    // Handle Drawing
    if (isDrawingMode && currentPath) {
      // Add point to path
      const point: Point = { x: mouseX, y: mouseY };
      setCurrentPath([...currentPath, point]);
    }
  };

  const handleBoardMouseUp = () => {
    if (draggingNote) {
      setDraggingNote(null);
      // Trigger update back to server on drag end
      onUpdateBoard({ ...board });
    }

    if (isDrawingMode && currentPath) {
      if (currentPath.length > 1) {
        const newPath: DrawingPath = {
          id: "path-" + Date.now() + "-" + Math.random().toString(36).substr(2, 5),
          points: currentPath,
          color: penColor,
          width: penWidth,
        };
        onUpdateBoard({
          ...board,
          drawings: [...board.drawings, newPath],
        });
      }
      setCurrentPath(null);
    }
  };

  // Drawing touch handlers for tablet support
  const handleBoardMouseDown = (e: React.MouseEvent) => {
    if (!isDrawingMode) return;
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const mouseX = e.clientX - boardRect.left;
    const mouseY = e.clientY - boardRect.top;

    setCurrentPath([{ x: mouseX, y: mouseY }]);
  };

  // Double click note to edit
  const handleDoubleClickNote = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
  };

  // Save note edits
  const handleSaveNoteEdit = (noteId: string) => {
    const updatedNotes = board.notes.map((n) => {
      if (n.id === noteId) {
        return { ...n, text: editingText };
      }
      return n;
    });
    onUpdateBoard({ ...board, notes: updatedNotes });
    setEditingNoteId(null);
  };

  // Delete note trigger
  const handleDeleteNote = (noteId: string) => {
    setNoteToDeleteId(noteId);
  };

  const confirmDeleteNote = () => {
    if (noteToDeleteId) {
      const updatedNotes = board.notes.filter((n) => n.id !== noteToDeleteId);
      onUpdateBoard({ ...board, notes: updatedNotes });
      if (activeCommentNoteId === noteToDeleteId) {
        setActiveCommentNoteId(null);
      }
      setNoteToDeleteId(null);
    }
  };

  // Add Comment/Reply to Note
  const handleAddComment = (noteId: string) => {
    if (!newCommentText.trim()) return;

    const newComment = {
      id: "comment-" + Date.now(),
      text: newCommentText,
      author: isAnonymous ? "匿名" : authorName || "導師",
      createdAt: Date.now(),
    };

    const updatedNotes = board.notes.map((n) => {
      if (n.id === noteId) {
        const comments = n.comments || [];
        return { ...n, comments: [...comments, newComment] };
      }
      return n;
    });

    onUpdateBoard({ ...board, notes: updatedNotes });
    setNewCommentText("");
  };

  // Clear drawings trigger
  const handleClearDrawings = () => {
    setIsClearDrawingsConfirmOpen(true);
  };

  const confirmClearDrawings = () => {
    onUpdateBoard({ ...board, drawings: [] });
    setIsClearDrawingsConfirmOpen(false);
  };

  // Select case trigger
  const handleSelectCase = (selectedCase: any) => {
    const updatedBoard = {
      ...board,
      caseTitle: selectedCase.title,
      caseDescription: selectedCase.description,
      caseTarget: selectedCase.target,
    };
    onUpdateBoard(updatedBoard);
    setIsCaseSelectOpen(false);
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 select-none">
      {/* Left 3 Columns: Active Case and Interactive Board */}
      <div className="lg:col-span-3 flex flex-col gap-6">
        {/* Active Room Case Summary Box */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-cathay-green"></span>
              <div>
                <span className="text-xs text-cathay-gold font-bold uppercase tracking-wider">小組個案討論場地</span>
                <h3 className="text-lg font-serif font-bold text-gray-800 leading-tight">
                  {board.room} — 主持導師：{board.tutor}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCaseSelectOpen(true)}
                className="flex items-center gap-1.5 bg-cathay-gold hover:bg-amber-600 text-white px-3.5 py-1.5 text-xs font-bold rounded-lg shadow-sm transition"
              >
                <Palette className="w-3.5 h-3.5" />
                選擇討論個案題目
              </button>
              <span className="px-2.5 py-1 bg-emerald-50 text-cathay-green border border-emerald-100 rounded text-xs font-medium">
                {board.moderatorTitle}
              </span>
            </div>
          </div>

          <div className="p-6 flex flex-col md:flex-row gap-6 bg-gradient-to-br from-white to-stone-50/30">
            {/* Case Left */}
            <div className="flex-1 border-r border-dashed border-gray-200 pr-0 md:pr-6">
              <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-sm">
                研討個案主題
              </span>
              <h4 className="text-md font-bold text-gray-900 mt-2 mb-2 leading-tight">
                {board.caseTitle}
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line text-justify bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-inner">
                {board.caseDescription}
              </p>
            </div>

            {/* Case Right */}
            <div className="md:w-1/3 flex flex-col justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-cathay-green bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-sm">
                  小組討論目標
                </span>
                <p className="text-xs text-gray-700 font-medium leading-relaxed mt-2.5">
                  {board.caseTarget}
                </p>
              </div>

              {/* Instructions summary */}
              <div className="bg-yellow-50/50 border border-yellow-200/50 p-2.5 rounded-lg text-[11px] text-yellow-800 leading-normal">
                <span className="font-bold flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-cathay-gold" />
                  白板操作秘訣：
                </span>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 font-sans text-gray-600">
                  <li>滑鼠按住便利貼可**任意拖曳**。</li>
                  <li>雙擊便利貼文字可**進入編輯模式**。</li>
                  <li>點擊對話泡泡可**新增匿名評論或追問**。</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Board Operations & Input Toolbar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* User Sign-in & Anonymity Settings */}
          <div className="flex items-center gap-3 w-full md:w-auto border-b md:border-b-0 md:border-r border-gray-200 pb-3 md:pb-0 pr-0 md:pr-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-cathay-green">
              {isAnonymous ? <User className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </div>
            <div className="flex-1 md:flex-initial">
              <label className="block text-[10px] text-gray-400 font-bold">目前發言身份設定</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  disabled={isAnonymous}
                  placeholder="輸入您的稱呼 (如: 張醫師)"
                  className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-cathay-green disabled:opacity-40 w-32"
                />
                <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer hover:text-cathay-green transition select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-cathay-green focus:ring-cathay-green border-gray-300 w-3.5 h-3.5"
                  />
                  <span>匿名留言</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sticky Note Creator */}
          <div className="flex-1 flex flex-wrap items-center gap-3 w-full md:w-auto">
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.value ? e.value : e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddNote();
              }}
              placeholder="新增討論對策或想法便利貼..."
              className="flex-1 min-w-[200px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-cathay-green focus:bg-white"
            />
            
            {/* Soft note colors selector */}
            <div className="flex items-center gap-1">
              {noteColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-6 h-6 rounded-md shadow-sm border border-black/10 flex items-center justify-center transition-all ${
                    selectedColor === color.value 
                      ? "ring-2 ring-cathay-green scale-110" 
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={`貼紙顏色: ${color.name}`}
                >
                  {selectedColor === color.value && <Check className="w-3.5 h-3.5 text-gray-800" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleAddNote()}
              disabled={!newNoteText.trim()}
              className="flex items-center gap-1 bg-cathay-green hover:bg-cathay-green-hover text-white px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow disabled:opacity-40 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              新增貼紙
            </button>
          </div>

          {/* Drawing Tool Settings */}
          <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-gray-200 pt-3 md:pt-0 pl-0 md:pl-4 w-full md:w-auto justify-end">
            <button
              onClick={() => setIsDrawingMode(!isDrawingMode)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                isDrawingMode
                  ? "bg-cathay-gold-light border-cathay-gold text-amber-800 shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
              title="啟用手繪畫筆，可在白板上直接塗鴉或寫字"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>{isDrawingMode ? "畫筆手繪中" : "手繪標記"}</span>
            </button>

            {isDrawingMode && (
              <div className="flex items-center gap-1">
                {penColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPenColor(color.value)}
                    className={`w-5 h-5 rounded-full border border-black/15 flex items-center justify-center transition-all ${
                      penColor === color.value ? "ring-2 ring-cathay-gold scale-110" : ""
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {penColor === color.value && <Circle className="w-1.5 h-1.5 fill-white text-white" />}
                  </button>
                ))}
                <button
                  onClick={handleClearDrawings}
                  className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 transition"
                  title="清除手繪線條"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* The Whiteboard Stage Area */}
        <div className="relative w-full h-[550px] bg-stone-100 border border-gray-200 rounded-xl overflow-hidden shadow-inner hex-pattern">
          {/* Instructions banner on drawing mode */}
          {isDrawingMode && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-1 text-xs font-bold rounded-full shadow-sm flex items-center gap-1.5 animate-bounce">
              <PenTool className="w-3.5 h-3.5 animate-pulse" />
              <span>手繪功能開啟：滑鼠左鍵按住可在白板上拖曳書寫/標記</span>
            </div>
          )}

          {/* Collaborative Drawing Overlay (Responsive SVG) */}
          <svg
            ref={boardRef as any}
            onMouseDown={handleBoardMouseDown}
            onMouseMove={handleBoardMouseMove}
            onMouseUp={handleBoardMouseUp}
            className={`absolute inset-0 w-full h-full ${
              isDrawingMode ? "cursor-crosshair z-10" : "z-0"
            }`}
          >
            {/* Render all finished drawing lines */}
            {board.drawings.map((path) => (
              <polyline
                key={path.id}
                points={path.points.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke={path.color}
                strokeWidth={path.width}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* Render current active drawing path */}
            {isDrawingMode && currentPath && currentPath.length > 0 && (
              <polyline
                points={currentPath.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke={penColor}
                strokeWidth={penWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>

          {/* Interactive Notes (Sticky Notes) Layer */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {board.notes.map((note) => {
              const isEditing = editingNoteId === note.id;
              const hasComments = note.comments && note.comments.length > 0;

              return (
                <div
                  key={note.id}
                  onMouseDown={(e) => handleNoteMouseDown(e, note)}
                  onDoubleClick={() => handleDoubleClickNote(note)}
                  className="absolute p-4 rounded-lg shadow-md border border-black/10 flex flex-col justify-between select-none pointer-events-auto sticky-note-hover cursor-grab active:cursor-grabbing"
                  style={{
                    left: `${note.x}px`,
                    top: `${note.y}px`,
                    width: `${note.width || 260}px`,
                    height: `${note.height || 120}px`,
                    backgroundColor: note.color,
                    transform: `rotate(${note.tilt || 0}deg)`,
                  }}
                >
                  {/* Note header: Author, Date, Actions */}
                  <div className="flex items-start justify-between gap-1 border-b border-black/5 pb-1 mb-1.5 text-[10px] text-gray-500 font-mono">
                    <span className="font-bold flex items-center gap-1 max-w-[120px] truncate" title={note.author}>
                      {note.isAnonymous ? "👤 匿名發言" : `👨‍⚕️ ${note.author}`}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDoubleClickNote(note);
                        }}
                        className="p-0.5 hover:bg-black/5 rounded text-gray-600 transition"
                        title="編輯便利貼"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note.id);
                        }}
                        className="p-0.5 hover:bg-black/5 rounded text-red-600 transition"
                        title="刪除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Note Content Text */}
                  <div className="flex-1 text-xs text-gray-800 overflow-y-auto whitespace-pre-wrap leading-relaxed font-sans pr-1">
                    {isEditing ? (
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => handleSaveNoteEdit(note.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            handleSaveNoteEdit(note.id);
                          }
                        }}
                        className="w-full h-full bg-white/80 border border-cathay-green rounded p-1 text-xs text-gray-800 font-sans focus:outline-none focus:ring-1 focus:ring-cathay-green resize-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    ) : (
                      note.text
                    )}
                  </div>

                  {/* Note Footer: Comments Bubble indicator */}
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-black/5">
                    <span className="text-[9px] text-gray-400 font-mono">
                      {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>

                    <button
                      onMouseDown={(e) => e.stopPropagation()} // Stop note drag when clicking comments
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveCommentNoteId(note.id);
                      }}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                        hasComments
                          ? "bg-cathay-green/15 text-cathay-green font-bold"
                          : "text-gray-500 hover:bg-black/5"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{note.comments?.length || 0} 條評論</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: AI Tutors panel + Comments Drawer split */}
      <div className="flex flex-col gap-6">
        {/* Thread Commenting Drawer (Displays only when a sticky note bubble is clicked) */}
        {activeCommentNoteId && (
          <div className="bg-amber-50/50 rounded-xl border border-amber-200/60 p-4 shadow-sm flex flex-col gap-3 transition-all animate-fadeIn">
            <div className="flex items-center justify-between border-b border-amber-200/40 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <MessageSquare className="w-4 h-4 text-cathay-gold" />
                便利貼研討與評論
              </span>
              <button
                onClick={() => setActiveCommentNoteId(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-amber-100/50 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Target Note Content Preview */}
            {(() => {
              const targetNote = board.notes.find((n) => n.id === activeCommentNoteId);
              if (!targetNote) return null;
              return (
                <div 
                  className="p-2.5 rounded-lg border border-black/5 text-xs text-gray-600 italic bg-white/80 line-clamp-2 max-h-16 overflow-y-auto mb-1 font-serif"
                  style={{ borderLeftWidth: "4px", borderLeftColor: targetNote.color }}
                >
                  "{targetNote.text}"
                </div>
              );
            })()}

            {/* Comment Thread */}
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
              {(() => {
                const targetNote = board.notes.find((n) => n.id === activeCommentNoteId);
                const comments = targetNote?.comments || [];
                if (comments.length === 0) {
                  return <p className="text-[11px] text-gray-400 text-center py-4">尚無評論。在下方發表您的回饋意見！</p>;
                }
                return comments.map((cmt) => (
                  <div key={cmt.id} className="bg-white border border-gray-100 rounded p-2 text-[11px] text-gray-700 shadow-sm leading-relaxed">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1 font-mono">
                      <span className="font-bold text-gray-600">{cmt.author}</span>
                      <span>{new Date(cmt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="text-gray-700 font-sans">{cmt.text}</div>
                  </div>
                ));
              })()}
            </div>

            {/* New Comment Input */}
            <div className="flex gap-1">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newCommentText.trim()) {
                    handleAddComment(activeCommentNoteId);
                  }
                }}
                placeholder="寫下您對該策略的回饋..."
                className="flex-1 bg-white border border-amber-200/60 rounded px-2.5 py-1 text-xs text-gray-700 focus:outline-none focus:border-cathay-green"
              />
              <button
                onClick={() => handleAddComment(activeCommentNoteId)}
                disabled={!newCommentText.trim()}
                className="px-2.5 py-1 bg-cathay-green text-white text-xs font-semibold rounded shadow transition hover:bg-cathay-green-hover disabled:opacity-40"
              >
                發表
              </button>
            </div>
          </div>
        )}

        {/* Group Discussion Feed */}
        <div className="bg-emerald-50/40 rounded-xl border border-emerald-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-cathay-green to-emerald-800 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cathay-gold" />
              <div>
                <h3 className="font-bold text-sm tracking-wide">全組討論動態與回饋</h3>
                <p className="text-[10px] text-emerald-100 leading-none">即時顯示所有便利貼的最新留言與意見</p>
              </div>
            </div>
          </div>

          {/* Main Body */}
          <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto max-h-[500px]">
            {(() => {
              const allComments = board.notes.flatMap(note => 
                (note.comments || []).map(comment => ({
                  ...comment,
                  noteId: note.id,
                  noteText: note.text,
                  noteColor: note.color,
                  noteAuthor: note.author,
                  noteIsAnonymous: note.isAnonymous
                }))
              ).sort((a, b) => b.createdAt - a.createdAt);

              if (allComments.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                    <div className="p-4 rounded-full bg-emerald-100/50 text-cathay-green mb-3">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-medium text-gray-700 max-w-[220px]">
                      目前尚無任何留言回饋。
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1 max-w-[220px]">
                      點擊便利貼右下角的「評論」圖示，即可開始撰寫意見並即時同步至主畫面！
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                    <span>共有 {allComments.length} 則討論意見</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                      最新優先
                    </span>
                  </div>
                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {allComments.map((cmt) => (
                      <div 
                        key={cmt.id} 
                        onClick={() => setActiveCommentNoteId(cmt.noteId)}
                        className="bg-white hover:bg-emerald-50/40 border border-gray-100 hover:border-emerald-100 rounded-lg p-2.5 text-left cursor-pointer transition shadow-xs group"
                      >
                        {/* Sticky Note Context */}
                        <div 
                          className="text-[9px] text-gray-400 truncate mb-1 pb-1 border-b border-gray-50 flex items-center gap-1 font-serif"
                          style={{ borderLeftWidth: "3px", borderLeftColor: cmt.noteColor, paddingLeft: "4px" }}
                        >
                          <span className="font-sans font-semibold text-gray-500">便利貼:</span>
                          <span className="italic">"{cmt.noteText}"</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1 font-mono">
                          <span className="font-bold text-emerald-800">{cmt.author}</span>
                          <span>{new Date(cmt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div className="text-xs text-gray-700 leading-relaxed font-sans font-medium group-hover:text-gray-900 break-words">
                          {cmt.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Case Selection Modal */}
      {isCaseSelectOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[999] p-4 select-none animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-cathay-gold" />
                <h3 className="font-bold text-base text-slate-800">選擇或更換本組討論個案</h3>
              </div>
              <button
                onClick={() => setIsCaseSelectOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content: List of Cases */}
            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-xs text-gray-500">大會共提供 9 個臨床導師研討議題。請點擊「選擇此案例」將其載入至當前白板中進行共同編撰。</p>
              
              {standardCases.map((cs, idx) => {
                const isCurrent = board.caseTitle === cs.title;
                return (
                  <div
                    key={cs.id}
                    onClick={() => handleSelectCase(cs)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col gap-2 ${
                      isCurrent
                        ? "bg-emerald-50/40 border-cathay-green shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-cathay-gold-light text-amber-800 font-bold px-2 py-0.5 rounded-sm">
                        議題 {idx + 1}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-cathay-green font-bold flex items-center gap-0.5">
                          ● 當前討論中
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 mt-1">{cs.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed bg-slate-50/50 p-2.5 rounded border border-slate-100">
                      {cs.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-sans">
                      <span>目標：挑選一個案例，進行討論，最後分享</span>
                      <span className="text-cathay-green font-bold hover:underline">
                        載入此個案討論 &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end flex-shrink-0">
              <button
                onClick={() => setIsCaseSelectOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Note Confirmation Modal */}
      <ConfirmModal
        isOpen={noteToDeleteId !== null}
        title="刪除便利貼"
        message="確定要刪除這張便利貼討論留言嗎？此動作將同步從所有在線參與者的白板上移除且不可復原。"
        confirmText="刪除留言"
        cancelText="保留"
        isDanger={true}
        onConfirm={confirmDeleteNote}
        onCancel={() => setNoteToDeleteId(null)}
      />

      {/* Clear Drawings Confirmation Modal */}
      <ConfirmModal
        isOpen={isClearDrawingsConfirmOpen}
        title="清除所有手繪筆跡"
        message="確定要清除本白板上所有的手繪線條與筆跡嗎？便利貼留言仍會完好保留。"
        confirmText="清除筆跡"
        cancelText="取消"
        isDanger={true}
        onConfirm={confirmClearDrawings}
        onCancel={() => setIsClearDrawingsConfirmOpen(false)}
      />
    </div>
  );
}
