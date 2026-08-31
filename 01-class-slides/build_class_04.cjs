const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("/root/opencode/k8s/.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 4 - PVE 上 K8s 架構規劃與 VM 建置";

let s = darkSlide(pptx, { kicker: "PVE × Kubernetes 工程師訓練", title: "Class 4", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.1, w: 6.6, h: 0.6, fill: { color: C.orange }, rectRadius: 0.1 });
s.addText("架構規劃與節點 VM 建置", { x: 0.6, y: 4.1, w: 6.6, h: 0.6, fontFace: FONT_BODY, fontSize: 16, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("1 hr 15 min ｜ 實作 ｜ 6 台節點 VM", { x: 0.6, y: 4.85, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("Design 6-VM HA architecture on PVE, VM best practices, network/storage planning, build VMs.");

// Slide 2: 節點配置表
s = contentSlide(pptx, "生產架構：6 台節點 VM", { page: "2" });
const head = ["角色", "主機名", "vCPU", "RAM", "磁碟", "放置"];
const rows = [
  ["控制平面", "k8s-cp1", "4", "8G", "40G", "PVE Node 1"],
  ["控制平面", "k8s-cp2", "4", "8G", "40G", "PVE Node 2"],
  ["控制平面", "k8s-cp3", "4", "8G", "40G", "PVE Node 3"],
  ["Worker", "k8s-w1", "8", "16G", "60G", "PVE Node 1"],
  ["Worker", "k8s-w2", "8", "16G", "60G", "PVE Node 2"],
  ["Worker", "k8s-w3", "8", "16G", "60G", "PVE Node 3"],
];
const colW = [1.5, 1.9, 1.1, 1.1, 1.4, 2.6];
let xx = 0.5;
head.forEach((h, i) => {
  s.addShape("rect", { x: xx, y: 1.25, w: colW[i], h: 0.45, fill: { color: C.navy } });
  s.addText(h, { x: xx, y: 1.3, w: colW[i], h: 0.35, fontFace: FONT_BODY, fontSize: 11, color: C.white, bold: true, align: "center", margin: 0 });
  xx += colW[i];
});
let ryy = 1.7;
rows.forEach((r, ri) => {
  xx = 0.5;
  r.forEach((c, ci) => {
    s.addShape("rect", { x: xx, y: ryy, w: colW[ci], h: 0.42, fill: { color: ri % 2 ? C.soft : C.white }, line: { color: C.line, width: 0.5 } });
    s.addText(c, { x: xx, y: ryy + 0.05, w: colW[ci], h: 0.32, fontFace: FONT_BODY, fontSize: 10.5, color: ri < 3 ? C.blue : C.orange, bold: ri < 3, align: "center", margin: 0 });
    xx += colW[ci];
  });
  ryy += 0.42;
});
footer(s, "控制平面分散到不同 PVE 節點，避免單點故障");

// Slide 3: 命名/IP 規畫
s = contentSlide(pptx, "IP 與網段規畫", { page: "3" });
card(s, 0.5, 1.2, 4.4, 2.5, C.orange, "網站與 IP", "管理網段：192.168.10.0/24\ncp: .11/.12/.13\nw: .21/.22/.23\nLB VIP: 192.168.10.100");
card(s, 5.1, 1.2, 4.4, 2.5, C.blue, "K8s 內部網段", "Pod 網段：10.200.0.0/16\n(與 CNI 相符)\nService 網段：10.96.0.0/12\n/kube-apiserver 設定)");
bullets(s, 0.6, 3.9, 8.8, 1.2, [
  "/etc/hosts 或 DNS 需能解析所有節點主機名（見 Lab 0）",
], { size: 13 });

// Slide 4: VM 最佳實踐
s = contentSlide(pptx, "PVE 上 VM 最佳實踐（K8s 節點）", { page: "4" });
card(s, 0.5, 1.2, 4.4, 1.9, C.orange, "CPU type = host", "同質硬體下效能最高\nK8s 節點通常不需 live migration\nDB/AI/加密多 5–25%");
card(s, 5.1, 1.2, 4.4, 1.9, C.blue, "磁碟 SCSI + Discard", "virtio-scsi-pci controller\n啟用 Discard（trim）\n效能較佳");
card(s, 0.5, 3.3, 4.4, 1.9, C.orange, "網路 VirtIO", "virtio-net 半虛擬化\nqemu-guest-agent\n讓 PVE 顯示 IP / 乾淨關機");
card(s, 5.1, 3.3, 4.4, 1.9, C.blue, "資源規畫", "控制平面 4vCPU/8G\nWorker 8vCPU/16G\n少用需 GPU passthrough");

// Slide 5: 網路規畫
s = contentSlide(pptx, "網路規畫", { page: "5" });
card(s, 0.5, 1.2, 4.4, 2.2, C.blue, "管理網段", "vmbr0 接 LAN\nPVE 管理 + SSH\nK8s 叢集通訊");
card(s, 5.1, 1.2, 4.4, 2.2, C.orange, "專用 bridge (vmbr1)", "大流量叢集加第二實體 NIC\n隔離 K8s / 儲存流量\n避免搶佔管理頻寬");
bullets(s, 0.6, 3.6, 8.8, 1.5, [
  "防火牆雙層管控：PVE 層 + K8s NetworkPolicy 層",
  "只用管理網段跑 Lab 亦可，但正式環境建議隔離",
], { size: 13 });

// Slide 6: 儲存規畫
s = contentSlide(pptx, "儲存規畫", { page: "6" });
card(s, 0.5, 1.2, 4.4, 2.2, C.orange, "節點 OS 磁碟", "放在節點 local 儲存（LVM/ZFS）\n開機系統獨立於共用儲存");
card(s, 5.1, 1.2, 4.4, 2.2, C.blue, "K8s PV 用磁碟", "放在 Ceph (RBD)\n使 worker VM 具備 HA 與遷移能力\nceph-csi 於 Class 6 整合");
bullets(s, 0.6, 3.6, 8.8, 1.5, [
  "共用儲存是 VM live migration 與 PVE HA 的前提",
  "Lab 環境可用 local 儲存，但 HA 受限",
], { size: 13 });

// Slide 7: Lab 步驟（建立 6 台 VM）
s = contentSlide(pptx, "Lab 4：建立 6 台節點 VM", { page: "7" });
const labSteps = [
  "匯入 Ubuntu 24.04 cloud image → 建範本 + cloud-init",
  "qm clone 複製 6 台（3 cp + 3 worker）",
  "依架構表設定 vCPU/RAM/磁碟/IP",
  "設定 CPU type=host、SSH key、qemu-guest-agent",
  "設定 /etc/hosts 與時區、時間同步",
];
let ly = 1.3;
labSteps.forEach((st, i) => {
  s.addShape("ellipse", { x: 0.6, y: ly + 0.05, w: 0.4, h: 0.4, fill: { color: C.orange } });
  s.addText(String(i + 1), { x: 0.6, y: ly + 0.13, w: 0.4, h: 0.3, fontFace: FONT_BODY, fontSize: 12, color: C.white, bold: true, align: "center", margin: 0 });
  s.addText(st, { x: 1.15, y: ly + 0.03, w: 8.2, h: 0.45, fontFace: FONT_BODY, fontSize: 14, color: C.body, margin: 0 });
  ly += 0.55;
});
footer(s, "詳見 lab-04-architecture-vm.md 與 Class 4 content");

// Slide 8: 收尾
s = darkSlide(pptx, { kicker: "Class 4 · 完成", title: "下一步：kubeadm 安裝高可用 K8s", titleY: 1.6, sub: "6 台節點就緒，開始安裝核心系統元件。" });
s.addText("架構落地：6 台 VM 具備正確資源、網路、儲存與 qemu-guest-agent。", { x: 0.6, y: 3.2, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0 });
s.addNotes("Hand-off to Class 5.");

pptx.writeFile({ fileName: "/root/opencode/k8s/01-class-slides/class-04-architecture-vm.pptx" }).then(() => console.log("class-04 done"));
