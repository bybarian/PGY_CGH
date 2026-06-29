export interface CaseTopic {
  id: string;
  title: string;
  description: string;
  target: string;
  tutor: string;
  room: string;
  moderatorTitle: string;
}

export const standardCases: CaseTopic[] = [
  {
    id: "case-1",
    title: "1. 晨會缺席、Call不到人與外院兼差爭議",
    tutor: "連恒煇副部長",
    room: "31 會議室 (外科/一般科)",
    moderatorTitle: "外科部副主任 / 一般外科主任",
    description: "PGY 學員幾乎不參加晨會，病房或是開刀房常常 Call 不到人，或是 call 到人卻姍姍來遲，主治醫師已經查完房離開或是手術已經完成大半，近日被同事檢舉在外面診所兼差，診所網站還大剌剌的秀出他的名字與大頭照。",
    target: "挑選一個案例，進行討論，最後分享"
  },
  {
    id: "case-2",
    title: "2. 情感挫折、自殘言論與同歸於盡恐嚇",
    tutor: "郭宇正醫師",
    room: "兒科醫局會議室 (兒科組)",
    moderatorTitle: "擬真教學中心主任 / 教學型主治醫師",
    description: "PGY 學員因為被男友拋棄後開始厭世，除了一直揚言要自殺外，大肆批評男總醫師排班不公平，同事之女 PGY 都靠美貌取得特別對待，揚言要同歸於盡。",
    target: "挑選一個案例，進行討論，最後分享"
  },
  {
    id: "case-3",
    title: "3. 人際距離與異性肢體界線拿捏失當",
    tutor: "陳信佑醫師",
    room: "婦產科醫局會議室 (婦產科組)",
    moderatorTitle: "師培中心主任 / 教學型主治醫師",
    description: "PGY 學員對人與人之間的距離總是無法拿捏，講話時臉會不禁意越來越靠近異性，用手碰觸異性的頭髮，或是大腿與異性之大腿幾乎貼在一起，這些行為是他情感的正常表達，但同事無法接受。",
    target: "挑選一個案例，進行討論，最後分享"
  },
  {
    id: "case-4",
    title: "4. 能力優異但抗拒寫病歷，主治醫師連帶受罰",
    tutor: "鍾睿元副部長",
    room: "35 會議室 (內科/一般科)",
    moderatorTitle: "教學部副部長 / 數科網主任",
    description: "PGY 學員表現非常正常，表達能力以及專業知識都很不錯，值得稱許，但就是不喜歡寫病歷，無論是每日的住院紀錄，或是出院後的病摘，常常要三催四請才願意完成，主治醫師常常被連坐罰錢。",
    target: "挑選一個案例，進行討論，最後分享"
  },
  {
    id: "case-5",
    title: "5. 無故缺勤擅自曠職，事後被電才找藉口請假",
    tutor: "楊琮翔主任",
    room: "36 會議室 (急重症/精準組)",
    moderatorTitle: "加速康復 ERAS中心主任",
    description: "學員沒來上班，CR call 學員，回覆媽媽從美國回來要去接機，要請事假，沒有事先請假被 call 才找藉口。",
    target: "挑選一個案例，進行討論，最後分享"
  },
  {
    id: "case-6",
    title: "6. 值班失聯拒接電話、擱置不會問題並稱病避責",
    tutor: "連恒煇副部長",
    room: "31 會議室 (外科/一般科)",
    moderatorTitle: "外科部副主任 / 一般外科主任",
    description: "PGY 學員值班被 call 都不接電話，需要一覺到天亮不能被打擾；白天臨床工作也常被 call 不接電話，面對不會的問題也不會 call for help 就擱置不理，最後都由同儕或學長姊處理，引起同儕反感投訴，老師輔導 PGY 就說自己有精神上的疾病，以致師長也不敢給太大壓力。",
    target: "挑選一個案例，進行討論，最後分享"
  },
  {
    id: "case-7",
    title: "7. 職場同儕朋友情感糾紛，爆發性騷控訴與誹謗爭議",
    tutor: "郭宇正醫師",
    room: "兒科醫局會議室 (兒科組)",
    moderatorTitle: "擬真教學中心主任 / 教學型主治醫師",
    description: "PGY 學員男女雙方原本是互有好感的朋友，友達以上戀人未滿，未料其中一方想回歸於一般普通男女同事的關係，其中引發些糾紛，一方控訴性騷擾，一方提告毀謗名譽。",
    target: "挑選一個案例，進行討論，最後分享"
  },
  {
    id: "case-8",
    title: "8. 經營個人社群發表歧視言論，引發網民肉搜攻擊",
    tutor: "陳信佑醫師",
    room: "婦產科醫局會議室 (婦產科組)",
    moderatorTitle: "師培中心主任 / 教學型主治醫師",
    description: "PGY 學員是網紅，經營社群媒體，未料在一次網路發言有性別歧視的言論，引起大批網友的攻擊肉搜，要求醫院要處置此網紅醫師。",
    target: "挑選一個案例，進行討論，最後分享"
  },
  {
    id: "case-9",
    title: "9. 自視甚高、對護理師與行政跨專業同仁不耐友善",
    tutor: "鍾睿元副部長",
    room: "35 會議室 (內科/一般科)",
    moderatorTitle: "教學部副部長 / 數科網主任",
    description: "PGY 學員自視甚高，對醫師以外人員如護理師、行政人員表現較不耐煩、不友善，遭受一起工作的非醫師同仁投訴。",
    target: "挑選一個案例，進行討論，最後分享"
  }
];
