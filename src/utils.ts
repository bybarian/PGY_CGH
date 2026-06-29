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
      caseDescription: "PGY 學員幾乎不學生不參加晨會，病房或是開刀房常常 Call 不到人，或是 call 到人卻姍姍來遲，主治醫師已經查完房離開或是手術已經完成大半，近日被同事檢舉在外面診所兼差，診所網站還大剌剌的秀出他的名字與大頭照。",
      caseTarget: "挑選一個案例，進行討論，最後分享",
      notes: [],
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
      notes: [],
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
      notes: [],
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
      notes: [],
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
      notes: [],
      drawings: []
    }
  };
}
