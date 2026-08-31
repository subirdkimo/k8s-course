# Class 5 — 使用 kubeadm 安裝高可用 Kubernetes（1.36/1.37）

> 時長：1 hr 30 min　|　投影片：`class-05-kubeadm-install.pptx`　|　Lab：`lab-05-kubeadm-install.md`

## 1. 安裝方式比較

| 方式 | 特色 | 適用 |
|------|------|------|
| **kubeadm** | CNCF 官方工具、標準化、可安裝 HA 多控制平面 | **生產、本課程主軸** |
| **k3s** | 輕量、單一 binary、易裝 | 邊緣、Lab |
| **RKE2** | Rancher、安全性強化 | 需要合規/生態 |
| 雲端託管 (EKS/GKE) | 全託管、免操作控制平面 | 雲端 |

> 本章採用 **kubeadm + containerd**，版本以 **v1.36 / v1.37** 為基準。

---

## 2. 前置：containerd 安裝與設定

K8s 自 1.24 起**移除 Docker 作為 runtime**；我們安裝並設定 **containerd**：

```bash
# 所有節點
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

# 網路轉發設定（K8s 要求）
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
sudo sysctl --system

# 安裝 containerd
sudo apt-get update
sudo apt-get install -y containerd

# 使用 systemd cgroup driver（K8s 1.36 起對 cgroup v2 的建議）
sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl restart containerd
```

### 鏡像來源設定（如在中國/企業環境）
- 建議調整 `config.toml` 的 `[plugins."io.containerd.grpc.v1.cri".registry.mirrors]` 改用加速度鏡像，以加速拉取 kubeadm/pause 等鏡像。

---

## 3. 安裝 kubeadm / kubelet / kubectl

```bash
# 加入 Kubernetes APT 儲存庫並安裝
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl gpg
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.36/deb/Release.key \
  | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.36/deb/ /" \
  | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

---

## 4. 初始化控制平面

### 第一台控制平面（k8s-cp1）
建立 `kubeadm-config.yaml`（可包含 etcd、apiserver、服務網段設定）：

```yaml
apiVersion: kubeadm.k8s.io/v1beta3
kind: ClusterConfiguration
kubernetesVersion: "v1.36.0"
controlPlaneEndpoint: "k8s-lb:6443"   # 使用負載平衡器 VIP/名稱
networking:
  podSubnet: "10.200.0.0/16"          # 需與 CNI 相符（Cilium/Calico）
  serviceSubnet: "10.96.0.0/12"
---
apiVersion: kubeadm.k8s.io/v1beta3
kind: InitConfiguration
localAPIEndpoint:
  advertiseAddress: "192.168.10.11"   # 本機 IP
```

```bash
sudo kubeadm init --config kubeadm-config.yaml
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

> **重要**：`controlPlaneEndpoint` 指向 HAProxy/LB 的 VIP（`k8s-lb`），即使只有一台 cp 也先設好，之後擴充控制平面才有意義。

---

## 5. 安裝 CNI（Calico / Cilium）

初始化完成後，**安裝 CNI**，Pod 網段才會通了：

```bash
# 以 Calico 為例
curl -LO https://raw.githubusercontent.com/projectcalico/calico/master/manifests/calico.yaml
kubectl apply -f calico.yaml   # 或設定 IP_AUTODETECTION 對應 Pod 網段

# 確認 Node Ready
kubectl get nodes
```

> Cilium（eBPF）選配：
> ```bash
> helm repo add cilium https://helm.cilium.io/
> helm install cilium cilium/cilium --version 1.x --namespace kube-system \
>   --set ipam.mode=kubernetes --set kubeProxyReplacement=strict
> ```

---

## 6. 加入其他控制平面與 Worker

從 `kubeadm init` 輸出取得 token：

```bash
# 取得 join 資訊（在 cp1 上）
kubeadm token create --print-join-command
```

**加入其餘控制平面（cp2, cp3）**：
```bash
sudo kubeadm join k8s-lb:6443 \
  --token <token> --discovery-token-ca-cert-hash sha256:<hash> \
  --control-plane --certificate-key <key>
```

**加入 Worker（w1, w2, w3）**：
```bash
sudo kubeadm join k8s-lb:6443 \
  --token <token> --discovery-token-ca-cert-hash sha256:<hash>
```

---

## 7. 驗證叢集

```bash
kubectl get nodes -o wide          # 確認 3 cp + 3 worker 皆 Ready
kubectl get pods -A                # 確認所有系統 Pod（含 etcd、coredns）Running
kubectl taint nodes $(kubectl get nodes -l node-role.kubernetes.io/control-plane= \
  -o name | head -1) node-role.kubernetes.io/control-plane-
kubectl create deployment nginx --image=nginx
kubectl scale deployment nginx --replicas=3
kubectl expose deployment nginx --port=80 --type=NodePort
kubectl get svc
```

---

## 8. 常見安裝錯誤（速查）

| 錯誤 | 原因 / 解決 |
|------|------------|
| cgroup driver mismatch | containerd `SystemdCgroup=true` 與 kubelet 一致 |
| Pod 卡 Pending / 無法互連 | CNI 未裝／Pod 網段與 CNI 不符 |
| swap 錯誤 | K8s 要求關閉 swap（`swapoff -a`） |
| port 6443 被佔 | 另一 apiserver 或 LB 設定錯誤 |
| 鏡像拉取失敗 | 設定 registry mirror |

> 詳細逐步含輸出的完整手冊見 `lab-05-kubeadm-install.md`。
