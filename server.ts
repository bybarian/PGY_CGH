import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { Note, DrawingPath, GroupBoard, Comment } from "./src/types.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Active SSE client connections
let sseClients: express.Response[] = [];

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const STATE_FILE = path.join(DATA_DIR, "whiteboard_state.json");

// Default cases for the 5 Workshop Groups
const defaultGroups: { [groupId: string]: GroupBoard } = {
  "group-1": {
    id: "group-1",
    name: "31 會議室",
    room: "31 會議室 (外科/一般科)",
    tutor: "連恒煇副部長",
    moderatorTitle: "外科部副主任 / 一般外科主任",
    caseTitle: "1. 晨會缺席、Call不到人與外院兼差爭議",
    caseDescription: "PGY 學員幾乎不參加晨會，病房或是開刀房常常 Call 不到人，或是 call 到人卻姍姍來遲，主治醫師已經查完房離開或是手術已經完成大半，近日被同事檢舉在外面診所兼差，診所網站還大剌剌的秀出他的名字與大頭照。",
    caseTarget: "挑選一個案例，進行討論，最後分享",
    notes: [
      {
        id: "note-1-1",
        text: "【輔導核心】應以醫學專業素養為出發點，進行個別訪談，釐清其晨會缺席、值班失聯以及外院兼差之具體原因，建立改善計畫與追蹤期限。",
        color: "#fef08a",
        x: 50,
        y: 80,
        width: 250,
        height: 120,
        author: "連恒煇副部長",
        isAnonymous: false,
        createdAt: Date.now() - 3600000,
        tilt: -2,
        comments: []
      },
      {
        id: "note-1-2",
        text: "【大會引導目標】本組已初始選定案例一。導師們可點擊上方「選擇討論個案題目」隨時切換至大會九大主題之任意案例。請共同挑選一例進行深入對策探討並分享。",
        color: "#bbf7d0",
        x: 350,
        y: 95,
        width: 280,
        height: 140,
        author: "大會秘書處",
        isAnonymous: false,
        createdAt: Date.now() - 1800000,
        tilt: 2,
        comments: []
      }
    ],
    drawings: []
  },
  "group-2": {
    id: "group-2",
    name: "兒科醫局會議室",
    room: "兒科醫局會議室 (兒科組)",
    tutor: "郭宇正醫師",
    moderatorTitle: "擬真教學中心主任 / 教學型主治醫師",
    caseTitle: "2. 情感挫折、自殘言論與同歸於盡恐嚇",
    caseDescription: "PGY 學員因為被男友拋棄後開始厭世，除了一直揚言要自殺外，大肆批評男總醫師排班不公平，同事之女 PGY 都靠美貌取得特別對待，揚言要同歸於盡。",
    caseTarget: "挑選一個案例，進行討論，最後分享",
    notes: [
      {
        id: "note-2-1",
        text: "【安全介入】學員揚言自殘與威脅同儕，應立即通報醫院員工關懷系統或心理諮商介入，安排專人陪同、評估是否需要請假休養，以確保人身安全。",
        color: "#fee2e2",
        x: 60,
        y: 80,
        width: 250,
        height: 130,
        author: "郭宇正醫師",
        isAnonymous: false,
        createdAt: Date.now() - 3000000,
        tilt: 2,
        comments: []
      },
      {
        id: "note-2-2",
        text: "【大會引導目標】本組已初始選定案例二。導師們可點擊上方「選擇討論個案題目」隨時切換至大會九大主題之任意案例。請共同挑選一例進行深入對策探討並分享。",
        color: "#bbf7d0",
        x: 350,
        y: 110,
        width: 280,
        height: 140,
        author: "大會秘書處",
        isAnonymous: false,
        createdAt: Date.now() - 1500000,
        tilt: -1,
        comments: []
      }
    ],
    drawings: []
  },
  "group-3": {
    id: "group-3",
    name: "婦產科醫局會議室",
    room: "婦產科醫局會議室 (婦產科組)",
    tutor: "陳信佑醫師",
    moderatorTitle: "師培中心主任 / 教學型主治醫師",
    caseTitle: "3. 人際距離與異性肢體界線拿捏失當",
    caseDescription: "PGY 學員對人與人之間的距離總是無法拿捏，講話時臉會不禁意越來越靠近異性，用手碰觸異性的頭髮，或是大腿與異性之大腿幾乎貼在一起，這些行為是他情感的正常表達，但同事無法接受。",
    caseTarget: "挑選一個案例，進行討論，最後分享",
    notes: [
      {
        id: "note-3-1",
        text: "【界線界定】即便學員自認是情感的正常表達，但當同事表達無法接受時，已涉及職場性騷擾疑慮與人際距離。應由導師進行具體社交界線輔導，必要時安排性平課程與環境隔離。",
        color: "#e0f2fe",
        x: 60,
        y: 90,
        width: 260,
        height: 140,
        author: "陳信佑醫師",
        isAnonymous: false,
        createdAt: Date.now() - 4000000,
        tilt: -3,
        comments: []
      },
      {
        id: "note-3-2",
        text: "【大會引導目標】本組已初始選定案例三。導師們可點擊上方「選擇討論個案題目」隨時切換至大會九大主題之任意案例。請共同挑選一例進行深入對策探討並分享。",
        color: "#bbf7d0",
        x: 360,
        y: 110,
        width: 280,
        height: 140,
        author: "大會秘書處",
        isAnonymous: false,
        createdAt: Date.now() - 2000000,
        tilt: 2,
        comments: []
      }
    ],
    drawings: []
  },
  "group-4": {
    id: "group-4",
    name: "35 會議室",
    room: "35 會議室 (內科/一般科)",
    tutor: "鍾睿元副部長",
    moderatorTitle: "教學部副部長 / 數科網主任",
    caseTitle: "4. 能力優異但抗拒寫病歷，主治醫師連帶受罰",
    caseDescription: "PGY 學員表現非常正常，表達能力以及專業知識都很不錯，值得稱許，但就是不喜歡寫病歷，無論是每日的住院紀錄，或是出院後的病摘，常常要三催四請才願意完成，主治醫師常常被連坐罰錢。",
    caseTarget: "挑選一個案例，進行討論，最後分享",
    notes: [
      {
        id: "note-4-1",
        text: "【責任養成】優良的臨床能力必須搭配合規的病歷記錄。這涉及醫療連續性及病人安全法律。應將其病歷書寫完成度與里程碑（CBME）評估直接連動。",
        color: "#ffedd5",
        x: 60,
        y: 90,
        width: 260,
        height: 130,
        author: "鍾睿元副部長",
        isAnonymous: false,
        createdAt: Date.now() - 2500000,
        tilt: -2,
        comments: []
      },
      {
        id: "note-4-2",
        text: "【大會引導目標】本組已初始選定案例四。導師們可點擊上方「選擇討論個案題目」隨時切換至大會九大主題之任意案例。請共同挑選一例進行深入對策探討並分享。",
        color: "#bbf7d0",
        x: 360,
        y: 100,
        width: 280,
        height: 140,
        author: "大會秘書處",
        isAnonymous: false,
        createdAt: Date.now() - 1000000,
        tilt: 3,
        comments: []
      }
    ],
    drawings: []
  },
  "group-5": {
    id: "group-5",
    name: "36 會議室",
    room: "36 會議室 (急重症/精準組)",
    tutor: "楊琮翔主任",
    moderatorTitle: "加速康復 ERAS中心主任",
    caseTitle: "5. 無故缺勤擅自曠職，事後被電才找藉口請假",
    caseDescription: "學員沒來上班，CR call 學員，回覆媽媽從美國回來要去接機，要請事假，沒有事先請假被 call 才找藉口。",
    caseTarget: "挑選一個案例，進行討論，最後分享",
    notes: [
      {
        id: "note-5-1",
        text: "【誠信與紀律】臨時請假接機且未事前報備，明顯違反請假與工作紀律。被查問後才託詞請事假涉及誠信（Integrity）的核心課題，應由導師嚴肅約談，建立工作責任心。",
        color: "#fee2e2",
        x: 50,
        y: 80,
        width: 250,
        height: 130,
        author: "楊琮翔主任",
        isAnonymous: false,
        createdAt: Date.now() - 3200000,
        tilt: -1,
        comments: []
      },
      {
        id: "note-5-2",
        text: "【大會引導目標】本組已初始選定案例五。導師們可點擊上方「選擇討論個案題目」隨時切換至大會九大主題之任意案例。請共同挑選一例進行深入對策探討並分享。",
        color: "#bbf7d0",
        x: 340,
        y: 110,
        width: 300,
        height: 140,
        author: "大會秘書處",
        isAnonymous: false,
        createdAt: Date.now() - 1600000,
        tilt: 2,
        comments: []
      }
    ],
    drawings: []
  }
};

// Global active board state (loads from file or uses default)
let activeState: { groups: { [groupId: string]: GroupBoard }; activeUsers: number } = {
  groups: defaultGroups,
  activeUsers: 1
};

// Load initial state if exists
try {
  if (fs.existsSync(STATE_FILE)) {
    const fileData = fs.readFileSync(STATE_FILE, "utf-8");
    const parsed = JSON.parse(fileData);
    if (parsed && parsed.groups) {
      const firstGroupCase = parsed.groups["group-1"]?.caseTitle || "";
      if (firstGroupCase.includes("學術巨人")) {
        console.log("Old state detected. Resetting to new 9 cases...");
        activeState.groups = defaultGroups;
        saveStateToDisk();
      } else {
        activeState.groups = parsed.groups;
        console.log("Loaded board state from disk.");
      }
    }
  }
} catch (err) {
  console.error("Error reading state file, using defaults:", err);
}

// Save helper
function saveStateToDisk() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(activeState, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving state file:", err);
  }
}

// SSE broadcast helper
function broadcastState() {
  const payload = {
    groups: activeState.groups,
    activeUsers: Math.max(1, sseClients.length)
  };
  const eventString = `data: ${JSON.stringify(payload)}\n\n`;
  
  // Clean up stale client handles if write fails
  sseClients = sseClients.filter(res => {
    try {
      res.write(eventString);
      return true;
    } catch (e) {
      return false;
    }
  });
}

// SSE route
app.get("/api/sync-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  res.write("retry: 5000\n\n");
  
  sseClients.push(res);
  console.log(`Client connected to SSE stream. Total clients: ${sseClients.length}`);
  
  // Send immediate current state
  const initialPayload = {
    groups: activeState.groups,
    activeUsers: Math.max(1, sseClients.length)
  };
  res.write(`data: ${JSON.stringify(initialPayload)}\n\n`);
  
  // Broadcast active user count change
  broadcastState();

  req.on("close", () => {
    sseClients = sseClients.filter(client => client !== res);
    console.log(`Client disconnected. Total clients: ${sseClients.length}`);
    broadcastState();
  });
});

// Direct fetch state
app.get("/api/board", (req, res) => {
  res.json({
    groups: activeState.groups,
    activeUsers: Math.max(1, sseClients.length)
  });
});

// Update/Save modifications
app.post("/api/board/update", (req, res) => {
  const { groups } = req.body;
  if (groups) {
    activeState.groups = { ...activeState.groups, ...groups };
    saveStateToDisk();
    broadcastState();
    return res.json({ status: "success" });
  }
  res.status(400).json({ error: "Missing group data" });
});

// Reset board state to default
app.post("/api/board/reset", (req, res) => {
  activeState.groups = JSON.parse(JSON.stringify(defaultGroups));
  saveStateToDisk();
  broadcastState();
  res.json({ status: "success", message: "Whiteboards reset successfully." });
});

// Lazy-initialized Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing.");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// AI suggest endpoint
app.post("/api/ai/suggest", async (req, res) => {
  const { groupId, customQuestion } = req.body;
  const group = activeState.groups[groupId];
  
  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  try {
    const ai = getGeminiClient();
    
    // Structure current board discussion sticky notes
    const notesSummary = group.notes
      .map(n => `- [${n.author || (n.isAnonymous ? "匿名" : "導師")}]: ${n.text}`)
      .join("\n");

    const prompt = `
你是一位專門輔導台灣「一般醫學訓練計畫 (PGY)」與醫學教育 (CBME / Milestones) 的專家導師顧問。
在「115 年度醫師畢業後一般醫學訓練計畫導師研習營(第一場) 國泰場」中，有一組學員案例正在進行小組研討。

以下是該小組的研討脈絡：
【研討小組/會議室】: ${group.room}
【主持人/導師】: ${group.tutor} (${group.moderatorTitle})
【討論個案主題】: ${group.caseTitle}
【個案現況描述】: ${group.caseDescription}
【小組討論目標】: ${group.caseTarget}

【目前白板上的導師討論留言與便利貼】：
${notesSummary || "(目前尚無便利貼討論)"}

${customQuestion ? `【使用者/現場導師提出的具體發問】: "${customQuestion}"` : "請針對以上個案與目前的討論，提供一份結構化的導師輔導「對策處方箋」。"}

請使用專業、溫暖、實用且符合台灣臨床醫學教學語境（使用如「導師、共識、約談、病房、學員、里程碑、CBME」等醫學詞彙，並夾雜常用的臨床英文簡稱）來撰寫。
回覆格式應符合 Markdown，包含：
1. **問題核心剖析 (Core Analysis)**: 針對該新世代學員的行為動機或心理阻礙進行精準分析。
2. **具體溝通心法 & 約談話術範例 (Communication Guide & Conversation Script)**: 提供一到兩段實際可對學員說的台詞。
3. **輔導策略與行政支持處方 (Coaching Plan & Admin Support)**: 包含短期、中長期的評估與學習支持（例如擬真教學、SNAPPS、工作調配）。
4. **CBME 里程碑評估與回饋建議 (CBME Assessment Advice)**: 具體指出該對應哪一項 CBME 核心能力（如：Professionalism, Interpersonal & Communication Skills, Patient Care）以及如何進行結構化回饋。

請保持內容的實戰性、條理清晰，並在 800 字內完成，讓現場醫學導師可以直接引用。
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({ suggestion: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "AI 智庫目前無法連線", 
      details: error.message,
      missingKey: !process.env.GEMINI_API_KEY 
    });
  }
});

// Set up server listening and Vite configuration
async function startServer() {
  // Vite Integration in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for all non-API SPA routes
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
