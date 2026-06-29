import React, { useState } from "react";
import { Brain, Send, Loader2, Sparkles, AlertCircle, Copy, Check, FileDown } from "lucide-react";

interface AICoachPanelProps {
  groupId: string;
  onAddAINote: (text: string) => void;
}

export default function AICoachPanel({ groupId, onAddAINote }: AICoachPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string>("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGetSuggestion = async (isCustom = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId,
          customQuestion: isCustom ? customQuestion : "",
        }),
      });

      if (!response.ok) {
        throw new Error("連線至 AI 智庫失敗，請確認伺服器與 API 金鑰設置");
      }

      const data = await response.json();
      setSuggestion(data.suggestion || "AI 沒有回傳任何建議。");
      if (isCustom) {
        setCustomQuestion("");
      }
    } catch (err: any) {
      setError(err.message || "發生未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConvertToNote = () => {
    if (!suggestion) return;
    // Strip headers or take a summary of the AI text to avoid huge sticky notes
    let noteText = suggestion;
    if (suggestion.length > 250) {
      noteText = `【AI 導師智庫建議摘要】\n` + suggestion.slice(0, 250).trim() + "...\n（雙擊展開可複製全文）";
    }
    onAddAINote(noteText);
  };

  return (
    <div className="bg-emerald-50/60 rounded-xl border border-emerald-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-cathay-green to-emerald-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cathay-gold animate-pulse" />
          <div>
            <h3 className="font-bold text-sm tracking-wide">PGY 導師智庫 (AI Assistant)</h3>
            <p className="text-[10px] text-emerald-100 leading-none">基於國泰醫院 CBME 與臨床溝通指南</p>
          </div>
        </div>
        <Sparkles className="w-4 h-4 text-cathay-gold" />
      </div>

      {/* Main Body */}
      <div className="p-4 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[500px]">
        {/* Quick Suggestion Button */}
        {!suggestion && !loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
            <div className="p-4 rounded-full bg-emerald-100/50 text-cathay-green mb-3">
              <Brain className="w-10 h-10" />
            </div>
            <p className="text-xs font-medium text-gray-700 max-w-[250px] mb-4">
              您可以點擊下方按鈕，由 AI 智庫根據目前的個案資訊及白板討論，產出結構化的「導師對策處方箋」。
            </p>
            <button
              onClick={() => handleGetSuggestion(false)}
              className="flex items-center gap-2 px-4 py-2 bg-cathay-green hover:bg-cathay-green-hover text-white text-xs font-semibold rounded-lg shadow transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-cathay-gold" />
              產出導師對策處方箋
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-cathay-green mb-3" />
            <p className="text-xs font-medium text-cathay-green">正在讀取白板討論、研擬專科導師對策中...</p>
            <span className="text-[10px] text-gray-400 mt-1">這通常需要 5-8 秒，請稍候</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">連線失敗</p>
              <p className="mt-1">{error}</p>
              <p className="mt-1.5 text-[10px] text-red-500">提示：請確認是否設定了有效的 Gemini API Key。您仍可手動在白板上貼匿名便利貼留言互動。</p>
            </div>
          </div>
        )}

        {/* Suggestion Result Display */}
        {suggestion && !loading && (
          <div className="flex-1 flex flex-col gap-3">
            <div className="bg-white border border-emerald-100 rounded-lg p-3.5 text-xs text-gray-700 leading-relaxed shadow-inner overflow-y-auto max-h-[360px] whitespace-pre-line font-sans">
              {suggestion}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium transition flex-1 justify-center"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    已複製
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    複製建議
                  </>
                )}
              </button>
              <button
                onClick={handleConvertToNote}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cathay-gold-light hover:bg-amber-100 border border-cathay-gold/30 text-amber-800 rounded text-xs font-medium transition flex-1 justify-center"
                title="將本段建議轉換為便利貼，供白板小組共同討論"
              >
                <FileDown className="w-3.5 h-3.5 text-cathay-gold" />
                轉為白板便利貼
              </button>
              <button
                onClick={() => handleGetSuggestion(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-cathay-green border border-emerald-200 rounded text-xs font-medium transition flex-1 justify-center"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />
                重新產生
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Inquiry Footer */}
      <div className="p-3 border-t border-emerald-100 bg-white">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customQuestion.trim()) {
                handleGetSuggestion(true);
              }
            }}
            placeholder="向 AI 詢問約談技巧、CBME 里程碑或法規..."
            disabled={loading}
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-cathay-green focus:bg-white disabled:opacity-50"
          />
          <button
            onClick={() => handleGetSuggestion(true)}
            disabled={loading || !customQuestion.trim()}
            className="p-1.5 bg-cathay-green hover:bg-cathay-green-hover text-white rounded-lg shadow disabled:opacity-40 transition flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline animation helper for spin on hover
const RefreshCw = ({ className, ...props }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${className} hover:rotate-180 transition-transform duration-500`}
    {...props}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M16 3h5v5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 21H3v-5" />
  </svg>
);
