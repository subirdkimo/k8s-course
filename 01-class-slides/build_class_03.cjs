const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("/root/opencode/k8s/.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 3 - K8s 網路、儲存與高可用";

let s = darkSlide(pptx, { kicker: "PVE × Kubernetes 工程師訓練", title: "Class 3", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.1, w: 6.4, h: 0.6, fill: { color: C.blue }, rectRadius: 0.1 });
s.addText("K8s 網路、儲存與高可用元件", { x: 0.6, y: 4.1, w: 6.4, h: 0.6, fontFace: FONT_BODY, fontSize: 15, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("1 hr 30 min ｜ 理論 + Lab ｜ CNI / Storage / HA", { x: 0.6, y: 4.85, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("Network model, CNI, service exposure, storage (PV/PVC/StorageClass/CSI), HA.");

// Slide 2: 網路模型
s = contentSlide(pptx, "Kubernetes 網路模型", { page: "2" });
bullets(s, 0.5, 1.2, 4.4, 3.6, [
  "每支 Pod 有獨立 IP，可跨節點直連",
  "Pod 之間不需 NAT 即可互通",
  "CNI (Container Network Interface) 實作 Pod 網路",
], { size: 15, line: 30 });
card(s, 5.1, 1.2, 4.4, 3.2, C.blue, "CNI 常見選項", "Calico：層三網格、支援 NetworkPolicy（本課程採用）\nCilium：eBPF、可觀測性佳\nFlannel：簡單、易上手、NetworkPolicy 較弱");
s.addShape("roundRect", { x: 0.5, y: 4.55, w: 9, h: 0.55, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("Pod↔Pod 跨節點：CNI 透過 overlay (VXLAN) 或 direct routing (Calico BGP) 打通", { x: 0.7, y: 4.62, w: 8.6, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0 });

// Slide 3: 服務暴露
s = contentSlide(pptx, "服務暴露方式", { page: "3" });
card(s, 0.5, 1.2, 2.9, 3.1, C.blue, "ClusterIP", "叢集內虛擬 IP\n僅叢集內可達\n預設型別");
card(s, 3.55, 1.2, 2.9, 3.1, C.orange, "NodePort", "每節點開某連接埠\n導向 Service\n測試用");
card(s, 6.6, 1.2, 2.9, 3.1, C.blue, "LoadBalancer", "需外部 LB 提供 4 層 VIP\nPVE 上用 MetalLB / PVE Dynamic LB\n對外正式服務");
s.addShape("roundRect", { x: 0.5, y: 4.5, w: 9, h: 0.6, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("Ingress：七層（HTTP/HTTPS）路由，依 host/path 轉發給後端 Service", { x: 0.7, y: 4.58, w: 8.6, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.navy, bold: true, margin: 0 });

// Slide 4: LoadBalancer + MetalLB
s = contentSlide(pptx, "PVE 上的 LoadBalancer：MetalLB", { page: "4" });
card(s, 0.5, 1.2, 4.4, 2.2, C.orange, "為什麼需要 MetalLB", "K8s 的 LoadBalancer 型別需要外部提供第4層 VIP\n雲端（EKS/GKE）內建；裸機/PVE 需自行提供\nMetalLB 是裸機方案");
card(s, 5.1, 1.2, 4.4, 2.2, C.blue, "運作方式", "宣告 IPAddressPool（如 192.168.10.200-220）\n為 LoadBalancer Service 分配外部 IP\nLayer2 模式經 ARP 回應（簡單）或 BGP");
bullets(s, 0.6, 3.6, 8.8, 1.5, [
  "PVE 9.2 亦內建 Dynamic Load Balancer，可作為替代",
  "kube-proxy 將 VIP 流量導向後端 Service Pod",
], { size: 13 });

// Slide 5: 儲存抽象
s = contentSlide(pptx, "儲存抽象：PV / PVC / StorageClass / CSI", { page: "5" });
card(s, 0.5, 1.2, 2.9, 2.5, C.blue, "PV", "PersistentVolume\n實際儲存磁碟區\n由管理員或 SC 建立");
card(s, 3.55, 1.2, 2.9, 2.5, C.orange, "PVC", "PersistentVolumeClaim\n應用宣告容量/存取模式\n動態綁定 PV");
card(s, 6.6, 1.2, 2.9, 2.5, C.blue, "StorageClass", "描述儲存類型\n提供動態供應\n如 rbd-ceph / local-path");
card(s, 0.5, 3.9, 9, 1.1, C.orange, "CSI (Container Storage Interface)", "標準連接 K8s 與儲存後端\nceph-csi（RBD/CephFS）、local-path-provisioner\n支援動態供應、快照、擴充");
footer(s, "RWO→RBD/Ceph；RWX→NFS/CephFS");

// Slide 6: 存取模式 & StatefulSet
s = contentSlide(pptx, "存取模式與有狀態應用", { page: "6" });
card(s, 0.5, 1.2, 4.4, 2.1, C.blue, "存取模式", "RWO：單節點讀寫（RBD/Ceph 常見）\nROX：唯讀多節點\nRWX：多節點可寫（NFS/CephFS）");
card(s, 5.1, 1.2, 4.4, 2.1, C.orange, "StatefulSet", "每個 Pod 有穩定、唯一的身分（序號）\n每個 Pod 綁定獨立 PVC\n適合資料庫、訊息佇列等有狀態應用");
bullets(s, 0.6, 3.5, 8.8, 1.6, [
  "無狀態應用（Web/API）用 Deployment",
  "有狀態應用（DB）用 StatefulSet + PVC",
], { size: 14 });

// Slide 7: 高可用原理
s = contentSlide(pptx, "高可用（HA）原理", { page: "7" });
card(s, 0.5, 1.2, 4.4, 2.2, C.blue, "控制平面 HA", "≥3 控制平面\netcd 奇數成員形成 quorum（多數決）\n需 LB 把流量分散到多個 apiserver");
card(s, 5.1, 1.2, 4.4, 2.2, C.orange, "工作負載 HA", "Deployment >1 副本，跨不同 worker\n節點故障→controller 在他處重建 Pod（自癒）\nPDB 控制自願中斷最少可用數");
bullets(s, 0.6, 3.6, 8.8, 1.5, [
  "在 PVE 上：控制平面 / worker VM 分佈於不同 PVE 節點，避免單點故障",
  "PVE HA（基礎設施層）＋ K8s HA（應用層）雙層保障",
], { size: 13 });

// Slide 8: 分散放置示意
s = contentSlide(pptx, "分散放置示意（PVE × K8s 結合）", { page: "8" });
const pve = [["PVE Node 1", "cp1 · w1"], ["PVE Node 2", "cp2 · w2"], ["PVE Node 3", "cp3 · w3"]];
let px2 = 0.5;
pve.forEach((p, i) => {
  s.addShape("roundRect", { x: px2, y: 1.3, w: 2.85, h: 3.2, fill: { color: C.card }, rectRadius: 0.1, line: { color: C.orange } });
  s.addShape("roundRect", { x: px2 + 0.15, y: 1.5, w: 2.55, h: 0.5, fill: { color: C.orange }, rectRadius: 0.08 });
  s.addText(p[0], { x: px2 + 0.15, y: 1.56, w: 2.55, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: C.white, bold: true, align: "center", margin: 0 });
  const roles = p[1].split(" · ");
  let ry2 = 2.2;
  roles.forEach((r) => {
    s.addShape("roundRect", { x: px2 + 0.45, y: ry2, w: 1.95, h: 0.6, fill: { color: C.blue }, rectRadius: 0.08 });
    s.addText(r, { x: px2 + 0.45, y: ry2 + 0.12, w: 1.95, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.white, bold: true, align: "center", margin: 0 });
    ry2 += 0.75;
  });
  s.addText("共用 Ceph 儲存", { x: px2 + 0.15, y: 3.9, w: 2.55, h: 0.4, fontFace: FONT_BODY, fontSize: 10, color: C.sub, align: "center", margin: 0 });
  px2 += 3.0;
});
footer(s, "分散控制平面與 worker 於不同 PVE 節點，才能避免單點故障");

// Slide 9: Lab 說明
s = contentSlide(pptx, "Lab 3 實作", { page: "9" });
bullets(s, 0.6, 1.2, 8.8, 3.4, [
  "建立 StorageClass + PVC，確認 Bound",
  "部署 StatefulSet（每個 Pod 獨立磁碟）",
  "安裝 MetalLB 並取得 LoadBalancer 外部 IP",
  "驗證 NetworkPolicy（限制 Pod 間流量）",
], { size: 15, line: 30 });
footer(s, "詳見 lab-03-network-storage-ha.md");

// Slide 10: 收尾
s = darkSlide(pptx, { kicker: "Class 3 · 完成", title: "下一步：架構規劃與 VM 建置", titleY: 1.6, sub: "把原理落地成 PVE 上的實體配置。" });
s.addText("網路、儲存、HA 三塊地基已備齊，Class 4 起開始實作。", { x: 0.6, y: 3.2, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0 });
s.addNotes("Hand-off to Class 4.");

pptx.writeFile({ fileName: "/root/opencode/k8s/01-class-slides/class-03-network-storage-ha.pptx" }).then(() => console.log("class-03 done"));
