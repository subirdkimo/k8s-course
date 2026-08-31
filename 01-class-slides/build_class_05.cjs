const pptxgen = require("/tmp/opencode/deckbuild/node_modules/pptxgenjs");
const D = require("/root/opencode/k8s/.design.cjs");
const { C, FONT_HEAD, FONT_BODY, W, H, darkSlide, contentSlide, card, bullets, footer } = D;

const pptx = new pptxgen();
pptx.layout = "LAYOUT_16x9";
pptx.author = "AI_assist";
pptx.title = "Class 5 - kubeadm 安裝高可用 Kubernetes";

let s = darkSlide(pptx, { kicker: "PVE × Kubernetes 工程師訓練", title: "Class 5", titleSize: 60 });
s.addShape("roundRect", { x: 0.6, y: 4.1, w: 6.4, h: 0.6, fill: { color: C.blue }, rectRadius: 0.1 });
s.addText("kubeadm 安裝高可用 Kubernetes", { x: 0.6, y: 4.1, w: 6.4, h: 0.6, fontFace: FONT_BODY, fontSize: 15, color: C.white, bold: true, align: "center", margin: 0 });
s.addText("1 hr 30 min ｜ 實作 ｜ kubeadm + containerd", { x: 0.6, y: 4.85, w: 8.8, h: 0.4, fontFace: FONT_BODY, fontSize: 13, color: C.ice, margin: 0 });
s.addNotes("kubeadm install of HA cluster: compare methods, containerd, kubeadm, CNI, join, verify, troubleshoot.");

// Slide 2: 安裝方式比較
s = contentSlide(pptx, "安裝方式比較", { page: "2" });
card(s, 0.5, 1.2, 2.9, 2.6, C.blue, "kubeadm", "CNCF 官方工具\n標準化、可 HA 多控制平面\n本課程主軸");
card(s, 3.55, 1.2, 2.9, 2.6, C.orange, "k3s", "輕量、單一 binary\n易安裝\n邊緣、Lab");
card(s, 6.6, 1.2, 2.9, 2.6, C.blue, "RKE2 / 雲端", "RKE2：Rancher、安全性強化\n雲端 (EKS/GKE)：全託管\n控制平面免操作");
bullets(s, 0.6, 4.0, 8.8, 1.0, [
  "本章採用 kubeadm + containerd，版本以 v1.36 / v1.37 為基準",
], { size: 13 });

// Slide 3: 安裝流程總覽（6 大步）
s = contentSlide(pptx, "安裝流程（6 大步）", { page: "3" });
const fsteps = [
  "基礎\n系統設定",
  "安裝\ncontainerd",
  "安裝\nkubeadm",
  "初始化\n控制平面",
  "安裝 CNI",
  "加入\ncp + worker",
];
let fx = 0.5;
fsteps.forEach((f, i) => {
  s.addShape("roundRect", { x: fx, y: 1.4, w: 1.4, h: 2.0, fill: { color: i < 3 ? C.orange : C.blue }, rectRadius: 0.1 });
  const parts = f.split("\n");
  s.addText(parts[0], { x: fx + 0.05, y: parts.length > 1 ? 1.65 : 2.1, w: 1.3, h: 0.6, fontFace: FONT_BODY, fontSize: 13, color: C.white, bold: true, align: "center", margin: 0 });
  if (parts.length > 1) s.addText(parts[1], { x: fx + 0.05, y: 2.2, w: 1.3, h: 0.9, fontFace: FONT_BODY, fontSize: 12, color: C.white, bold: true, align: "center", margin: 0 });
  if (i < fsteps.length - 1) s.addShape("line", { x: fx + 1.4, y: 2.4, w: 0.28, h: 0, line: { color: C.orange, width: 2.5 } });
  fx += 1.68;
});
bullets(s, 0.6, 3.7, 8.8, 1.4, [
  "6 台節點皆需完成 1–3；cp1 做 4–5；其餘控制平面/worker 做 6",
], { size: 13 });

// Slide 4: 基礎系統設定（所有節點）
s = contentSlide(pptx, "步驟 1 · 基礎系統設定", { page: "4" });
s.addShape("roundRect", { x: 0.5, y: 1.2, w: 9, h: 3.2, fill: { color: C.navy }, rectRadius: 0.08 });
s.addText('sudo swapoff -a\nsudo modprobe overlay br_netfilter\n\n# /etc/sysctl.d/k8s.conf\nnet.bridge.bridge-nf-call-iptables = 1\nnet.bridge.bridge-nf-call-ip6tables = 1\nnet.ipv4.ip_forward = 1\nsudo sysctl --system', {
  x: 0.8, y: 1.4, w: 8.4, h: 2.8, fontFace: "Courier New", fontSize: 14, color: "#EAF1FF", margin: 0, lineSpacing: 22, valign: "top",
});
bullets(s, 0.6, 4.55, 8.8, 0.8, ["關閉 swap：K8s 要求；載入核心模組；啟用網路轉發"], { size: 12 });

// Slide 5: 安裝 containerd
s = contentSlide(pptx, "步驟 2 · 安裝 containerd", { page: "5" });
s.addShape("roundRect", { x: 0.5, y: 1.2, w: 9, h: 2.6, fill: { color: C.navy }, rectRadius: 0.08 });
s.addText('sudo apt-get install -y containerd\nsudo containerd config default | sudo tee /etc/containerd/config.toml\nsudo sed -i \'s/SystemdCgroup = false/SystemdCgroup = true/\' \\\n   /etc/containerd/config.toml\nsudo systemctl restart containerd', {
  x: 0.8, y: 1.35, w: 8.4, h: 2.3, fontFace: "Courier New", fontSize: 13, color: "#EAF1FF", margin: 0, lineSpacing: 22,
});
bullets(s, 0.6, 4.1, 8.8, 1.3, [
  "系統 cgroup driver（SystemdCgroup=true）需與 kubelet 一致",
  "企業/中國環境可另設 registry mirror 加速鏡像拉取",
], { size: 12 });

// Slide 6: 安裝 kubeadm/kubelet/kubectl
s = contentSlide(pptx, "步驟 3 · 安裝 kubeadm/kubelet/kubectl", { page: "6" });
s.addShape("roundRect", { x: 0.5, y: 1.15, w: 9, h: 2.7, fill: { color: C.navy }, rectRadius: 0.08 });
s.addText('curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.36/deb/Release.key | \\\n   sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg\n\necho "deb https://pkgs.k8s.io/core:/stable:/v1.36/deb/ /" > kubernetes.list\nsudo apt-get install -y kubelet kubeadm kubectl\nsudo apt-mark hold kubelet kubeadm kubectl', {
  x: 0.8, y: 1.3, w: 8.4, h: 2.4, fontFace: "Courier New", fontSize: 13, color: "#EAF1FF", margin: 0, lineSpacing: 21,
});
bullets(s, 0.6, 4.1, 8.8, 1.1, ["apt-mark hold 防止意外升級，維護版本一致性"], { size: 12 });

// Slide 7: 初始化控制平面
s = contentSlide(pptx, "步驟 4 · 初始化控制平面（cp1）", { page: "7" });
s.addShape("roundRect", { x: 0.5, y: 1.15, w: 4.55, h: 3.1, fill: { color: C.soft }, rectRadius: 0.08, line: { color: C.blue } });
s.addText("kubeadm-config.yaml", { x: 0.65, y: 1.25, w: 4.2, h: 0.35, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0 });
s.addText('kubernetesVersion: v1.36.0\ncontrolPlaneEndpoint: 192.168.10.100:6443\nnetworking:\n  podSubnet: 10.200.0.0/16\n  serviceSubnet: 10.96.0.0/12', { x: 0.65, y: 1.65, w: 4.3, h: 2.5, fontFace: "Courier New", fontSize: 12, color: C.body, margin: 0, lineSpacing: 20 });
s.addShape("roundRect", { x: 5.25, y: 1.15, w: 4.25, h: 3.1, fill: { color: C.navy }, rectRadius: 0.08 });
s.addText('sudo kubeadm init \\\n  --config kubeadm-config.yaml \\\n  --upload-certs\n\nmkdir -p $HOME/.kube\nsudo cp -i /etc/kubernetes/admin.conf \\\n   $HOME/.kube/config', { x: 5.45, y: 1.3, w: 3.9, h: 2.8, fontFace: "Courier New", fontSize: 11, color: "#EAF1FF", margin: 0, lineSpacing: 19 });
bullets(s, 0.6, 4.5, 8.8, 0.9, ["controlPlaneEndpoint 指向 LB VIP，是之後擴充控制平面的關鍵"], { size: 12 });

// Slide 8: 安裝 CNI
s = contentSlide(pptx, "步驟 5 · 安裝 CNI（Calico）", { page: "8" });
s.addShape("roundRect", { x: 0.5, y: 1.2, w: 9, h: 2.5, fill: { color: C.navy }, rectRadius: 0.08 });
s.addText('curl -LO https://raw.githubusercontent.com/projectcalico/calico/master/manifests/calico.yaml\nkubectl apply -f calico.yaml\nwatch kubectl get pods -n kube-system   # 等 calico 與 coredns Running', {
  x: 0.8, y: 1.35, w: 8.4, h: 2.2, fontFace: "Courier New", fontSize: 13, color: "#EAF1FF", margin: 0, lineSpacing: 24,
});
bullets(s, 0.6, 4.0, 8.8, 1.2, [
  "Pod 網段需與 CNI 設定相符（CALICO_IPV4POOL_CIDR）",
  "Cilium 選配（eBPF）可在 helm 安裝",
], { size: 12 });

// Slide 9: 加入節點
s = contentSlide(pptx, "步驟 6 · 加入控制平面與 Worker", { page: "9" });
s.addShape("roundRect", { x: 0.5, y: 1.15, w: 4.55, h: 2.5, fill: { color: C.soft }, rectRadius: 0.08, line: { color: C.orange } });
s.addText("加入其餘控制平面 (cp2/cp3)", { x: 0.65, y: 1.25, w: 4.2, h: 0.35, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0 });
s.addText('sudo kubeadm join 192.168.10.100:6443 \\\n  --token <token> \\\n  --discovery-token-ca-cert-hash sha256:<hash> \\\n  --control-plane --certificate-key <key>', { x: 0.65, y: 1.7, w: 4.3, h: 1.8, fontFace: "Courier New", fontSize: 10.5, color: C.body, margin: 0, lineSpacing: 18 });
s.addShape("roundRect", { x: 5.25, y: 1.15, w: 4.25, h: 2.5, fill: { color: C.soft }, rectRadius: 0.08, line: { color: C.blue } });
s.addText("加入 Worker (w1/w2/w3)", { x: 5.4, y: 1.25, w: 4.0, h: 0.35, fontFace: FONT_BODY, fontSize: 12, color: C.navy, bold: true, margin: 0 });
s.addText('sudo kubeadm join 192.168.10.100:6443 \\\n  --token <token> \\\n  --discovery-token-ca-cert-hash sha256:<hash>', { x: 5.4, y: 1.7, w: 4.0, h: 1.7, fontFace: "Courier New", fontSize: 11, color: C.body, margin: 0, lineSpacing: 18 });
bullets(s, 0.6, 4.0, 8.8, 1.2, ["---control-plane 追加作用於控制平面；worker 不加這個旗標"], { size: 12 });

// Slide 10: 驗證
s = contentSlide(pptx, "驗證叢集", { page: "10" });
s.addShape("roundRect", { x: 0.5, y: 1.15, w: 9, h: 2.5, fill: { color: C.navy }, rectRadius: 0.08 });
s.addText('kubectl get nodes -o wide   # 6 台皆 Ready\nkubectl get pods -A            # 全部 Running\nkubectl cluster-info\n\nkubectl create deployment nginx --image=nginx\nkubectl scale deployment nginx --replicas=3\nkubectl expose deployment nginx --port=80 --type=NodePort', {
  x: 0.8, y: 1.3, w: 8.4, h: 2.2, fontFace: "Courier New", fontSize: 12.5, color: "#EAF1FF", margin: 0, lineSpacing: 21,
});
bullets(s, 0.6, 4.0, 8.8, 1.2, ["部署第一個 Deployment、縮放、以 NodePort 存取"], { size: 12 });

// Slide 11: 常見錯誤
s = contentSlide(pptx, "常見安裝錯誤", { page: "11" });
const errs = [
  ["cgroup driver mismatch", "containerd SystemdCgroup 與 kubelet 不一致"],
  ["Pod 卡 Pending", "CNI 未裝／Pod 網段與 CNI 不符"],
  ["swap 錯誤", "K8s 要求 swapoff -a"],
  ["port 6443 被佔", "另一 apiserver 或 LB 設定錯誤"],
  ["鏡像拉取失敗", "設定 registry mirror"],
];
let ey = 1.2;
errs.forEach((e) => {
  s.addShape("roundRect", { x: 0.5, y: ey, w: 3.3, h: 0.72, fill: { color: C.blue }, rectRadius: 0.08 });
  s.addText(e[0], { x: 0.55, y: ey + 0.12, w: 3.2, h: 0.5, fontFace: FONT_BODY, fontSize: 11, color: C.white, bold: true, margin: 0, lineSpacing: 14 });
  s.addShape("roundRect", { x: 3.9, y: ey, w: 5.6, h: 0.72, fill: { color: C.soft }, rectRadius: 0.08 });
  s.addText(e[1], { x: 4.05, y: ey + 0.14, w: 5.3, h: 0.5, fontFace: FONT_BODY, fontSize: 11, color: C.body, margin: 0, lineSpacing: 15 });
  ey += 0.85;
});
footer(s, "詳見 lab-05-kubeadm-install.md");

// Slide 12: HA 驗證
s = darkSlide(pptx, { kicker: "Class 5 · 完成", title: "HA 驗證挑戰", titleY: 1.6, sub: "停掉一台控制平面 VM，叢集應持續可用。" });
s.addText("若成功完成 → 你的 K8s 已具備控制平面 HA。", { x: 0.6, y: 3.2, w: 8.6, h: 0.6, fontFace: FONT_BODY, fontSize: 14, color: C.ice, margin: 0 });
s.addNotes("Challenge students to kill a control plane and verify continued operation.");

pptx.writeFile({ fileName: "/root/opencode/k8s/01-class-slides/class-05-kubeadm-install.pptx" }).then(() => console.log("class-05 done"));
