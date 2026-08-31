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
s.addText("1 hr 15 min ｜ 理論 + 實作 ｜ PVE 9.x", { x: 0.6, y: 4.85, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
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

// Slide 3: 9.x 版本演進
s = contentSlide(pptx, "PVE 9.x 版本演進（2026 最新）", { page: "3" });
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

// Slide 4: 虛擬化技術
s = contentSlide(pptx, "虛擬化技術原理", { page: "4" });
card(s, 0.5, 1.2, 4.4, 1.7, C.blue, "QEMU/KVM（虛擬機）", "KVM：Linux 內建 Type-1 hypervisor\nQEMU：裝置模擬層\n全虛擬化、效能接近原生");
card(s, 5.1, 1.2, 4.4, 1.7, C.orange, "LXC（系統容器）", "行程層級隔離、共用宿主核心\n啟動快、密度高\nK8s 節點建議用 VM 而非 LXC");
card(s, 0.5, 3.05, 4.4, 1.7, C.blue, "VirtIO（半虛擬化）", "虛擬 NIC / 磁碟高效能驅動\nLinux Guest 內建\nK8s 節點必用");
card(s, 5.1, 3.05, 4.4, 1.7, C.orange, "qemu-guest-agent", "宿主可取得 Guest IP\n執行乾淨關機、快照協調");
footer(s, "K8s 節點趟好以 VM 建置");

// Slide 5: CPU type 選擇
s = contentSlide(pptx, "CPU type：host vs x86-64-v2-AES", { page: "5" });
card(s, 0.5, 1.3, 4.4, 3.2, C.orange, "host（效能最高）", "暴露宿主完整指令集\n5%–25% 更快（DB/AI/加密）\n同質硬體適用\n但：混合 CPU 硬體無法 live migration");
card(s, 5.1, 1.3, 4.4, 3.2, C.blue, "x86-64-v2-AES（可攜）", "統一的虛擬 CPU 型號\n可跨世代硬體 live migration\n異質/需遷移環境適用\n效能略低於 host");
s.addShape("roundRect", { x: 0.5, y: 4.7, w: 9, h: 0.5, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("同質硬體 → host；異質/需遷移 → 標準化型號。K8s 節點通常可選 host。", { x: 0.7, y: 4.76, w: 8.6, h: 0.38, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0 });
footer(s, "PVE 官方建議：欲 live migration 用最低世代相容型號");

// Slide 6: 儲存
s = contentSlide(pptx, "儲存後端（K8s PV 的基礎）", { page: "6" });
const stor = [
  ["Local", "單節點目錄", "OS / 模板"],
  ["LVM-Thin", "快照、精簡供應", "VM 磁碟"],
  ["ZFS", "快照、世代、資料保護", "VM 磁碟"],
  ["Ceph (RBD)", "分散式共用、HA、可擴充", "K8s PersistentVolume"],
  ["NFS", "網路共用", "RWX 應用"],
];
let sx = 0.5, icol = 0;
stor.forEach((st) => {
  const col = icol % 3, row = Math.floor(icol / 3);
  card(s, 0.5 + col * 3.1, 1.2 + row * 1.6, 2.9, 1.4, col % 2 ? C.blue : C.orange, st[0], st[1] + "\n" + st[2]);
  icol++;
});
s.addShape("roundRect", { x: 0.5, y: 4.5, w: 9, h: 0.55, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("K8s 節點虛擬磁碟建議放 Ceph，以支援 VM live migration 與 HA；RWO 用 RBD、RWX 用 CephFS/NFS。", { x: 0.7, y: 4.58, w: 8.6, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0 });
footer(s, "儲存選擇決定 K8s PV 的能力與 HA 上限");

// Slide 7: 網路
s = contentSlide(pptx, "網路：Bridge、VLAN、SDN", { page: "7" });
card(s, 0.5, 1.2, 4.4, 2.3, C.blue, "Linux Bridge (vmbrX)", "連結實體 NIC 與 VM 的 vNIC\nVM 透過 vNIC 取得對外網段 IP\nK8s CNI 負責 Pod 層次網路");
card(s, 5.1, 1.2, 4.4, 2.3, C.orange, "VLAN / SDN", "VLAN：單線切分多個隔離網段\nSDN：集中管理跨節點虛擬網路\nPVE 9.2 新增 Dynamic LB + WireGuard");
bullets(s, 0.6, 3.7, 8.8, 1.5, [
  "K8s 節點 VM 接在 bridge 後，由 CNI 提供 Pod 網路",
  "大流量叢集建議第二實體 NIC → 專用 bridge 與管理流量隔離",
], { size: 13 });
footer(s, "網路規畫是 K8s 叢集穩定性的關鍵");

// Slide 8: 叢集 / HA / 備份
s = contentSlide(pptx, "叢集、HA、備份、快照", { page: "8" });
card(s, 0.5, 1.2, 2.9, 2.3, C.orange, "叢集 (Cluster)", "corosync + pve-cluster\n多節點共用 Web/API\nHA 資源池");
card(s, 3.55, 1.2, 2.9, 2.3, C.blue, "HA", "監控 VM 健康\n節點故障→他節點重啟\n需共用儲存 (Ceph)");
card(s, 6.6, 1.2, 2.9, 2.3, C.orange, "備份 / 快照", "vzdump 產生備份\nPBS 去重/加密/增量\n快照可還原");
bullets(s, 0.6, 3.7, 8.8, 1.4, [
  "K8s 節點升級 / 實驗前，先在 PVE 層打快照是良好習慣",
  "PVE 備份 vs K8s 應用備份需分層規劃（Class 6 詳述）",
], { size: 13 });
footer(s, "PVE 提供的是「基礎設施層」HA，K8s 則處理應用層自癒");

// Slide 9: Lab
s = contentSlide(pptx, "Lab 1 實作", { page: "9" });
bullets(s, 0.6, 1.2, 8.8, 3.4, [
  "建立一台測試 VM（或使用範本）",
  "建立快照並還原（qm snapshot / qm rollback）",
  "執行一次 vzdump 備份並產出備份檔",
  "新增第二張 VirtIO NIC 接到專用 bridge vmbr1",
  "體驗 PVE Web UI 的 VM / 快照 / 備份操作",
], { size: 15, line: 30 });
footer(s, "詳見 lab-01-pve-overview.md");

// Slide 10: 收尾
s = darkSlide(pptx, { kicker: "Class 1 · 完成", title: "下一步：K8s 核心架構", titleY: 1.6, sub: "搞懂控制平面與工作節點的運作原理。" });
s.addText("PVE 是承載 K8s 的堅實地基——虛擬化、儲存、網路、HA 皆備。", { x: 0.6, y: 3.2, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0 });
s.addNotes("Wrap up, hand-off to Class 2.");

pptx.writeFile({ fileName: "/root/opencode/k8s/01-class-slides/class-01-pve-overview.pptx" }).then(() => console.log("class-01 done"));
