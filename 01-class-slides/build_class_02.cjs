const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("/root/opencode/k8s/.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 2 - Kubernetes 核心架構與運作原理";

let s = darkSlide(pptx, { kicker: "PVE × Kubernetes 工程師訓練", title: "Class 2", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.1, w: 6.2, h: 0.6, fill: { color: C.blue }, rectRadius: 0.1 });
s.addText("Kubernetes 核心架構與運作原理", { x: 0.6, y: 4.1, w: 6.2, h: 0.6, fontFace: FONT_BODY, fontSize: 15, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("2 hr 15 min（含 OCP 比較）｜ 理論 ｜ 容器編排", { x: 0.6, y: 4.85, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("K8s core: motivation, isolation spectrum, control plane, reconcile loop, objects, declarative model, OCP comparison.");

// Slide 2: 為什麼需要 K8s
s = contentSlide(pptx, "為什麼需要 Kubernetes", { page: "2" });
card(s, 0.5, 1.2, 4.4, 2.1, C.orange, "容器解決了什麼", "把單一應用打包與執行\n（containerd / Docker 皆可）\n可攜、隔離、輕量");
card(s, 5.1, 1.2, 4.4, 2.1, C.blue, "容器編排解決什麼", "數百個容器的：調度、自癒\n服務發現、負載平衡\n滾動更新、橫向擴展");
s.addShape("roundRect", { x: 0.5, y: 3.55, w: 9, h: 1.5, fill: { color: C.soft }, rectRadius: 0.1 });
s.addText("Kubernetes = 業界標準容器編排平台", { x: 0.7, y: 3.75, w: 8.6, h: 0.45, fontFace: FONT_HEAD, fontSize: 20, color: C.navy, bold: true, margin: 0 });
s.addText("宣告式（Declarative）· 自我修復（Self-Healing）· 可擴展（Scalable）· 可攜（Portable）", { x: 0.7, y: 4.3, w: 8.6, h: 0.5, fontFace: FONT_BODY, fontSize: 14, color: C.body, margin: 0 });
footer(s, "K8s 的哲學：描述「想要的狀態」，系統自動收斂");

// Slide 3 (NEW): 容器/VM/裸機 光譜
s = contentSlide(pptx, "容器、虛擬機、裸機（隔離光譜）", { page: "3" });
const iso = [
  ["面向", "裸機", "虛擬機 (KVM)", "容器 (containerd)"],
  ["隔離單位", "整台實體機", "完整 OS（Guest）", "行程層 (namespace+cgroup)"],
  ["共用宿主核心", "—", "否", "是"],
  ["啟動 / 密度", "分鐘級・1/機", "分鐘級・數十/機", "秒級・數百~/機"],
  ["角色定位", "專用負載", "K8s 節點", "微服務打包部署"],
];
let iy = 1.05;
iso.forEach((row, ri) => {
  row.forEach((cell, ci) => {
    const x = 0.5 + ci * 2.25;
    s.addShape("rect", { x, y: iy, w: 2.25, h: 0.5, fill: { color: ri === 0 ? C.navy : (ci === 0 ? C.soft : (ri % 2 ? C.card : C.white)) }, line: { color: C.line, width: 0.5 } });
    s.addText(cell, { x: x + 0.07, y: iy, w: 2.13, h: 0.5, fontFace: FONT_BODY, fontSize: ci === 0 ? 10 : 10, color: ri === 0 ? C.white : (ci === 0 ? C.blue : C.body), bold: ri === 0 || ci === 0, margin: 0, valign: "middle" });
  });
  iy += 0.5;
});
s.addShape("roundRect", { x: 0.5, y: 3.9, w: 9, h: 0.55, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("本課程定位：VM 跑 K8s 節點（重隔離）＋ 容器跑應用（高密度）", { x: 0.7, y: 3.97, w: 8.6, h: 0.42, fontFace: FONT_BODY, fontSize: 13, color: C.navy, bold: true, margin: 0 });
s.addShape("roundRect", { x: 0.5, y: 4.6, w: 9, h: 0.55, fill: { color: C.card }, rectRadius: 0.08 });
s.addText("心智模型：裸機=整間公寓、VM=大樓單元、容器=單元房間；K8s 管「房間」，VM 只是載體", { x: 0.7, y: 4.67, w: 8.6, h: 0.42, fontFace: FONT_BODY, fontSize: 12, color: C.body, margin: 0 });
footer(s, "兩層組合是 PVE 環境下的標準形態");

// Slide 4: 總體架構圖
s = contentSlide(pptx, "總體架構：控制平面 + 工作節點", { page: "4" });
s.addShape("rect", { x: 0.5, y: 1.1, w: 4.3, h: 3.6, fill: { color: C.soft }, line: { color: C.blue, width: 1 } });
s.addText("控制平面 (Control Plane)", { x: 0.6, y: 1.1, w: 4.1, h: 0.4, fontFace: FONT_HEAD, fontSize: 16, color: C.navy, bold: true, margin: 0 });
const cp = [
  ["kube-apiserver", "唯一入口 / 認證授權"],
  ["etcd", "叢集狀態儲存 (quorum)"],
  ["kube-scheduler", "為 Pod 選節點"],
  ["kube-controller-manager", "控制器迴圈收斂"],
];
let cy = 1.6;
cp.forEach((c) => {
  s.addShape("roundRect", { x: 0.7, y: cy, w: 3.9, h: 0.62, fill: { color: C.white }, rectRadius: 0.1, line: { color: C.blue } });
  s.addText(c[0], { x: 0.85, y: cy + 0.07, w: 1.9, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: C.blue, bold: true, margin: 0 });
  s.addText(c[1], { x: 2.8, y: cy + 0.12, w: 1.75, h: 0.35, fontFace: FONT_BODY, fontSize: 9, color: C.sub, margin: 0 });
  cy += 0.75;
});
s.addShape("rect", { x: 5.1, y: 1.1, w: 4.4, h: 3.6, fill: { color: C.card }, line: { color: C.orange, width: 1 } });
s.addText("工作節點 (Worker Node) × N", { x: 5.2, y: 1.1, w: 4.2, h: 0.4, fontFace: FONT_HEAD, fontSize: 16, color: C.navy, bold: true, margin: 0 });
const wn = [
  ["kubelet", "管理本節點 Pod/容器"],
  ["kube-proxy", "Service 網路規則"],
  ["containerd", "容器執行期 (CRI)"],
];
let wy = 1.6;
wn.forEach((c) => {
  s.addShape("roundRect", { x: 5.3, y: wy, w: 4.05, h: 0.72, fill: { color: C.white }, rectRadius: 0.1, line: { color: C.orange } });
  s.addText(c[0], { x: 5.45, y: wy + 0.1, w: 1.6, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: C.orange, bold: true, margin: 0 });
  s.addText(c[1], { x: 7.1, y: wy + 0.15, w: 2.2, h: 0.35, fontFace: FONT_BODY, fontSize: 9, color: C.sub, margin: 0 });
  wy += 0.85;
});
s.addShape("line", { x: 4.8, y: 2.9, w: 0.3, h: 0, line: { color: C.orange, width: 3 } });
s.addText("kubelet 每 10s 回報狀態", { x: 4.55, y: 3.0, w: 0.9, h: 0.8, fontFace: FONT_BODY, fontSize: 8, color: C.sub, align: "center", margin: 0 });
s.addText("kubectl / API 用戶端", { x: 0.5, y: 4.9, w: 9, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.blue, bold: true, margin: 0, align: "center" });
s.addShape("line", { x: 4.7, y: 5.0, w: 0.4, h: 0, line: { color: C.blue, width: 2 } });
footer(s, "apiserver 是唯一入口；etcd 保存期望狀態");

// Slide 5: 控制平面元件
s = contentSlide(pptx, "控制平面元件職責", { page: "5" });
card(s, 0.5, 1.2, 4.4, 1.6, C.blue, "kube-apiserver", "所有 API 請求唯一入口\n驗證 / 授權 / 准入\n狀態透過 etcd 保存");
card(s, 5.1, 1.2, 4.4, 1.6, C.orange, "etcd", "分散式 KV 儲存\n存整個叢集狀態\n需奇數副本維持 quorum");
card(s, 0.5, 3.0, 4.4, 1.6, C.blue, "kube-scheduler", "為新 Pod 選擇節點\n考量資源/標籤/親和性\n不執行 Pod");
card(s, 5.1, 3.0, 4.4, 1.6, C.orange, "kube-controller-manager", "執行控制器迴圈\n(ReplicaSet/Node/Deployment...)\n把現況收斂到期望狀態");
footer(s, "高可用叢集會部署 ≥3 個控制平面（Class 3/5）");

// Slide 6 (NEW): 宣告式 + reconcile loop
s = contentSlide(pptx, "宣告式與控制回路（Reconcile Loop）", { page: "6" });
card(s, 0.5, 1.2, 4.4, 1.7, C.orange, "命令式（傳統）", "「升这台、關那台、開 port」\n每一步都要人下令\n人離開就停擺");
card(s, 5.1, 1.2, 4.4, 1.7, C.blue, "宣告式（K8s）", "「我要 3 個 nginx、跑這」\n偏離（掛/掉/被改）\n都由 K8s 自動修正");
s.addShape("roundRect", { x: 0.5, y: 3.05, w: 9, h: 1.35, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("控制回路：每個 controller 不斷迴圈", { x: 0.7, y: 3.12, w: 8.6, h: 0.34, fontFace: FONT_BODY, fontSize: 14, color: C.navy, bold: true, margin: 0 });
const loop = ["讀期望狀態 (etcd)", "讀實際狀態", "差異→修正 Pod", "重複"];
loop.forEach((f, i) => {
  s.addShape("roundRect", { x: 0.7 + i * 2.15, y: 3.55, w: 1.85, h: 0.62, fill: { color: C.white }, rectRadius: 0.1, line: { color: C.blue, width: 0.75 } });
  s.addText(f, { x: 0.75 + i * 2.15, y: 3.55, w: 1.75, h: 0.62, fontFace: FONT_BODY, fontSize: 10, color: C.navy, bold: true, align: "center", valign: "middle", margin: 0 });
  if (i < loop.length - 1) s.addText("→", { x: 0.7 + i * 2.15 + 1.85, y: 3.55, w: 0.3, h: 0.62, fontFace: FONT_BODY, fontSize: 14, color: C.orange, align: "center", valign: "middle", margin: 0 });
});
s.addShape("roundRect", { x: 0.5, y: 4.55, w: 9, h: 0.55, fill: { color: C.card }, rectRadius: 0.08 });
s.addText("生活類比：冷氣定溫 24°——你只設目標，自己感知差距再收斂；controller 就是那個溫控迴路", { x: 0.7, y: 4.62, w: 8.6, h: 0.42, fontFace: FONT_BODY, fontSize: 12, color: C.body, margin: 0 });
footer(s, "排障思路：先問「目標是啥？實際差在哪？」");

// Slide 7 (NEW): etcd quorum
s = contentSlide(pptx, "etcd 為何要 3 / 5 台（quorum）", { page: "7" });
s.addText("etcd 是「叢集唯一事實來源」，寫入需過半數節點認可 → 要能「過半數」就得「有過半數存活」：", { x: 0.5, y: 1.0, w: 9, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: C.body, margin: 0 });
const eq = [
  ["etcd 節點", "容許掉線", "說明"],
  ["1", "0", "掉了全叢集不可寫"],
  ["3", "1", "剩 2 仍過半（2/3）→ 繼續"],
  ["5", "2", "剩 3 仍過半（3/5）→ 繼續"],
  ["4 ✗", "1", "多一台沒多容錯，白費"],
];
let eqy = 1.5;
eq.forEach((row, ri) => {
  row.forEach((cell, ci) => {
    const w = [1.6, 1.4, 6.0][ci];
    const x = 0.5 + ([1.6, 1.4][ci] || 0);
    s.addShape("rect", { x, y: eqy, w, h: 0.5, fill: { color: ri === 0 ? C.navy : (ri === 4 ? C.soft : (ri % 2 ? C.card : C.white)) }, line: { color: C.line, width: 0.5 } });
    s.addText(cell, { x: x + 0.1, y: eqy, w: w - 0.2, h: 0.5, fontFace: FONT_BODY, fontSize: 11, color: ri === 0 ? C.white : (ci === 0 ? C.blue : C.body), bold: ri === 0 || ci === 0, margin: 0, valign: "middle", align: ci === 2 ? "left" : "center" });
  });
  eqy += 0.5;
});
s.addShape("roundRect", { x: 0.5, y: 4.2, w: 9, h: 0.75, fill: { color: C.soft }, rectRadius: 0.08 });
s.addText("心智模型：開會過半數才作數——4 人掉 2 就作不了決定，跟 3 人掉 1 一樣但更貴 → HA etcd 一律奇數（3 或 5）", { x: 0.7, y: 4.28, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 11, color: C.navy, bold: true, margin: 0, lineSpacing: 14 });
footer(s, "etcd 磁碟寫入延遲直接影響 API 回應，建議 SSD + fast-fsync");

// Slide 8: 工作節點元件
s = contentSlide(pptx, "工作節點元件", { page: "8" });
card(s, 0.5, 1.2, 4.4, 1.6, C.orange, "kubelet", "節點上的主要代理\n向 apiserver 註冊\n負責啟動/停止 Pod 容器");
card(s, 5.1, 1.2, 4.4, 1.6, C.blue, "kube-proxy", "實作 Service 網路規則\n(iptables / IPVS)\n把流量導向後端 Pod");
card(s, 0.5, 3.0, 4.4, 1.6, C.orange, "containerd (CRI)", "真正執行容器的元件\nCNCF 維護、輕量\nK8s 自 1.24 起預設 runtime");
card(s, 5.1, 3.0, 4.4, 1.6, C.blue, "CRI 介面", "Container Runtime Interface\n標準化 runtime 與 K8s 的溝通\n可替換（containerd/cri-o）");
footer(s, "containerd 已取代 Docker 作為 K8s 的預設 runtime");

// Slide 9 (NEW): Pod 網路心智模型
s = contentSlide(pptx, "Pod 網路心智模型（兩層 IP）", { page: "9" });
const nodes = ["Node1", "Node2", "Node3"];
nodes.forEach((n, i) => {
  const x = 0.9 + i * 2.95;
  s.addShape("rect", { x, y: 1.2, w: 2.6, h: 1.5, fill: { color: C.soft }, line: { color: C.orange, width: 1 } });
  s.addText(n, { x: x + 0.1, y: 1.28, w: 1.2, h: 0.4, fontFace: FONT_BODY, fontSize: 11, color: C.orange, bold: true, margin: 0 });
  s.addShape("roundRect", { x: x + 0.6, y: 1.85, w: 1.4, h: 0.5, fill: { color: C.blue }, rectRadius: 0.08 });
  s.addText("Pod" + "ABC"[i], { x: x + 0.6, y: 1.85, w: 1.4, h: 0.5, fontFace: FONT_BODY, fontSize: 11, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
});
s.addText("Node IP（物理/VM IP，PVE/bridge 管）", { x: 0.5, y: 2.75, w: 9, h: 0.3, fontFace: FONT_BODY, fontSize: 10, color: C.orange, margin: 0, align: "center" });
s.addText("Pod IP（跨節點可路由，CNI 管）", { x: 0.5, y: 2.95, w: 9, h: 0.3, fontFace: FONT_BODY, fontSize: 10, color: C.blue, margin: 0, align: "center" });
const pods = [
  ["每個 Pod 有自己的 IP", "跨節點可路由，跟「容器用 host 網路」完全不同"],
  ["K8s 不管 Pod 間怎麼通", "只告知「Pod CIDR」與節點間路由，交由 CNI（Calico/Flannel/Cilium）實現"],
  ["Pod IP 是短暫的", "Pod 重排/調度就變；Service 提供穩定入口，應用不必追蹤"],
];
let pby = 3.45;
pods.forEach((p) => {
  s.addShape("ellipse", { x: 0.6, y: pby + 0.05, w: 0.12, h: 0.12, fill: { color: C.orange } });
  s.addText(p[0] + "　", { x: 0.78, y: pby, w: 2.2, h: 0.4, fontFace: FONT_BODY, fontSize: 10, color: C.blue, bold: true, margin: 0, valign: "middle" });
  s.addText(p[1], { x: 3.0, y: pby, w: 6.5, h: 0.42, fontFace: FONT_BODY, fontSize: 10, color: C.body, margin: 0, valign: "middle" });
  pby += 0.42;
});
footer(s, "PVE/bridge 管節點間；CNI 管 Pod 間——兩層各自獨立");

// Slide 10: 核心物件
s = contentSlide(pptx, "核心物件（API 資源）", { page: "10" });
card(s, 0.5, 1.2, 2.9, 1.9, C.blue, "Pod", "最小部署單位\n共享網路/儲存的容器群\n通常由控制器管理");
card(s, 3.55, 1.2, 2.9, 1.9, C.orange, "Deployment", "宣告副本數/鏡像\n管理滾動更新與滾回\n透過 ReplicaSet");
card(s, 6.6, 1.2, 2.9, 1.9, C.blue, "Service", "穩定虛擬 IP + DNS\n服務發現/負載平衡\nClusterIP/NodePort/LB");
card(s, 0.5, 3.3, 2.9, 1.7, C.orange, "ConfigMap", "明文設定\n與鏡像分離\n可動態變更");
card(s, 3.55, 3.3, 2.9, 1.7, C.blue, "Secret", "機密 (base64)\n憑證/密碼\n避免寫入鏡像");
card(s, 6.6, 3.3, 2.9, 1.7, C.orange, "其他", "Namespace / Ingress\nStatefulSet / Job\nPV/PVC/StorageClass\nNetworkPolicy");
footer(s, "Namespace 做邏輯隔離；Ingress 做七層路由");

// Slide 11 (NEW): Service 為什麼必要 + 原理
s = contentSlide(pptx, "Service：為什麼必要與工作原理", { page: "11" });
s.addText("問題：Pod 短暫（重排/縮放/升級），Pod IP 時常變——客戶端不可能追蹤。解法：Service 提供永遠不變的「門面」（VIP + DNS）。", { x: 0.5, y: 1.0, w: 9, h: 0.5, fontFace: FONT_BODY, fontSize: 11, color: C.body, margin: 0, lineSpacing: 14 });
s.addShape("roundRect", { x: 3.6, y: 1.65, w: 2.8, h: 0.7, fill: { color: C.soft }, rectRadius: 0.1, line: { color: C.blue, width: 1 } });
s.addText("Service (VIP + DNS)", { x: 3.7, y: 1.65, w: 2.6, h: 0.7, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, align: "center", valign: "middle", margin: 0 });
["PodA", "PodB", "PodC"].forEach((p, i) => {
  const x = 2.4 + i * 2.0;
  s.addShape("line", { x: 4.6 + (i - 1) * 2.0, y: 2.35, w: 0.6, h: 0.5, line: { color: C.orange, width: 1.5 } });
  s.addShape("roundRect", { x, y: 2.85, w: 1.4, h: 0.5, fill: { color: C.blue }, rectRadius: 0.08 });
  s.addText(p, { x, y: 2.85, w: 1.4, h: 0.5, fontFace: FONT_BODY, fontSize: 11, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
});
s.addText("label selector 自動挑出符合的 Pod（新 Pod 自動進、掛掉自動移出）", { x: 0.5, y: 3.45, w: 9, h: 0.3, fontFace: FONT_BODY, fontSize: 10, color: C.sub, margin: 0, align: "center" });
card(s, 0.5, 3.85, 4.4, 1.35, C.orange, "怎麼轉（kube-proxy）", "iptables：簡單、小規模夠用\nIPVS：內核 L4 負平衡\n規模大/低延遲，生產推薦");
card(s, 5.1, 3.85, 4.4, 1.35, C.blue, "DNS 服務發現", "CoreDNS：my-svc →\nmy-svc.default.svc.cluster.local\n→ Service VIP");
s.addShape("roundRect", { x: 0.5, y: 5.0, w: 9, h: 0.28, fill: { color: C.card } });
footer(s, "心智模型：Service=公司總機電話，號碼不變、後面分機會換");

// Slide 12 (NEW): 排程心智模型
s = contentSlide(pptx, "排程心智模型（Affinity/Taint/Spread）", { page: "12" });
card(s, 0.5, 1.2, 8.9, 1.15, C.blue, "NodeSelector / Affinity", "「只放 3 樓的辦公室」——把 Pod 綁到特定節點標籤（GPU 節點、同可用區）");
card(s, 0.5, 2.5, 8.9, 1.15, C.orange, "Taint / Toleration", "「這棟樓有毒，非抗毒者勿進」——把 Pod 趕離特定節點（如 GPU 節點只給特定負載）");
card(s, 0.5, 3.8, 8.9, 1.15, C.blue, "Spread（podAntiAffinity）", "「同一組同事別都坐一張桌」——副本分散到不同節點/機櫃，防單點");
s.addShape("roundRect", { x: 0.5, y: 5.05, w: 9, h: 0.25, fill: { color: C.soft } });
footer(s, "Affinity=想要放這；Taint=別讓我放這；Spread=別都擠一起（Class 3 實務應用）");

// Slide 13: 其他資源 / ConfigMap 已整合
s = contentSlide(pptx, "宣告式管理與 API 原理", { page: "13" });
const flow = [
  "kubectl apply",
  "kube-apiserver\n(驗證/授權/准入)",
  "etcd\n(期望狀態)",
  "controllers\n(收斂差異)",
  "scheduler→kubelet\n→containerd",
];
let fx = 0.5;
flow.forEach((f, i) => {
  s.addShape("roundRect", { x: fx, y: 1.5, w: 1.65, h: 1.3, fill: { color: i === 2 ? C.orange : C.soft }, rectRadius: 0.1, line: { color: i === 2 ? C.orange : C.blue } });
  const parts = f.split("\n");
  s.addText(parts[0], { x: fx + 0.08, y: 1.65, w: 1.5, h: parts.length > 1 ? 0.5 : 0.9, fontFace: FONT_BODY, fontSize: 11, color: C.navy, bold: true, align: "center", margin: 0 });
  if (parts.length > 1) s.addText(parts.slice(1).join("\n"), { x: fx + 0.08, y: 2.15, w: 1.5, h: 0.6, fontFace: FONT_BODY, fontSize: 8, color: C.sub, align: "center", margin: 0, lineSpacing: 11 });
  if (i < flow.length - 1) s.addShape("line", { x: fx + 1.65, y: 2.15, w: 0.35, h: 0, line: { color: C.orange, width: 2.5 } });
  fx += 2.0;
});
bullets(s, 0.6, 3.2, 8.8, 2.0, [
  "apiserver 是唯一寫入入口；etcd 是單一事實來源（quorum）",
  "每個 controller 都是 reconcile loop 的一個實例",
  "kubectl 只是客戶端（REST over HTTPS）；任何語言/工具都能直打 apiserver",
], { size: 14 });
footer(s, "把第 6 頁「宣告式」觀念放到實際資料流");

// Slide 14: 重點複習
s = contentSlide(pptx, "重點複習", { page: "14" });
bullets(s, 0.6, 1.2, 8.8, 3.2, [
  "控制平面負責「決定」叢集狀態；工作節點負責「執行」Pod",
  "宣告式：你描述目標，controller 靠 reconcile loop 收斂",
  "etcd 保存全部狀態，奇數節點維持 quorum",
  "Service=穩定門面、Pod 網路=CNI、排程=Affinity/Taint/Spread",
  "containerd 是現行標準 runtime",
  "小測驗：取得 Quizlet 課堂小測驗（04-exercises/QUIZZES.md）",
], { size: 15, line: 28 });
footer(s, "本堂原理是後續安裝/運維的基礎");

// Slide 15: 比較概覽
s = contentSlide(pptx, "比較：Kubernetes vs OpenShift (OCP)", { page: "15" });
const compMatrix = [
  ["面向", "Vanilla Kubernetes", "Red Hat OpenShift"],
  ["核心", "開源容器編排核心", "企業 K8s 發行版＋支援"],
  ["安裝", "kubeadm / k3s（自行組裝）", "openshift-install（一鍵/自動 HA）"],
  ["runtime", "containerd / CRI-O", "CRI-O（Red Hat 主導）"],
  ["節點 OS", "任意 Linux", "RHCOS（唯讀自動更新）"],
  ["網路", "自裝 CNI（Calico…）", "內建 OVN-Kubernetes"],
  ["認證/路由", "自組 OIDC / Ingress", "內建 OAuth＋Router"],
  ["成本", "免費開源", "付費訂閱（有 SLA）"],
];
let mty = 1.1;
compMatrix.forEach((row, ri) => {
  const fillc = ri === 0 ? C.navy : (ri % 2 ? C.soft : C.card);
  row.forEach((cell, ci) => {
    const x = 0.5 + ci * 3.0;
    const bold = ri === 0 || ci === 0;
    const acc = ci === 0 ? C.orange : (bold ? C.navy : C.body);
    s.addShape("rect", { x, y: mty, w: 3.0, h: 0.52, fill: { color: fillc }, line: { color: C.line, width: 0.5 } });
    s.addText(cell, { x: x + 0.08, y: mty, w: 2.84, h: 0.52, fontFace: FONT_BODY, fontSize: 11, color: acc, bold, margin: 0, valign: "middle" });
  });
  mty += 0.52;
});
footer(s, "同一套 K8s API；OCP 等於「K8s 核心 + 企業層功能 + Red Hat 支援」");

// Slide 16: 比較 Pros & Cons
s = contentSlide(pptx, "OCP 比較：優點 vs 缺點", { page: "16" });
card(s, 0.5, 1.15, 4.4, 2.25, C.orange, "Kubernetes（Vanilla）", "Pros：免費開源 / 輕量客製 / 版本自主\nCons：CNI/監控/Ingress/RBAC 全要自組\n無原廠支援、維運與升級成本高");
card(s, 5.1, 1.15, 4.4, 2.25, C.blue, "OpenShift（OCP）", "Pros：企業一體化 / 支援與 SLA / 安全開箱即用\nCons：付費訂閱 / 較重耗資源 / 客製受限\n綁定 Red Hat 節奏，免費版 OKD 無支援");
const pick = [
  ["訓練/研究/Lab →", "Vanilla Kubernetes（零成本、看透原理）"],
  ["企業上線/需合規 →", "OpenShift（付費買支援與一體化）"],
  ["折衷 →", "先打穩 K8s 原理，轉 OCP 僅換外皮"],
];
let py = 3.7;
pick.forEach((row) => {
  s.addShape("roundRect", { x: 0.5, y: py, w: 9, h: 0.52, fill: { color: C.soft }, rectRadius: 0.08 });
  s.addText(row[0], { x: 0.65, y: py + 0.06, w: 3.1, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.orange, bold: true, margin: 0, valign: "middle" });
  s.addText(row[1], { x: 3.85, y: py + 0.06, w: 5.5, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.navy, margin: 0, valign: "middle" });
  py += 0.6;
});
footer(s, "底層都是 K8s API；本課程以 Vanilla (kubeadm) 講透原理，OCP 只是企業層調味");

// Slide 17: 收尾
s = darkSlide(pptx, { kicker: "Class 2 · 完成", title: "下一步：網路、儲存、高可用", titleY: 1.6, sub: "了解 K8s 對外暴露、持久儲存與 HA 的原理。" });
s.addText("原理通了，接下來實作前先把基礎元件（CNI/儲存/HA）搞懂。", { x: 0.6, y: 3.2, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0 });
s.addNotes("Wrap up, hand-off to Class 3.");

pptx.writeFile({ fileName: "/root/opencode/k8s/01-class-slides/class-02-k8s-core.pptx" }).then(() => console.log("class-02 done"));
