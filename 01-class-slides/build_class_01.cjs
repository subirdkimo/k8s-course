const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("/root/opencode/k8s/.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 1 - Proxmox VE 虛擬化平台概論";

let s = darkSlide(pptx, { kicker: "PVE × Kubernetes 工程師訓練", title: "Class 1", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.1, w: 5.4, h: 0.6, fill: { color: C.orange }, rectRadius: 0.1 });
s.addText("Proxmox VE 虛擬化平台概論", { x: 0.6, y: 4.1, w: 5.4, h: 0.6, fontFace: FONT_BODY, fontSize: 16, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("2 hr ｜ 觀念 + 實作 ｜ PVE 9.x", { x: 0.6, y: 4.85, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("PVE overview. Latest 9.x facts, virtualization tech, storage, network, HA/backup.");

// Slide 2: PVE 是什麼
s = contentSlide(pptx, "Proxmox VE 是什麼？", { page: "2" });
card(s, 0.5, 1.2, 4.4, 2.6, C.orange, "Type-1 虛擬化平台", "開放原始碼 (AGPLv3) 的伺服器虛擬化平台\n整合虛擬機 (KVM/QEMU) 與容器 (LXC)\n單一 Web 介面 + RESTful API 管理");
card(s, 5.1, 1.2, 4.4, 2.6, C.blue, "內建企業級能力", "Ceph 分散式儲存\nZFS 檔案系統\nHA 高可用\n備份 (PBS) 與快照\n防火牆 / 網路 (SDN)");
bullets(s, 0.6, 4.0, 8.8, 1.3, [
  "管理介面：https://<pve-ip>:8006",
  "專業支援訂閱：企業版 Repo（EUR 115/年/CPU 起）",
], { size: 13 });
footer(s, "PVE = 虛擬化 + 儲存 + 網路 + HA 的整合平台");

// Slide 3 (NEW): 虛擬化三種形態
s = contentSlide(pptx, "虛擬化三種形態（觀念）", { page: "3" });
const virt = [
  ["形 態", "代表", "隔離", "啟動/密度"],
  ["Type-1 裸機", "PVE / ESXi", "最強（完整 OS）", "稍慢・中等"],
  ["Type-2 主機", "Workstation/VB", "最弱（先裝宿主 OS）", "最慢・最佔資源"],
  ["容器 OS-level", "LXC / Docker", "中（共用宿主核心）", "最快・密度最高"],
];
let vty = 1.1;
virt.forEach((row, ri) => {
  const fillc = ri === 0 ? C.navy : (ri % 2 ? C.card : C.white);
  const acc = ri === 0 ? C.white : C.navy;
  row.forEach((cell, ci) => {
    const x = 0.5 + ci * 2.25;
    s.addShape("rect", { x, y: vty, w: 2.25, h: 0.58, fill: { color: ri === 0 ? fillc : (ci === 0 ? C.soft : C.white) }, line: { color: C.line, width: 0.5 } });
    s.addText(cell, { x: x + 0.08, y: vty, w: 2.12, h: 0.58, fontFace: FONT_BODY, fontSize: 11, color: ri === 0 ? C.white : (ci === 0 ? C.blue : C.body), bold: ri === 0 || ci === 0, margin: 0, valign: "middle" });
  });
  vty += 0.58;
});
s.addShape("roundRect", { x: 0.5, y: 3.6, w: 9, h: 1.1, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("為什麼 PVE 選 Type-1", { x: 0.7, y: 3.68, w: 8.6, h: 0.35, fontFace: FONT_BODY, fontSize: 14, color: C.orange, bold: true, margin: 0 });
s.addText("直接跑在硬體、少一層宿主 OS → 效能/穩定/密度最佳，是生產環境標準。", { x: 0.7, y: 4.02, w: 8.6, h: 0.35, fontFace: FONT_BODY, fontSize: 12, color: C.body, margin: 0 });
s.addShape("roundRect", { x: 0.5, y: 4.8, w: 9, h: 0.5, fill: { color: C.card }, rectRadius: 0.08 });
s.addText("對 K8s：K8s 管「容器」編排，PVE 把 K8s 節點裝成 VM —— 兩層各司其職。", { x: 0.7, y: 4.86, w: 8.6, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0 });
footer(s, "隔離越強越安全也越貴；生產取 Type-1 VM + 應用層容器");

// Slide 4: 9.x 版本演進
s = contentSlide(pptx, "PVE 9.x 版本演進（2026 最新）", { page: "4" });
const vers = [
  ["9.0", "2025-08", "Debian 13 Trixie、核心 6.14、Ceph Squid"],
  ["9.1", "2025-11", "多項改善與修正"],
  ["9.2", "2026-05", "核心 7.0、Dynamic Load Balancer、WireGuard SDN"],
  ["9.x", "2026", "原生 Arm64 支援（NVIDIA Grace/Vera）"],
];
let vy = 1.2;
vers.forEach((v) => {
  s.addShape("roundRect", { x: 0.5, y: vy, w: 9, h: 0.85, fill: { color: C.card }, rectRadius: 0.08, line: { color: C.line } });
  s.addShape("roundRect", { x: 0.65, y: vy + 0.15, w: 1.0, h: 0.55, fill: { color: C.orange }, rectRadius: 0.08 });
  s.addText(v[0], { x: 0.65, y: vy + 0.24, w: 1.0, h: 0.4, fontFace: FONT_BODY, fontSize: 15, color: C.white, bold: true, align: "center", margin: 0 });
  s.addText(v[1], { x: 1.85, y: vy + 0.22, w: 1.4, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.blue, bold: true, margin: 0 });
  s.addText(v[2], { x: 3.4, y: vy + 0.22, w: 5.9, h: 0.45, fontFace: FONT_BODY, fontSize: 13, color: C.body, margin: 0 });
  vy += 1.0;
});
s.addShape("roundRect", { x: 0.5, y: 4.5, w: 9, h: 0.55, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("PVE 8.x 已於 2026-08 停止支援（EOL），本課程一律以 9.x 為準。", { x: 0.7, y: 4.58, w: 8.6, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.navy, bold: true, margin: 0 });
footer(s, "版本資訊參考 Proxmox 官方 Roadmap / Release Notes");

// Slide 5: 虛擬化技術
s = contentSlide(pptx, "虛擬化技術原理", { page: "5" });
card(s, 0.5, 1.2, 4.4, 1.7, C.blue, "QEMU/KVM（虛擬機）", "KVM：Linux 內建 Type-1 hypervisor\nQEMU：裝置模擬層\n全虛擬化、效能接近原生");
card(s, 5.1, 1.2, 4.4, 1.7, C.orange, "LXC（系統容器）", "行程層級隔離、共用宿主核心\n啟動快、密度高\nK8s 節點建議用 VM 而非 LXC");
card(s, 0.5, 3.05, 4.4, 1.7, C.blue, "VirtIO（半虛擬化）", "虛擬 NIC / 磁碟高效能驅動\nLinux Guest 內建\nK8s 節點必用");
card(s, 5.1, 3.05, 4.4, 1.7, C.orange, "qemu-guest-agent", "宿主可取得 Guest IP\n執行乾淨關機、快照協調");
footer(s, "K8s 節點應以 VM 建置");

// Slide 6 (NEW): 隔離與效能取捨
s = contentSlide(pptx, "隔離 vs 效能的光譜（觀念）", { page: "6" });
card(s, 0.5, 1.2, 4.4, 2.0, C.blue, "全虛擬化 (VM)", "Guest 以為有完整硬體\n隔離最強、可跑任意 OS\n經 QEMU 模擬有折損");
card(s, 5.1, 1.2, 4.4, 2.0, C.orange, "半虛擬化 (VirtIO)", "Guest 裝「知道自己是虛擬」的驅動\n直接跟 hypervisor 對話\n折損大幅降低 (<5%)");
card(s, 0.5, 3.35, 4.4, 1.5, C.orange, "容器", "不模擬硬體、共用宿主核心\n效能幾乎零折損、密度最高\n犧牲多 OS 與強隔離");
s.addShape("roundRect", { x: 5.1, y: 3.35, w: 4.4, h: 1.5, fill: { color: C.soft }, rectRadius: 0.08, line: { color: C.line } });
s.addText("心智模型", { x: 5.3, y: 3.45, w: 4.0, h: 0.35, fontFace: FONT_BODY, fontSize: 14, color: C.orange, bold: true, margin: 0 });
s.addText("隔離越強＝越安全＝越貴（效能/資源）。K8s 生產取「VM 強隔離 + VirtIO 高速」，應用層用容器換密度。", { x: 5.3, y: 3.82, w: 4.0, h: 0.95, fontFace: FONT_BODY, fontSize: 11, color: C.body, margin: 0, lineSpacing: 15 });
footer(s, "隔離與效能是一條光譜，不是二選一");

// Slide 7: CPU type 選擇
s = contentSlide(pptx, "CPU type：host vs x86-64-v2-AES", { page: "7" });
card(s, 0.5, 1.3, 4.4, 3.2, C.orange, "host（效能最高）", "暴露宿主完整指令集\n5%–25% 更快（DB/AI/加密）\n同質硬體適用\n但：混合 CPU 硬體無法 live migration");
card(s, 5.1, 1.3, 4.4, 3.2, C.blue, "x86-64-v2-AES（可攜）", "統一的虛擬 CPU 型號\n可跨世代硬體 live migration\n異質/需遷移環境適用\n效能略低於 host");
s.addShape("roundRect", { x: 0.5, y: 4.7, w: 9, h: 0.5, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("同質硬體 → host；異質/需遷移 → 標準化型號。K8s 節點通常可選 host。", { x: 0.7, y: 4.76, w: 8.6, h: 0.38, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0 });
footer(s, "PVE 官方建議：欲 live migration 用最低世代相容型號");

// Slide 8: 儲存
s = contentSlide(pptx, "儲存後端（K8s PV 的基礎）", { page: "8" });
const stor = [
  ["Local", "單節點目錄", "OS / 模板"],
  ["LVM-Thin", "快照、精簡供應", "VM 磁碟"],
  ["ZFS", "快照、世代、資料保護", "VM 磁碟"],
  ["Ceph (RBD)", "分散式共用、HA、可擴充", "K8s PersistentVolume"],
  ["NFS", "網路共用", "RWX 應用"],
];
stor.forEach((st, icol) => {
  const col = icol % 3, row = Math.floor(icol / 3);
  card(s, 0.5 + col * 3.1, 1.2 + row * 1.6, 2.9, 1.4, col % 2 ? C.blue : C.orange, st[0], st[1] + "\n" + st[2]);
});
s.addShape("roundRect", { x: 0.5, y: 4.5, w: 9, h: 0.55, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("K8s 節點虛擬磁碟建議放 Ceph，以支援 VM live migration 與 HA；RWO 用 RBD、RWX 用 CephFS/NFS。", { x: 0.7, y: 4.58, w: 8.6, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0 });
footer(s, "儲存選擇決定 K8s PV 的能力與 HA 上限");

// Slide 9 (NEW): 精簡供應/快照/超售
s = contentSlide(pptx, "精簡供應、快照、超售（觀念）", { page: "9" });
card(s, 0.5, 1.2, 2.9, 2.4, C.blue, "精簡供應 (Thin)", "先「預留」空間，寫入才佔用\n省空間\n但超載會「寫入失敗」");
card(s, 3.55, 1.2, 2.9, 2.4, C.orange, "快照 (Snapshot)", "某時間點的磁碟狀態\n快速還原/比對\n⚠ 存在原系統內，非備份");
card(s, 6.6, 1.2, 2.9, 2.4, C.blue, "超售 (Oversell)", "預留總量賣得比實體多\n前提：實際用量遠低於預留\n適合開發/測試、非生產");
s.addShape("roundRect", { x: 0.5, y: 3.85, w: 9, h: 1.0, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("心智模型", { x: 0.7, y: 3.93, w: 8.6, h: 0.32, fontFace: FONT_BODY, fontSize: 13, color: C.orange, bold: true, margin: 0 });
s.addText("精簡供應＝先開帳後付款；快照＝時間機器；超售＝多賣房號；三者都靠「實際用遠少於預留」，假設破了就出事。K8s PV capacity 也是「預留」非「保證量」，生產建議配 Ceph quota + PBS 備份。", { x: 0.7, y: 4.24, w: 8.6, h: 0.55, fontFace: FONT_BODY, fontSize: 11, color: C.body, margin: 0, lineSpacing: 14 });
footer(s, "三者互補：Ceph 硬限制 + PBS 備份 + 快照快速還原");

// Slide 10: 網路
s = contentSlide(pptx, "網路：Bridge、VLAN、SDN", { page: "10" });
card(s, 0.5, 1.2, 4.4, 2.3, C.blue, "Linux Bridge (vmbrX)", "連結實體 NIC 與 VM 的 vNIC\nVM 透過 vNIC 取得對外網段 IP\nK8s CNI 負責 Pod 層次網路");
card(s, 5.1, 1.2, 4.4, 2.3, C.orange, "VLAN / SDN", "VLAN：單線切分多個隔離網段\nSDN：集中管理跨節點虛擬網路\nPVE 9.2 新增 Dynamic LB + WireGuard");
bullets(s, 0.6, 3.7, 8.8, 1.5, [
  "K8s 節點 VM 接在 bridge 後，由 CNI 提供 Pod 網路",
  "大流量叢集建議第二實體 NIC → 專用 bridge 與管理流量隔離",
], { size: 13 });
footer(s, "網路規畫是 K8s 叢集穩定性的關鍵");

// Slide 11 (NEW): 封包流向心智模型
s = contentSlide(pptx, "封包流向心智模型", { page: "11" });
const flow = ["VM 內的應用", "vNIC (VirtIO NIC)", "Linux Bridge (vmbrX)", "實體 NIC → 實體交換機"];
let fy = 1.05;
flow.forEach((f, i) => {
  s.addShape("roundRect", { x: 2.6, y: fy, w: 4.8, h: 0.55, fill: { color: i === 0 ? C.soft : C.card }, rectRadius: 0.1, line: { color: C.blue, width: 0.75 } });
  s.addText(f, { x: 2.7, y: fy, w: 4.6, h: 0.55, fontFace: FONT_BODY, fontSize: 13, color: C.navy, bold: true, align: "center", valign: "middle", margin: 0 });
  if (i < flow.length - 1) s.addText("▼", { x: 4.9, y: fy + 0.53, w: 0.3, h: 0.32, fontFace: FONT_BODY, fontSize: 14, color: C.orange, align: "center", margin: 0 });
  fy += 0.85;
});
const pkt = [
  ["bridge 是「交換機」", "按 MAC 轉發、不經 IP 層（不像 NAT），同網段 VM 間交換 MAC 即可、效能接近原生"],
  ["VM 是「真機」", "與外部實體主機平起平坐：可 ping、可路由、可用 VLAN / ACL / QoS"],
  ["與 K8s 的分界", "bridge 管「節點（VM）間與對外」；Pod 間才由 CNI 管（Class 3）"],
];
let py = 4.42;
pkt.forEach((p) => {
  s.addShape("ellipse", { x: 0.6, y: py + 0.05, w: 0.12, h: 0.12, fill: { color: C.orange } });
  s.addText(p[0] + "　", { x: 0.78, y: py, w: 1.5, h: 0.4, fontFace: FONT_BODY, fontSize: 10, color: C.blue, bold: true, margin: 0, valign: "middle" });
  s.addText(p[1], { x: 2.3, y: py, w: 7.2, h: 0.42, fontFace: FONT_BODY, fontSize: 10, color: C.body, margin: 0, valign: "middle" });
  py += 0.31;
});
footer(s, "生產 K8s 用 Bridge（雙向、可預測 IP）而非 NAT");

// Slide 12: 叢集 / HA / 備份
s = contentSlide(pptx, "叢集、HA、備份、快照", { page: "12" });
card(s, 0.5, 1.2, 2.9, 2.3, C.orange, "叢集 (Cluster)", "corosync + pve-cluster\n多節點共用 Web/API\nHA 資源池");
card(s, 3.55, 1.2, 2.9, 2.3, C.blue, "HA", "監控 VM 健康\n節點故障→他節點重啟\n需共用儲存 (Ceph)");
card(s, 6.6, 1.2, 2.9, 2.3, C.orange, "備份 / 快照", "vzdump 產生備份\nPBS 去重/加密/增量\n快照可還原");
bullets(s, 0.6, 3.7, 8.8, 1.4, [
  "K8s 節點升級 / 實驗前，先在 PVE 層打快照是良好習慣",
  "PVE 備份 vs K8s 應用備份需分層規劃（Class 6 詳述）",
], { size: 13 });
footer(s, "PVE 提供「基礎設施層」HA，K8s 處理應用層自癒");

// Slide 13 (NEW): 高可用觀念 quorum
s = contentSlide(pptx, "高可用觀念（quorum 與重啟）", { page: "13" });
card(s, 0.5, 1.2, 4.4, 2.4, C.blue, "Quorum 法定人數", "叢集要「多數節點存活」才認帳\n3 節集容許 1 掉、5 容許 2\n→ HA 要「奇數節點」\n偶數 2 掉時「2 對 2」無法決定正統");
card(s, 5.1, 1.2, 4.4, 2.4, C.orange, "HA＝重啟，非無縫接管", "節點掛 → VM 在別節點「重新開機」\n秒~分鐘級中斷\n（非 VMware FT 的零中斷熱遷移）");
card(s, 0.5, 3.8, 4.4, 1.4, C.blue, "Split-brain 腦裂", "網路割裂讓兩組各認自己多數\nCeph 靠 quorum+副本仲裁避免雙寫");
card(s, 5.1, 3.8, 4.4, 1.4, C.orange, "分層容錯", "HA(單點故障) + 備份(災難/PITR) + K8s(應用自癒)\n三層互補、不互相取代");
footer(s, "quorum=開會過半數；HA=一台倒了另一台頂上(重開)；備份=保險箱");

// Slide 14: Lab
s = contentSlide(pptx, "Lab 1 實作", { page: "14" });
bullets(s, 0.6, 1.2, 8.8, 3.4, [
  "建立一台測試 VM（或使用範本）",
  "建立快照並還原（qm snapshot / qm rollback）",
  "執行一次 vzdump 備份並產出備份檔",
  "新增第二張 VirtIO NIC 接到專用 bridge vmbr1",
  "體驗 PVE Web UI 的 VM / 快照 / 備份操作",
], { size: 15, line: 30 });
footer(s, "詳見 lab-01-pve-overview.md");

// Slide 15: 收尾
s = darkSlide(pptx, { kicker: "Class 1 · 完成", title: "下一步：K8s 核心架構", titleY: 1.6, sub: "搞懂控制平面與工作節點的運作原理。" });
s.addText("PVE 是承載 K8s 的堅實地基——虛擬化、儲存、網路、HA 皆備。", { x: 0.6, y: 3.2, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0 });
s.addNotes("Wrap up, hand-off to Class 2.");

pptx.writeFile({ fileName: "/root/opencode/k8s/01-class-slides/class-01-pve-overview.pptx" }).then(() => console.log("class-01 done"));
