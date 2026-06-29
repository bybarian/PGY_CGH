import { GroupBoard } from "./types";

// Dynamic base API URL helpers
export function getBackendUrl(): string {
  // Check if a custom backend URL is configured in local storage
  const savedUrl = localStorage.getItem("whiteboard_backend_url");
  if (savedUrl) {
    return savedUrl.trim().replace(/\/$/, ""); // Remove trailing slash
  }

  // If running on GitHub Pages (e.g. bybarian.github.io)
  // we do not have a relative backend. We can default to empty or a specific cloud run server.
  if (window.location.hostname.endsWith("github.io")) {
    // Return empty by default (which triggers local offline mode)
    // or the user can configure a custom Cloud Run backend URL
    return "";
  }

  // Default to relative path (standard full-stack container environment)
  return "";
}

export function isOfflineMode(): boolean {
  // If we are on GitHub Pages and no backend URL is set, we run in offline local-storage mode
  if (window.location.hostname.endsWith("github.io")) {
    const savedUrl = localStorage.getItem("whiteboard_backend_url");
    return !savedUrl;
  }
  return false;
}

// Generate the 5 default workshop groups identical to the backend server
export function getDefaultGroups(): { [groupId: string]: GroupBoard } {
  return {
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
      caseDescription: "PGY 學員因為被男友拋棄後開始厭世，除了一置揚言要自殺外，大肆批評男總醫師排班不公平，同事之女 PGY 都靠美貌取得特別對待，揚言要同歸於盡。",
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
      caseDescription: "PGY 學員對人與人之間的距離總是無法拿捏，講話時臉會不經意越來越靠近異性，用手碰觸異性的頭髮，或是大腿與異性之大腿幾乎貼在一起，這些行為是他情感的正常表達，但同事無法接受。",
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
}
