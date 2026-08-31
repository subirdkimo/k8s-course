const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("/root/opencode/k8s/.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 6 - 上線運維";

let s = darkSlide(pptx, { kicker: "PVE × Kubernetes 工程師訓練", title: "Class 6", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.1, w: 5.4, h: 0.6, fill: { color: C.orange }, rectRadius: 0.1 });
s.addText("上線運維：儲存 / 備份 / 監控 / 升級", { x: 0.6, y: 4.1, w: 5.4, h: 0.6, fontFace: FONT_BODY, fontSize: 14, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("1 hr 15 min ｜ 實作 ｜ ceph-csi / Velero / Prometheus / kubeadm upgrade", { x: 0.6, y: 4.85, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: C.ice, margin: 0 });
s.addNotes("Operations: storage integration, backup/DR, monitoring, security, upgrade, final project.");

// Slide 2: 儲存整合
s = contentSlide(pptx, "儲存整合：StorageClass + ceph-csi", { page: "2" });
s.addShape("roundRect", { x: 0.5, y: 1.15, w: 9, h: 2.4, fill: { color: C.navy }, rectRadius: 0.08 });
s.addText('# ceph-csi (RBD) → StorageClass\nkubectl create -f csi-rbd-secret.yaml\nkubectl create -f storageclass-rbd.yaml\n\n# 有狀態應用掛載 PVC\nkubectl create -f statefulset-postgres.yaml\nkubectl get pvc   # 確認 Bound', {
  x: 0.8, y: 1.3, w: 8.4, h: 2.1, fontFace: "Courier New", fontSize: 12.5, color: "#EAF1FF", margin: 0, lineSpacing: 21,
});
bullets(s, 0.6, 3.8, 8.8, 1.3, [
  "RWO→RBD/Ceph；RWX→CephFS 或 NFS",
  "Lab 可用 local-path-provisioner（節點本機磁碟）快速供應",
], { size: 13 });

// Slide 3: 備份與災難復原
s = contentSlide(pptx, "備份與災難復原（雙層）", { page: "3" });
card(s, 0.5, 1.2, 4.4, 2.3, C.orange, "PVE 層（整機）", "vzdump / PBS\n備份每個 K8s 節點 VM\n可整機還原");
card(s, 5.1, 1.2, 4.4, 2.3, C.blue, "K8s 層（應用與狀態）", "etcd 快照（最核心）\nVelero 備份資源+PVC\n支援還原");
bullets(s, 0.6, 3.7, 8.8, 1.4, [
  "控制平面的 etcd 定期備份是災難復原的根本",
  "PVE 層備份 VM，K8s 層備份應用，兩者缺一不可",
], { size: 13 });

// Slide 4: etcd 備份指令
s = contentSlide(pptx, "etcd 快照備份", { page: "4" });
s.addShape("roundRect", { x: 0.5, y: 1.15, w: 9, h: 2.9, fill: { color: C.navy }, rectRadius: 0.08 });
s.addText('sudo ETCDCTL_API=3 etcdctl \\\n  --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  snapshot save /backup/etcd-$(date +%F).db', {
  x: 0.8, y: 1.3, w: 8.4, h: 2.5, fontFace: "Courier New", fontSize: 13, color: "#EAF1FF", margin: 0, lineSpacing: 22,
});
bullets(s, 0.6, 4.3, 8.8, 0.9, ["將此指令排程 cron；可搭配 Velero 做應用層備份"], { size: 12 });

// Slide 5: 監控
s = contentSlide(pptx, "監控與可觀察性", { page: "5" });
card(s, 0.5, 1.2, 4.4, 2.0, C.blue, "Metrics Server", "提供 kubectl top\nHPA 擴展依據\n輕量必裝");
card(s, 5.1, 1.2, 4.4, 2.0, C.orange, "Prometheus + Grafana", "完整指標收集與儀表板\nkube-prometheus-stack\nGPU/自訂指標可擴充");
bullets(s, 0.6, 3.4, 8.8, 1.7, [
  "kubectl top nodes / pods",
  "kubectl logs / describe / events 做日常除錯",
  "Loki/ELK 收集日誌",
], { size: 13 });

// Slide 6: 安全性
s = contentSlide(pptx, "安全性要點", { page: "6" });
card(s, 0.5, 1.2, 4.4, 2.4, C.orange, "RBAC / 最小權限", "Roles / ClusterRoles\nRoleBindings\nleast-privilege");
card(s, 5.1, 1.2, 4.4, 2.4, C.blue, "NetworkPolicy", "以 Calico/Cilium 控制\n「誰能連誰」\n預設拒絕策略");
card(s, 0.5, 3.8, 4.4, 1.2, C.blue, "Pod Security", "restricted / baseline / privileged");
card(s, 5.1, 3.8, 4.4, 1.2, C.orange, "Secret 管理 / 審計", "避免純 base64\nSealed Secrets / ES\n啟用審計日誌");
footer(s, "保持最新補丁、限制金鑰權限");

// Slide 7: 升級策略
s = contentSlide(pptx, "升級：1.36 → 1.37", { page: "7" });
const upg = [
  ["1", "備份", "etcd 快照 + 重要資源"],
  ["2", "升級 kubeadm", "apt 更新（先 unhold）→ upgrade plan"],
  ["3", "控制平面", "kubeadm upgrade apply v1.37.0（逐台）"],
  ["4", "kubelet", "更新 kubelet/kubectl → restart"],
  ["5", "Worker", "drain → upgrade → uncordon 滾動"],
];
let uy = 1.3;
upg.forEach((u) => {
  s.addShape("ellipse", { x: 0.6, y: uy + 0.03, w: 0.4, h: 0.4, fill: { color: C.blue } });
  s.addText(u[0], { x: 0.6, y: uy + 0.11, w: 0.4, h: 0.3, fontFace: FONT_BODY, fontSize: 11, color: C.white, bold: true, align: "center", margin: 0 });
  s.addText(u[1], { x: 1.15, y: uy, w: 2.6, h: 0.45, fontFace: FONT_HEAD, fontSize: 14, color: C.navy, bold: true, margin: 0 });
  s.addText(u[2], { x: 3.9, y: uy + 0.05, w: 5.5, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: C.sub, margin: 0 });
  uy += 0.52;
});
bullets(s, 0.6, 4.45, 8.8, 1.0, ["一次只升一個 minor，遵守版本偏差策略（apiserver 差 ≤1）"], { size: 12 });

// Slide 8: 期末專案
s = contentSlide(pptx, "期末專案（延伸）", { page: "8" });
bullets(s, 0.6, 1.2, 8.8, 3.3, [
  "在 PVE 9.x 上獨立完成 3 控制平面 + 2–3 worker 的 HAK8s",
  "部署具持久儲存（PVC）與自動擴展（HPA）的應用",
  "停掉一台控制平面 VM，證明叢集持續可用",
  "執行過一次 etcd 備份並產出備份檔狀態",
  "交付架構文件、安裝紀錄、故障演練簡報",
], { size: 15, line: 30 });
footer(s, "詳見 04-exercises/FINAL-PROJECT.md");

// Slide 9: 課程總結
s = darkSlide(pptx, { kicker: "Class 6 · 課程總結", title: "從平台到上線，你已具備完整能力", titleY: 1.5, sub: "PVE 提供地基，K8s 提供敏捷。" });
const skills = ["虛擬化平台", "K8s 原理", "架構設計", "HA 安裝", "運維升級"];
let ss = 0.6;
skills.forEach((sk) => {
  s.addShape("roundRect", { x: ss, y: 3.1, w: 1.7, h: 0.6, fill: { color: C.blue }, rectRadius: 0.1 });
  s.addText(sk, { x: ss, y: 3.18, w: 1.7, h: 0.4, fontFace: FONT_BODY, fontSize: 12, color: C.white, bold: true, align: "center", margin: 0 });
  ss += 1.9;
});
s.addText("恭喜完成課程。持續追蹤 Kubernetes 每季 minor 與 PVE 版本升級。", { x: 0.6, y: 4.2, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0 });
s.addNotes("Final wrap-up. Emphasize version lifecycle and continuing education.");

pptx.writeFile({ fileName: "/root/opencode/k8s/01-class-slides/class-06-operations.pptx" }).then(() => console.log("class-06 done"));
