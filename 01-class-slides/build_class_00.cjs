const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("/root/opencode/k8s/.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 0 - 課程導覽與 Lab 準備";

const KN = (s) => { s.addNotes.bind(s); return s; };

// Slide 1: Title
let s = darkSlide(pptx, { kicker: "PVE × Kubernetes 工程師訓練", title: "Class 0", titleSize: 60, noKicker: false });
s.background = { color: C.navy };
s.addShape("roundRect", { x: 0.6, y: 4.1, w: 4.2, h: 0.6, fill: { color: C.orange }, rectRadius: 0.1 });
s.addText("課程導覽 · 環境 · Lab 準備", { x: 0.6, y: 4.1, w: 4.2, h: 0.6, fontFace: FONT_BODY, fontSize: 16, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("1 hr ｜ Lab ｜ Proxmox VE 9.x × Kubernetes 1.36/1.37", { x: 0.6, y: 4.85, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("Opening. Introduce the course roadmap and how the 7 classes fit together.");

// Slide 2: 課程路線圖 (timeline)
s = contentSlide(pptx, "課程路線圖：從平台到上線", { page: "2" });
const steps = [
  ["0-1", "平台 + Lab", "PVE 概論、範本準備", C.orange],
  ["2-3", "K8s 原理", "架構 / 網路 / 儲存 / HA", C.blue],
  ["4", "架構規劃", "6 台節點 VM 建置", C.orange],
  ["5", "kubeadm 安裝", "高可用叢集實作", C.blue],
  ["6", "上線運維", "儲存/備份/監控/升級", C.orange],
];
let xs = 0.5;
steps.forEach((st, i) => {
  s.addShape("roundRect", { x: xs, y: 1.6, w: 1.75, h: 2.4, fill: { color: C.card }, rectRadius: 0.08, line: { color: C.line } });
  s.addShape("roundRect", { x: xs + 0.1, y: 1.8, w: 0.5, h: 0.5, fill: { color: st[3] }, rectRadius: 0.08 });
  s.addText(st[0], { x: xs + 0.18, y: 1.86, w: 0.4, h: 0.34, fontFace: FONT_BODY, fontSize: 11, color: C.white, bold: true, margin: 0 });
  s.addText(st[1], { x: xs + 0.12, y: 2.5, w: 1.5, h: 0.55, fontFace: FONT_HEAD, fontSize: 14, color: C.navy, bold: true, margin: 0 });
  s.addText(st[2], { x: xs + 0.12, y: 3.1, w: 1.5, h: 0.75, fontFace: FONT_BODY, fontSize: 10, color: C.sub, margin: 0, lineSpacing: 13 });
  if (i < steps.length - 1) {
    s.addShape("line", { x: xs + 1.75, y: 2.8, w: 0.25, h: 0, line: { color: C.orange, width: 2 } });
  }
  xs += 2.0;
});
footer(s, "Class 0 · 課程導覽與 Lab 準備");

// Slide 3: 學習目標
s = contentSlide(pptx, "本堂課學習目標", { page: "3" });
s.addShape("roundRect", { x: 0.5, y: 1.2, w: 9, h: 3.4, fill: { color: C.soft }, rectRadius: 0.1 });
bullets(s, 0.9, 1.5, 8.2, 2.9, [
  "理解課程總路線與 7 堂課的銜接關係",
  "認識 PVE 9.x 的主控台、網路、儲存入口",
  "匯入 cloud image、建立 VM 範本（cloud-init）",
  "由範本複製出 6 台 K8s 節點 VM",
  "確認 SSH 連線與 /etc/hosts 解析就緒",
]);
footer(s, "目標：讓 Lab 環境在課前完全就緒");

// Slide 4: 環境總覽
s = contentSlide(pptx, "環境總覽", { page: "4" });
card(s, 0.5, 1.2, 2.9, 1.9, C.orange, "PVE 9.x 主機", "一台或多台（Lab 可單機）\nWeb UI :8006\nRESTful API");
card(s, 3.55, 1.2, 2.9, 1.9, C.blue, "VM 範本 (ID 10000)", "Ubuntu 24.04 cloud image\ncloud-init 可自動設定 IP/SSH");
card(s, 6.6, 1.2, 2.9, 1.9, C.orange, "6 台節點 VM", "3 控制平面 + 3 worker\nclone 自範本");
card(s, 0.5, 3.3, 2.9, 1.6, C.blue, "網路", "vmbr0 bridge\n管理網段 192.168.10.0/24");
card(s, 3.55, 3.3, 2.9, 1.6, C.orange, "存取", "SSH / qemu-guest-agent\nhosts 解析");
card(s, 6.6, 3.3, 2.9, 1.6, C.blue, "後續課程", "Class 4-6 在此基礎上建 HAK8s");
footer(s, "Lab 目標：一切就緒，等待 Class 1-6");

// Slide 5: Lab 目標清單
s = contentSlide(pptx, "Lab 0 目標清單", { page: "5" });
bullets(s, 0.6, 1.2, 8.8, 3.5, [
  "下載 Ubuntu 24.04 cloud image",
  "建立範本 VM 並匯入磁碟、設 cloud-init",
  "以 qm clone 複製 6 台節點",
  "設定各節點 vCPU/RAM/磁碟/IP（依 Class 4 架構表）",
  "安裝 qemu-guest-agent 與 /etc/hosts",
  "驗證：qm list、SSH、互 ping",
], { size: 15, line: 28 });
footer(s, "詳見 lab-00-lab-prep.md");

// Slide 6: 收尾
s = darkSlide(pptx, { kicker: "Class 0 · 完成", title: "下一步：進入 Class 1", titleY: 1.6, sub: "PVE 虛擬化平台概論——了解你腳下的地基。" });
s.addText("Lab 0 未完成者，可在課後自行補上，後續課程皆以 6 台節點就緒為前提。", { x: 0.6, y: 3.2, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0 });
s.addNotes("Wrap up and hand-off to Class 1.");

pptx.writeFile({ fileName: "/root/opencode/k8s/01-class-slides/class-00-lab-prep.pptx" }).then(() => console.log("class-00 done"));
